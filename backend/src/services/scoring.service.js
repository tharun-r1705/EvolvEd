'use strict';

const prisma = require('../lib/prisma');
const { getLearningPace } = require('./learningPace.service');

// ═══════════════════════════════════════════════════════════════════════════════
// PLACEMENT READINESS SCORING ENGINE v3
// ═══════════════════════════════════════════════════════════════════════════════
//
// Design principles:
//   1. Every formula maps to what recruiters actually evaluate
//   2. Diminishing returns — first items matter most, quantity alone won't max out
//   3. Quality signals — descriptions, tech stacks, live URLs count
//   4. The AI mentor can justify every sub-score with actionable advice
//   5. Weights reflect real placement-interview emphasis
//
// Score pillars (weighted total = 100):
//
//   Coding Practice      18%  — DSA/problem-solving (interviews start here)
//   Projects             15%  — Portfolio quality & diversity
//   Internships          15%  — Industry experience
//   Technical Skills     12%  — Breadth + depth of declared skills
//   Assessments          10%  — Academic aptitude / test performance
//   Interview Readiness   8%  — Mock interview scores
//   GitHub Activity        6%  — Contribution consistency & code activity
//   Certifications         5%  — Verified credentials
//   Events                 4%  — Hackathons, workshops, competitions
//   Learning Pace          4%  — Consistency streak & growth rate
//   Roadmap Progress       3%  — Self-directed structured learning
//
// Each component returns 0–100. Weighted sum → readinessScore 0–100.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Weights ──────────────────────────────────────────────────────────────────

const DEFAULT_WEIGHTS = {
  coding_practice:     18,
  projects:            15,
  internships:         15,
  technical_skills:    12,
  assessments:         10,
  interview_readiness:  8,
  github_activity:      6,
  certifications:       5,
  events:               4,
  learning_pace:        4,
  roadmap_progress:     3,
};

async function loadWeights() {
  const dbWeights = await prisma.scoreWeight.findMany();
  if (dbWeights.length === 0) return { ...DEFAULT_WEIGHTS };
  return dbWeights.reduce((acc, row) => {
    acc[row.component] = parseFloat(row.weight);
    return acc;
  }, { ...DEFAULT_WEIGHTS });
}

// ─── Utility: diminishing-return curve ────────────────────────────────────────
// Maps a raw count to 0–cap using a log curve: cap × ln(1 + count/scale) / ln(1 + target/scale)
// At count=target the output equals cap. Beyond target it keeps growing but slows down.
function logCurve(count, target, cap) {
  if (count <= 0) return 0;
  const scale = target * 0.5;
  const raw = cap * Math.log(1 + count / scale) / Math.log(1 + target / scale);
  return Math.min(Math.round(raw), cap);
}

// ─── Component Calculators ────────────────────────────────────────────────────

/**
 * CODING PRACTICE (0–100)  — Weight: 18%
 *
 * Rationale: Most placement interviews are DSA-heavy. This is the single
 * biggest predictor of interview success.
 *
 * Formula (3 tiers reflecting real interview difficulty):
 *   Easy    → min(solved, 50) × 0.3   … max 15 pts (warm-up, basics)
 *   Medium  → min(solved, 80) × 0.6   … max 48 pts (core interview range)
 *   Hard    → min(solved, 30) × 1.2   … max 36 pts (differentiator)
 *   Contest → +5 if rating ≥ 1500, +10 if ≥ 1800 (rare signal of excellence)
 *
 * Justification an AI mentor can give:
 *   "You've solved 23 medium problems — aim for 50+ to cover the core
 *    patterns companies test (sliding window, BFS/DFS, DP). That alone
 *    would push your Coding Practice to ~70."
 */
async function calcCodingPracticeScore(studentId) {
  const p = await prisma.leetCodeProfile.findUnique({
    where: { studentId },
    select: { easySolved: true, mediumSolved: true, hardSolved: true, contestRating: true },
  });
  if (!p) return 0;

  const easy   = Math.min(p.easySolved, 50) * 0.3;
  const medium = Math.min(p.mediumSolved, 80) * 0.6;
  const hard   = Math.min(p.hardSolved, 30) * 1.2;

  let bonus = 0;
  if (p.contestRating) {
    const r = parseFloat(p.contestRating);
    if (r >= 1800)      bonus = 10;
    else if (r >= 1500) bonus = 5;
  }

  return Math.min(Math.round(easy + medium + hard + bonus), 100);
}

