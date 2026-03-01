// backend/src/controllers/goals.controller.js
'use strict';

const goalsService = require('../services/goals.service');
const AppError = require('../utils/AppError');

// GET /student/goals
async function getGoals(req, res, next) {
  try {
    const { status } = req.query;
    const goals = await goalsService.getGoals(req.user.userId, status);
    res.json({ success: true, data: goals });
  } catch (err) {
    next(err);
  }
}

// GET /student/goals/summary
async function getGoalsSummary(req, res, next) {
  try {
    const summary = await goalsService.getGoalsSummary(req.user.userId);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

// POST /student/goals
async function createGoal(req, res, next) {
  try {
    const { title, description, category, targetDate, milestones } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new AppError('Goal title is required', 400);
    }
    const goal = await goalsService.createGoal(req.user.userId, {
      title: title.trim(),
      description,
      category,
      targetDate,
      milestones,
    });
    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
}

// PUT /student/goals/:goalId
async function updateGoal(req, res, next) {
  try {
    const { goalId } = req.params;
    const goal = await goalsService.updateGoal(req.user.userId, goalId, req.body);
    res.json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
}

// DELETE /student/goals/:goalId
async function deleteGoal(req, res, next) {
  try {
    const { goalId } = req.params;
    await goalsService.deleteGoal(req.user.userId, goalId);
    res.json({ success: true, message: 'Goal deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getGoals, getGoalsSummary, createGoal, updateGoal, deleteGoal };
