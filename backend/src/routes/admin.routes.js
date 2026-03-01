'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const feedCtrl = require('../controllers/feed.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  adminStudentQuerySchema,
  adminUpdateStudentSchema,
  createPlacementDriveSchema,
  updatePlacementDriveSchema,
  inviteRecruiterSchema,
  createCompanySchema,
} = require('../validators/admin.schema');

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

router.get('/dashboard', ctrl.getDashboard);

// Students
router.get('/students', validate(adminStudentQuerySchema, 'query'), ctrl.getStudents);
router.get('/students/:id', ctrl.getStudentById);
router.put('/students/:id', validate(adminUpdateStudentSchema), ctrl.updateStudent);
router.delete('/students/:id', ctrl.deleteStudent);

// User activation toggle
router.patch('/users/:userId/status', ctrl.toggleUserStatus);

// Placement drives
router.get('/placement-drives', ctrl.getPlacementDrives);
router.post('/placement-drives', validate(createPlacementDriveSchema), ctrl.createPlacementDrive);
router.patch('/placement-drives/:id', validate(updatePlacementDriveSchema), ctrl.updatePlacementDrive);

// Recruiters
router.get('/recruiters', ctrl.getRecruiters);
router.post('/recruiters/invite', validate(inviteRecruiterSchema), ctrl.inviteRecruiter);

// Companies
router.get('/companies', ctrl.getCompanies);
router.post('/companies', validate(createCompanySchema), ctrl.createCompany);

// System
router.get('/stats', ctrl.getSystemStats);
router.post('/scores/recalculate', ctrl.recalculateAllScores);
router.get('/reports/generate', ctrl.generateReport);

// Phase 9: Feed admin
router.post('/interview-questions', feedCtrl.createInterviewQuestion);
router.post('/trends/refresh', feedCtrl.refreshTrends);

module.exports = router;
