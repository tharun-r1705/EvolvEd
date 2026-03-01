'use strict';

const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { recalculateScore, getScoreLabel, getReadinessClassification } = require('./scoring.service');
const { recalculateGlobalRankings, getStudentGlobalRank } = require('./ranking.service');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { uploadFromBuffer, deleteFromCloudinary } = require('../config/cloudinary');
const { groqChat } = require('../utils/groq');
const pdfParse = require('pdf-parse');

// ─── HELPERS ─────────────────────────────────────────────────────

async function getStudentByUserId(userId) {
  const student = await prisma.student.findFirst({
    where: { userId, deletedAt: null },
  });
  if (!student) throw AppError.notFound('Student profile not found.');
  return student;
}

// ─── DASHBOARD ───────────────────────────────────────────────────

async function getDashboard(userId) {
  const student = await prisma.student.findFirst({
    where: { userId, deletedAt: null },
    include: {
      scoreBreakdown: true,
      skills: { include: { skill: true }, orderBy: { proficiency: 'desc' }, take: 6 },
      assessments: {
        orderBy: { completedAt: 'desc' },
        take: 5,
      },
      applications: {
        include: { job: { include: { company: true } } },
        orderBy: { appliedAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!student) throw AppError.notFound('Student profile not found.');

  // Count metrics
  const [totalAssessments, totalApplications, pendingApplications, profileViews] =
    await Promise.all([
      prisma.assessment.count({ where: { studentId: student.id } }),
      prisma.application.count({ where: { studentId: student.id } }),
      prisma.application.count({ where: { studentId: student.id, status: { in: ['applied', 'shortlisted'] } } }),
      // Profile views: use shortlists as a proxy (how many recruiters have shortlisted this student)
      prisma.shortlist.count({ where: { studentId: student.id } }),
    ]);

  // Readiness trend: get last 6 months of score changes
  // Since we don't have a history table, we use assessment scores as a proxy trend
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyAssessments = await prisma.assessment.findMany({
    where: {
      studentId: student.id,
      completedAt: { gte: sixMonthsAgo },
    },
    select: { totalScore: true, maxScore: true, completedAt: true },
    orderBy: { completedAt: 'asc' },
  });

  // Group by month for trend data
  const trendMap = {};
  for (const a of monthlyAssessments) {
    const monthKey = new Date(a.completedAt).toLocaleString('default', { month: 'short' });
    if (!trendMap[monthKey]) trendMap[monthKey] = [];
    trendMap[monthKey].push((a.totalScore / a.maxScore) * 100);
  }

  const readinessTrend = Object.entries(trendMap).map(([month, scores]) => ({
    month,
    value: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));

  // Global rank
  const rankInfo = await getStudentGlobalRank(student.id);

  const score = Number(student.readinessScore);

  return {
    student: {
      id: student.id,
      fullName: student.fullName,
      department: student.department,
      yearOfStudy: student.yearOfStudy,
      avatarUrl: student.avatarUrl,
      profileCompletion: student.profileCompletion,
    },
    readiness: {
      score,
      label: getScoreLabel(score),
      classification: getReadinessClassification(score),
      rank: rankInfo.rank,
      percentile: rankInfo.percentile,
      totalStudents: rankInfo.totalStudents,
    },
    metrics: {
      assessments: totalAssessments,
      applications: totalApplications,
      pendingActions: pendingApplications,
      profileViews,
    },
    scoreBreakdown: student.scoreBreakdown
      ? {
          technicalSkills: Number(student.scoreBreakdown.technicalSkills),
          projects: Number(student.scoreBreakdown.projects),
          internships: Number(student.scoreBreakdown.internships),
          certifications: Number(student.scoreBreakdown.certifications),
          assessments: Number(student.scoreBreakdown.assessments),
          lastCalculatedAt: student.scoreBreakdown.lastCalculatedAt,
        }
      : null,
    skills: student.skills.map((ss) => ({
      id: ss.id,
      name: ss.skill.name,
      category: ss.skill.category,
      proficiency: ss.proficiency,
      level: ss.level,
    })),
    recentAssessments: student.assessments.map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      score: Math.round((a.totalScore / a.maxScore) * 100),
      status: a.status,
      completedAt: a.completedAt,
    })),
    readinessTrend,
  };
}

// ─── READINESS SCORE ─────────────────────────────────────────────

async function getReadinessScore(userId) {
  const student = await getStudentByUserId(userId);
  const score = await recalculateScore(student.id);
  const rankInfo = await getStudentGlobalRank(student.id);

  return {
    score: score.totalScore,
    label: getScoreLabel(score.totalScore),
    classification: getReadinessClassification(score.totalScore),
    components: score.components,
    weights: score.weights,
    rank: rankInfo.rank,
    percentile: rankInfo.percentile,
    totalStudents: rankInfo.totalStudents,
    lastCalculatedAt: score.lastCalculatedAt,
  };
}

// ─── PROFILE ─────────────────────────────────────────────────────

async function getProfile(userId) {
  const student = await prisma.student.findFirst({
    where: { userId, deletedAt: null },
    include: {
      user: { select: { email: true, lastLoginAt: true, createdAt: true } },
      skills: { include: { skill: true }, orderBy: { proficiency: 'desc' } },
      projects: { orderBy: { createdAt: 'desc' } },
      internships: { orderBy: { startDate: 'desc' } },
      certifications: { orderBy: { issueDate: 'desc' } },
      resumes: { orderBy: { uploadedAt: 'desc' } },
      scoreBreakdown: true,
    },
  });

  if (!student) throw AppError.notFound('Student profile not found.');

  return {
    id: student.id,
    fullName: student.fullName,
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
    githubUsername: student.githubUsername,
    leetcodeUsername: student.leetcodeUsername,
    linkedinPdfUrl: student.linkedinPdfUrl,
    showOnLeaderboard: student.showOnLeaderboard,
    profileCompletion: student.profileCompletion,
    readinessScore: Number(student.readinessScore),
    status: student.status,
    createdAt: student.createdAt,
    lastLoginAt: student.user.lastLoginAt,
    skills: student.skills.map((ss) => ({
      id: ss.id,
      name: ss.skill.name,
      category: ss.skill.category,
      proficiency: ss.proficiency,
      level: ss.level,
    })),
    projects: student.projects,
    internships: student.internships,
    certifications: student.certifications,
    resumes: student.resumes,
    scoreBreakdown: student.scoreBreakdown
      ? {
          technicalSkills: Number(student.scoreBreakdown.technicalSkills),
          projects: Number(student.scoreBreakdown.projects),
          internships: Number(student.scoreBreakdown.internships),
          certifications: Number(student.scoreBreakdown.certifications),
          assessments: Number(student.scoreBreakdown.assessments),
          totalScore: Number(student.scoreBreakdown.totalScore),
        }
      : null,
  };
}

async function updateProfile(userId, data) {
  const student = await getStudentByUserId(userId);

  const updated = await prisma.student.update({
    where: { id: student.id },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      linkedin: data.linkedin,
      website: data.website,
      location: data.location,
      expectedGrad: data.expectedGrad,
      bio: data.bio,
      gpa: data.gpa,
      department: data.department,
      yearOfStudy: data.yearOfStudy,
      githubUsername: data.githubUsername,
      leetcodeUsername: data.leetcodeUsername,
      showOnLeaderboard: data.showOnLeaderboard,
    },
  });

  // Recalculate score (profile completion may change)
  const newScore = await recalculateScore(student.id);
  await recalculateGlobalRankings().catch(() => {});

  return {
    message: 'Profile updated successfully.',
    readinessScore: newScore.totalScore,
    profileCompletion: newScore.profileCompletion,
  };
}

// ─── SKILLS ──────────────────────────────────────────────────────

async function getSkills(userId) {
  const student = await getStudentByUserId(userId);

  const skills = await prisma.studentSkill.findMany({
    where: { studentId: student.id },
    include: { skill: true },
    orderBy: { proficiency: 'desc' },
  });

  return skills.map((ss) => ({
    id: ss.id,
    skillId: ss.skillId,
    name: ss.skill.name,
    category: ss.skill.category,
    proficiency: ss.proficiency,
    level: ss.level,
  }));
}

async function addSkill(userId, { skillName, proficiency, level }) {
  const student = await getStudentByUserId(userId);

  // Find or create the skill
  const skill = await prisma.skill.upsert({
    where: { name: skillName },
    create: { name: skillName, category: 'technical' },
    update: {},
  });

  // Check if student already has this skill
  const existing = await prisma.studentSkill.findUnique({
    where: { studentId_skillId: { studentId: student.id, skillId: skill.id } },
  });

  if (existing) {
    // Update proficiency
    const updated = await prisma.studentSkill.update({
      where: { id: existing.id },
      data: { proficiency, level },
      include: { skill: true },
    });

    await recalculateScore(student.id);
    await recalculateGlobalRankings().catch(() => {});

    return {
      message: 'Skill updated successfully.',
      skill: { id: updated.id, name: updated.skill.name, proficiency: updated.proficiency, level: updated.level },
    };
  }

  const newSkill = await prisma.studentSkill.create({
    data: { studentId: student.id, skillId: skill.id, proficiency, level },
    include: { skill: true },
  });

  await recalculateScore(student.id);
  await recalculateGlobalRankings().catch(() => {});

  return {
    message: 'Skill added successfully.',
    skill: { id: newSkill.id, name: newSkill.skill.name, proficiency: newSkill.proficiency, level: newSkill.level },
  };
}

async function removeSkill(userId, studentSkillId) {
  const student = await getStudentByUserId(userId);

  const skillRecord = await prisma.studentSkill.findFirst({
    where: { id: studentSkillId, studentId: student.id },
  });

  if (!skillRecord) throw AppError.notFound('Skill not found.');

  await prisma.studentSkill.delete({ where: { id: studentSkillId } });

  await recalculateScore(student.id);
  await recalculateGlobalRankings().catch(() => {});

  return { message: 'Skill removed successfully.' };
}

// ─── PROJECTS ────────────────────────────────────────────────────

async function addProject(userId, data) {
  const student = await getStudentByUserId(userId);

  const project = await prisma.project.create({
    data: { studentId: student.id, ...data },
  });

  await recalculateScore(student.id);
  await recalculateGlobalRankings().catch(() => {});

  return { message: 'Project added successfully.', project };
}

async function removeProject(userId, projectId) {
  const student = await getStudentByUserId(userId);

  const project = await prisma.project.findFirst({
    where: { id: projectId, studentId: student.id },
  });
  if (!project) throw AppError.notFound('Project not found.');

  await prisma.project.delete({ where: { id: projectId } });

  await recalculateScore(student.id);
  await recalculateGlobalRankings().catch(() => {});

  return { message: 'Project removed successfully.' };
}

// ─── INTERNSHIPS ─────────────────────────────────────────────────

async function addInternship(userId, data) {
  const student = await getStudentByUserId(userId);

  const internship = await prisma.internship.create({
    data: { studentId: student.id, ...data },
  });

  await recalculateScore(student.id);
  await recalculateGlobalRankings().catch(() => {});

  return { message: 'Internship added successfully.', internship };
}

async function removeInternship(userId, internshipId) {
  const student = await getStudentByUserId(userId);

  const internship = await prisma.internship.findFirst({
    where: { id: internshipId, studentId: student.id },
  });
  if (!internship) throw AppError.notFound('Internship not found.');

  await prisma.internship.delete({ where: { id: internshipId } });
  await recalculateScore(student.id);
  await recalculateGlobalRankings().catch(() => {});

  return { message: 'Internship removed successfully.' };
}

// ─── CERTIFICATIONS ──────────────────────────────────────────────

async function addCertification(userId, data) {
  const student = await getStudentByUserId(userId);

  const cert = await prisma.certification.create({
    data: { studentId: student.id, ...data },
  });

  await recalculateScore(student.id);
  await recalculateGlobalRankings().catch(() => {});

  return { message: 'Certification added successfully.', certification: cert };
}

async function removeCertification(userId, certId) {
  const student = await getStudentByUserId(userId);

  const cert = await prisma.certification.findFirst({
    where: { id: certId, studentId: student.id },
  });
  if (!cert) throw AppError.notFound('Certification not found.');

  await prisma.certification.delete({ where: { id: certId } });
  await recalculateScore(student.id);
  await recalculateGlobalRankings().catch(() => {});

  return { message: 'Certification removed successfully.' };
}

// ─── ASSESSMENTS ─────────────────────────────────────────────────

async function getAssessments(userId, query) {
  const student = await getStudentByUserId(userId);
  const { page, limit, skip, take } = parsePagination(query);

  const where = { studentId: student.id };
  if (query.category) where.category = query.category;

  const [assessments, total] = await Promise.all([
    prisma.assessment.findMany({
      where,
      include: { scores: true },
      orderBy: { completedAt: 'desc' },
      skip,
      take,
    }),
    prisma.assessment.count({ where }),
  ]);

  const formatted = assessments.map((a) => ({
    id: a.id,
    title: a.title,
    subtitle: a.subtitle,
    category: a.category,
    score: Math.round((a.totalScore / a.maxScore) * 100),
    totalScore: a.totalScore,
    maxScore: a.maxScore,
    percentile: a.percentile,
    timeTaken: a.timeTaken,
    maxTime: a.maxTime,
    status: a.status,
    completedAt: a.completedAt,
  }));

  return paginatedResponse(formatted, total, page, limit);
}

async function getAssessmentById(userId, assessmentId) {
  const student = await getStudentByUserId(userId);

  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, studentId: student.id },
    include: { scores: true },
  });

  if (!assessment) throw AppError.notFound('Assessment not found.');

  // Get all assessments for history
  const history = await prisma.assessment.findMany({
    where: { studentId: student.id },
    orderBy: { completedAt: 'desc' },
    take: 10,
  });

  // Improvement recommendations based on low scores
  const improvements = assessment.scores
    .filter((s) => (s.score / s.maxScore) < 0.75)
    .map((s) => ({
      area: s.category,
      description: `Your ${s.category} score (${Math.round((s.score / s.maxScore) * 100)}%) is below the recommended threshold. Focus on targeted practice.`,
      resourcesLink: null,
    }));

  return {
    id: assessment.id,
    title: assessment.title,
    subtitle: assessment.subtitle,
    category: assessment.category,
    overallScore: assessment.totalScore,
    maxScore: assessment.maxScore,
    percentileRank: assessment.percentile,
    timeTaken: assessment.timeTaken,
    maxTime: assessment.maxTime,
    completedDate: assessment.completedAt,
    status: assessment.status,
    categoryPerformance: assessment.scores.map((s) => ({
      label: s.category,
      score: s.score,
      maxScore: s.maxScore,
      percentage: Math.round((s.score / s.maxScore) * 100),
    })),
    improvements,
    history: history.map((h) => ({
      id: h.id,
      name: h.title,
      subtitle: h.subtitle,
      date: h.completedAt,
      category: h.category,
      score: h.totalScore,
      maxScore: h.maxScore,
      status: h.status,
    })),
  };
}

