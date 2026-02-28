'use strict';

const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { recalculateScore } = require('./scoring.service');
const { recalculateGlobalRankings } = require('./ranking.service');
const { exportAdminStudentReport } = require('./export.service');
const crypto = require('crypto');

// ─── DASHBOARD ───────────────────────────────────────────────────

async function getDashboard() {
  const now = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const lastSemester = new Date();
  lastSemester.setMonth(lastSemester.getMonth() - 6);

  // KPIs
  const [
    totalStudents,
    studentsLastMonth,
    activeRecruiters,
    recruitersLastMonth,
    avgReadinessResult,
    avgReadinessLastSemester,
  ] = await Promise.all([
    prisma.student.count({ where: { deletedAt: null } }),
    prisma.student.count({ where: { deletedAt: null, createdAt: { lte: lastMonth } } }),
    prisma.recruiter.count({ where: { deletedAt: null, user: { isActive: true } } }),
    prisma.recruiter.count({ where: { deletedAt: null, createdAt: { lte: lastMonth }, user: { isActive: true } } }),
    prisma.student.aggregate({ where: { deletedAt: null }, _avg: { readinessScore: true } }),
    prisma.student.aggregate({ where: { deletedAt: null, createdAt: { lte: lastSemester } }, _avg: { readinessScore: true } }),
  ]);

  const currentAvg = Math.round(Number(avgReadinessResult._avg.readinessScore) || 0);
  const lastAvg = Math.round(Number(avgReadinessLastSemester._avg.readinessScore) || 0);
  const readinessTrend = lastAvg > 0 ? `+${(((currentAvg - lastAvg) / lastAvg) * 100).toFixed(1)}%` : 'N/A';

  // Department performance: avg readiness score per department
  const departments = await prisma.student.groupBy({
    by: ['department'],
    where: { deletedAt: null },
    _avg: { readinessScore: true },
    _count: { id: true },
    orderBy: { _avg: { readinessScore: 'desc' } },
  });

  const departmentPerformance = departments.map((d) => ({
    department: d.department,
    avgScore: Math.round(Number(d._avg.readinessScore) || 0),
    studentCount: d._count.id,
  }));

  // Upcoming placement drives
  const upcomingDrives = await prisma.placementDrive.findMany({
    where: { status: 'upcoming', driveDate: { gte: now } },
    include: { company: true },
    orderBy: { driveDate: 'asc' },
    take: 5,
  });

  // Recent placements
  const recentPlacements = await prisma.placement.findMany({
    include: {
      student: { select: { fullName: true, department: true, avatarUrl: true } },
      company: { select: { name: true } },
    },
    orderBy: { placedAt: 'desc' },
    take: 10,
  });

  // System stats
  const [totalPlacements, totalJobs, totalApplications] = await Promise.all([
    prisma.placement.count(),
    prisma.job.count({ where: { deletedAt: null, isActive: true } }),
    prisma.application.count(),
  ]);

  return {
    kpis: {
      totalStudents,
      studentGrowth: studentsLastMonth > 0
        ? `+${(((totalStudents - studentsLastMonth) / studentsLastMonth) * 100).toFixed(1)}%`
        : 'N/A',
      activeRecruiters,
      recruiterGrowth: recruitersLastMonth > 0
        ? `+${(((activeRecruiters - recruitersLastMonth) / recruitersLastMonth) * 100).toFixed(1)}%`
        : 'N/A',
      avgReadinessScore: currentAvg,
      readinessTrend,
      totalPlacements,
      activeJobs: totalJobs,
      totalApplications,
    },
    departmentPerformance,
    upcomingDrives: upcomingDrives.map((d) => ({
      id: d.id,
      company: d.company.name,
      role: d.role,
      date: d.driveDate,
      time: d.driveTime,
      status: d.status,
      packageLpa: d.packageLpa ? Number(d.packageLpa) : null,
    })),
    recentPlacements: recentPlacements.map((p) => ({
      id: p.id,
      studentName: p.student.fullName,
      studentDept: p.student.department,
      studentAvatar: p.student.avatarUrl,
      company: p.company.name,
      role: p.role,
      packageLpa: Number(p.packageLpa),
      status: p.status,
      placedAt: p.placedAt,
    })),
  };
}

// ─── STUDENTS ────────────────────────────────────────────────────

