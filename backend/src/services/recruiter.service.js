'use strict';

const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { recalculateJobRankings } = require('./ranking.service');
const { exportCandidates } = require('./export.service');

// ─── HELPER ──────────────────────────────────────────────────────

async function getRecruiterByUserId(userId) {
  const recruiter = await prisma.recruiter.findFirst({
    where: { userId, deletedAt: null },
    include: { company: true },
  });
  if (!recruiter) throw AppError.notFound('Recruiter profile not found.');
  return recruiter;
}

// ─── DASHBOARD ───────────────────────────────────────────────────

async function getDashboard(userId) {
  const recruiter = await getRecruiterByUserId(userId);

  const [activeJobs, totalApplications, shortlisted, interviewsScheduled] = await Promise.all([
    prisma.job.count({ where: { recruiterId: recruiter.id, isActive: true, deletedAt: null } }),
    prisma.application.count({
      where: { job: { recruiterId: recruiter.id } },
    }),
    prisma.shortlist.count({ where: { recruiterId: recruiter.id } }),
    prisma.application.count({
      where: { job: { recruiterId: recruiter.id }, status: 'interviewing' },
    }),
  ]);

  // Application trend: last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentApplications = await prisma.application.findMany({
    where: {
      job: { recruiterId: recruiter.id },
      appliedAt: { gte: sevenDaysAgo },
    },
    select: { appliedAt: true },
  });

  // Group by day of week
  const dayTrend = [0, 0, 0, 0, 0, 0, 0];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (const app of recentApplications) {
    dayTrend[new Date(app.appliedAt).getDay()]++;
  }
  const applicationTrend = dayNames.map((day, i) => ({ day, count: dayTrend[i] }));

  // Recent applicants
  const recentApplicants = await prisma.application.findMany({
    where: { job: { recruiterId: recruiter.id } },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          readinessScore: true,
        },
      },
      job: { select: { title: true } },
    },
    orderBy: { appliedAt: 'desc' },
    take: 5,
  });

  // Hiring pipeline
  const [screening, interviewing, offered, hired] = await Promise.all([
    prisma.application.count({ where: { job: { recruiterId: recruiter.id }, status: 'applied' } }),
    prisma.application.count({ where: { job: { recruiterId: recruiter.id }, status: 'interviewing' } }),
    prisma.application.count({ where: { job: { recruiterId: recruiter.id }, status: 'offered' } }),
    prisma.application.count({ where: { job: { recruiterId: recruiter.id }, status: 'shortlisted' } }),
  ]);

  return {
    recruiter: {
      id: recruiter.id,
      fullName: recruiter.fullName,
      designation: recruiter.designation,
      company: recruiter.company
        ? { id: recruiter.company.id, name: recruiter.company.name, logoUrl: recruiter.company.logoUrl }
        : null,
    },
    stats: {
      activeJobs,
      shortlistedCandidates: shortlisted,
      totalApplications,
      interviewsScheduled,
    },
    applicationTrend,
    recentApplicants: recentApplicants.map((app) => ({
      id: app.student.id,
      name: app.student.fullName,
      avatarUrl: app.student.avatarUrl,
      role: app.job.title,
      score: Number(app.student.readinessScore),
      status: app.status,
    })),
    hiringPipeline: [
      { stage: 'Screening', count: screening },
      { stage: 'Interview', count: interviewing },
      { stage: 'Offer Sent', count: offered },
      { stage: 'Hired', count: hired },
    ],
  };
}

// ─── CANDIDATES ──────────────────────────────────────────────────