// ─── AVATAR UPLOAD ───────────────────────────────────────────────

async function uploadAvatar(userId, fileBuffer, mimetype) {
  const student = await getStudentByUserId(userId);

  // Delete old avatar from Cloudinary if it exists
  if (student.avatarUrl && student.avatarUrl.includes('cloudinary')) {
    // Extract public ID from URL: .../evolved/avatars/<public_id>.<ext>
    const parts = student.avatarUrl.split('/');
    const folder = parts.slice(-2, -1)[0];
    const filename = parts[parts.length - 1].split('.')[0];
    await deleteFromCloudinary(`${folder}/${filename}`);
  }

  const result = await uploadFromBuffer(fileBuffer, {
    folder: 'evolved/avatars',
    public_id: `student_${student.id}`,
    overwrite: true,
    resource_type: 'image',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });

  await prisma.student.update({
    where: { id: student.id },
    data: { avatarUrl: result.secure_url },
  });

  const newScore = await recalculateScore(student.id);

  return {
    message: 'Avatar uploaded successfully.',
    avatarUrl: result.secure_url,
    profileCompletion: newScore.profileCompletion,
  };
}

// ─── RESUME MANAGEMENT ───────────────────────────────────────────

async function getResumes(userId) {
  const student = await getStudentByUserId(userId);
  return prisma.resume.findMany({
    where: { studentId: student.id },
    orderBy: [{ isDefault: 'desc' }, { uploadedAt: 'desc' }],
  });
}