/**
 * PROJECTS (0–100)  — Weight: 15%
 *
 * Rationale: Recruiters skim portfolios — count alone is misleading.
 * A project with a description, diverse tech stack, and a live URL
 * demonstrates real ability; a titled-only stub does not.
 *
 * Formula:
 *   Base      = logCurve(count, target=5, cap=40)     ← 5 projects ≈ 40 pts
 *   Quality   = per-project points (max 12 pts each, total capped at 60):
 *     +3  has description ≥ 50 chars
 *     +3  has techStack with ≥ 2 technologies
 *     +3  has a GitHub URL
 *     +3  has a live URL (deployed)
 *
 * Justification:
 *   "You have 3 projects, but only 1 has a live link and description.
 *    Adding descriptions and deploying your projects would raise this from 42 to ~70."
 */
async function calcProjectsScore(studentId) {
  const projects = await prisma.project.findMany({
    where: { studentId },
    select: { description: true, techStack: true, githubUrl: true, url: true },
  });

  if (projects.length === 0) return 0;

  const base = logCurve(projects.length, 5, 40);

  let quality = 0;
  for (const p of projects) {
    let q = 0;
    if (p.description && p.description.length >= 50) q += 3;
    if (Array.isArray(p.techStack) && p.techStack.length >= 2) q += 3;
    if (p.githubUrl) q += 3;
    if (p.url) q += 3;
    quality += q;
  }
  quality = Math.min(quality, 60);

  return Math.min(base + quality, 100);
}

/**
 * INTERNSHIPS (0–100)  — Weight: 15%
 *
 * Rationale: Companies value real industry exposure. A 6-month internship
 * at a real company carries more weight than finishing 5 online courses.
 * Diminishing returns: 1st internship = huge boost, 3rd = marginal.
 *
 * Formula:
 *   1st internship         → 40 pts
 *   2nd                    → +25 pts
 *   3rd+                   → +10 each (diminishing)
 *   Duration bonus per internship: +5 if ≥ 3 months, +5 more if ≥ 6 months
 *
 * Justification:
 *   "Your 4-month internship scores you 45/100. A second internship of
 *    any duration would push this to ~75."
 */
async function calcInternshipsScore(studentId) {
  const internships = await prisma.internship.findMany({
    where: { studentId },
    select: { startDate: true, endDate: true },
  });

  if (internships.length === 0) return 0;

  let score = 0;
  internships.forEach((intern, idx) => {
    // Diminishing base per internship
    if (idx === 0) score += 40;
    else if (idx === 1) score += 25;
    else score += 10;

    // Duration bonus
    if (intern.endDate && intern.startDate) {
      const months = (new Date(intern.endDate) - new Date(intern.startDate)) / (1000 * 60 * 60 * 24 * 30);
      if (months >= 3) score += 5;
      if (months >= 6) score += 5;
    }
  });

  return Math.min(score, 100);
}

/**
 * TECHNICAL SKILLS (0–100)  — Weight: 12%
 *
 * Rationale: Skills proficiency shows breadth (how many skills) and depth
 * (how proficient). A student who declares 10 skills at proficiency 20 is
 * weaker than one with 5 skills at proficiency 80.
 *
 * Formula:
 *   avgProficiency × depthMultiplier
 *   depthMultiplier = 1 + 0.05 × min(skillCount, 8)
 *   → Having 4–8 skills amplifies the average by up to 40%
 *   → More than 8 gives no extra multiplier (prevents keyword-stuffing)
 *
 * Justification:
 *   "Your 6 skills average 55 proficiency. To reach 80+, deepen your
 *    strongest 3 skills through projects and assessments."
 */
async function calcTechnicalSkillsScore(studentId) {
  const result = await prisma.studentSkill.aggregate({
    where: { studentId },
    _avg: { proficiency: true },
    _count: { id: true },
  });

  if (result._count.id === 0) return 0;

  const avg = result._avg.proficiency || 0;
  const depthMultiplier = 1 + 0.05 * Math.min(result._count.id, 8);
  return Math.min(Math.round(avg * depthMultiplier), 100);
}

/**
 * ASSESSMENTS (0–100)  — Weight: 10%
 *
 * Rationale: Test performance shows academic aptitude. Recent assessments
 * matter more (improvement trajectory).
 *
 * Formula: Recency-weighted average of (totalScore / maxScore × 100).
 *   Most recent assessment gets weight 1.5; each older one fades by 0.1
 *   (minimum weight 1.0). This rewards improvement over time.
 *
 * Justification:
 *   "Your assessment average is 68%, up from 55% three months ago.
 *    Your upward trend is reflected in the recency weighting."
 */
