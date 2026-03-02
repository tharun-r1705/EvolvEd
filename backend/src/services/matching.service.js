'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// matching.service.js — Phase 5: Candidate Matching & AI Ranking Engine
//
// 6-component job-fit score:
//   Skill Match        40%
//   Readiness          20%
//   Experience         15%
//   Project Relevance  10%
//   Assessments        10%
//   Certifications      5%
// ─────────────────────────────────────────────────────────────────────────────

const prisma = require('../lib/prisma');
const { groqChat } = require('../utils/groq');
const AppError = require('../utils/AppError');

const MODEL = 'llama-3.3-70b-versatile';
const AI_TOP_N = 20;          // generate justifications for top-N candidates
const AI_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Verify that a job belongs to the given recruiter and return the job with skills.
 */
async function _getRecruiterJob(recruiterId, jobId) {
  // Resolve recruiter profile from userId
  const recruiter = await prisma.recruiter.findFirst({
    where: { userId: recruiterId, deletedAt: null },
    select: { id: true },
  });
  if (!recruiter) throw new AppError('Recruiter profile not found', 404);

  const job = await prisma.job.findFirst({
    where: { id: jobId, recruiterId: recruiter.id, deletedAt: null },
    include: {
      skills: { include: { skill: true } },
    },
  });
  if (!job) throw new AppError('Job not found or access denied', 404);

  return { recruiter, job };
}

/**
 * Compute a 0-100 skill match score.
 * Exact skill-id match = full proficiency weight.
 * Falls back to case-insensitive name match as a secondary check.
 */
function _skillScore(studentSkills, requiredJobSkills) {
  if (requiredJobSkills.length === 0) return 100; // no requirements = full marks

  const studentSkillMap = new Map(
    studentSkills.map((ss) => [ss.skillId, ss.proficiency ?? 0])
  );
  const studentSkillNameMap = new Map(
    studentSkills.map((ss) => [ss.skill.name.toLowerCase(), ss.proficiency ?? 0])
  );

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const js of requiredJobSkills) {
    const weight = 1; // equal weight per required skill
    totalWeight += weight;

    // Exact ID match
    if (studentSkillMap.has(js.skillId)) {
      const proficiency = studentSkillMap.get(js.skillId);
      // Proficiency 0-100 → contribution 0.5–1.0 (even a beginner gets partial credit)
      earnedWeight += weight * (0.5 + proficiency / 200);
    } else {
      // Fallback: name match (partial credit: 0.3)
      const nameKey = js.skill.name.toLowerCase();
      if (studentSkillNameMap.has(nameKey)) {
        const proficiency = studentSkillNameMap.get(nameKey);
        earnedWeight += weight * (0.3 + proficiency / 333);
      }
    }
  }

  return Math.min((earnedWeight / totalWeight) * 100, 100);
}

/**
 * Experience score based on number of completed internships.
 */
function _experienceScore(internships) {
  const count = internships.length;
  if (count === 0) return 0;
  if (count === 1) return 50;
  if (count === 2) return 75;
  return 100;
}

/**
 * Project relevance score: check techStack + tags overlap with required skill names.
 */
function _projectScore(projects, requiredSkillNames) {
  if (requiredSkillNames.length === 0) return 100;
  if (projects.length === 0) return 0;

  const required = new Set(requiredSkillNames.map((n) => n.toLowerCase()));
  let matchingProjects = 0;

  for (const p of projects) {
    const tokens = [
      ...(p.techStack || []).map((t) => t.toLowerCase()),
      ...(p.tags || []).map((t) => t.toLowerCase()),
    ];
    const hasOverlap = tokens.some((t) => required.has(t));
    if (hasOverlap) matchingProjects++;
  }

  return Math.min((matchingProjects / requiredSkillNames.length) * 100, 100);
}

/**
 * Assessment performance: average of totalScore/maxScore across all assessments.
 */
function _assessmentScore(assessments) {
  if (assessments.length === 0) return 0;
  const scores = assessments.map((a) =>
    a.maxScore > 0 ? (a.totalScore / a.maxScore) * 100 : 0
  );
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  return Math.min(avg, 100);
}

/**
 * Certification relevance (diminishing returns).
 */
function _certScore(certifications) {
  const count = certifications.length;
  if (count === 0) return 0;
  if (count === 1) return 40;
  if (count === 2) return 65;
  return 100;
}

/**
 * Compose all 6 components into the final job-fit score.
 */