async function getCandidates(userId, query) {
  const { page, limit, skip, take } = parsePagination(query);

  // Build filter
  const where = { deletedAt: null };

  if (query.minScore !== undefined) {
    where.readinessScore = { ...where.readinessScore, gte: Number(query.minScore) };
  }
  if (query.maxScore !== undefined) {
    where.readinessScore = { ...where.readinessScore, lte: Number(query.maxScore) };
  }
  if (query.department) {
    where.department = { contains: query.department, mode: 'insensitive' };
  }
  if (query.yearOfStudy) {
    where.yearOfStudy = query.yearOfStudy;
  }
  if (query.readyForHire === 'true' || query.readyForHire === true) {
    where.status = 'active';
    where.readinessScore = { ...where.readinessScore, gte: 70 };
  }
  if (query.search) {
    where.OR = [
      { fullName: { contains: query.search, mode: 'insensitive' } },
      { studentId: { contains: query.search, mode: 'insensitive' } },
      { department: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  // Filter by skills if provided
  let studentIdsWithSkills = null;
  if (query.skills) {
    const skillNames = query.skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skillNames.length > 0) {
      const skillRecords = await prisma.skill.findMany({
        where: { name: { in: skillNames, mode: 'insensitive' } },
        select: { id: true },
      });
      const skillIds = skillRecords.map((s) => s.id);

      if (skillIds.length > 0) {
        const studentsWithSkills = await prisma.studentSkill.findMany({
          where: { skillId: { in: skillIds } },
          select: { studentId: true },
          distinct: ['studentId'],
        });
        studentIdsWithSkills = studentsWithSkills.map((s) => s.studentId);
        where.id = { in: studentIdsWithSkills };
      }
    }
  }

  // Sorting
  const orderBy =
    query.sortBy === 'name'
      ? { fullName: query.sortOrder || 'asc' }
      : { readinessScore: query.sortOrder || 'desc' };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        skills: { include: { skill: true }, orderBy: { proficiency: 'desc' }, take: 5 },
        rankings: { where: { jobId: null }, take: 1 },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.student.count({ where }),
  ]);

  const formatted = students.map((s, index) => ({
    id: s.id,
    rank: s.rankings.length > 0 ? s.rankings[0].rank : skip + index + 1,
    name: s.fullName,
    studentId: s.studentId,
    class: s.yearOfStudy,
    department: s.department,
    gpa: s.gpa ? Number(s.gpa) : null,
    skills: s.skills.map((ss) => ({ id: ss.skillId, name: ss.skill.name, proficiency: ss.proficiency })),
    readinessScore: Number(s.readinessScore),
    status: s.status,
    avatarUrl: s.avatarUrl,
  }));

  return paginatedResponse(formatted, total, page, limit);
}

async function getCandidateById(candidateId) {
  const student = await prisma.student.findFirst({
    where: { id: candidateId, deletedAt: null },
    include: {
      user: { select: { email: true } },
      skills: { include: { skill: true }, orderBy: { proficiency: 'desc' } },
      projects: { orderBy: { createdAt: 'desc' } },
      assessments: { include: { scores: true }, orderBy: { completedAt: 'desc' }, take: 10 },
      internships: { orderBy: { startDate: 'desc' } },
      certifications: { orderBy: { issueDate: 'desc' } },
      rankings: { where: { jobId: null }, take: 1 },
      scoreBreakdown: true,
    },
  });

  if (!student) throw AppError.notFound('Candidate not found.');

  const score = Number(student.readinessScore);
  let matchLevel = 'Good Match';
  if (score >= 90) matchLevel = 'Excellent Match';
  else if (score >= 75) matchLevel = 'Strong Match';
  else if (score < 50) matchLevel = 'Developing';

  const totalStudents = await prisma.student.count({ where: { deletedAt: null } });
  const rank = student.rankings.length > 0 ? student.rankings[0].rank : null;
  const percentile = rank ? Math.round(((totalStudents - rank) / totalStudents) * 100) : null;

  return {
    id: student.id,
    name: student.fullName,
    studentId: student.studentId,
    email: student.user.email,
    department: student.department,
    yearOfStudy: student.yearOfStudy,
    gpa: student.gpa ? Number(student.gpa) : null,
    phone: student.phone,
    linkedin: student.linkedin,
    website: student.website,
    location: student.location,
    expectedGrad: student.expectedGrad,
    bio: student.bio,
    avatarUrl: student.avatarUrl,
    status: student.status,
    readinessScore: score,
    matchLevel,
    percentile,
    rank,
    technicalSkills: student.skills
      .filter((ss) => ss.skill.category === 'technical')
      .map((ss) => ({ name: ss.skill.name, proficiency: ss.proficiency, level: ss.level })),
    softSkills: student.skills
      .filter((ss) => ss.skill.category === 'soft_skill')
      .map((ss) => ss.skill.name),
    projects: student.projects,
    internships: student.internships,
    certifications: student.certifications,
    assessmentHistory: student.assessments.map((a) => ({
      id: a.id,
      name: a.title,
      type: a.subtitle || a.category,
      date: a.completedAt,
      score: `${Math.round((a.totalScore / a.maxScore) * 100)}%`,
      status: a.status,
    })),
    scoreBreakdown: student.scoreBreakdown
      ? {
          technicalSkills: Number(student.scoreBreakdown.technicalSkills),
          projects: Number(student.scoreBreakdown.projects),
          internships: Number(student.scoreBreakdown.internships),
          certifications: Number(student.scoreBreakdown.certifications),
          assessments: Number(student.scoreBreakdown.assessments),
        }
      : null,
  };
}

