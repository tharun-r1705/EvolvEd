'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/student.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  updateProfileSchema,
  addSkillSchema,
  addProjectSchema,
  addInternshipSchema,
  addCertificationSchema,
  assessmentQuerySchema,
} = require('../validators/student.schema');

// All student routes require authentication + student role
router.use(authenticate, authorize('student'));

router.get('/dashboard', ctrl.getDashboard);
router.get('/readiness-score', ctrl.getReadinessScore);

router.get('/profile', ctrl.getProfile);
router.put('/profile', validate(updateProfileSchema), ctrl.updateProfile);

router.get('/skills', ctrl.getSkills);
router.post('/skills', validate(addSkillSchema), ctrl.addSkill);
router.delete('/skills/:skillId', ctrl.removeSkill);

router.post('/projects', validate(addProjectSchema), ctrl.addProject);
router.delete('/projects/:projectId', ctrl.removeProject);

router.post('/internships', validate(addInternshipSchema), ctrl.addInternship);
router.delete('/internships/:internshipId', ctrl.removeInternship);

router.post('/certifications', validate(addCertificationSchema), ctrl.addCertification);
router.delete('/certifications/:certId', ctrl.removeCertification);

router.get('/assessments', validate(assessmentQuerySchema, 'query'), ctrl.getAssessments);
router.get('/assessments/:id', ctrl.getAssessmentById);

router.get('/applications', ctrl.getApplications);

router.get('/report/export', ctrl.exportReport);

module.exports = router;