async function getStudents(query) {
  const { page, limit, skip, take } = parsePagination(query);

  const where = { deletedAt: null };

  if (query.search) {
    where.OR = [
      { fullName: { contains: query.search, mode: 'insensitive' } },
      { studentId: { contains: query.search, mode: 'insensitive' } },
      { department: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.department) {
    where.department = { contains: query.department, mode: 'insensitive' };
  }
  if (query.yearOfStudy) {
    where.yearOfStudy = query.yearOfStudy;
  }
  if (query.status) {
    where.status = query.status;
  }
  if (query.readiness && query.readiness !== 'all') {
    const readinessMap = {
      high: { gte: 75 },
      medium: { gte: 50, lt: 75 },
      low: { lt: 50 },
    };
    if (readinessMap[query.readiness]) {
      where.readinessScore = readinessMap[query.readiness];
    }
  }

  const orderByMap = {
    name: { fullName: query.sortOrder || 'asc' },
    score: { readinessScore: query.sortOrder || 'desc' },
    gpa: { gpa: query.sortOrder || 'desc' },
    createdAt: { createdAt: query.sortOrder || 'desc' },
  };
  const orderBy = orderByMap[query.sortBy] || { readinessScore: 'desc' };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        user: { select: { email: true, isActive: true, lastLoginAt: true } },
        skills: { include: { skill: true }, orderBy: { proficiency: 'desc' }, take: 3 },
        rankings: { where: { jobId: null }, take: 1 },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.student.count({ where }),
  ]);

  const formatted = students.map((s) => ({
    id: s.id,
    studentId: s.studentId,
    fullName: s.fullName,
    email: s.user.email,
    department: s.department,
    yearOfStudy: s.yearOfStudy,
    gpa: s.gpa ? Number(s.gpa) : null,
    readinessScore: Number(s.readinessScore),
    profileCompletion: s.profileCompletion,
    status: s.status,
    rank: s.rankings.length > 0 ? s.rankings[0].rank : null,
    avatarUrl: s.avatarUrl,
    isUserActive: s.user.isActive,
    lastLogin: s.user.lastLoginAt,
    topSkills: s.skills.map((ss) => ss.skill.name),
    createdAt: s.createdAt,
  }));

  return paginatedResponse(formatted, total, page, limit);
}

async function getStudentById(studentId) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, deletedAt: null },
    include: {
      user: { select: { email: true, isActive: true, createdAt: true, lastLoginAt: true } },
      skills: { include: { skill: true }, orderBy: { proficiency: 'desc' } },
      assessments: { orderBy: { completedAt: 'desc' }, take: 10 },
      projects: true,
      internships: true,
      certifications: true,
      scoreBreakdown: true,
      rankings: { where: { jobId: null }, take: 1 },
      placements: { include: { company: true }, take: 1 },
    },
  });

  if (!student) throw AppError.notFound('Student not found.');

  return {
    id: student.id,
    studentId: student.studentId,
    fullName: student.fullName,
    email: student.user.email,
    department: student.department,
    yearOfStudy: student.yearOfStudy,
    gpa: student.gpa ? Number(student.gpa) : null,
    phone: student.phone,
    linkedin: student.linkedin,
    location: student.location,
    expectedGrad: student.expectedGrad,
    bio: student.bio,
    avatarUrl: student.avatarUrl,
    profileCompletion: student.profileCompletion,
    readinessScore: Number(student.readinessScore),
    status: student.status,
    isUserActive: student.user.isActive,
    lastLogin: student.user.lastLoginAt,
    registeredAt: student.user.createdAt,
    rank: student.rankings.length > 0 ? student.rankings[0].rank : null,
    skills: student.skills.map((ss) => ({
      name: ss.skill.name,
      category: ss.skill.category,
      proficiency: ss.proficiency,
      level: ss.level,
    })),
    assessments: student.assessments.map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      score: Math.round((a.totalScore / a.maxScore) * 100),
      status: a.status,
      completedAt: a.completedAt,
    })),
    projects: student.projects,
    internships: student.internships,
    certifications: student.certifications,
    scoreBreakdown: student.scoreBreakdown
      ? {
          technicalSkills: Number(student.scoreBreakdown.technicalSkills),
          projects: Number(student.scoreBreakdown.projects),
          internships: Number(student.scoreBreakdown.internships),
          certifications: Number(student.scoreBreakdown.certifications),
          assessments: Number(student.scoreBreakdown.assessments),
          totalScore: Number(student.scoreBreakdown.totalScore),
          lastCalculatedAt: student.scoreBreakdown.lastCalculatedAt,
        }
      : null,
    placement: student.placements.length > 0
      ? { company: student.placements[0].company.name, role: student.placements[0].role, packageLpa: Number(student.placements[0].packageLpa) }
      : null,
  };
}