// ─── SHORTLIST ───────────────────────────────────────────────────

async function shortlistCandidate(userId, candidateId, data) {
  const recruiter = await getRecruiterByUserId(userId);

  const student = await prisma.student.findFirst({
    where: { id: candidateId, deletedAt: null },
  });
  if (!student) throw AppError.notFound('Candidate not found.');

  const existing = await prisma.shortlist.findFirst({
    where: {
      recruiterId: recruiter.id,
      studentId: candidateId,
      jobId: data.jobId || null,
    },
  });

  if (existing) {
    // Toggle: remove from shortlist
    await prisma.shortlist.delete({ where: { id: existing.id } });
    return { message: 'Candidate removed from shortlist.', shortlisted: false };
  }

  await prisma.shortlist.create({
    data: {
      recruiterId: recruiter.id,
      studentId: candidateId,
      jobId: data.jobId || null,
      notes: data.notes || null,
    },
  });

  return { message: 'Candidate added to shortlist.', shortlisted: true };
}

// ─── JOBS ────────────────────────────────────────────────────────

async function getJobs(userId, query) {
  const recruiter = await getRecruiterByUserId(userId);
  const { page, limit, skip, take } = parsePagination(query);

  const where = { recruiterId: recruiter.id, deletedAt: null };
  if (query.active !== undefined) where.isActive = query.active === 'true';

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        skills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.job.count({ where }),
  ]);

  const formatted = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    department: j.department,
    employmentType: j.employmentType,
    location: j.location,
    minimumReadinessScore: j.minimumReadinessScore,
    visibility: j.visibility,
    isActive: j.isActive,
    applicationsCount: j._count.applications,
    skills: j.skills.map((js) => js.skill.name),
    createdAt: j.createdAt,
  }));

  return paginatedResponse(formatted, total, page, limit);
}

async function createJob(userId, data) {
  const recruiter = await getRecruiterByUserId(userId);

  const { requiredSkills = [], ...jobData } = data;

  // Find or create all required skills
  const skillRecords = await Promise.all(
    requiredSkills.map((name) =>
      prisma.skill.upsert({
        where: { name },
        create: { name, category: 'technical' },
        update: {},
      })
    )
  );

  const job = await prisma.$transaction(async (tx) => {
    const newJob = await tx.job.create({
      data: {
        recruiterId: recruiter.id,
        companyId: recruiter.companyId,
        title: jobData.title,
        department: jobData.department,
        employmentType: jobData.employmentType,
        location: jobData.location,
        description: jobData.description,
        minimumReadinessScore: jobData.minimumReadinessScore || 0,
        visibility: jobData.visibility || 'public',
        notifyEligible: jobData.notifyEligible || false,
      },
    });

    if (skillRecords.length > 0) {
      await tx.jobSkill.createMany({
        data: skillRecords.map((s) => ({ jobId: newJob.id, skillId: s.id })),
        skipDuplicates: true,
      });
    }

    return newJob;
  });

  // Trigger per-job ranking calculation asynchronously
  recalculateJobRankings(job.id).catch(() => {});

  return {
    message: 'Job posted successfully.',
    job: { id: job.id, title: job.title, createdAt: job.createdAt },
  };
}

// ─── ANALYTICS ───────────────────────────────────────────────────