async function calcAssessmentsScore(studentId) {
  const assessments = await prisma.assessment.findMany({
    where: { studentId },
    select: { totalScore: true, maxScore: true, completedAt: true },
    orderBy: { completedAt: 'desc' },
    take: 20,
  });

  if (assessments.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  assessments.forEach((a, idx) => {
    const pct = (a.totalScore / a.maxScore) * 100;
    const w = Math.max(1.5 - idx * 0.1, 1.0);
    weightedSum += pct * w;
    totalWeight += w;
  });

  return Math.round(weightedSum / totalWeight);
}

/**
 * INTERVIEW READINESS (0–100)  — Weight: 8%
 *
 * Rationale: Mock interviews are the closest simulation of placement day.
 * Scoring well here means the student can communicate, structure answers,
 * and handle pressure.
 *
 * Formula:
 *   avgScore × 10 (interviews are scored 0–10)
 *   + diversity bonus: +5 for each distinct type (technical, hr, behavioral)
 *     beyond the first, capped at +10
 *
 * Justification:
 *   "You average 6.8/10 across 3 technical interviews. Try an HR or
 *    behavioral mock to earn the diversity bonus and cover all angles."
 */
async function calcInterviewReadinessScore(studentId) {
  const interviews = await prisma.mockInterview.findMany({
    where: { studentId, status: 'completed', overallScore: { not: null } },
    select: { overallScore: true, type: true },
  });

  if (interviews.length === 0) return 0;

  const avg = interviews.reduce((s, i) => s + i.overallScore, 0) / interviews.length;
  const base = avg * 10; // 0–100

  // Diversity bonus: distinct interview types beyond the first
  const types = new Set(interviews.map((i) => i.type?.toLowerCase()).filter(Boolean));
  const diversityBonus = Math.min((types.size - 1) * 5, 10);

  return Math.min(Math.round(base + diversityBonus), 100);
}

/**
 * GITHUB ACTIVITY (0–100)  — Weight: 6%
 *
 * Rationale: Consistent contributions signal real coding habit. Stars
 * are vanity — contribution count is the signal.
 *
 * Formula:
 *   Contributions: logCurve(count, target=200, cap=70)   ← 200 contribs ≈ 70
 *   Active repos:  min(publicRepos × 6, 30)              ← 5 repos ≈ 30
 *
 * Justification:
 *   "You have 85 contributions this year and 4 public repos (score: 52).
 *    Reaching 150+ contributions would push this past 70."
 */
async function calcGitHubActivityScore(studentId) {
  const p = await prisma.gitHubProfile.findUnique({
    where: { studentId },
    select: { publicRepos: true, contributionCount: true },
  });
  if (!p) return 0;

  const contribScore = logCurve(p.contributionCount, 200, 70);
  const repoScore    = Math.min(p.publicRepos * 6, 30);

  return Math.min(contribScore + repoScore, 100);
}

/**
 * CERTIFICATIONS (0–100)  — Weight: 5%
 *
 * Rationale: Certs verify learning, but have diminishing value — 2–3
 * relevant certifications are strong; 10 certificates don't mean 5× more.
 *
 * Formula: logCurve(count, target=4, cap=100)
 *   1 cert ≈ 40, 2 ≈ 65, 4 ≈ 100
 *
 * Justification:
 *   "You have 1 certification (score: 40). One more relevant cert
 *    (AWS, Azure, Google Cloud, etc.) would push this to ~65."
 */
async function calcCertificationsScore(studentId) {
  const count = await prisma.certification.count({ where: { studentId } });
  return logCurve(count, 4, 100);
}

/**
 * EVENTS (0–100)  — Weight: 4%
 *
 * Rationale: Hackathon wins and competition achievements show initiative
 * and teamwork. Passive attendance has some value, but achievements
 * differentiate.
 *
 * Formula:
 *   Base = logCurve(count, target=5, cap=50)
 *   Achievement bonus per event:
 *     winner/finalist  → +15
 *     runner_up        → +12
 *     speaker/organizer→ +8
 *     participant      → +2
 *   Total capped at 100.
 *
 * Justification:
 *   "You attended 3 events with 1 hackathon win (score: 62). Keep
 *    participating — another win or organizing role would push past 75."
 */
async function calcEventsScore(studentId) {
  const events = await prisma.event.findMany({
    where: { studentId },
    select: { achievement: true },
  });

  if (events.length === 0) return 0;

  const base = logCurve(events.length, 5, 50);

  let bonus = 0;
  for (const ev of events) {
    switch (ev.achievement) {
      case 'winner':
      case 'finalist':   bonus += 15; break;
      case 'runner_up':  bonus += 12; break;
      case 'speaker':
      case 'organizer':  bonus += 8;  break;
      default:           bonus += 2;  break;
    }
  }

  return Math.min(base + bonus, 100);
}

/**
 * LEARNING PACE (0–100)  — Weight: 4%
 *
 * Rationale: Consistency matters — students who learn daily grow faster.
 * Delegates to the existing getLearningPace service.
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
 * ROADMAP PROGRESS (0–100)  — Weight: 3%
 *
 * Rationale: Completing structured roadmaps with good test scores shows
 * disciplined, self-directed learning — a supplementary signal.
 *
 * Formula:
 *   completedModules × 10  (capped at 60)
 *   + avgTestScore × 0.4   (capped at 40)
 */
async function calcRoadmapProgressScore(studentId) {
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

  if (completedModules.length === 0) return 0;

  const withScores = completedModules.filter((m) => m.testScore !== null);
  const avgTestScore = withScores.length > 0
    ? withScores.reduce((s, m) => s + m.testScore, 0) / withScores.length
    : 0;

  const modulePts = Math.min(completedModules.length * 10, 60);
  const testPts   = Math.min(avgTestScore * 0.4, 40);
  return Math.min(Math.round(modulePts + testPts), 100);
}

// ─── Profile Completion (unchanged — separate from readiness) ─────────────────

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

  const hasResume = (student._count?.resumes ?? 0) > 0;
  const filled = fields.filter((v) => v !== null && v !== undefined && v !== '').length +
    (hasResume ? 1 : 0);

  return Math.round((filled / (fields.length + 1)) * 100);
}