async function updateStudent(studentId, data) {
  const student = await prisma.student.findFirst({ where: { id: studentId, deletedAt: null } });
  if (!student) throw AppError.notFound('Student not found.');

  await prisma.student.update({
    where: { id: studentId },
    data: {
      fullName: data.fullName,
      department: data.department,
      yearOfStudy: data.yearOfStudy,
      gpa: data.gpa,
      status: data.status,
      phone: data.phone,
    },
  });

  if (data.status) {
    // Recalculate rankings when status changes
    await recalculateGlobalRankings().catch(() => {});
  }

  return { message: 'Student updated successfully.' };
}

async function deleteStudent(studentId) {
  const student = await prisma.student.findFirst({ where: { id: studentId, deletedAt: null } });
  if (!student) throw AppError.notFound('Student not found.');

  await prisma.$transaction([
    prisma.student.update({ where: { id: studentId }, data: { deletedAt: new Date() } }),
    prisma.user.update({ where: { id: student.userId }, data: { deletedAt: new Date(), isActive: false } }),
  ]);

  await recalculateGlobalRankings().catch(() => {});

  return { message: 'Student deleted successfully.' };
}

async function toggleUserStatus(userId, isActive) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) throw AppError.notFound('User not found.');

  await prisma.user.update({ where: { id: userId }, data: { isActive } });

  return { message: `User ${isActive ? 'activated' : 'deactivated'} successfully.` };
}

// ─── PLACEMENT DRIVES ────────────────────────────────────────────

async function getPlacementDrives(query) {
  const { page, limit, skip, take } = parsePagination(query);

  const where = {};
  if (query.status) where.status = query.status;
  if (query.companyId) where.companyId = query.companyId;

  const [drives, total] = await Promise.all([
    prisma.placementDrive.findMany({
      where,
      include: { company: true },
      orderBy: { driveDate: 'asc' },
      skip,
      take,
    }),
    prisma.placementDrive.count({ where }),
  ]);

  const formatted = drives.map((d) => ({
    id: d.id,
    company: { id: d.company.id, name: d.company.name, logoUrl: d.company.logoUrl },
    role: d.role,
    description: d.description,
    driveDate: d.driveDate,
    driveTime: d.driveTime,
    status: d.status,
    packageLpa: d.packageLpa ? Number(d.packageLpa) : null,
    createdAt: d.createdAt,
  }));

  return paginatedResponse(formatted, total, page, limit);
}

async function createPlacementDrive(data) {
  // Verify company exists
  const company = await prisma.company.findUnique({ where: { id: data.companyId } });
  if (!company) throw AppError.notFound('Company not found.');

  const drive = await prisma.placementDrive.create({
    data: {
      companyId: data.companyId,
      role: data.role,
      description: data.description || null,
      driveDate: new Date(data.driveDate),
      driveTime: data.driveTime || null,
      packageLpa: data.packageLpa || null,
      status: 'upcoming',
    },
    include: { company: true },
  });

  return {
    message: 'Placement drive created successfully.',
    drive: {
      id: drive.id,
      company: drive.company.name,
      role: drive.role,
      driveDate: drive.driveDate,
    },
  };
}

async function updatePlacementDriveStatus(driveId, data) {
  const drive = await prisma.placementDrive.findUnique({ where: { id: driveId } });
  if (!drive) throw AppError.notFound('Placement drive not found.');

  const updated = await prisma.placementDrive.update({
    where: { id: driveId },
    data,
  });

  return { message: 'Drive updated.', drive: updated };
}

// ─── RECRUITERS ──────────────────────────────────────────────────

