'use strict';

const recruiterService = require('../services/recruiter.service');
const { sendCsvResponse } = require('../utils/csvExport');

// GET /api/recruiter/dashboard
async function getDashboard(req, res, next) {
  try {
    const data = await recruiterService.getDashboard(req.user.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/recruiter/candidates
async function getCandidates(req, res, next) {
  try {
    const data = await recruiterService.getCandidates(req.user.userId, req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/recruiter/candidates/export
async function exportCandidates(req, res, next) {
  try {
    const csv = await recruiterService.exportCandidatesForRecruiter(req.user.userId, req.query);
    sendCsvResponse(res, csv, 'candidates');
  } catch (err) {
    next(err);
  }
}

// GET /api/recruiter/candidates/:id
async function getCandidateById(req, res, next) {
  try {
    const data = await recruiterService.getCandidateById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/recruiter/candidates/:id/export
async function exportCandidateProfile(req, res, next) {
  try {
    const csv = await recruiterService.exportCandidateProfileReport(req.params.id);
    sendCsvResponse(res, csv, `candidate_${req.params.id}`);
  } catch (err) {
    next(err);
  }
}

// POST /api/recruiter/candidates/:id/shortlist
async function shortlistCandidate(req, res, next) {
  try {
    const data = await recruiterService.shortlistCandidate(
      req.user.userId,
      req.params.id,
      req.body
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/recruiter/jobs
async function getJobs(req, res, next) {
  try {
    const data = await recruiterService.getJobs(req.user.userId, req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/recruiter/jobs
async function createJob(req, res, next) {
  try {
    const data = await recruiterService.createJob(req.user.userId, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/recruiter/jobs/:jobId/applicants
async function getApplicants(req, res, next) {
  try {
    const data = await recruiterService.getApplicants(
      req.user.userId,
      req.params.jobId,
      req.query
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/recruiter/applications/:applicationId/status
async function updateApplicationStatus(req, res, next) {
  try {
    const data = await recruiterService.updateApplicationStatus(
      req.user.userId,
      req.params.applicationId,
      req.body.status
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/recruiter/analytics
async function getAnalytics(req, res, next) {
  try {
    const data = await recruiterService.getAnalytics(req.user.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  getCandidates,
  exportCandidates,
  getCandidateById,
  exportCandidateProfile,
  shortlistCandidate,
  getJobs,
  createJob,
  getApplicants,
  updateApplicationStatus,
  getAnalytics,
};
