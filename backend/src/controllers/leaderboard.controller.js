'use strict';

const prisma = require('../lib/prisma');
const svc = require('../services/leaderboard.service');
const AppError = require('../utils/AppError');

async function resolveStudentId(userId) {
  const student = await prisma.student.findFirst({
    where: { userId, deletedAt: null },
    select: { id: true },
  });
  if (!student) throw new AppError('Student profile not found', 404);
  return student.id;
}

// ─── GET /student/leaderboard ─────────────────────────────────────────────────
// Unified endpoint: ?scope=global|department|weekly|skill
// Optional: ?department=CS&yearOfStudy=3&search=...&skill=React&page=1&limit=20

async function getLeaderboard(req, res, next) {
  try {
    const {
      scope = 'global',
      department,
      yearOfStudy,
      search,
      skill,
      page = '1',
      limit = '20',
    } = req.query;

    const parsedPage  = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    let result;

    switch (scope) {
      case 'department':
        result = await svc.getDepartmentLeaderboard({ department, page: parsedPage, limit: parsedLimit });
        break;
      case 'weekly':
        result = await svc.getWeeklyLeaderboard({ page: parsedPage, limit: parsedLimit });
        break;
      case 'skill':
        result = await svc.getSkillLeaderboard({ skill, page: parsedPage, limit: parsedLimit });
        break;
      case 'global':
      default:
        result = await svc.getGlobalLeaderboard({
          page: parsedPage,
          limit: parsedLimit,
          department,
          yearOfStudy,
          search,
        });
    }

    res.json({ success: true, data: { scope, ...result } });
  } catch (err) {
    next(err);
  }
}

// ─── GET /student/leaderboard/me ──────────────────────────────────────────────

async function getMyRank(req, res, next) {
  try {
    const studentId = await resolveStudentId(req.user.userId);
    const data = await svc.getMyRank(studentId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ─── GET /student/leaderboard/meta ───────────────────────────────────────────
// Returns available departments and skills for filter dropdowns

async function getMeta(req, res, next) {
  try {
    const [departments, skills] = await Promise.all([
      svc.getAvailableDepartments(),
      svc.getAvailableSkills(),
    ]);
    res.json({ success: true, data: { departments, skills } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLeaderboard, getMyRank, getMeta };
