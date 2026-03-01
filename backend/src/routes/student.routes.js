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
  updateProjectSchema,
  addInternshipSchema,
  addCertificationSchema,
  updateCertificationSchema,
  addEventSchema,
  updateEventSchema,
  assessmentQuerySchema,
  assessmentIdParamSchema,
  addResumeSchema,
  updateResumeSchema,
} = require('../validators/student.schema');
const { uploadAvatar, uploadResume, uploadLinkedinPdf, uploadProjectImage } = require('../middleware/upload');

// All student routes require authentication + student role
router.use(authenticate, authorize('student'));

router.get('/dashboard', ctrl.getDashboard);
router.get('/readiness-score', ctrl.getReadinessScore);

router.get('/profile', ctrl.getProfile);
router.put('/profile', validate(updateProfileSchema), ctrl.updateProfile);
router.post('/profile/avatar', uploadAvatar, ctrl.uploadAvatar);
router.post('/profile/linkedin-pdf', uploadLinkedinPdf, ctrl.parseLinkedinPdf);

router.get('/resumes', ctrl.getResumes);
router.post('/resumes', uploadResume, validate(addResumeSchema), ctrl.uploadResume);
router.put('/resumes/:resumeId', validate(updateResumeSchema), ctrl.updateResume);
router.delete('/resumes/:resumeId', ctrl.deleteResume);

router.get('/skills', ctrl.getSkills);
router.post('/skills/sync', ctrl.syncSkills);          // must be before /:skillId
router.post('/skills', validate(addSkillSchema), ctrl.addSkill);
router.delete('/skills/:skillId', ctrl.removeSkill);

router.get('/projects', ctrl.getProjects);
router.post('/projects', validate(addProjectSchema), ctrl.addProject);
router.put('/projects/:projectId', validate(updateProjectSchema), ctrl.updateProject);
router.post('/projects/:projectId/image', uploadProjectImage, ctrl.uploadProjectImage);
router.delete('/projects/:projectId', ctrl.removeProject);

router.post('/internships', validate(addInternshipSchema), ctrl.addInternship);
router.delete('/internships/:internshipId', ctrl.removeInternship);

router.get('/certifications', ctrl.getCertifications);
router.post('/certifications', validate(addCertificationSchema), ctrl.addCertification);
router.put('/certifications/:certId', validate(updateCertificationSchema), ctrl.updateCertification);
router.delete('/certifications/:certId', ctrl.removeCertification);

router.get('/events', ctrl.getEvents);
router.post('/events', validate(addEventSchema), ctrl.addEvent);
router.put('/events/:eventId', validate(updateEventSchema), ctrl.updateEvent);
router.delete('/events/:eventId', ctrl.deleteEvent);

router.get('/assessments', validate(assessmentQuerySchema, 'query'), ctrl.getAssessments);
router.get('/assessments/:id', validate(assessmentIdParamSchema, 'params'), ctrl.getAssessmentById);

router.get('/applications', ctrl.getApplications);

router.get('/report/export', ctrl.exportReport);

router.get('/learning-pace', ctrl.getLearningPace);

module.exports = router;
