'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  recruiterRegisterSchema,
  oauthCallbackSchema,
} = require('../validators/auth.schema');

// Public routes
router.post('/register', validate(registerSchema), ctrl.register);
router.post('/register/recruiter', validate(recruiterRegisterSchema), ctrl.registerRecruiter);
router.post('/login', validate(loginSchema), ctrl.login);
router.post('/refresh', validate(refreshSchema), ctrl.refresh);
router.post('/logout', ctrl.logout);
router.post('/oauth/callback', validate(oauthCallbackSchema), ctrl.oauthCallback);

// Protected routes
router.get('/me', authenticate, ctrl.getMe);
router.post('/logout-all', authenticate, ctrl.logoutAll);

module.exports = router;