async function uploadResume(userId, fileBuffer, data) {
  const student = await getStudentByUserId(userId);

  // Enforce max 10 resumes per student
  const count = await prisma.resume.count({ where: { studentId: student.id } });
  if (count >= 10) {
    throw AppError.badRequest('Maximum 10 resumes allowed. Please delete one before uploading a new one.');
  }

  const sanitizedName = data.name.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
  const timestamp = Date.now();
  const publicId = `evolved/resumes/student_${student.id}_${timestamp}`;

  const result = await uploadFromBuffer(fileBuffer, {
    folder: 'evolved/resumes',
    public_id: `student_${student.id}_${timestamp}`,
    resource_type: 'raw',
    format: 'pdf',
  });

  // If this is the first resume or isDefault requested, set as default
  const shouldBeDefault = data.isDefault || count === 0;

  // If setting as default, unset others
  if (shouldBeDefault) {
    await prisma.resume.updateMany({
      where: { studentId: student.id },
      data: { isDefault: false },
    });
  }

  const resume = await prisma.resume.create({
    data: {
      studentId: student.id,
      name: sanitizedName || data.name,
      category: data.category || 'general',
      url: result.secure_url,
      publicId: result.public_id,
      isDefault: shouldBeDefault,
    },
  });

  return { message: 'Resume uploaded successfully.', resume };
}