async function getRecruiters(query) {
  const { page, limit, skip, take } = parsePagination(query);

  const where = { deletedAt: null };
  if (query.search) {
    where.OR = [
      { fullName: { contains: query.search, mode: 'insensitive' } },
      { company: { name: { contains: query.search, mode: 'insensitive' } } },
    ];
  }

  const [recruiters, total] = await Promise.all([
    prisma.recruiter.findMany({
      where,
      include: {
        user: { select: { email: true, isActive: true, lastLoginAt: true } },
        company: true,
        _count: { select: { jobs: true, shortlists: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.recruiter.count({ where }),
  ]);

  const formatted = recruiters.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    email: r.user.email,
    designation: r.designation,
    company: r.company ? { id: r.company.id, name: r.company.name } : null,
    isActive: r.user.isActive,
    lastLogin: r.user.lastLoginAt,
    totalJobs: r._count.jobs,
    totalShortlisted: r._count.shortlists,
    createdAt: r.createdAt,
  }));

  return paginatedResponse(formatted, total, page, limit);
}

// ─── INVITE RECRUITER ────────────────────────────────────────────

async function inviteRecruiter(data) {
  const { email, companyId } = data;

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw AppError.notFound('Company not found.');

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw AppError.conflict('An account with this email already exists.');

  // Check for existing unused invite
  const existingInvite = await prisma.recruiterInvite.findUnique({ where: { email } });
  if (existingInvite && !existingInvite.usedAt && new Date() < new Date(existingInvite.expiresAt)) {
    throw AppError.conflict('An active invite already exists for this email.');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await prisma.recruiterInvite.upsert({
    where: { email },
    create: { email, token, companyId, expiresAt },
    update: { token, companyId, expiresAt, usedAt: null },
  });

  // In production: send invite email with registration link
  // The registration URL would be: FRONTEND_URL/signup/recruiter?token=TOKEN&email=EMAIL
  return {
    message: 'Recruiter invite created successfully.',
    invite: {
      email: invite.email,
      token: invite.token, // Return token so admin can share manually (in production: send email)
      expiresAt: invite.expiresAt,
      registrationUrl: `${process.env.FRONTEND_URL}/signup/recruiter?token=${invite.token}&email=${encodeURIComponent(invite.email)}`,
    },
  };
}

// ─── COMPANIES ───────────────────────────────────────────────────

async function getCompanies(query) {
  const { page, limit, skip, take } = parsePagination(query);

  const where = { deletedAt: null };
  if (query.search) {
    where.name = { contains: query.search, mode: 'insensitive' };
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: { _count: { select: { recruiters: true, jobs: true, placementDrives: true } } },
      orderBy: { name: 'asc' },
      skip,
      take,
    }),
    prisma.company.count({ where }),
  ]);

  return paginatedResponse(
    companies.map((c) => ({
      id: c.id,
      name: c.name,
      industry: c.industry,
      website: c.website,
      logoUrl: c.logoUrl,
      location: c.location,
      totalRecruiters: c._count.recruiters,
      totalJobs: c._count.jobs,
      totalDrives: c._count.placementDrives,
    })),
    total,
    page,
    limit
  );
}

async function createCompany(data) {
  const existing = await prisma.company.findUnique({ where: { name: data.name } });
  if (existing) throw AppError.conflict('A company with this name already exists.');

  const company = await prisma.company.create({ data });
  return { message: 'Company created successfully.', company };
}

// ─── SYSTEM STATS ────────────────────────────────────────────────

async function getSystemStats() {
  const [
    totalUsers,
    totalStudents,
    totalRecruiters,
    totalAdmins,
    totalJobs,
    totalApplications,
    totalPlacements,
    totalAssessments,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.student.count({ where: { deletedAt: null } }),
    prisma.recruiter.count({ where: { deletedAt: null } }),
    prisma.admin.count(),
    prisma.job.count({ where: { deletedAt: null } }),
    prisma.application.count(),
    prisma.placement.count(),
    prisma.assessment.count(),
    prisma.auditLog.findMany({
      include: { user: { select: { email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return {
    users: { total: totalUsers, students: totalStudents, recruiters: totalRecruiters, admins: totalAdmins },
    activity: { totalJobs, totalApplications, totalPlacements, totalAssessments },
    recentAuditLogs: recentAuditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      userEmail: log.user?.email,
      userRole: log.user?.role,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt,
    })),
  };
}

// ─── RECALCULATE ALL SCORES ─────────────────────────────────────

async function recalculateAllScores() {
  const students = await prisma.student.findMany({
    where: { deletedAt: null },
    select: { id: true },
  });

  let processed = 0;
  for (const student of students) {
    await recalculateScore(student.id).catch(() => {});
    processed++;
  }

  await recalculateGlobalRankings().catch(() => {});

  return { message: 'Score recalculation complete.', processed };
}

// ─── GENERATE REPORT ─────────────────────────────────────────────

async function generateReport(filters) {
  return exportAdminStudentReport(filters);
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
  updatePlacementDriveStatus,
  getRecruiters,
  inviteRecruiter,
  getCompanies,
  createCompany,
  getSystemStats,
  recalculateAllScores,
  generateReport,
};
