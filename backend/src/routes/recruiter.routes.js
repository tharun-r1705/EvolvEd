'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/recruiter.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createJobSchema, candidateSearchSchema } = require('../validators/recruiter.schema');

// All recruiter routes require authentication + recruiter role
router.use(authenticate, authorize('recruiter'));

router.get('/dashboard', ctrl.getDashboard);

// Candidate search — export must come before /:id to avoid route shadowing
router.get('/candidates/export', ctrl.exportCandidates);
router.get('/candidates', validate(candidateSearchSchema, 'query'), ctrl.getCandidates);
router.get('/candidates/:id', ctrl.getCandidateById);
router.get('/candidates/:id/export', ctrl.exportCandidateProfile);
router.post('/candidates/:id/shortlist', ctrl.shortlistCandidate);

router.get('/jobs', ctrl.getJobs);
router.post('/jobs', validate(createJobSchema), ctrl.createJob);
router.get('/jobs/:jobId/applicants', ctrl.getApplicants);

router.patch('/applications/:applicationId/status', ctrl.updateApplicationStatus);

router.get('/analytics', ctrl.getAnalytics);

module.exports = router;
