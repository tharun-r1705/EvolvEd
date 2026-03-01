// backend/src/routes/interview.routes.js
// Phase 8 — Mock Interview routes

'use strict';

const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const ctrl = require('../controllers/interview.controller');

const router = Router();

router.use(authenticate, authorize('student'));

// POST   /api/student/interviews               — start new interview
router.post('/', ctrl.startInterview);

// GET    /api/student/interviews               — list interviews (optional ?status=)
router.get('/', ctrl.listInterviews);

// GET    /api/student/interviews/:id           — get full interview details
router.get('/:id', ctrl.getInterview);

// GET    /api/student/interviews/:id/questions/:index        — get question (text)
router.get('/:id/questions/:index', ctrl.getQuestion);

// GET    /api/student/interviews/:id/questions/:index/audio  — get question audio (mp3)
router.get('/:id/questions/:index/audio', ctrl.getQuestionAudio);

// POST   /api/student/interviews/:id/questions/:index/answer — submit answer
router.post('/:id/questions/:index/answer', ctrl.submitAnswer);

// POST   /api/student/interviews/:id/complete  — complete interview + get overall feedback
router.post('/:id/complete', ctrl.completeInterview);

// PATCH  /api/student/interviews/:id/abandon   — abandon in-progress interview
router.patch('/:id/abandon', ctrl.abandonInterview);

module.exports = router;
