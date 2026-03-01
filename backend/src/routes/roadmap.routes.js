// backend/src/routes/roadmap.routes.js
// Phase 7 — Roadmap Generator routes

'use strict';

const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const ctrl = require('../controllers/roadmap.controller');

const router = Router();

router.use(authenticate, authorize('student'));

// POST   /api/student/roadmaps/chat         — AI conversation → generate roadmap
router.post('/chat', ctrl.chatRoadmap);

// POST   /api/student/roadmaps              — direct generate (kept for backward compat)
router.post('/', ctrl.generateRoadmap);

// GET    /api/student/roadmaps              — list roadmaps (optional ?status=)
router.get('/', ctrl.listRoadmaps);

// GET    /api/student/roadmaps/:id          — get single roadmap with module progress
router.get('/:id', ctrl.getRoadmap);

// GET    /api/student/roadmaps/:id/modules/:moduleIndex/test   — get quiz (no answers)
router.get('/:id/modules/:moduleIndex/test', ctrl.getModuleTest);

// POST   /api/student/roadmaps/:id/modules/:moduleIndex/test   — submit answers
router.post('/:id/modules/:moduleIndex/test', ctrl.submitModuleTest);

// PATCH  /api/student/roadmaps/:id/modules/:moduleIndex/status — update module status
router.patch('/:id/modules/:moduleIndex/status', ctrl.updateModuleStatus);

// PATCH  /api/student/roadmaps/:id/archive  — archive roadmap
router.patch('/:id/archive', ctrl.archiveRoadmap);

// DELETE /api/student/roadmaps/:id           — permanently delete roadmap
router.delete('/:id', ctrl.deleteRoadmap);

module.exports = router;
