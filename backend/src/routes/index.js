'use strict';

const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/student', require('./student.routes'));
router.use('/recruiter', require('./recruiter.routes'));
router.use('/admin', require('./admin.routes'));

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
