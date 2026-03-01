'use strict';

const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/student', require('./student.routes'));
router.use('/student/integrations', require('./integrations.routes'));
router.use('/student/chat', require('./chat.routes'));
router.use('/student/goals', require('./goals.routes'));
router.use('/student/roadmaps', require('./roadmap.routes'));
router.use('/student/interviews', require('./interview.routes'));
router.use('/recruiter', require('./recruiter.routes'));
router.use('/admin', require('./admin.routes'));

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
