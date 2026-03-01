'use strict';

const studentService = require('../services/student.service');
const { sendCsvResponse } = require('../utils/csvExport');
const { exportStudentReport } = require('../services/export.service');

// GET /api/student/dashboard
async function getDashboard(req, res, next) {
  try {
    const data = await studentService.getDashboard(req.user.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/student/readiness-score
async function getReadinessScore(req, res, next) {
  try {
    const data = await studentService.getReadinessScore(req.user.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/student/profile
async function getProfile(req, res, next) {
  try {
    const data = await studentService.getProfile(req.user.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// PUT /api/student/profile
async function updateProfile(req, res, next) {
  try {
    const data = await studentService.updateProfile(req.user.userId, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/student/skills
async function getSkills(req, res, next) {
  try {
    const data = await studentService.getSkills(req.user.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/student/skills
async function addSkill(req, res, next) {
  try {
    const data = await studentService.addSkill(req.user.userId, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/student/skills/:skillId
async function removeSkill(req, res, next) {
  try {
    const data = await studentService.removeSkill(req.user.userId, req.params.skillId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/student/projects
async function getProjects(req, res, next) {
  try {
    const data = await studentService.getProjects(req.user.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/student/projects
async function addProject(req, res, next) {
  try {
    const data = await studentService.addProject(req.user.userId, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

// PUT /api/student/projects/:projectId
async function updateProject(req, res, next) {
  try {
    const data = await studentService.updateProject(req.user.userId, req.params.projectId, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/student/projects/:projectId/image
async function uploadProjectImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const data = await studentService.uploadProjectImage(
      req.user.userId,
      req.params.projectId,
      req.file.buffer,
      req.file.mimetype
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/student/projects/:projectId
async function removeProject(req, res, next) {
  try {
    const data = await studentService.removeProject(req.user.userId, req.params.projectId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/student/internships
async function addInternship(req, res, next) {
  try {
    const data = await studentService.addInternship(req.user.userId, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/student/internships/:internshipId
async function removeInternship(req, res, next) {
  try {
    const data = await studentService.removeInternship(req.user.userId, req.params.internshipId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/student/certifications
async function getCertifications(req, res, next) {
  try {
    const data = await studentService.getCertifications(req.user.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/student/certifications
async function addCertification(req, res, next) {
  try {
    const data = await studentService.addCertification(req.user.userId, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

// PUT /api/student/certifications/:certId
async function updateCertification(req, res, next) {
  try {
    const data = await studentService.updateCertification(req.user.userId, req.params.certId, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/student/certifications/:certId
async function removeCertification(req, res, next) {
  try {
    const data = await studentService.removeCertification(req.user.userId, req.params.certId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/student/events
async function getEvents(req, res, next) {
  try {
    const data = await studentService.getEvents(req.user.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/student/events
async function addEvent(req, res, next) {
  try {
    const data = await studentService.addEvent(req.user.userId, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

// PUT /api/student/events/:eventId
async function updateEvent(req, res, next) {
  try {
    const data = await studentService.updateEvent(req.user.userId, req.params.eventId, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/student/events/:eventId
async function deleteEvent(req, res, next) {
  try {
    const data = await studentService.deleteEvent(req.user.userId, req.params.eventId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/student/assessments
async function getAssessments(req, res, next) {
  try {
    const data = await studentService.getAssessments(req.user.userId, req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/student/assessments/:id
async function getAssessmentById(req, res, next) {
  try {
    const data = await studentService.getAssessmentById(req.user.userId, req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/student/applications
async function getApplications(req, res, next) {
  try {
    const data = await studentService.getApplications(req.user.userId, req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/student/report/export
async function exportReport(req, res, next) {
  try {
    const csv = await exportStudentReport(req.user.userId);
    sendCsvResponse(res, csv, 'student_report');
  } catch (err) {
    next(err);
  }
}

// POST /api/student/profile/avatar
async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const data = await studentService.uploadAvatar(req.user.userId, req.file.buffer, req.file.mimetype);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/student/resumes
async function getResumes(req, res, next) {
  try {
    const data = await studentService.getResumes(req.user.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/student/resumes
async function uploadResume(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const data = await studentService.uploadResume(req.user.userId, req.file.buffer, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

// PUT /api/student/resumes/:resumeId
async function updateResume(req, res, next) {
  try {
    const data = await studentService.updateResume(req.user.userId, req.params.resumeId, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/student/resumes/:resumeId
async function deleteResume(req, res, next) {
  try {
    const data = await studentService.deleteResume(req.user.userId, req.params.resumeId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/student/profile/linkedin-pdf
async function parseLinkedinPdf(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const data = await studentService.parseLinkedinPdf(req.user.userId, req.file.buffer);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  getReadinessScore,
  getProfile,
  updateProfile,
  uploadAvatar,
  getResumes,
  uploadResume,
  updateResume,
  deleteResume,
  parseLinkedinPdf,
  getSkills,
  addSkill,
  removeSkill,
  getProjects,
  addProject,
  updateProject,
  uploadProjectImage,
  removeProject,
  addInternship,
  removeInternship,
  getCertifications,
  addCertification,
  updateCertification,
  removeCertification,
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  getAssessments,
  getAssessmentById,
  getApplications,
  exportReport,
};
