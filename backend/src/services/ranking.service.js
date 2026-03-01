'use strict';

const prisma = require('../lib/prisma');

/**
 * Recalculate GLOBAL rankings for all active students.
 * Uses RANK() ordering by readiness_score DESC.
 * Runs as a batch upsert.
 *
 * @returns {Promise<number>} Number of students ranked
 */
async function recalculateGlobalRankings() {
  // Fetch all active, non-deleted students ordered by score
  const students = await prisma.student.findMany({
    where: { deletedAt: null, status: { not: 'inactive' } },
    select: { id: true, readinessScore: true },
    orderBy: { readinessScore: 'desc' },
  });

  if (students.length === 0) return 0;

  // Assign ranks (handle ties: same score = same rank, next is skipped)
  let currentRank = 1;
  const ranked = [];

  for (let i = 0; i < students.length; i++) {
    if (i > 0 && Number(students[i].readinessScore) < Number(students[i - 1].readinessScore)) {
      currentRank = i + 1;
    }
    ranked.push({
      studentId: students[i].id,
      jobId: null,
      rank: currentRank,
      score: students[i].readinessScore,
    });
  }

  // NOTE:
  // Prisma cannot upsert through a composite unique where one key part is null.
  // Global rankings use jobId = null, so refresh that slice atomically.
  const calculatedAt = new Date();
  await prisma.$transaction([
    prisma.ranking.deleteMany({ where: { jobId: null } }),
    prisma.ranking.createMany({
      data: ranked.map((r) => ({
        studentId: r.studentId,
        jobId: null,
        rank: r.rank,
        score: r.score,
        calculatedAt,
      })),
    }),
  ]);

  return ranked.length;
}

/**
 * Recalculate per-job rankings for a specific job.
 * Students are ranked by a composite relevance score:
 *   60% readiness score + 40% skill match ratio (scaled 0-100)
 *
 * Only students meeting minimum readiness score are included.
 *
 * @param {string} jobId
 * @returns {Promise<number>} Number of candidates ranked
 */
async function recalculateJobRankings(jobId) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      skills: { include: { skill: true } },
    },
  });

  if (!job) return 0;

  const requiredSkillIds = job.skills.map((js) => js.skillId);
  const minScore = job.minimumReadinessScore || 0;

  // Fetch eligible students
  const students = await prisma.student.findMany({
    where: {
      deletedAt: null,
      readinessScore: { gte: minScore },
    },
    select: {
      id: true,
      readinessScore: true,
      skills: {
        where: requiredSkillIds.length > 0
          ? { skillId: { in: requiredSkillIds } }
          : {},
        select: { skillId: true },
      },
    },
  });

  if (students.length === 0) return 0;

  const totalRequired = requiredSkillIds.length || 1;

  // Calculate relevance score per student
  const scored = students.map((s) => {
    const matchingSkills = s.skills.length;
    const skillMatchRatio = matchingSkills / totalRequired;
    const skillScore = Math.min(skillMatchRatio * 100, 100);
    const relevanceScore =
      Number(s.readinessScore) * 0.6 + skillScore * 0.4;

    return { studentId: s.id, relevanceScore: Math.round(relevanceScore * 100) / 100 };
  });

  // Sort descending
  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Assign ranks with ties
  let currentRank = 1;
  const ranked = [];

  for (let i = 0; i < scored.length; i++) {
    if (i > 0 && scored[i].relevanceScore < scored[i - 1].relevanceScore) {
      currentRank = i + 1;
    }
    ranked.push({
      studentId: scored[i].studentId,
      jobId,
      rank: currentRank,
      score: scored[i].relevanceScore,
    });
  }

  // Batch upsert
  await prisma.$transaction(
    ranked.map((r) =>
      prisma.ranking.upsert({
        where: {
          studentId_jobId: {
            studentId: r.studentId,
            jobId: r.jobId,
          },
        },
        create: {
          studentId: r.studentId,
          jobId: r.jobId,
          rank: r.rank,
          score: r.score,
          calculatedAt: new Date(),
        },
        update: {
          rank: r.rank,
          score: r.score,
          calculatedAt: new Date(),
        },
      })
    )
  );

  return ranked.length;
}

/**
 * Get a student's global rank and percentile.
 * @param {string} studentId
 * @returns {Promise<{ rank: number|null, totalStudents: number, percentile: number|null }>}
 */
async function getStudentGlobalRank(studentId) {
  const [ranking, totalStudents] = await Promise.all([
    prisma.ranking.findFirst({
      where: { studentId, jobId: null },
      select: { rank: true, score: true },
    }),
    prisma.student.count({
      where: { deletedAt: null, status: { not: 'inactive' } },
    }),
  ]);

  if (!ranking || totalStudents === 0) {
    return { rank: null, totalStudents, percentile: null };
  }

  // Percentile = (students ranked BELOW / total) * 100
  const studentsBelow = totalStudents - ranking.rank;
  const percentile = Math.round((studentsBelow / totalStudents) * 100);

  return {
    rank: ranking.rank,
    score: Number(ranking.score),
    totalStudents,
    percentile,
  };
}

module.exports = {
  recalculateGlobalRankings,
  recalculateJobRankings,
  getStudentGlobalRank,
};
