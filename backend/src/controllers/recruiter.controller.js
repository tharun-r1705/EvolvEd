'use strict';

const recruiterService = require('../services/recruiter.service');
const matchingService = require('../services/matching.service');
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

// GET /api/recruiter/jobs/:jobId
async function getJobById(req, res, next) {
  try {
    const data = await recruiterService.getJobById(req.user.userId, req.params.jobId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// PUT /api/recruiter/jobs/:jobId
async function updateJob(req, res, next) {
  try {
    const data = await recruiterService.updateJob(req.user.userId, req.params.jobId, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/recruiter/jobs/:jobId
async function deleteJob(req, res, next) {
  try {
    const data = await recruiterService.deleteJob(req.user.userId, req.params.jobId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/recruiter/jobs/:jobId/status
async function toggleJobStatus(req, res, next) {
  try {
    const data = await recruiterService.toggleJobStatus(req.user.userId, req.params.jobId);
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

// GET /api/recruiter/profile
async function getProfile(req, res, next) {
  try {
    const data = await recruiterService.getProfile(req.user.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// PUT /api/recruiter/profile
async function updateProfile(req, res, next) {
  try {
    const data = await recruiterService.updateProfile(req.user.userId, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/recruiter/profile/avatar
async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) throw require('../utils/AppError').badRequest('No file uploaded.');
    const data = await recruiterService.uploadRecruiterAvatar(req.user.userId, req.file.buffer);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/recruiter/profile/company-logo
async function uploadCompanyLogo(req, res, next) {
  try {
    if (!req.file) throw require('../utils/AppError').badRequest('No file uploaded.');
    const data = await recruiterService.uploadCompanyLogo(req.user.userId, req.file.buffer);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/recruiter/jobs/:jobId/calculate
async function calculateJobMatches(req, res, next) {
  try {
    const data = await matchingService.calculateJobMatches(req.user.userId, req.params.jobId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/recruiter/jobs/:jobId/rankings
async function getJobRankings(req, res, next) {
  try {
    const data = await matchingService.getJobRankings(req.user.userId, req.params.jobId, req.query);
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
  getJobById,
  updateJob,
  deleteJob,
  toggleJobStatus,
  getApplicants,
  updateApplicationStatus,
  calculateJobMatches,
  getJobRankings,
  getAnalytics,
  getProfile,
  updateProfile,
  uploadAvatar,
  uploadCompanyLogo,
};
