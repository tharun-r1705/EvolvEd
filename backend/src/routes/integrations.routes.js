'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/integrations.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All integration routes require authentication + student role
router.use(authenticate, authorize('student'));

// LeetCode
router.get('/leetcode', ctrl.getLeetCode);
router.post('/leetcode/refresh', ctrl.refreshLeetCode);

// GitHub
router.get('/github', ctrl.getGitHub);
router.post('/github/refresh', ctrl.refreshGitHub);

module.exports = router;