function _computeFitScore(student, job) {
  const requiredJobSkills = job.skills; // [{ skillId, skill: { name } }]
  const requiredSkillNames = requiredJobSkills.map((js) => js.skill.name);

  const skillS = _skillScore(student.skills, requiredJobSkills);
  const readinessS = Math.min(Number(student.readinessScore), 100);
  const experienceS = _experienceScore(student.internships);
  const projectS = _projectScore(student.projects, requiredSkillNames);
  const assessmentS = _assessmentScore(student.assessments);
  const certS = _certScore(student.certifications);

  const fitScore =
    skillS * 0.40 +
    readinessS * 0.20 +
    experienceS * 0.15 +
    projectS * 0.10 +
    assessmentS * 0.10 +
    certS * 0.05;

  return {
    fitScore: Math.round(fitScore * 100) / 100,
    breakdown: {
      skillMatch:   Math.round(skillS * 100) / 100,
      readiness:    Math.round(readinessS * 100) / 100,
      experience:   Math.round(experienceS * 100) / 100,
      projects:     Math.round(projectS * 100) / 100,
      assessments:  Math.round(assessmentS * 100) / 100,
      certifications: Math.round(certS * 100) / 100,
    },
  };
}

// ─── AI Justification ────────────────────────────────────────────────────────

/**
 * Generate a 2-3 sentence AI justification for a single candidate.
 */
async function _generateJustification(student, job, breakdown) {
  const topSkills = student.skills
    .sort((a, b) => (b.proficiency ?? 0) - (a.proficiency ?? 0))
    .slice(0, 5)
    .map((s) => `${s.skill.name} (${s.proficiency ?? 0}%)`)
    .join(', ') || 'None listed';

  const projectTitles = student.projects
    .slice(0, 3)
    .map((p) => p.title)
    .join(', ') || 'None';

  const internshipSummary = student.internships
    .slice(0, 2)
    .map((i) => `${i.role} at ${i.company}`)
    .join(', ') || 'None';

  const requiredSkills = job.skills.map((js) => js.skill.name).join(', ') || 'None specified';

  const prompt = `You are a recruitment assistant. Write a 2-3 sentence justification for why the following candidate is a good fit for the job. Be specific and concise.

Job: ${job.title} at ${job.department || 'the company'}
Required skills: ${requiredSkills}

Candidate profile:
- Top skills: ${topSkills}
- Projects: ${projectTitles}
- Experience: ${internshipSummary}
- Job-fit score: ${breakdown.fitScore}/100
- Skill match: ${breakdown.breakdown.skillMatch}%, Readiness: ${breakdown.breakdown.readiness}%, Experience: ${breakdown.breakdown.experience}%

Write only the justification paragraph, no preamble.`;

  const response = await groqChat({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
    temperature: 0.5,
  });
  return response?.choices?.[0]?.message?.content?.trim() || null;
}

/**
 * Async batch: generate AI justifications for top N ranked entries.
 * Updates the Ranking rows in-place. Skips entries that have a fresh justification.
 * Fires-and-forgets (caller does not await).
 */