async function updateResume(userId, resumeId, data) {
  const student = await getStudentByUserId(userId);

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, studentId: student.id },
  });
  if (!resume) throw AppError.notFound('Resume not found.');

  // If setting as default, unset others first
  if (data.isDefault) {
    await prisma.resume.updateMany({
      where: { studentId: student.id, id: { not: resumeId } },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.resume.update({
    where: { id: resumeId },
    data: {
      name: data.name,
      category: data.category,
      isDefault: data.isDefault,
    },
  });

  return { message: 'Resume updated successfully.', resume: updated };
}

async function deleteResume(userId, resumeId) {
  const student = await getStudentByUserId(userId);

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, studentId: student.id },
  });
  if (!resume) throw AppError.notFound('Resume not found.');

  // Delete from Cloudinary
  await deleteFromCloudinary(resume.publicId, 'raw');

  await prisma.resume.delete({ where: { id: resumeId } });

  // If deleted resume was default and other resumes exist, make the most recent one default
  if (resume.isDefault) {
    const nextResume = await prisma.resume.findFirst({
      where: { studentId: student.id },
      orderBy: { uploadedAt: 'desc' },
    });
    if (nextResume) {
      await prisma.resume.update({ where: { id: nextResume.id }, data: { isDefault: true } });
    }
  }

  return { message: 'Resume deleted successfully.' };
}

