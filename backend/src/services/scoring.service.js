'use strict';

const prisma = require('../lib/prisma');
const { getLearningPace } = require('./learningPace.service');

// ─── V2 Default weights (11 components, total = 100%) ────────────────────────
const DEFAULT_WEIGHTS = {
  technical_skills:    20,
  projects:            12,
  internships:         12,
  certifications:       8,
  assessments:         12,
  coding_practice:     12,
  github_activity:      6,
  events:               3,
  learning_pace:        8,
  roadmap_progress:     4,
  interview_readiness:  3,
};

/**
 * Load score weights from the database, falling back to V2 defaults.
 * @returns {Promise<object>} weights object
 */
async function loadWeights() {
  const dbWeights = await prisma.scoreWeight.findMany();

  if (dbWeights.length === 0) return { ...DEFAULT_WEIGHTS };

  return dbWeights.reduce((acc, row) => {
    acc[row.component] = parseFloat(row.weight);
    return acc;
  }, { ...DEFAULT_WEIGHTS });
}

// ─── Component calculators ────────────────────────────────────────────────────

/**
 * Technical skills score (0–100): average proficiency across all skills.
 */
async function calcTechnicalSkillsScore(studentId) {
  const result = await prisma.studentSkill.aggregate({
    where: { studentId },
    _avg: { proficiency: true },
    _count: { id: true },
  });
  if (result._count.id === 0) return 0;
  return Math.round(result._avg.proficiency || 0);
}

/**
 * Projects score (0–100): min(count * 20, 100) — 5 projects = 100.
 */
async function calcProjectsScore(studentId) {
  const count = await prisma.project.count({ where: { studentId } });
  return Math.min(count * 20, 100);
}

/**
 * Internships score (0–100): 30 per internship + duration bonuses, capped at 100.
 */
async function calcInternshipsScore(studentId) {
  const internships = await prisma.internship.findMany({
    where: { studentId },
    select: { startDate: true, endDate: true },
  });

  if (internships.length === 0) return 0;

  let score = 0;
  for (const intern of internships) {
    score += 30;
    if (intern.endDate && intern.startDate) {
      const months =
        (new Date(intern.endDate) - new Date(intern.startDate)) /
        (1000 * 60 * 60 * 24 * 30);
      if (months >= 3) score += 10;
      if (months >= 6) score += 10;
    }
  }

  return Math.min(score, 100);
}

/**
 * Certifications score (0–100): min(count * 25, 100) — 4 certs = 100.
 */
async function calcCertificationsScore(studentId) {
  const count = await prisma.certification.count({ where: { studentId } });
  return Math.min(count * 25, 100);
}

/**
 * Events score (0–100): base 20 per event + achievement bonuses, capped at 100.
 */
async function calcEventsScore(studentId) {
  const events = await prisma.event.findMany({
    where: { studentId },
    select: { achievement: true },
  });

  if (events.length === 0) return 0;

  let score = events.length * 20;
  for (const ev of events) {
    if (ev.achievement === 'winner') score += 5;
    else if (ev.achievement === 'runner_up' || ev.achievement === 'finalist') score += 3;
    else if (ev.achievement === 'speaker' || ev.achievement === 'organizer') score += 2;
  }

  return Math.min(score, 100);
}

/**
 * Assessments score (0–100): average of (totalScore / maxScore * 100) across assessments.
 */
async function calcAssessmentsScore(studentId) {
  const assessments = await prisma.assessment.findMany({
    where: { studentId },
    select: { totalScore: true, maxScore: true },
  });

  if (assessments.length === 0) return 0;

  const avg =
    assessments.reduce((sum, a) => sum + (a.totalScore / a.maxScore) * 100, 0) /
    assessments.length;

  return Math.round(avg);
}

/**
 * Coding practice score (0–100) from cached LeetCode profile.
 * Formula: min((easy*1 + medium*3 + hard*5) / 2, 100) + contest rating bonus.
 */
async function calcCodingPracticeScore(studentId) {
  const profile = await prisma.leetCodeProfile.findUnique({
    where: { studentId },
    select: { easySolved: true, mediumSolved: true, hardSolved: true, contestRating: true },
  });

  if (!profile) return 0;

  const base = Math.min(
    (profile.easySolved * 1 + profile.mediumSolved * 3 + profile.hardSolved * 5) / 2,
    100
  );

  let bonus = 0;
  if (profile.contestRating) {
    const rating = parseFloat(profile.contestRating);
    if (rating >= 1800) bonus = 10;
    else if (rating >= 1500) bonus = 5;
  }

  return Math.min(Math.round(base + bonus), 100);
}