// ─── Main Recalculate ─────────────────────────────────────────────────────────

async function recalculateScore(studentId) {
  const [
    weights,
    codingScore,
    projectsScore,
    internshipsScore,
    skillsScore,
    assessScore,
    interviewScore,
    githubScore,
    certsScore,
    eventsScore,
    learningPaceScore,
    roadmapScore,
  ] = await Promise.all([
    loadWeights(),
    calcCodingPracticeScore(studentId),
    calcProjectsScore(studentId),
    calcInternshipsScore(studentId),
    calcTechnicalSkillsScore(studentId),
    calcAssessmentsScore(studentId),
    calcInterviewReadinessScore(studentId),
    calcGitHubActivityScore(studentId),
    calcCertificationsScore(studentId),
    calcEventsScore(studentId),
    calcLearningPaceScore(studentId),
    calcRoadmapProgressScore(studentId),
  ]);

  // Weighted total: each component (0-100) × weight(%) / 100
  const totalScore =
    (codingScore        * (weights.coding_practice     || 0)) / 100 +
    (projectsScore      * (weights.projects            || 0)) / 100 +
    (internshipsScore   * (weights.internships         || 0)) / 100 +
    (skillsScore        * (weights.technical_skills    || 0)) / 100 +
    (assessScore        * (weights.assessments         || 0)) / 100 +
    (interviewScore     * (weights.interview_readiness || 0)) / 100 +
    (githubScore        * (weights.github_activity     || 0)) / 100 +
    (certsScore         * (weights.certifications      || 0)) / 100 +
    (eventsScore        * (weights.events              || 0)) / 100 +
    (learningPaceScore  * (weights.learning_pace       || 0)) / 100 +
    (roadmapScore       * (weights.roadmap_progress    || 0)) / 100;

  const roundedTotal = Math.round(totalScore * 100) / 100;

  // Profile completion
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      fullName: true, phone: true, linkedin: true, website: true,
      location: true, expectedGrad: true, bio: true, gpa: true,
      avatarUrl: true, githubUsername: true, leetcodeUsername: true,
      linkedinPdfUrl: true, _count: { select: { resumes: true } },
    },
  });
  const profileCompletion = student ? calcProfileCompletion(student) : 0;

  // Upsert ScoreBreakdown (same 11 columns)
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

// ─── Score Labels ─────────────────────────────────────────────────────────────

function getScoreLabel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Good';
  if (score >= 40) return 'Developing';
  if (score >= 25) return 'Needs Work';
  return 'Getting Started';
}

function getReadinessClassification(score) {
  if (score >= 80) return 'Placement Ready';
  if (score >= 60) return 'High Potential';
  if (score >= 40) return 'Developing';
  if (score >= 20) return 'Building Foundation';
  return 'Just Starting';
}

module.exports = {
  recalculateScore,
  getScoreLabel,
  getReadinessClassification,
  loadWeights,
};
