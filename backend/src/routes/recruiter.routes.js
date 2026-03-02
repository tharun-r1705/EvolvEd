'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/recruiter.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createJobSchema, updateJobSchema, candidateSearchSchema, updateRecruiterProfileSchema } = require('../validators/recruiter.schema');
const { uploadAvatar, uploadCompanyLogo } = require('../middleware/upload');

// All recruiter routes require authentication + recruiter role
router.use(authenticate, authorize('recruiter'));

router.get('/dashboard', ctrl.getDashboard);

// Profile
router.get('/profile',               ctrl.getProfile);
router.put('/profile',               validate(updateRecruiterProfileSchema), ctrl.updateProfile);
router.post('/profile/avatar',       uploadAvatar, ctrl.uploadAvatar);
router.post('/profile/company-logo', uploadCompanyLogo, ctrl.uploadCompanyLogo);

// Candidate search — export must come before /:id to avoid route shadowing
router.get('/candidates/export', ctrl.exportCandidates);
router.get('/candidates', validate(candidateSearchSchema, 'query'), ctrl.getCandidates);
router.get('/candidates/:id', ctrl.getCandidateById);
router.get('/candidates/:id/export', ctrl.exportCandidateProfile);
router.post('/candidates/:id/shortlist', ctrl.shortlistCandidate);

router.get('/jobs', ctrl.getJobs);
router.post('/jobs', validate(createJobSchema), ctrl.createJob);
// Specific sub-routes before /:jobId to avoid shadowing
router.get('/jobs/:jobId/applicants', ctrl.getApplicants);
router.patch('/jobs/:jobId/status', ctrl.toggleJobStatus);
// CRUD
router.get('/jobs/:jobId', ctrl.getJobById);
router.put('/jobs/:jobId', validate(updateJobSchema), ctrl.updateJob);
router.delete('/jobs/:jobId', ctrl.deleteJob);

router.patch('/applications/:applicationId/status', ctrl.updateApplicationStatus);

router.get('/analytics', ctrl.getAnalytics);

module.exports = router;
