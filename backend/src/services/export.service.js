'use strict';

const { generateCsv, sendCsvResponse } = require('../utils/csvExport');
const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');

// ─── STUDENT REPORT ──────────────────────────────────────────────

/**
 * Generate a student's own profile report as CSV.
 */
async function exportStudentReport(userId) {
  const student = await prisma.student.findFirst({
    where: { userId, deletedAt: null },
    include: {
      user: { select: { email: true } },
      skills: { include: { skill: true } },
      assessments: { orderBy: { completedAt: 'desc' } },
      projects: true,
      internships: true,
      certifications: true,
      scoreBreakdown: true,
    },
  });

  if (!student) throw AppError.notFound('Student profile not found.');

  const data = [
    {
      'Student Name': student.fullName,
      'Student ID': student.studentId,
      Email: student.user.email,
      Department: student.department,
      'Year of Study': student.yearOfStudy,
      GPA: student.gpa ? Number(student.gpa) : 'N/A',
      'Readiness Score': Number(student.readinessScore),
      'Profile Completion': `${student.profileCompletion}%`,
      'Total Assessments': student.assessments.length,
      'Total Skills': student.skills.length,
      'Total Projects': student.projects.length,
      'Total Internships': student.internships.length,
      'Total Certifications': student.certifications.length,
      'Technical Skills Score': student.scoreBreakdown ? Number(student.scoreBreakdown.technicalSkills) : 0,
      'Projects Score': student.scoreBreakdown ? Number(student.scoreBreakdown.projects) : 0,
      'Internships Score': student.scoreBreakdown ? Number(student.scoreBreakdown.internships) : 0,
      'Certifications Score': student.scoreBreakdown ? Number(student.scoreBreakdown.certifications) : 0,
      'Assessments Score': student.scoreBreakdown ? Number(student.scoreBreakdown.assessments) : 0,
      'Top Skills': student.skills
        .sort((a, b) => b.proficiency - a.proficiency)
        .slice(0, 5)
        .map((s) => `${s.skill.name}(${s.proficiency}%)`)
        .join(', '),
      Status: student.status,
    },
  ];

  const fields = Object.keys(data[0]).map((k) => ({ label: k, value: k }));
  return generateCsv(data, fields);
}

// ─── ASSESSMENT REPORT ───────────────────────────────────────────

async function exportAssessmentReport(studentId, assessmentId) {
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, studentId },
    include: { scores: true },
  });

  if (!assessment) throw AppError.notFound('Assessment not found.');

  const data = assessment.scores.map((s) => ({
    'Assessment Title': assessment.title,
    Category: s.category,
    Score: s.score,
    'Max Score': s.maxScore,
    'Percentage': `${Math.round((s.score / s.maxScore) * 100)}%`,
    'Date Completed': new Date(assessment.completedAt).toLocaleDateString(),
    Status: assessment.status,
  }));

  if (data.length === 0) {
    data.push({
      'Assessment Title': assessment.title,
      Category: assessment.category,
      Score: assessment.totalScore,
      'Max Score': assessment.maxScore,
      Percentage: `${Math.round((assessment.totalScore / assessment.maxScore) * 100)}%`,
      'Date Completed': new Date(assessment.completedAt).toLocaleDateString(),
      Status: assessment.status,
    });
  }

  const fields = Object.keys(data[0]).map((k) => ({ label: k, value: k }));
  return generateCsv(data, fields);
}

// ─── RECRUITER: CANDIDATE EXPORT ────────────────────────────────

/**
 * Export candidate list as CSV.
 * @param {Array} candidates - Already-fetched candidate array
 */
function exportCandidates(candidates) {
  if (!candidates || candidates.length === 0) {
    throw AppError.badRequest('No candidates to export.');
  }

  const data = candidates.map((c, i) => ({
    Rank: i + 1,
    Name: c.fullName,
    'Student ID': c.studentId,
    Department: c.department,
    'Year of Study': c.yearOfStudy,
    GPA: c.gpa ? Number(c.gpa) : 'N/A',
    'Readiness Score': Number(c.readinessScore),
    'Top Skills': c.skills ? c.skills.map((s) => s.name).slice(0, 5).join(', ') : '',
    Status: c.status,
    Location: c.location || '',
  }));

  const fields = Object.keys(data[0]).map((k) => ({ label: k, value: k }));
  return generateCsv(data, fields);
}

// ─── ADMIN: FULL REPORT ──────────────────────────────────────────

async function exportAdminStudentReport(filters) {
  const where = {
    deletedAt: null,
    ...(filters.department && { department: filters.department }),
    ...(filters.status && { status: filters.status }),
  };

  const students = await prisma.student.findMany({
    where,
    include: {
      user: { select: { email: true, lastLoginAt: true } },
      skills: { include: { skill: true } },
      scoreBreakdown: true,
      placements: { include: { company: true }, take: 1 },
    },
    orderBy: { readinessScore: 'desc' },
  });

  if (students.length === 0) throw AppError.badRequest('No students found for the given filters.');

  const data = students.map((s) => ({
    'Student ID': s.studentId,
    Name: s.fullName,
    Email: s.user.email,
    Department: s.department,
    'Year of Study': s.yearOfStudy,
    GPA: s.gpa ? Number(s.gpa) : 'N/A',
    'Readiness Score': Number(s.readinessScore),
    Status: s.status,
    'Total Skills': s.skills.length,
    'Top Skills': s.skills
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 3)
      .map((sk) => sk.skill.name)
      .join(', '),
    'Placed At': s.placements.length > 0 ? s.placements[0].company.name : 'Not Placed',
    'Package (LPA)': s.placements.length > 0 ? Number(s.placements[0].packageLpa) : 'N/A',
    'Last Login': s.user.lastLoginAt ? new Date(s.user.lastLoginAt).toLocaleDateString() : 'Never',
  }));

  const fields = Object.keys(data[0]).map((k) => ({ label: k, value: k }));
  return generateCsv(data, fields);
}

module.exports = {
  exportStudentReport,
  exportAssessmentReport,
  exportCandidates,
  exportAdminStudentReport,
};
