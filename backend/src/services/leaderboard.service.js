'use strict';

const prisma = require('../lib/prisma');
const { getScoreLabel, getReadinessClassification } = require('./scoring.service');
const { recalculateGlobalRankings } = require('./ranking.service');
const AppError = require('../utils/AppError');

const PAGE_SIZE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compute rank trend: compare current rank to rank 7 days ago.
 * Uses calculatedAt on the Ranking row vs. a snapshot stored in metadata.
 * Since we store one ranking row per student (not history), we derive "trend"
 * from score movement: if score increased → up, decreased → down, else same.
 * We compare `score` in the ranking row vs. the student's score 7 days ago
 * (approximated via LearningActivity counts — practical heuristic).
 */
function deriveTrend(currentScore, previousScore) {
  if (previousScore == null) return 'same';
  const diff = Number(currentScore) - Number(previousScore);
  if (diff > 0.5) return 'up';
  if (diff < -0.5) return 'down';
  return 'same';
}

// ─── Global Leaderboard ───────────────────────────────────────────────────────

/**
 * Returns the global leaderboard (all departments, by readiness score).
 * Only includes students where showOnLeaderboard = true and deletedAt = null.
 *
 * @param {object} opts
 * @param {number} opts.page
 * @param {number} opts.limit
 * @param {string} [opts.department]
 * @param {string} [opts.yearOfStudy]
 * @param {string} [opts.search]
 * @returns {Promise<{ entries: array, total: number, page: number, totalPages: number }>}
 */
async function getGlobalLeaderboard({ page = 1, limit = PAGE_SIZE, department, yearOfStudy, search } = {}) {
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    showOnLeaderboard: true,
    status: { not: 'inactive' },
    ...(department ? { department } : {}),
    ...(yearOfStudy ? { yearOfStudy } : {}),
    ...(search
      ? { fullName: { contains: search, mode: 'insensitive' } }
      : {}),
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { readinessScore: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        fullName: true,
        department: true,
        yearOfStudy: true,
        readinessScore: true,
        avatarUrl: true,
        rankings: {
          where: { jobId: null },
          select: { rank: true, score: true, calculatedAt: true },
          take: 1,
        },
        scoreBreakdown: {
          select: {
            technicalSkills: true,
            projects: true,
            internships: true,
            certifications: true,
            assessments: true,
            codingPractice: true,
            githubActivity: true,
            events: true,
          },
        },
        skills: {
          take: 3,
          orderBy: { proficiency: 'desc' },
          select: {
            proficiency: true,
            skill: { select: { name: true } },
          },
        },
      },
    }),
    prisma.student.count({ where }),
  ]);

  // Build position-in-page rank (1-based absolute from page offset)
  const entries = students.map((s, idx) => {
    const globalRank = s.rankings[0]?.rank ?? skip + idx + 1;
    const score = Number(s.readinessScore);
    return {
      rank: globalRank,
      studentId: s.id,
      name: s.fullName,
      department: s.department,
      yearOfStudy: s.yearOfStudy,
      avatarUrl: s.avatarUrl ?? null,
      readinessScore: score,
      label: getScoreLabel(score),
      classification: getReadinessClassification(score),
      topSkills: s.skills.map((sk) => ({ name: sk.skill.name, proficiency: sk.proficiency })),
      scoreBreakdown: s.scoreBreakdown ?? null,
      trend: 'same', // no history table — requires Phase 11 enhancement
    };
  });

  return { entries, total, page, totalPages: Math.ceil(total / limit) };
}

// ─── Department Leaderboard ───────────────────────────────────────────────────

/**
 * Department-scoped leaderboard. Ranks are relative to the department.
 */
