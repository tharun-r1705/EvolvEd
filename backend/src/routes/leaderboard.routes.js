'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/leaderboard.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All routes require auth + student role
router.use(authenticate, authorize('student'));

// summary routes BEFORE parameterized routes to avoid collisions
router.get('/me',   ctrl.getMyRank);
router.get('/meta', ctrl.getMeta);
router.get('/',     ctrl.getLeaderboard);

module.exports = router;
