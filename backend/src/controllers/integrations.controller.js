'use strict';

const { getLeetCodeProfile, getGitHubProfile } = require('../services/integrations.service');
const { recalculateScore } = require('../services/scoring.service');
const AppError = require('../utils/AppError');
const prisma = require('../lib/prisma');

// ─── HELPERS ─────────────────────────────────────────────────────

async function getStudentId(userId) {
  const student = await prisma.student.findFirst({
    where: { userId, deletedAt: null },
    select: { id: true },
  });
  if (!student) throw AppError.notFound('Student profile not found.');
  return student.id;
}

// ─── LEETCODE ─────────────────────────────────────────────────────

/**
 * GET /api/student/integrations/leetcode
 * Returns cached LeetCode profile (fetches fresh if cache is stale).
 */
async function getLeetCode(req, res, next) {
  try {
    const studentId = await getStudentId(req.user.id);
    const result = await getLeetCodeProfile(studentId, false);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/student/integrations/leetcode/refresh
 * Force-fetches fresh LeetCode data, updates cache, recalculates score.
 */
async function refreshLeetCode(req, res, next) {
  try {
    const studentId = await getStudentId(req.user.id);
    const result = await getLeetCodeProfile(studentId, true);
    if (result.connected) {
      // Recalculate score in background (non-blocking)
      recalculateScore(studentId).catch(() => {});
    }
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

// ─── GITHUB ───────────────────────────────────────────────────────

/**
 * GET /api/student/integrations/github
 * Returns cached GitHub profile (fetches fresh if cache is stale).
 */
async function getGitHub(req, res, next) {
  try {
    const studentId = await getStudentId(req.user.id);
    const result = await getGitHubProfile(studentId, false);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/student/integrations/github/refresh
 * Force-fetches fresh GitHub data, updates cache, recalculates score.
 */
async function refreshGitHub(req, res, next) {
  try {
    const studentId = await getStudentId(req.user.id);
    const result = await getGitHubProfile(studentId, true);
    if (result.connected) {
      recalculateScore(studentId).catch(() => {});
    }
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLeetCode,
  refreshLeetCode,
  getGitHub,
  refreshGitHub,
};
