// backend/src/routes/chat.routes.js
'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/chat.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize('student'));

router.get('/conversations', ctrl.listConversations);
router.post('/conversations', ctrl.createConversation);
router.delete('/conversations/:id', ctrl.deleteConversation);
router.get('/conversations/:id/messages', ctrl.getMessages);
router.post('/conversations/:id/messages', ctrl.sendMessage);

module.exports = router;