async function getDepartmentLeaderboard({ department, page = 1, limit = PAGE_SIZE } = {}) {
  if (!department) throw new AppError('department is required', 400);

  const skip = (page - 1) * limit;
  const where = {
    deletedAt: null,
    showOnLeaderboard: true,
    status: { not: 'inactive' },
    department,
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { readinessScore: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        fullName: true,
        department: true,
        yearOfStudy: true,
        readinessScore: true,
        avatarUrl: true,
        skills: {
          take: 3,
          orderBy: { proficiency: 'desc' },
          select: { proficiency: true, skill: { select: { name: true } } },
        },
      },
    }),
    prisma.student.count({ where }),
  ]);

  const entries = students.map((s, idx) => ({
    rank: skip + idx + 1,
    studentId: s.id,
    name: s.fullName,
    department: s.department,
    yearOfStudy: s.yearOfStudy,
    avatarUrl: s.avatarUrl ?? null,
    readinessScore: Number(s.readinessScore),
    label: getScoreLabel(Number(s.readinessScore)),
    topSkills: s.skills.map((sk) => ({ name: sk.skill.name, proficiency: sk.proficiency })),
    trend: 'same',
  }));

  return { entries, total, page, totalPages: Math.ceil(total / limit) };
}

// ─── Weekly Active Leaderboard ────────────────────────────────────────────────

/**
 * Weekly activity leaderboard — ranked by LearningActivity count in last 7 days.
 */
async function getWeeklyLeaderboard({ page = 1, limit = PAGE_SIZE } = {}) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const skip = (page - 1) * limit;

  // Aggregate activity counts per student in last 7 days
  const activityCounts = await prisma.learningActivity.groupBy({
    by: ['studentId'],
    where: { completedAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    skip,
    take: limit,
  });

  if (activityCounts.length === 0) {
    return { entries: [], total: 0, page, totalPages: 0 };
  }

  const studentIds = activityCounts.map((a) => a.studentId);

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where: { id: { in: studentIds }, deletedAt: null, showOnLeaderboard: true },
      select: {
        id: true,
        fullName: true,
        department: true,
        yearOfStudy: true,
        readinessScore: true,
        avatarUrl: true,
      },
    }),
    prisma.learningActivity
      .groupBy({
        by: ['studentId'],
        where: { completedAt: { gte: since } },
        _count: { id: true },
      })
      .then((r) => r.length),
  ]);

  const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));

  const entries = activityCounts
    .filter((a) => studentMap[a.studentId])
    .map((a, idx) => {
      const s = studentMap[a.studentId];
      return {
        rank: skip + idx + 1,
        studentId: s.id,
        name: s.fullName,
        department: s.department,
        yearOfStudy: s.yearOfStudy,
        avatarUrl: s.avatarUrl ?? null,
        readinessScore: Number(s.readinessScore),
        label: getScoreLabel(Number(s.readinessScore)),
        activityCount: a._count.id,
        trend: 'same',
      };
    });

  return { entries, total, page, totalPages: Math.ceil(total / limit) };
}

// ─── Skill Leaderboard ────────────────────────────────────────────────────────

/**
 * Top students for a given skill name (case-insensitive).
 */
async function getSkillLeaderboard({ skill, page = 1, limit = PAGE_SIZE } = {}) {
  if (!skill) throw new AppError('skill is required', 400);
  const skip = (page - 1) * limit;

  const skillRecord = await prisma.skill.findFirst({
    where: { name: { equals: skill, mode: 'insensitive' } },
    select: { id: true, name: true },
  });

  if (!skillRecord) {
    return { entries: [], total: 0, page, totalPages: 0, skillName: skill };
  }

  const where = {
    skillId: skillRecord.id,
    student: { deletedAt: null, showOnLeaderboard: true, status: { not: 'inactive' } },
  };

  const [skillEntries, total] = await Promise.all([
    prisma.studentSkill.findMany({
      where,
      orderBy: { proficiency: 'desc' },
      skip,
      take: limit,
      select: {
        proficiency: true,
        level: true,
        student: {
          select: {
            id: true,
            fullName: true,
            department: true,
            yearOfStudy: true,
            readinessScore: true,
            avatarUrl: true,
          },
        },
      },
    }),
    prisma.studentSkill.count({ where }),
  ]);

  const entries = skillEntries.map((se, idx) => ({
    rank: skip + idx + 1,
    studentId: se.student.id,
    name: se.student.fullName,
    department: se.student.department,
    yearOfStudy: se.student.yearOfStudy,
    avatarUrl: se.student.avatarUrl ?? null,
    readinessScore: Number(se.student.readinessScore),
    label: getScoreLabel(Number(se.student.readinessScore)),
    skillProficiency: se.proficiency,
    skillLevel: se.level,
    trend: 'same',
  }));

  return { entries, total, page, totalPages: Math.ceil(total / limit), skillName: skillRecord.name };
}

