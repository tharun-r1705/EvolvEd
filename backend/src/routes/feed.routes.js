// backend/src/routes/feed.routes.js
// Phase 9 — /student/feed routes

'use strict';

const router = require('express').Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const ctrl = require('../controllers/feed.controller');

router.use(authenticate, authorize('student'));

// Interview questions — random feed (personalized)
router.get('/interview-questions', ctrl.getInterviewQuestions);

// Interview questions — paginated browse
router.get('/interview-questions/all', ctrl.listInterviewQuestions);

// Interview questions — single
router.get('/interview-questions/:id', ctrl.getInterviewQuestionById);

// Tech trends
router.get('/market-trends', ctrl.getMarketTrends);

// Daily tip
router.get('/daily-tip', ctrl.getDailyTip);

module.exports = router;
