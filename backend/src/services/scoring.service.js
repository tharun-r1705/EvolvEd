'use strict';

const prisma = require('../lib/prisma');

// Default score weights (will be overridden by DB values if present)
const DEFAULT_WEIGHTS = {
  technical_skills: 28,
  projects: 20,
  internships: 18,
  certifications: 10,
  assessments: 19,
  events: 5,
};

/**
 * Load score weights from the database, falling back to defaults.
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

/**
 * Calculate the proficiency score (0-100) from a student's skills.
 * Returns the average proficiency across all skills.
 * @param {string} studentId
 * @returns {Promise<number>}
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
 * Calculate project score (0-100).
 * Formula: min(count * 20, 100) — 5 projects = 100
 * @param {string} studentId
 * @returns {Promise<number>}
 */
async function calcProjectsScore(studentId) {
  const count = await prisma.project.count({ where: { studentId } });
  return Math.min(count * 20, 100);
}

/**
 * Calculate internship score (0-100).
 * Formula: min(count * 40, 100) — 3 internships = 100 (capped)
 * Additional scoring for duration.
 * @param {string} studentId
 * @returns {Promise<number>}
 */
async function calcInternshipsScore(studentId) {
  const internships = await prisma.internship.findMany({
    where: { studentId },
    select: { startDate: true, endDate: true },
  });

  if (internships.length === 0) return 0;

  // Base: 30 per internship, bonus: up to 10 per internship for duration > 3 months
  let score = 0;
  for (const intern of internships) {
    score += 30;
    if (intern.endDate && intern.startDate) {
      const months =
        (new Date(intern.endDate) - new Date(intern.startDate)) /
        (1000 * 60 * 60 * 24 * 30);
      if (months >= 3) score += 10;
      if (months >= 6) score += 10; // additional bonus for 6+ months
    }
  }

  return Math.min(score, 100);
}

/**
 * Calculate certification score (0-100).
 * Formula: min(count * 25, 100) — 4 certifications = 100
 * @param {string} studentId
 * @returns {Promise<number>}
 */
async function calcCertificationsScore(studentId) {
  const count = await prisma.certification.count({ where: { studentId } });
  return Math.min(count * 25, 100);
}

/**
 * Calculate events score (0-100).
 * Formula: min(count * 20, 100) — 5 events = 100.
 * Bonus: +5 per winning/runner_up achievement (capped by overall 100).
 * @param {string} studentId
 * @returns {Promise<number>}
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
 * Calculate assessment score (0-100).
 * Returns the average of (totalScore / maxScore * 100) across all assessments.
 * @param {string} studentId
 * @returns {Promise<number>}
 */
async function calcAssessmentsScore(studentId) {
  const assessments = await prisma.assessment.findMany({
    where: { studentId },
    select: { totalScore: true, maxScore: true },
  });

  if (assessments.length === 0) return 0;

  const avg =
    assessments.reduce((sum, a) => {
      return sum + (a.totalScore / a.maxScore) * 100;
    }, 0) / assessments.length;

  return Math.round(avg);
}

/**
 * Calculate profile completion percentage.
 * @param {object} student - Student record with all fields
 * @returns {number} 0-100
 */
function calcProfileCompletion(student) {
  // Each field contributes equally; weight total to 100
  const fields = [
    { key: 'fullName', value: student.fullName },           // core
    { key: 'phone', value: student.phone },                 // contact
    { key: 'linkedin', value: student.linkedin },           // social
    { key: 'website', value: student.website },             // portfolio
    { key: 'location', value: student.location },           // location
    { key: 'expectedGrad', value: student.expectedGrad },   // academic
    { key: 'bio', value: student.bio },                     // about
    { key: 'gpa', value: student.gpa },                     // academic
    { key: 'avatarUrl', value: student.avatarUrl },         // avatar
    { key: 'githubUsername', value: student.githubUsername }, // coding
    { key: 'leetcodeUsername', value: student.leetcodeUsername }, // coding
  ];

  const filled = fields.filter(
    ({ value }) => value !== null && value !== undefined && value !== ''
  ).length;

  return Math.round((filled / fields.length) * 100);
}

/**
 * MAIN: Recalculate the readiness score for a student.
 * Updates score_breakdowns, students.readiness_score, and students.profile_completion.
 *
 * @param {string} studentId
 * @returns {Promise<object>} Updated score breakdown
 */
async function recalculateScore(studentId) {
  const [weights, skillsScore, projectsScore, internshipsScore, certsScore, assessScore, eventsScore] =
    await Promise.all([
      loadWeights(),
      calcTechnicalSkillsScore(studentId),
      calcProjectsScore(studentId),
      calcInternshipsScore(studentId),
      calcCertificationsScore(studentId),
      calcAssessmentsScore(studentId),
      calcEventsScore(studentId),
    ]);

  // Weighted total (each component is 0-100, weight is a percentage)
  const totalScore =
    (skillsScore * weights.technical_skills) / 100 +
    (projectsScore * weights.projects) / 100 +
    (internshipsScore * weights.internships) / 100 +
    (certsScore * weights.certifications) / 100 +
    (assessScore * weights.assessments) / 100 +
    (eventsScore * (weights.events || 0)) / 100;

  const roundedTotal = Math.round(totalScore * 100) / 100;

  // Fetch student for profile completion calc
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
    },
  });

  const profileCompletion = student ? calcProfileCompletion(student) : 0;

  // Upsert score breakdown
  const breakdown = await prisma.scoreBreakdown.upsert({
    where: { studentId },
    create: {
      studentId,
      technicalSkills: skillsScore,
      projects: projectsScore,
      internships: internshipsScore,
      certifications: certsScore,
      assessments: assessScore,
      events: eventsScore,
      totalScore: roundedTotal,
      lastCalculatedAt: new Date(),
    },
    update: {
      technicalSkills: skillsScore,
      projects: projectsScore,
      internships: internshipsScore,
      certifications: certsScore,
      assessments: assessScore,
      events: eventsScore,
      totalScore: roundedTotal,
      lastCalculatedAt: new Date(),
    },
  });

  // Update student record
  await prisma.student.update({
    where: { id: studentId },
    data: {
      readinessScore: roundedTotal,
      profileCompletion,
    },
  });

  return {
    studentId,
    components: {
      technicalSkills: skillsScore,
      projects: projectsScore,
      internships: internshipsScore,
      certifications: certsScore,
      assessments: assessScore,
      events: eventsScore,
    },
    weights,
    totalScore: roundedTotal,
    profileCompletion,
    lastCalculatedAt: breakdown.lastCalculatedAt,
  };
}

/**
 * Get score label based on score value.
 * @param {number} score
 * @returns {string}
 */
function getScoreLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Low';
  return 'Needs Preparation';
}

/**
 * Get readiness classification for dashboard display.
 * @param {number} score
 * @returns {string}
 */
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
