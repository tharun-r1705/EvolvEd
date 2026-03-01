'use strict';

const prisma = require('../lib/prisma');

// ─── Constants ─────────────────────────────────────────────────────────────

const THIRTY_DAYS_MS  = 30  * 24 * 60 * 60 * 1000;
const NINETY_DAYS_MS  = 90  * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS   = 7   * 24 * 60 * 60 * 1000;
const QUARTER_MS      = 91  * 24 * 60 * 60 * 1000;

// ─── Helpers ───────────────────────────────────────────────────────────────

function countInWindow(activities, type, windowMs) {
  const cutoff = new Date(Date.now() - windowMs);
  return activities.filter(
    (a) => a.type === type && new Date(a.completedAt) >= cutoff
  ).length;
}

function getActiveDaysInWindow(activities, windowMs) {
  const cutoff = new Date(Date.now() - windowMs);
  const days = new Set(
    activities
      .filter((a) => new Date(a.completedAt) >= cutoff)
      .map((a) => new Date(a.completedAt).toISOString().slice(0, 10))
  );
  return days.size;
}

/**
 * Build a 12-week activity histogram (count of all activities per ISO week).
 * Returns [{week, count}] sorted oldest-first.
 */
function buildWeeklyTrend(activities) {
  const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000);
  const weekMap = {};

  for (const a of activities) {
    const d = new Date(a.completedAt);
    if (d < twelveWeeksAgo) continue;
    const weekStart = new Date(d);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    const key = weekStart.toISOString().slice(0, 10);
    weekMap[key] = (weekMap[key] || 0) + 1;
  }

  // Fill all 12 weeks (some may have 0 activity)
  const weeks = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7 - d.getDay());
    const key = d.toISOString().slice(0, 10);
    weeks.push({ week: key, count: weekMap[key] || 0 });
  }
  return weeks;
}

/**
 * Calculate assessment improvement rate over last 5 assessments.
 * Returns a score 0-100 where:
 *   50 = flat/no data, >50 = improving, <50 = declining
 */
function calcAssessmentImprovementRate(assessments) {
  if (assessments.length < 2) return 50;
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.completedAt) - new Date(b.completedAt)
  );
  const scores = sorted.map((a) => (a.totalScore / a.maxScore) * 100);
  // Simple linear regression slope normalised to 0-100
  const n = scores.length;
  const meanX = (n - 1) / 2;
  const meanY = scores.reduce((s, v) => s + v, 0) / n;
  const numerator = scores.reduce((s, v, i) => s + (i - meanX) * (v - meanY), 0);
  const denominator = scores.reduce((s, _, i) => s + (i - meanX) ** 2, 0);
  const slope = denominator === 0 ? 0 : numerator / denominator; // pts per assessment
  // Map slope to 0-100: slope=0 → 50, slope=+5 → 100, slope=-5 → 0
  return Math.min(100, Math.max(0, Math.round(50 + slope * 10)));
}

/**
 * Calculate LeetCode activity score from recent learning activities.
 * Returns 0-100.
 */
function calcLeetCodeActivityScore(activities) {
  const last30 = countInWindow(activities, 'leetcode_solved', THIRTY_DAYS_MS);
  return Math.min(last30 * 5, 100); // 20 problems/month → 100
}

// ─── Pace Label ────────────────────────────────────────────────────────────

function getPaceLabel(score) {
  if (score >= 75) return 'Fast Learner';
  if (score >= 50) return 'Steady';
  if (score >= 25) return 'Needs Push';
  return 'Getting Started';
}

function getPaceColor(label) {
  const map = {
    'Fast Learner':    '#16a34a',
    'Steady':          '#c6a43f',
    'Needs Push':      '#ea580c',
    'Getting Started': '#dc2626',
  };
  return map[label] ?? '#64748b';
}

// ─── Main Calculation ──────────────────────────────────────────────────────