// ─── LINKEDIN PDF PARSING ─────────────────────────────────────────

async function parseLinkedinPdf(userId, fileBuffer) {
  const student = await getStudentByUserId(userId);

  // Extract text from PDF
  let pdfText = '';
  try {
    const parsed = await pdfParse(fileBuffer);
    pdfText = parsed.text;
  } catch (err) {
    throw AppError.badRequest('Could not read the PDF file. Please ensure it is a valid LinkedIn export.');
  }

  if (!pdfText || pdfText.trim().length < 100) {
    throw AppError.badRequest('The PDF appears to be empty or unreadable. Please export your LinkedIn profile again.');
  }

  // Use Groq AI to extract structured data from the PDF text
  let extracted;
  try {
    const response = await groqChat({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `You are a precise data extractor for LinkedIn PDF profiles. Extract information from the provided LinkedIn profile text and return ONLY a valid JSON object with no additional text or markdown. Extract exactly these fields (use null if not found):
{
  "fullName": string or null,
  "headline": string or null,
  "location": string or null,
  "summary": string or null (this will be the bio, max 1000 chars),
  "skills": array of strings (technical skills only, max 20),
  "experience": array of { "company": string, "role": string, "startDate": string, "endDate": string or null, "description": string or null },
  "education": array of { "school": string, "degree": string, "field": string, "startYear": string, "endYear": string },
  "certifications": array of { "name": string, "issuer": string, "issueDate": string or null, "credentialUrl": string or null },
  "linkedinUrl": string or null,
  "website": string or null
}`,
        },
        {
          role: 'user',
          content: `Extract information from this LinkedIn profile:\n\n${pdfText.slice(0, 8000)}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    // Strip markdown code blocks if present
    const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
    extracted = JSON.parse(jsonStr);
  } catch (err) {
    console.error('[LinkedIn PDF] AI extraction failed:', err.message);
    throw AppError.internal('Failed to extract data from LinkedIn PDF. Please try again.');
  }

  // Upload the PDF to Cloudinary for storage
  let pdfUrl = null;
  try {
    const result = await uploadFromBuffer(fileBuffer, {
      folder: 'evolved/linkedin',
      public_id: `linkedin_${student.id}_${Date.now()}`,
      resource_type: 'raw',
      format: 'pdf',
    });
    pdfUrl = result.secure_url;

    // Save PDF URL to student record
    await prisma.student.update({
      where: { id: student.id },
      data: { linkedinPdfUrl: pdfUrl },
    });
  } catch (err) {
    console.error('[LinkedIn PDF] Cloudinary upload failed:', err.message);
    // Non-critical: continue even if upload fails
  }

  return {
    message: 'LinkedIn PDF parsed successfully.',
    extracted,
    pdfUrl,
  };
}

// ─── APPLICATIONS ────────────────────────────────────────────────

async function getApplications(userId, query) {
  const student = await getStudentByUserId(userId);
  const { page, limit, skip, take } = parsePagination(query);

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        job: {
          include: { company: true, skills: { include: { skill: true } } },
        },
      },
      orderBy: { appliedAt: 'desc' },
      skip,
      take,
    }),
    prisma.application.count({ where: { studentId: student.id } }),
  ]);

  const formatted = applications.map((app) => ({
    id: app.id,
    status: app.status,
    appliedAt: app.appliedAt,
    job: {
      id: app.job.id,
      title: app.job.title,
      department: app.job.department,
      employmentType: app.job.employmentType,
      location: app.job.location,
      company: {
        id: app.job.company.id,
        name: app.job.company.name,
        logoUrl: app.job.company.logoUrl,
      },
      skills: app.job.skills.map((js) => js.skill.name),
    },
  }));

  return paginatedResponse(formatted, total, page, limit);
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
  addProject,
  removeProject,
  addInternship,
  removeInternship,
  addCertification,
  removeCertification,
  getAssessments,
  getAssessmentById,
  getApplications,
};