/**
 * GitHub activity score (0–100) from cached GitHub profile.
 * repos: min(publicRepos*5, 40), stars: min(totalStars*2, 30), contribs: min(count/3, 30)
 */
async function calcGitHubActivityScore(studentId) {
  const profile = await prisma.gitHubProfile.findUnique({
    where: { studentId },
    select: { publicRepos: true, totalStars: true, contributionCount: true },
  });

  if (!profile) return 0;

  const reposScore   = Math.min(profile.publicRepos * 5, 40);
  const starsScore   = Math.min(profile.totalStars * 2, 30);
  const contribScore = Math.min(profile.contributionCount / 3, 30);

  return Math.min(Math.round(reposScore + starsScore + contribScore), 100);
}

/**
 * Learning pace score (0–100): delegates to getLearningPace service.
 */
async function calcLearningPaceScore(studentId) {
  try {
    const pace = await getLearningPace(studentId);
    return typeof pace.paceScore === 'number' ? pace.paceScore : 0;
  } catch {
    return 0;
  }
}

/**
 * Roadmap progress score (0–100).
 * Formula: min(completedModules * 10, 60) + (avgTestScore * 0.4), capped at 100.
 * avgTestScore only counts completed modules with a testScore.
 */
async function calcRoadmapProgressScore(studentId) {
  // Only consider roadmaps belonging to this student
  const roadmaps = await prisma.roadmap.findMany({
    where: { studentId },
    select: { id: true },
  });

  if (roadmaps.length === 0) return 0;

  const roadmapIds = roadmaps.map((r) => r.id);

  const completedModules = await prisma.roadmapProgress.findMany({
    where: { roadmapId: { in: roadmapIds }, status: 'completed' },
    select: { testScore: true },
  });

  const completedCount = completedModules.length;
  if (completedCount === 0) return 0;

  const withScores = completedModules.filter((m) => m.testScore !== null);
  const avgTestScore =
    withScores.length > 0
      ? withScores.reduce((s, m) => s + m.testScore, 0) / withScores.length
      : 0;

  const score = Math.min(completedCount * 10, 60) + avgTestScore * 0.4;
  return Math.min(Math.round(score), 100);
}

/**
 * Interview readiness score (0–100): average overallScore across completed mock interviews.
 */
async function calcInterviewReadinessScore(studentId) {
  const interviews = await prisma.mockInterview.findMany({
    where: { studentId, status: 'completed', overallScore: { not: null } },
    select: { overallScore: true },
  });

  if (interviews.length === 0) return 0;

  const avg =
    interviews.reduce((s, i) => s + i.overallScore, 0) / interviews.length;

  return Math.min(Math.round(avg), 100);
}

// ─── Profile Completion ───────────────────────────────────────────────────────

/**
 * Calculate profile completion percentage (V2).
 * Includes linkedinPdfUrl and resume check.
 */
function calcProfileCompletion(student) {
  const fields = [
    student.fullName,
    student.phone,
    student.linkedin,
    student.website,
    student.location,
    student.expectedGrad,
    student.bio,
    student.gpa,
    student.avatarUrl,
    student.githubUsername,
    student.leetcodeUsername,
    student.linkedinPdfUrl,
  ];

  // resumeCount passed in via student._count?.resumes (optional)
  const hasResume = (student._count?.resumes ?? 0) > 0;
  const filled = fields.filter((v) => v !== null && v !== undefined && v !== '').length +
    (hasResume ? 1 : 0);

  return Math.round((filled / (fields.length + 1)) * 100);
}

// ─── Main recalculate ─────────────────────────────────────────────────────────

/**
 * Recalculate the readiness score for a student (V2 — 11 components).
 * Updates score_breakdowns, students.readiness_score, and students.profile_completion.
 *
 * @param {string} studentId
 * @returns {Promise<object>} Updated score breakdown
 */
