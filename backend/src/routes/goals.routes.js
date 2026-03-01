// backend/src/routes/goals.routes.js
'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/goals.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize('student'));

// summary must come before /:goalId to avoid route collision
router.get('/summary', ctrl.getGoalsSummary);
router.get('/', ctrl.getGoals);
router.post('/', ctrl.createGoal);
router.put('/:goalId', ctrl.updateGoal);
router.delete('/:goalId', ctrl.deleteGoal);

module.exports = router;
