'use strict';

const adminService = require('../services/admin.service');
const { sendCsvResponse } = require('../utils/csvExport');

// GET /api/admin/dashboard
async function getDashboard(req, res, next) {
  try {
    const data = await adminService.getDashboard();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/students
async function getStudents(req, res, next) {
  try {
    const data = await adminService.getStudents(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/students/:id
async function getStudentById(req, res, next) {
  try {
    const data = await adminService.getStudentById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/students/:id
async function updateStudent(req, res, next) {
  try {
    const data = await adminService.updateStudent(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/students/:id
async function deleteStudent(req, res, next) {
  try {
    const data = await adminService.deleteStudent(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/users/:userId/status
async function toggleUserStatus(req, res, next) {
  try {
    const { isActive } = req.body;
    const data = await adminService.toggleUserStatus(req.params.userId, isActive);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/placement-drives
async function getPlacementDrives(req, res, next) {
  try {
    const data = await adminService.getPlacementDrives(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/placement-drives
async function createPlacementDrive(req, res, next) {
  try {
    const data = await adminService.createPlacementDrive(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/placement-drives/:id
async function updatePlacementDrive(req, res, next) {
  try {
    const data = await adminService.updatePlacementDriveStatus(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/recruiters
async function getRecruiters(req, res, next) {
  try {
    const data = await adminService.getRecruiters(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/recruiters/invite
async function inviteRecruiter(req, res, next) {
  try {
    const data = await adminService.inviteRecruiter(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/companies
async function getCompanies(req, res, next) {
  try {
    const data = await adminService.getCompanies(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/companies
async function createCompany(req, res, next) {
  try {
    const data = await adminService.createCompany(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/stats
async function getSystemStats(req, res, next) {
  try {
    const data = await adminService.getSystemStats();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/scores/recalculate
async function recalculateAllScores(req, res, next) {
  try {
    const data = await adminService.recalculateAllScores();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/reports/generate
async function generateReport(req, res, next) {
  try {
    const csv = await adminService.generateReport(req.query);
    sendCsvResponse(res, csv, 'admin_student_report');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  toggleUserStatus,
  getPlacementDrives,
  createPlacementDrive,
  updatePlacementDrive,
  getRecruiters,
  inviteRecruiter,
  getCompanies,
  createCompany,
  getSystemStats,
  recalculateAllScores,
  generateReport,
};