async function _triggerAiJustifications(rankedEntries, job) {
  const cutoff = new Date(Date.now() - AI_CACHE_TTL_MS);

  // Filter entries that need new justification
  const toGenerate = rankedEntries.slice(0, AI_TOP_N).filter((entry) => {
    if (!entry.aiJustification) return true;
    if (entry.calculatedAt && new Date(entry.calculatedAt) < cutoff) return true;
    return false;
  });

  if (toGenerate.length === 0) return;

  const results = await Promise.allSettled(
    toGenerate.map(async (entry) => {
      try {
        const justification = await _generateJustification(entry._student, job, {
          fitScore: Number(entry.score),
          breakdown: entry._breakdown,
        });
        if (justification) {
          await prisma.ranking.update({
            where: { id: entry.id },
            data: { aiJustification: justification },
          });
        }
      } catch (err) {
        // Non-fatal: AI justification failure should not break the feature
        console.error(`[matching] AI justification failed for ranking ${entry.id}:`, err.message);
      }
    })
  );

  const failed = results.filter((r) => r.status === 'rejected').length;
  if (failed > 0) {
    console.warn(`[matching] ${failed}/${toGenerate.length} AI justification(s) failed.`);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Calculate 6-component job-fit scores for all eligible students and persist
 * them in the Ranking table for the given job.
 *
 * The AI justification step is triggered asynchronously and does NOT block
 * the HTTP response.
 *
 * @param {string} recruiterId  – userId of the authenticated recruiter
 * @param {string} jobId
 * @returns {{ ranked: number, jobId: string }}
 */
async function calculateJobMatches(recruiterId, jobId) {
  const { job } = await _getRecruiterJob(recruiterId, jobId);

  const minScore = job.minimumReadinessScore ?? 0;

  // Fetch all eligible students with all relevant sub-data
  const students = await prisma.student.findMany({
    where: {
      deletedAt: null,
      status: { not: 'inactive' },
      readinessScore: { gte: minScore },
    },
    select: {
      id: true,
      readinessScore: true,
      skills: {
        select: {
          skillId: true,
          proficiency: true,
          skill: { select: { name: true } },
        },
      },
      projects: {
        select: { title: true, techStack: true, tags: true },
      },
      internships: {
        select: { role: true, company: true, startDate: true, endDate: true },
      },
      assessments: {
        select: { totalScore: true, maxScore: true, completedAt: true },
        orderBy: { completedAt: 'desc' },
        take: 10,
      },
      certifications: {
        select: { id: true },
      },
    },
  });

  if (students.length === 0) {
    // Clear any stale rankings for this job
    await prisma.ranking.deleteMany({ where: { jobId } });
    return { ranked: 0, jobId };
  }

  // Score each student
  const scored = students.map((student) => {
    const { fitScore, breakdown } = _computeFitScore(student, job);
    return { student, fitScore, breakdown };
  });

  // Sort descending
  scored.sort((a, b) => b.fitScore - a.fitScore);

  // Assign ranks with tie handling
  let currentRank = 1;
  const ranked = scored.map((entry, i) => {
    if (i > 0 && entry.fitScore < scored[i - 1].fitScore) {
      currentRank = i + 1;
    }
    return {
      studentId: entry.student.id,
      jobId,
      rank: currentRank,
      score: entry.fitScore,
      scoreBreakdown: entry.breakdown,
      calculatedAt: new Date(),
      // internal refs for AI justification (not persisted via this field)
      _student: entry.student,
      _breakdown: entry.breakdown,
    };
  });

  const calculatedAt = new Date();

  // Batch upsert: delete old job rankings, then createMany
  await prisma.$transaction([
    prisma.ranking.deleteMany({ where: { jobId } }),
    prisma.ranking.createMany({
      data: ranked.map((r) => ({
        studentId: r.studentId,
        jobId: r.jobId,
        rank: r.rank,
        score: r.score,
        scoreBreakdown: r.scoreBreakdown,
        calculatedAt,
      })),
    }),
  ]);

  // Fetch the newly created ranking rows (we need IDs for AI updates)
  const freshRankings = await prisma.ranking.findMany({
    where: { jobId },
    orderBy: { rank: 'asc' },
    select: { id: true, studentId: true, rank: true, score: true, aiJustification: true, calculatedAt: true },
  });

  // Attach student + breakdown refs for AI step
  const studentMap = new Map(ranked.map((r) => [r.studentId, { _student: r._student, _breakdown: r._breakdown }]));
  const enrichedForAI = freshRankings.map((r) => ({
    ...r,
    ...studentMap.get(r.studentId),
  }));

  // Fire AI justification asynchronously — don't await
  _triggerAiJustifications(enrichedForAI, job).catch((err) =>
    console.error('[matching] _triggerAiJustifications error:', err)
  );

  return { ranked: ranked.length, jobId };
}

/**
 * Retrieve ranked candidates for a job with optional filtering + pagination.
 *
 * @param {string} recruiterId  – userId of the authenticated recruiter
 * @param {string} jobId
 * @param {{ page, limit, minFitScore, sortBy }} query
 */
async function getJobRankings(recruiterId, jobId, query = {}) {
  const { job } = await _getRecruiterJob(recruiterId, jobId);

  const { page = 1, limit = 50, minFitScore, sortBy = 'fitScore' } = query;
  const skip = (page - 1) * limit;

  // Build where clause
  const where = { jobId };
  if (minFitScore != null) {
    where.score = { gte: minFitScore };
  }

  // Determine orderBy
  let orderBy;
  if (sortBy === 'readinessScore') {
    orderBy = { student: { readinessScore: 'desc' } };
  } else if (sortBy === 'applicationDate') {
    // Sort by the student's application date for this job
    orderBy = { calculatedAt: 'asc' };
  } else {
    orderBy = { rank: 'asc' }; // fitScore desc = rank asc
  }

  const [total, rankings] = await Promise.all([
    prisma.ranking.count({ where }),
    prisma.ranking.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        rank: true,
        score: true,
        aiJustification: true,
        scoreBreakdown: true,
        calculatedAt: true,
        student: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            department: true,
            yearOfStudy: true,
            readinessScore: true,
            skills: {
              select: {
                proficiency: true,
                skill: { select: { name: true } },
              },
              orderBy: { proficiency: 'desc' },
              take: 6,
            },
            applications: {
              where: { jobId },
              select: { appliedAt: true, status: true },
              take: 1,
            },
          },
        },
      },
    }),
  ]);

  const items = rankings.map((r) => ({
    rankingId: r.id,
    rank: r.rank,
    fitScore: Number(r.score),
    aiJustification: r.aiJustification,
    scoreBreakdown: r.scoreBreakdown,
    calculatedAt: r.calculatedAt,
    student: {
      id: r.student.id,
      fullName: r.student.fullName,
      avatarUrl: r.student.avatarUrl,
      department: r.student.department,
      yearOfStudy: r.student.yearOfStudy,
      readinessScore: Number(r.student.readinessScore),
      topSkills: r.student.skills.map((ss) => ({
        name: ss.skill.name,
        proficiency: ss.proficiency,
      })),
      application: r.student.applications[0] ?? null,
    },
  }));

  return {
    job: {
      id: job.id,
      title: job.title,
      department: job.department,
      requiredSkills: job.skills.map((js) => js.skill.name),
    },
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    items,
  };
}

module.exports = { calculateJobMatches, getJobRankings };