// ─── My Rank ──────────────────────────────────────────────────────────────────

/**
 * Return the calling student's position across all scopes.
 */
async function getMyRank(studentId) {
  const [student, ranking, totalStudents] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        fullName: true,
        department: true,
        yearOfStudy: true,
        readinessScore: true,
        avatarUrl: true,
        showOnLeaderboard: true,
      },
    }),
    prisma.ranking.findFirst({
      where: { studentId, jobId: null },
      select: { rank: true, score: true, calculatedAt: true },
    }),
    prisma.student.count({ where: { deletedAt: null, status: { not: 'inactive' } } }),
  ]);

  if (!student) throw new AppError('Student not found', 404);

  const score = Number(student.readinessScore);
  const globalRank = ranking?.rank ?? null;
  const percentile = globalRank && totalStudents > 0
    ? Math.round(((totalStudents - globalRank) / totalStudents) * 100)
    : null;

  // Department rank
  const deptTotal = await prisma.student.count({
    where: { deletedAt: null, status: { not: 'inactive' }, department: student.department },
  });
  const deptBelow = await prisma.student.count({
    where: {
      deletedAt: null,
      status: { not: 'inactive' },
      department: student.department,
      readinessScore: { lt: student.readinessScore },
    },
  });
  const deptRank = deptTotal - deptBelow;

  // Nearest competitors (students within ±5 score)
  const nearby = await prisma.student.findMany({
    where: {
      deletedAt: null,
      showOnLeaderboard: true,
      status: { not: 'inactive' },
      id: { not: studentId },
      readinessScore: {
        gte: Math.max(0, score - 5),
        lte: Math.min(100, score + 5),
      },
    },
    orderBy: { readinessScore: 'desc' },
    take: 3,
    select: {
      id: true,
      fullName: true,
      department: true,
      readinessScore: true,
      avatarUrl: true,
    },
  });

  return {
    studentId: student.id,
    name: student.fullName,
    department: student.department,
    yearOfStudy: student.yearOfStudy,
    avatarUrl: student.avatarUrl,
    readinessScore: score,
    label: getScoreLabel(score),
    classification: getReadinessClassification(score),
    showOnLeaderboard: student.showOnLeaderboard,
    globalRank,
    totalStudents,
    percentile,
    departmentRank: deptRank,
    departmentTotal: deptTotal,
    nearbyCompetitors: nearby.map((n) => ({
      studentId: n.id,
      name: n.fullName,
      department: n.department,
      readinessScore: Number(n.readinessScore),
      avatarUrl: n.avatarUrl ?? null,
    })),
  };
}

// ─── Available Departments ────────────────────────────────────────────────────

async function getAvailableDepartments() {
  const departments = await prisma.student.groupBy({
    by: ['department'],
    where: { deletedAt: null, status: { not: 'inactive' } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });
  return departments.map((d) => ({ department: d.department, count: d._count.id }));
}

// ─── Available Skills ─────────────────────────────────────────────────────────

async function getAvailableSkills() {
  const skills = await prisma.skill.findMany({
    select: { id: true, name: true, category: true },
    orderBy: { name: 'asc' },
  });
  return skills;
}

module.exports = {
  getGlobalLeaderboard,
  getDepartmentLeaderboard,
  getWeeklyLeaderboard,
  getSkillLeaderboard,
  getMyRank,
  getAvailableDepartments,
  getAvailableSkills,
};
