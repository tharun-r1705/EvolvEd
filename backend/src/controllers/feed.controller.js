// backend/src/controllers/feed.controller.js
// Phase 9 — Feed endpoints controller

'use strict';

const feedService = require('../services/feed.service');
const AppError = require('../utils/AppError');

// GET /student/feed/interview-questions
async function getInterviewQuestions(req, res, next) {
  try {
    const { category, difficulty, limit = 5 } = req.query;
    const questions = await feedService.getInterviewQuestions({
      userId: req.user.userId,
      category,
      difficulty,
      limit: Math.min(parseInt(limit, 10) || 5, 20),
    });
    res.json({ success: true, data: questions });
  } catch (err) { next(err); }
}

// GET /student/feed/interview-questions/all
async function listInterviewQuestions(req, res, next) {
  try {
    const { category, difficulty, search, page = 1, limit = 20 } = req.query;
    const result = await feedService.listInterviewQuestions({
      category,
      difficulty,
      search,
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 20, 50),
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

// GET /student/feed/interview-questions/:id
async function getInterviewQuestionById(req, res, next) {
  try {
    const q = await feedService.getInterviewQuestionById(req.params.id);
    if (!q) return next(new AppError('Question not found', 404));
    res.json({ success: true, data: q });
  } catch (err) { next(err); }
}

// GET /student/feed/market-trends
async function getMarketTrends(req, res, next) {
  try {
    const { category, limit = 8 } = req.query;
    const trends = await feedService.getMarketTrends({
      userId: req.user.userId,
      category,
      limit: Math.min(parseInt(limit, 10) || 8, 20),
    });
    res.json({ success: true, data: trends });
  } catch (err) { next(err); }
}

// GET /student/feed/daily-tip
async function getDailyTip(req, res, next) {
  try {
    const tip = feedService.getDailyTip();
    res.json({ success: true, data: tip });
  } catch (err) { next(err); }
}

// POST /admin/interview-questions  (admin only)
async function createInterviewQuestion(req, res, next) {
  try {
    const { question, answer, category, difficulty, tags } = req.body;
    if (!question || !answer || !category) throw new AppError('question, answer and category are required', 400);
    const q = await feedService.createInterviewQuestion({
      question,
      answer,
      category,
      difficulty: difficulty || 'medium',
      tags: Array.isArray(tags) ? tags : [],
      source: 'admin',
    });
    res.status(201).json({ success: true, data: q });
  } catch (err) { next(err); }
}

// POST /admin/trends/refresh  (admin only)
async function refreshTrends(req, res, next) {
  try {
    const result = await feedService.refreshTrendScores();
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

module.exports = {
  getInterviewQuestions,
  listInterviewQuestions,
  getInterviewQuestionById,
  getMarketTrends,
  getDailyTip,
  createInterviewQuestion,
  refreshTrends,
};