async function getAnalytics(userId) {
  const recruiter = await getRecruiterByUserId(userId);

  const jobs = await prisma.job.findMany({
    where: { recruiterId: recruiter.id, deletedAt: null },
    include: {
      _count: { select: { applications: true } },
    },
  });

  // Applications by status
  const applicationsByStatus = await prisma.application.groupBy({
    by: ['status'],
    where: { job: { recruiterId: recruiter.id } },
    _count: { id: true },
  });

  // Applications over last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentApps = await prisma.application.findMany({
    where: {
      job: { recruiterId: recruiter.id },
      appliedAt: { gte: thirtyDaysAgo },
    },
    select: { appliedAt: true },
  });

  // Group by day
  const dailyMap = {};
  for (const app of recentApps) {
    const day = new Date(app.appliedAt).toISOString().slice(0, 10);
    dailyMap[day] = (dailyMap[day] || 0) + 1;
  }

  const applicationTrendByDay = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Top shortlisted candidates
  const topShortlisted = await prisma.shortlist.findMany({
    where: { recruiterId: recruiter.id },
    include: {
      student: {
        select: { id: true, fullName: true, department: true, readinessScore: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j) => j.isActive).length,
    totalApplicationsReceived: jobs.reduce((sum, j) => sum + j._count.applications, 0),
    applicationsByStatus: applicationsByStatus.map((s) => ({
      status: s.status,
      count: s._count.id,
    })),
    applicationTrendByDay,
    topShortlisted: topShortlisted.map((s) => ({
      id: s.student.id,
      name: s.student.fullName,
      department: s.student.department,
      readinessScore: Number(s.student.readinessScore),
      shortlistedAt: s.createdAt,
    })),
    jobsBreakdown: jobs.map((j) => ({
      id: j.id,
      title: j.title,
      applications: j._count.applications,
      isActive: j.isActive,
    })),
  };
}

// ─── CANDIDATE EXPORT ────────────────────────────────────────────

async function exportCandidatesForRecruiter(userId, query) {
  const { data: candidates } = await getCandidates(userId, { ...query, limit: '1000', page: '1' });
  return exportCandidates(
    candidates.map((c) => ({
      ...c,
      fullName: c.name,
      skills: c.skills,
    }))
  );
}

// ─── CANDIDATE PROFILE REPORT ────────────────────────────────────

async function exportCandidateProfileReport(candidateId) {
  const candidate = await getCandidateById(candidateId);

  const data = [
    {
      Name: candidate.name,
      'Student ID': candidate.studentId,
      Email: candidate.email,
      Department: candidate.department,
      'Year of Study': candidate.yearOfStudy,
      GPA: candidate.gpa || 'N/A',
      'Readiness Score': candidate.readinessScore,
      'Match Level': candidate.matchLevel,
      Location: candidate.location || '',
      'Expected Graduation': candidate.expectedGrad || '',
      'Total Assessments': candidate.assessmentHistory.length,
      'Top Technical Skills': candidate.technicalSkills.slice(0, 5).map((s) => `${s.name}(${s.proficiency}%)`).join(', '),
      'Soft Skills': candidate.softSkills.slice(0, 5).join(', '),
      'Total Projects': candidate.projects.length,
      'Total Internships': candidate.internships.length,
      'Total Certifications': candidate.certifications.length,
    },
  ];

  const fields = Object.keys(data[0]).map((k) => ({ label: k, value: k }));
  const { generateCsv } = require('../utils/csvExport');
  return generateCsv(data, fields);
}

// ─── GET APPLICANTS FOR JOB ──────────────────────────────────────

async function getApplicants(userId, jobId, query) {
  const recruiter = await getRecruiterByUserId(userId);

  // Verify job belongs to this recruiter
  const job = await prisma.job.findFirst({
    where: { id: jobId, recruiterId: recruiter.id, deletedAt: null },
  });
  if (!job) throw AppError.notFound('Job not found.');

  const { page, limit, skip, take } = parsePagination(query);

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where: { jobId },
      include: {
        student: {
          include: { skills: { include: { skill: true }, take: 5 } },
        },
      },
      orderBy: { appliedAt: 'desc' },
      skip,
      take,
    }),
    prisma.application.count({ where: { jobId } }),
  ]);

  const formatted = applications.map((app) => ({
    applicationId: app.id,
    status: app.status,
    appliedAt: app.appliedAt,
    student: {
      id: app.student.id,
      name: app.student.fullName,
      department: app.student.department,
      readinessScore: Number(app.student.readinessScore),
      skills: app.student.skills.map((ss) => ss.skill.name),
      avatarUrl: app.student.avatarUrl,
    },
  }));

  return paginatedResponse(formatted, total, page, limit);
}

// ─── UPDATE APPLICATION STATUS ───────────────────────────────────

async function updateApplicationStatus(userId, applicationId, status) {
  const recruiter = await getRecruiterByUserId(userId);

  const application = await prisma.application.findFirst({
    where: { id: applicationId, job: { recruiterId: recruiter.id } },
  });
  if (!application) throw AppError.notFound('Application not found.');

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });

  return { message: `Application status updated to '${status}'.`, status: updated.status };
}

module.exports = {
  getDashboard,
  getCandidates,
  getCandidateById,
  shortlistCandidate,
  getJobs,
  createJob,
  getAnalytics,
  exportCandidatesForRecruiter,
  exportCandidateProfileReport,
  getApplicants,
  updateApplicationStatus,
};
