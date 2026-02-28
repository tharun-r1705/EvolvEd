'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Score Weights ───────────────────────────────────────────────
  console.log('  Creating score weights...');
  const weights = [
    { component: 'technical_skills', weight: 30 },
    { component: 'projects', weight: 20 },
    { component: 'internships', weight: 20 },
    { component: 'certifications', weight: 10 },
    { component: 'assessments', weight: 20 },
  ];
  for (const w of weights) {
    await prisma.scoreWeight.upsert({
      where: { component: w.component },
      create: w,
      update: { weight: w.weight },
    });
  }

  // ─── Admin ───────────────────────────────────────────────────────
  console.log('  Creating admin user...');
  const adminPasswordHash = await bcrypt.hash('Admin@1234', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@evolved.edu' },
    create: { email: 'admin@evolved.edu', passwordHash: adminPasswordHash, role: 'admin' },
    update: {},
  });
  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    create: { userId: adminUser.id, fullName: 'System Admin', title: 'Placement Officer' },
    update: {},
  });

  // ─── Companies ───────────────────────────────────────────────────
  console.log('  Creating companies...');
  const companiesData = [
    { name: 'Google', industry: 'Technology', website: 'https://google.com', location: 'Bangalore, India' },
    { name: 'Microsoft', industry: 'Technology', website: 'https://microsoft.com', location: 'Hyderabad, India' },
    { name: 'Amazon', industry: 'E-Commerce / Cloud', website: 'https://amazon.com', location: 'Bangalore, India' },
    { name: 'Infosys', industry: 'IT Services', website: 'https://infosys.com', location: 'Pune, India' },
    { name: 'TCS', industry: 'IT Services', website: 'https://tcs.com', location: 'Mumbai, India' },
  ];
  const companies = {};
  for (const c of companiesData) {
    const company = await prisma.company.upsert({
      where: { name: c.name },
      create: c,
      update: {},
    });
    companies[c.name] = company;
  }

  // ─── Recruiter ───────────────────────────────────────────────────
  console.log('  Creating recruiter...');
  const recruiterPasswordHash = await bcrypt.hash('Recruiter@1234', 12);
  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter@google.com' },
    create: { email: 'recruiter@google.com', passwordHash: recruiterPasswordHash, role: 'recruiter' },
    update: {},
  });
  const recruiter = await prisma.recruiter.upsert({
    where: { userId: recruiterUser.id },
    create: {
      userId: recruiterUser.id,
      fullName: 'Priya Sharma',
      companyId: companies['Google'].id,
      designation: 'Technical Recruiter',
    },
    update: {},
  });

  // ─── Students ────────────────────────────────────────────────────
  console.log('  Creating students...');
  const studentsData = [
    {
      email: 'arjun.kumar@student.edu',
      fullName: 'Arjun Kumar',
      studentId: 'CS2021001',
      department: 'Computer Science',
      yearOfStudy: '4th Year',
      gpa: 8.9,
      location: 'Delhi, India',
      bio: 'Passionate full-stack developer with a focus on cloud-native applications.',
      linkedin: 'https://linkedin.com/in/arjunkumar',
    },
    {
      email: 'sneha.patel@student.edu',
      fullName: 'Sneha Patel',
      studentId: 'CS2021002',
      department: 'Computer Science',
      yearOfStudy: '4th Year',
      gpa: 9.2,
      location: 'Mumbai, India',
      bio: 'Machine learning enthusiast and competitive programmer.',
      linkedin: 'https://linkedin.com/in/snehapatel',
    },
    {
      email: 'rahul.verma@student.edu',
      fullName: 'Rahul Verma',
      studentId: 'EC2021003',
      department: 'Electronics & Communication',
      yearOfStudy: '3rd Year',
      gpa: 7.8,
      location: 'Bangalore, India',
      bio: 'Embedded systems and IoT developer.',
    },
    {
      email: 'meera.nair@student.edu',
      fullName: 'Meera Nair',
      studentId: 'ME2021004',
      department: 'Mechanical Engineering',
      yearOfStudy: '4th Year',
      gpa: 8.1,
      location: 'Chennai, India',
      bio: 'Automation and robotics engineer.',
    },
    {
      email: 'vikram.singh@student.edu',
      fullName: 'Vikram Singh',
      studentId: 'CS2022005',
      department: 'Computer Science',
      yearOfStudy: '3rd Year',
      gpa: 8.5,
      location: 'Pune, India',
      bio: 'Backend developer specializing in distributed systems.',
    },
  ];

  const studentPassword = await bcrypt.hash('Student@1234', 12);
  const studentRecords = {};

  for (const s of studentsData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      create: { email: s.email, passwordHash: studentPassword, role: 'student' },
      update: {},
    });

    const student = await prisma.student.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: s.fullName,
        studentId: s.studentId,
        department: s.department,
        yearOfStudy: s.yearOfStudy,
        gpa: s.gpa,
        location: s.location || null,
        bio: s.bio || null,
        linkedin: s.linkedin || null,
        expectedGrad: '2025-05',
      },
      update: {},
    });

    studentRecords[s.studentId] = student;
  }

  // ─── Skills ──────────────────────────────────────────────────────
  console.log('  Creating skills...');
  const skillsData = [
    { name: 'JavaScript', category: 'technical' },
    { name: 'Python', category: 'technical' },
    { name: 'React', category: 'technical' },
    { name: 'Node.js', category: 'technical' },
    { name: 'SQL', category: 'technical' },
    { name: 'Machine Learning', category: 'technical' },
    { name: 'Docker', category: 'technical' },
    { name: 'AWS', category: 'technical' },
    { name: 'Git', category: 'technical' },
    { name: 'Java', category: 'technical' },
    { name: 'C++', category: 'technical' },
    { name: 'Communication', category: 'soft_skill' },
    { name: 'Teamwork', category: 'soft_skill' },
    { name: 'Problem Solving', category: 'soft_skill' },
  ];
  const skillRecords = {};
  for (const sk of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { name: sk.name },
      create: sk,
      update: {},
    });
    skillRecords[sk.name] = skill;
  }

  // ─── Student Skills ──────────────────────────────────────────────
  const studentSkillsMap = {
    CS2021001: [
      { name: 'JavaScript', proficiency: 90, level: 'Expert' },
      { name: 'React', proficiency: 85, level: 'Advanced' },
      { name: 'Node.js', proficiency: 80, level: 'Advanced' },
      { name: 'SQL', proficiency: 70, level: 'Intermediate' },
      { name: 'Docker', proficiency: 65, level: 'Intermediate' },
      { name: 'Git', proficiency: 95, level: 'Expert' },
    ],
    CS2021002: [
      { name: 'Python', proficiency: 95, level: 'Expert' },
      { name: 'Machine Learning', proficiency: 88, level: 'Advanced' },
      { name: 'SQL', proficiency: 80, level: 'Advanced' },
      { name: 'Git', proficiency: 85, level: 'Advanced' },
      { name: 'AWS', proficiency: 60, level: 'Intermediate' },
    ],
    EC2021003: [
      { name: 'C++', proficiency: 78, level: 'Advanced' },
      { name: 'Python', proficiency: 65, level: 'Intermediate' },
      { name: 'Git', proficiency: 70, level: 'Intermediate' },
    ],
    ME2021004: [
      { name: 'Python', proficiency: 55, level: 'Intermediate' },
      { name: 'C++', proficiency: 60, level: 'Intermediate' },
    ],
    CS2022005: [
      { name: 'Java', proficiency: 82, level: 'Advanced' },
      { name: 'Node.js', proficiency: 75, level: 'Advanced' },
      { name: 'SQL', proficiency: 78, level: 'Advanced' },
      { name: 'Docker', proficiency: 70, level: 'Intermediate' },
      { name: 'AWS', proficiency: 68, level: 'Intermediate' },
    ],
  };

  for (const [sid, skills] of Object.entries(studentSkillsMap)) {
    const student = studentRecords[sid];
    for (const sk of skills) {
      const skill = skillRecords[sk.name];
      if (!skill) continue;
      await prisma.studentSkill.upsert({
        where: { studentId_skillId: { studentId: student.id, skillId: skill.id } },
        create: { studentId: student.id, skillId: skill.id, proficiency: sk.proficiency, level: sk.level },
        update: { proficiency: sk.proficiency, level: sk.level },
      });
    }
  }

  // ─── Projects ────────────────────────────────────────────────────
  console.log('  Creating projects...');
  const arjun = studentRecords['CS2021001'];
  const existingProject = await prisma.project.findFirst({ where: { studentId: arjun.id, title: 'Campus Placement Portal' } });
  if (!existingProject) {
    await prisma.project.create({
      data: {
        studentId: arjun.id,
        title: 'Campus Placement Portal',
        description: 'A full-stack web application for managing college placements with real-time notifications.',
        tags: ['React', 'Node.js', 'PostgreSQL'],
        url: 'https://github.com/arjun/placement-portal',
      },
    });
    await prisma.project.create({
      data: {
        studentId: arjun.id,
        title: 'E-Commerce Microservices',
        description: 'Distributed e-commerce platform built with microservices architecture.',
        tags: ['Node.js', 'Docker', 'AWS'],
      },
    });
  }

  const sneha = studentRecords['CS2021002'];
  const existingSnehaProject = await prisma.project.findFirst({ where: { studentId: sneha.id, title: 'Sentiment Analysis Engine' } });
  if (!existingSnehaProject) {
    await prisma.project.create({
      data: {
        studentId: sneha.id,
        title: 'Sentiment Analysis Engine',
        description: 'NLP-based sentiment analysis for social media data using transformers.',
        tags: ['Python', 'Machine Learning', 'NLP'],
        url: 'https://github.com/sneha/sentiment-engine',
      },
    });
  }

  // ─── Internships ─────────────────────────────────────────────────
  console.log('  Creating internships...');
  const existingInternship = await prisma.internship.findFirst({ where: { studentId: arjun.id } });
  if (!existingInternship) {
    await prisma.internship.create({
      data: {
        studentId: arjun.id,
        company: 'Google',
        role: 'Software Engineering Intern',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-07-31'),
        description: 'Worked on improving the search indexing pipeline using distributed systems.',
      },
    });
  }

  const existingSnehaInternship = await prisma.internship.findFirst({ where: { studentId: sneha.id } });
  if (!existingSnehaInternship) {
    await prisma.internship.create({
      data: {
        studentId: sneha.id,
        company: 'Microsoft Research',
        role: 'ML Research Intern',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        description: 'Developed a novel approach to few-shot learning for NLP tasks.',
      },
    });
  }

  // ─── Certifications ──────────────────────────────────────────────
  console.log('  Creating certifications...');
  const existingCert = await prisma.certification.findFirst({ where: { studentId: arjun.id } });
  if (!existingCert) {
    await prisma.certification.create({
      data: {
        studentId: arjun.id,
        name: 'AWS Certified Developer – Associate',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2024-01-15'),
        expiryDate: new Date('2027-01-15'),
        credentialUrl: 'https://aws.amazon.com/certification',
      },
    });
  }

  const existingSnehaCert = await prisma.certification.findFirst({ where: { studentId: sneha.id } });
  if (!existingSnehaCert) {
    await prisma.certification.create({
      data: {
        studentId: sneha.id,
        name: 'Google Professional Machine Learning Engineer',
        issuer: 'Google Cloud',
        issueDate: new Date('2024-03-10'),
        credentialUrl: 'https://cloud.google.com/certification',
      },
    });
  }

  // ─── Assessments ─────────────────────────────────────────────────
  console.log('  Creating assessments...');
  const existingAssessment = await prisma.assessment.findFirst({ where: { studentId: arjun.id } });
  if (!existingAssessment) {
    const assessment1 = await prisma.assessment.create({
      data: {
        studentId: arjun.id,
        title: 'Data Structures & Algorithms',
        subtitle: 'Advanced Level',
        category: 'technical',
        totalScore: 847,
        maxScore: 1000,
        percentile: 91,
        timeTaken: 45,
        maxTime: 60,
        status: 'Completed',
        completedAt: new Date('2024-10-15'),
      },
    });
    await prisma.assessmentScore.createMany({
      data: [
        { assessmentId: assessment1.id, category: 'Arrays & Strings', score: 92, maxScore: 100 },
        { assessmentId: assessment1.id, category: 'Trees & Graphs', score: 78, maxScore: 100 },
        { assessmentId: assessment1.id, category: 'Dynamic Programming', score: 85, maxScore: 100 },
        { assessmentId: assessment1.id, category: 'System Design', score: 88, maxScore: 100 },
        { assessmentId: assessment1.id, category: 'Problem Solving', score: 90, maxScore: 100 },
      ],
    });

    const assessment2 = await prisma.assessment.create({
      data: {
        studentId: arjun.id,
        title: 'Full Stack Web Development',
        subtitle: 'React + Node.js',
        category: 'technical',
        totalScore: 912,
        maxScore: 1000,
        percentile: 95,
        timeTaken: 50,
        maxTime: 60,
        status: 'Completed',
        completedAt: new Date('2024-11-20'),
      },
    });
    await prisma.assessmentScore.createMany({
      data: [
        { assessmentId: assessment2.id, category: 'React Fundamentals', score: 95, maxScore: 100 },
        { assessmentId: assessment2.id, category: 'Node.js & Express', score: 90, maxScore: 100 },
        { assessmentId: assessment2.id, category: 'Database Design', score: 88, maxScore: 100 },
        { assessmentId: assessment2.id, category: 'API Development', score: 92, maxScore: 100 },
        { assessmentId: assessment2.id, category: 'Testing', score: 85, maxScore: 100 },
      ],
    });
  }

  const existingSnehaAssessment = await prisma.assessment.findFirst({ where: { studentId: sneha.id } });
  if (!existingSnehaAssessment) {
    const assessment3 = await prisma.assessment.create({
      data: {
        studentId: sneha.id,
        title: 'Machine Learning Fundamentals',
        subtitle: 'Supervised & Unsupervised',
        category: 'technical',
        totalScore: 956,
        maxScore: 1000,
        percentile: 98,
        timeTaken: 55,
        maxTime: 60,
        status: 'Completed',
        completedAt: new Date('2024-11-05'),
      },
    });
    await prisma.assessmentScore.createMany({
      data: [
        { assessmentId: assessment3.id, category: 'Supervised Learning', score: 96, maxScore: 100 },
        { assessmentId: assessment3.id, category: 'Neural Networks', score: 94, maxScore: 100 },
        { assessmentId: assessment3.id, category: 'Feature Engineering', score: 97, maxScore: 100 },
        { assessmentId: assessment3.id, category: 'Model Evaluation', score: 92, maxScore: 100 },
        { assessmentId: assessment3.id, category: 'NLP Basics', score: 95, maxScore: 100 },
      ],
    });
  }

  // ─── Jobs ────────────────────────────────────────────────────────
  console.log('  Creating jobs...');
  const existingJob = await prisma.job.findFirst({ where: { recruiterId: recruiter.id } });
  let job1;
  if (!existingJob) {
    job1 = await prisma.job.create({
      data: {
        recruiterId: recruiter.id,
        companyId: companies['Google'].id,
        title: 'Software Engineer – New Grad',
        department: 'Engineering',
        employmentType: 'full_time',
        location: 'Bangalore, India',
        description: 'Join our engineering team to build products used by billions. Strong DSA and problem-solving skills required.',
        minimumReadinessScore: 70,
        visibility: 'public',
        notifyEligible: true,
      },
    });

    await prisma.jobSkill.createMany({
      data: [
        { jobId: job1.id, skillId: skillRecords['JavaScript'].id },
        { jobId: job1.id, skillId: skillRecords['Python'].id },
        { jobId: job1.id, skillId: skillRecords['SQL'].id },
      ],
      skipDuplicates: true,
    });

    const job2 = await prisma.job.create({
      data: {
        recruiterId: recruiter.id,
        companyId: companies['Google'].id,
        title: 'ML Engineer – Research',
        department: 'AI Research',
        employmentType: 'full_time',
        location: 'Hyderabad, India',
        description: 'Work on cutting-edge ML research projects. Strong background in Python and ML required.',
        minimumReadinessScore: 75,
        visibility: 'public',
      },
    });

    await prisma.jobSkill.createMany({
      data: [
        { jobId: job2.id, skillId: skillRecords['Python'].id },
        { jobId: job2.id, skillId: skillRecords['Machine Learning'].id },
      ],
      skipDuplicates: true,
    });
  }

  // ─── Applications ────────────────────────────────────────────────
  if (job1) {
    console.log('  Creating applications...');
    const existingApp = await prisma.application.findFirst({ where: { studentId: arjun.id, jobId: job1.id } });
    if (!existingApp) {
      await prisma.application.create({
        data: { studentId: arjun.id, jobId: job1.id, status: 'shortlisted' },
      });
      await prisma.application.create({
        data: { studentId: sneha.id, jobId: job1.id, status: 'interviewing' },
      });
    }
  }

  // ─── Placement Drives ────────────────────────────────────────────
  console.log('  Creating placement drives...');
  const futureDrive = new Date();
  futureDrive.setMonth(futureDrive.getMonth() + 1);

  const existingDrive = await prisma.placementDrive.findFirst({ where: { companyId: companies['Amazon'].id } });
  if (!existingDrive) {
    await prisma.placementDrive.create({
      data: {
        companyId: companies['Amazon'].id,
        role: 'SDE-1',
        description: 'On-campus recruitment drive for Amazon Software Development Engineer role.',
        driveDate: futureDrive,
        driveTime: '10:00 AM',
        status: 'upcoming',
        packageLpa: 24,
      },
    });

    const pastDrive = new Date();
    pastDrive.setMonth(pastDrive.getMonth() - 2);
    await prisma.placementDrive.create({
      data: {
        companyId: companies['Infosys'].id,
        role: 'Systems Engineer',
        description: 'Infosys campus hiring for Systems Engineer position.',
        driveDate: pastDrive,
        driveTime: '9:00 AM',
        status: 'completed',
        packageLpa: 6.5,
      },
    });
  }

  // ─── Placements ──────────────────────────────────────────────────
  console.log('  Creating placement records...');
  const vikram = studentRecords['CS2022005'];
  const existingPlacement = await prisma.placement.findFirst({ where: { studentId: vikram.id } });
  if (!existingPlacement) {
    await prisma.placement.create({
      data: {
        studentId: vikram.id,
        companyId: companies['Microsoft'].id,
        role: 'Software Engineer',
        packageLpa: 18,
        status: 'Placed',
      },
    });

    await prisma.student.update({
      where: { id: vikram.id },
      data: { status: 'placed' },
    });
  }

  // ─── Recalculate all scores ───────────────────────────────────────
  console.log('  Recalculating readiness scores...');
  const { recalculateScore } = require('../src/services/scoring.service');
  const { recalculateGlobalRankings } = require('../src/services/ranking.service');

  for (const student of Object.values(studentRecords)) {
    await recalculateScore(student.id).catch((e) => console.warn(`  Score calc failed for ${student.id}:`, e.message));
  }
  await recalculateGlobalRankings().catch((e) => console.warn('  Global ranking failed:', e.message));

  console.log('\nSeed complete!');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Admin:     admin@evolved.edu     / Admin@1234');
  console.log('  Student:   arjun.kumar@student.edu / Student@1234');
  console.log('  Recruiter: recruiter@google.com   / Recruiter@1234');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