async function getLearningPace(studentId) {
  const [activities, assessments, peerCount] = await Promise.all([
    prisma.learningActivity.findMany({
      where: { studentId },
      select: { type: true, completedAt: true, score: true },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.assessment.findMany({
      where: { studentId },
      select: { totalScore: true, maxScore: true, completedAt: true },
      orderBy: { completedAt: 'desc' },
      take: 5,
    }),
    // Count of peers with at least one activity (for percentile comparison)
    prisma.learningActivity.groupBy({
      by: ['studentId'],
      _count: { id: true },
    }).then((rows) => rows.length).catch(() => 1),
  ]);

  // ── Component scores ──────────────────────────────────────────

  // 1. Skill acquisition rate (new skills added per rolling 3 months)
  const skillsAdded3m   = countInWindow(activities, 'skill_added', NINETY_DAYS_MS);
  const skillAcqScore   = Math.min(skillsAdded3m * 20, 100); // 5+ skills/3m → 100

  // 2. Assessment improvement rate (trend over last 5 assessments)
  const assessImprove   = calcAssessmentImprovementRate(assessments);

  // 3. Project completion frequency (projects in last 3 months)
  const projectsDone3m  = countInWindow(activities, 'project_completed', NINETY_DAYS_MS);
  const projectFreqScore = Math.min(projectsDone3m * 35, 100); // 3+ projects → 100

  // 4. Certification velocity (certs earned per quarter)
  const certsPerQuarter = countInWindow(activities, 'cert_earned', QUARTER_MS);
  const certVeloScore   = Math.min(certsPerQuarter * 34, 100); // 3+ certs/quarter → 100

  // 5. Consistency score (active days in last 30 days)
  const activeDays30    = getActiveDaysInWindow(activities, THIRTY_DAYS_MS);
  const consistencyScore = Math.min(Math.round((activeDays30 / 30) * 100), 100);

  // 6. LeetCode activity (problems solved last 30 days via activity log)
  const lcActivityScore  = calcLeetCodeActivityScore(activities);

  // ── Composite pace score (equal weight across 6 components) ───
  const components = {
    skillAcquisition:   skillAcqScore,
    assessmentImprovement: assessImprove,
    projectCompletion:  projectFreqScore,
    certificationVelocity: certVeloScore,
    consistency:        consistencyScore,
    leetcodeActivity:   lcActivityScore,
  };

  const paceScore = Math.round(
    Object.values(components).reduce((s, v) => s + v, 0) / Object.keys(components).length
  );

  const label = getPaceLabel(paceScore);
  const color = getPaceColor(label);

  // ── Weekly trend (last 12 weeks) ──────────────────────────────
  const weeklyTrend = buildWeeklyTrend(activities);

  // ── Peer percentile ────────────────────────────────────────────
  // Simple estimate: students with fewer total activities than this student
  const myTotal = activities.length;
  const peersBelow = await prisma.learningActivity
    .groupBy({ by: ['studentId'], _count: { id: true } })
    .then((rows) => rows.filter((r) => r._count.id < myTotal).length)
    .catch(() => 0);

  const percentile = peerCount > 0
    ? Math.round((peersBelow / peerCount) * 100)
    : 0;

  // ── Recent activities (last 10 for display) ───────────────────
  const recentActivities = await prisma.learningActivity.findMany({
    where: { studentId },
    orderBy: { completedAt: 'desc' },
    take: 10,
  });

  // ── Activity streak (consecutive days) ────────────────────────
  let streak = 0;
  if (activities.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    const activityDays = [
      ...new Set(activities.map((a) => new Date(a.completedAt).toISOString().slice(0, 10))),
    ].sort().reverse();

    let expected = today;
    for (const day of activityDays) {
      if (day === expected) {
        streak++;
        const d = new Date(expected);
        d.setDate(d.getDate() - 1);
        expected = d.toISOString().slice(0, 10);
      } else if (day < expected) {
        break;
      }
    }
  }

  return {
    paceScore,
    label,
    color,
    percentile,
    streak,
    activeDaysLast30: activeDays30,
    totalActivities: activities.length,
    components,
    weeklyTrend,
    recentActivities: recentActivities.map((a) => ({
      id: a.id,
      type: a.type,
      score: a.score,
      metadata: a.metadata,
      completedAt: a.completedAt,
    })),
  };
}

// ─── Activity Logger ───────────────────────────────────────────────────────

/**
 * Log a single learning activity for a student.
 * Fire-and-forget — never throws (prevents blocking mutations).
 */
async function logActivity(studentId, type, { entityId, score, metadata } = {}) {
  try {
    await prisma.learningActivity.create({
      data: {
        studentId,
        type,
        entityId: entityId ?? null,
        score:    score    ?? null,
        metadata: metadata ?? null,
      },
    });
  } catch (err) {
    console.error(`[LearningActivity] Failed to log ${type} for ${studentId}:`, err.message);
  }
}

module.exports = { getLearningPace, logActivity };