async function recalculateScore(studentId) {
  const [
    weights,
    skillsScore,
    projectsScore,
    internshipsScore,
    certsScore,
    assessScore,
    eventsScore,
    codingScore,
    githubScore,
    learningPaceScore,
    roadmapScore,
    interviewScore,
  ] = await Promise.all([
    loadWeights(),
    calcTechnicalSkillsScore(studentId),
    calcProjectsScore(studentId),
    calcInternshipsScore(studentId),
    calcCertificationsScore(studentId),
    calcAssessmentsScore(studentId),
    calcEventsScore(studentId),
    calcCodingPracticeScore(studentId),
    calcGitHubActivityScore(studentId),
    calcLearningPaceScore(studentId),
    calcRoadmapProgressScore(studentId),
    calcInterviewReadinessScore(studentId),
  ]);

  // Weighted total — each component score is 0–100, weight is a percentage
  const totalScore =
    (skillsScore     * (weights.technical_skills    || 0)) / 100 +
    (projectsScore   * (weights.projects             || 0)) / 100 +
    (internshipsScore * (weights.internships         || 0)) / 100 +
    (certsScore      * (weights.certifications       || 0)) / 100 +
    (assessScore     * (weights.assessments          || 0)) / 100 +
    (eventsScore     * (weights.events               || 0)) / 100 +
    (codingScore     * (weights.coding_practice      || 0)) / 100 +
    (githubScore     * (weights.github_activity      || 0)) / 100 +
    (learningPaceScore * (weights.learning_pace      || 0)) / 100 +
    (roadmapScore    * (weights.roadmap_progress     || 0)) / 100 +
    (interviewScore  * (weights.interview_readiness  || 0)) / 100;

  const roundedTotal = Math.round(totalScore * 100) / 100;

  // Fetch student for profile completion calc (V2 includes linkedinPdfUrl + resume count)
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      fullName: true,
      phone: true,
      linkedin: true,
      website: true,
      location: true,
      expectedGrad: true,
      bio: true,
      gpa: true,
      avatarUrl: true,
      githubUsername: true,
      leetcodeUsername: true,
      linkedinPdfUrl: true,
      _count: { select: { resumes: true } },
    },
  });

  const profileCompletion = student ? calcProfileCompletion(student) : 0;

  // Upsert score breakdown
  const breakdown = await prisma.scoreBreakdown.upsert({
    where: { studentId },
    create: {
      studentId,
      technicalSkills:    skillsScore,
      projects:           projectsScore,
      internships:        internshipsScore,
      certifications:     certsScore,
      assessments:        assessScore,
      events:             eventsScore,
      codingPractice:     codingScore,
      githubActivity:     githubScore,
      learningPace:       learningPaceScore,
      roadmapProgress:    roadmapScore,
      interviewReadiness: interviewScore,
      totalScore:         roundedTotal,
      lastCalculatedAt:   new Date(),
    },
    update: {
      technicalSkills:    skillsScore,
      projects:           projectsScore,
      internships:        internshipsScore,
      certifications:     certsScore,
      assessments:        assessScore,
      events:             eventsScore,
      codingPractice:     codingScore,
      githubActivity:     githubScore,
      learningPace:       learningPaceScore,
      roadmapProgress:    roadmapScore,
      interviewReadiness: interviewScore,
      totalScore:         roundedTotal,
      lastCalculatedAt:   new Date(),
    },
  });

  // Update student record
  await prisma.student.update({
    where: { id: studentId },
    data: { readinessScore: roundedTotal, profileCompletion },
  });

  return {
    studentId,
    components: {
      technicalSkills:    skillsScore,
      projects:           projectsScore,
      internships:        internshipsScore,
      certifications:     certsScore,
      assessments:        assessScore,
      events:             eventsScore,
      codingPractice:     codingScore,
      githubActivity:     githubScore,
      learningPace:       learningPaceScore,
      roadmapProgress:    roadmapScore,
      interviewReadiness: interviewScore,
    },
    weights,
    totalScore: roundedTotal,
    profileCompletion,
    lastCalculatedAt: breakdown.lastCalculatedAt,
  };
}

// ─── Score labels ─────────────────────────────────────────────────────────────

function getScoreLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Low';
  return 'Needs Preparation';
}

function getReadinessClassification(score) {
  if (score >= 85) return 'Placement Ready';
  if (score >= 70) return 'High Potential';
  if (score >= 50) return 'Developing';
  return 'Needs Focus';
}

module.exports = {
  recalculateScore,
  getScoreLabel,
  getReadinessClassification,
  loadWeights,
};
