'use strict';

const { z } = require('zod');

// ─── PROFILE UPDATE ───────────────────────────────────────────────

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Machine Learning',
  'Data Science',
  'Biotechnology',
  'Chemical Engineering',
  'Other',
];

const YEARS_OF_STUDY = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG - 1st Year', 'PG - 2nd Year'];

const updateProfileSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required.' })
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(100, 'Full name cannot exceed 100 characters.')
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(
      /^(\+91[\s-]?)?[6-9]\d{9}$|^\+?[1-9]\d{6,14}$/,
      'Enter a valid Indian mobile number or international number.'
    )
    .optional()
    .nullable(),
  linkedin: z
    .string()
    .trim()
    .url('Must be a valid URL.')
    .regex(/linkedin\.com/i, 'Must be a LinkedIn URL (linkedin.com).')
    .optional()
    .nullable(),
  website: z
    .string()
    .trim()
    .url('Must be a valid URL (include https://).')
    .optional()
    .nullable(),
  location: z
    .string()
    .trim()
    .max(100, 'Location cannot exceed 100 characters.')
    .optional()
    .nullable(),
  expectedGrad: z
    .string()
    .trim()
    .regex(
      /^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}$/,
      'Use format: Month Year (e.g., May 2026).'
    )
    .optional()
    .nullable(),
  bio: z
    .string()
    .trim()
    .min(20, 'Bio should be at least 20 characters.')
    .max(1000, 'Bio cannot exceed 1000 characters.')
    .optional()
    .nullable(),
  gpa: z
    .number()
    .min(0, 'GPA cannot be negative.')
    .max(10, 'GPA cannot exceed 10.')
    .optional()
    .nullable(),
  department: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),
  yearOfStudy: z
    .string()
    .trim()
    .max(20)
    .optional(),
  githubUsername: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/,
      'GitHub username can only contain letters, numbers, and hyphens.'
    )
    .max(39, 'GitHub username cannot exceed 39 characters.')
    .optional()
    .nullable(),
  leetcodeUsername: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'LeetCode username can only contain letters, numbers, underscores, and hyphens.'
    )
    .max(50, 'LeetCode username cannot exceed 50 characters.')
    .optional()
    .nullable(),
  showOnLeaderboard: z.boolean().optional(),
});

// ─── SKILLS ───────────────────────────────────────────────────────

const addSkillSchema = z.object({
  skillName: z
    .string({ required_error: 'Skill name is required.' })
    .trim()
    .min(1, 'Skill name cannot be empty.')
    .max(100, 'Skill name too long.'),
  proficiency: z
    .number({ required_error: 'Proficiency is required.' })
    .int()
    .min(0, 'Proficiency must be between 0 and 100.')
    .max(100, 'Proficiency must be between 0 and 100.'),
  level: z
    .enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    .optional()
    .default('Beginner'),
});

const updateSkillSchema = z.object({
  proficiency: z.number().int().min(0).max(100).optional(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
});

// ─── PROJECTS ─────────────────────────────────────────────────────

const PROJECT_STATUSES = ['in_progress', 'completed'];

const addProjectSchema = z.object({
  title: z
    .string({ required_error: 'Project title is required.' })
    .trim()
    .min(2, 'Project title must be at least 2 characters.')
    .max(200, 'Project title cannot exceed 200 characters.'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters.')
    .optional()
    .nullable(),
  tags: z.array(z.string().trim().max(50)).max(10).optional().default([]),
  techStack: z.array(z.string().trim().max(50)).max(20).optional().default([]),
  url: z.string().trim().url('Must be a valid URL.').optional().nullable(),
  githubUrl: z
    .string()
    .trim()
    .url('Must be a valid URL.')
    .regex(/github\.com/i, 'Must be a GitHub URL.')
    .optional()
    .nullable(),
  imageUrl: z.string().trim().url('Must be a valid URL.').optional().nullable(),
  status: z.enum(PROJECT_STATUSES).optional().default('in_progress'),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

const updateProjectSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  tags: z.array(z.string().trim().max(50)).max(10).optional(),
  techStack: z.array(z.string().trim().max(50)).max(20).optional(),
  url: z.string().trim().url().optional().nullable(),
  githubUrl: z.string().trim().url().regex(/github\.com/i).optional().nullable(),
  status: z.enum(PROJECT_STATUSES).optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

// ─── INTERNSHIPS ──────────────────────────────────────────────────

const addInternshipSchema = z.object({
  company: z
    .string({ required_error: 'Company name is required.' })
    .trim()
    .min(1, 'Company name cannot be empty.')
    .max(200, 'Company name too long.'),
  role: z
    .string({ required_error: 'Role is required.' })
    .trim()
    .min(1, 'Role cannot be empty.')
    .max(200, 'Role too long.'),
  startDate: z
    .string({ required_error: 'Start date is required.' })
    .datetime({ message: 'Start date must be a valid ISO date string.' }),
  endDate: z.string().datetime().optional().nullable(),
  description: z
    .string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters.')
    .optional()
    .nullable(),
});

// ─── CERTIFICATIONS ───────────────────────────────────────────────

const addCertificationSchema = z.object({
  name: z
    .string({ required_error: 'Certification name is required.' })
    .trim()
    .min(1, 'Certification name cannot be empty.')
    .max(200, 'Certification name too long.'),
  issuer: z
    .string({ required_error: 'Issuer is required.' })
    .trim()
    .min(1, 'Issuer cannot be empty.')
    .max(200, 'Issuer too long.'),
  issueDate: z
    .string({ required_error: 'Issue date is required.' })
    .datetime({ message: 'Issue date must be a valid ISO date string.' }),
  expiryDate: z.string().datetime().optional().nullable(),
  credentialUrl: z.string().trim().url('Must be a valid URL.').optional().nullable(),
  credentialId: z.string().trim().max(200).optional().nullable(),
});

const updateCertificationSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  issuer: z.string().trim().min(1).max(200).optional(),
  issueDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional().nullable(),
  credentialUrl: z.string().trim().url().optional().nullable(),
  credentialId: z.string().trim().max(200).optional().nullable(),
});

// ─── EVENTS ───────────────────────────────────────────────────────

const EVENT_TYPES = ['hackathon', 'workshop', 'conference', 'competition', 'seminar', 'other'];
const EVENT_ACHIEVEMENTS = ['winner', 'runner_up', 'participant', 'speaker', 'organizer', 'finalist'];

const addEventSchema = z.object({
  title: z
    .string({ required_error: 'Event title is required.' })
    .trim()
    .min(2, 'Title must be at least 2 characters.')
    .max(200, 'Title cannot exceed 200 characters.'),
  organizer: z
    .string({ required_error: 'Organizer is required.' })
    .trim()
    .min(1, 'Organizer cannot be empty.')
    .max(200, 'Organizer too long.'),
  type: z
    .enum(EVENT_TYPES, { errorMap: () => ({ message: `Type must be one of: ${EVENT_TYPES.join(', ')}` }) })
    .default('other'),
  date: z
    .string({ required_error: 'Event date is required.' })
    .datetime({ message: 'Date must be a valid ISO date string.' }),
  description: z
    .string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters.')
    .optional()
    .nullable(),
  achievement: z
    .enum(EVENT_ACHIEVEMENTS, { errorMap: () => ({ message: `Achievement must be one of: ${EVENT_ACHIEVEMENTS.join(', ')}` }) })
    .default('participant'),
  certificateUrl: z.string().trim().url('Must be a valid URL.').optional().nullable(),
});

const updateEventSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  organizer: z.string().trim().min(1).max(200).optional(),
  type: z.enum(EVENT_TYPES).optional(),
  date: z.string().datetime().optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  achievement: z.enum(EVENT_ACHIEVEMENTS).optional(),
  certificateUrl: z.string().trim().url().optional().nullable(),
});

// ─── RESUME ───────────────────────────────────────────────────────

const RESUME_CATEGORIES = [
  'general',
  'ai_ml',
  'full_stack',
  'frontend',
  'backend',
  'data_science',
  'devops',
  'mobile',
  'embedded',
  'custom',
];

const addResumeSchema = z.object({
  name: z
    .string({ required_error: 'Resume name is required.' })
    .trim()
    .min(2, 'Resume name must be at least 2 characters.')
    .max(100, 'Resume name cannot exceed 100 characters.'),
  category: z
    .enum(RESUME_CATEGORIES, {
      errorMap: () => ({ message: `Category must be one of: ${RESUME_CATEGORIES.join(', ')}` }),
    })
    .default('general'),
  isDefault: z.boolean().optional().default(false),
});

const updateResumeSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  category: z.enum(RESUME_CATEGORIES).optional(),
  isDefault: z.boolean().optional(),
});

// ─── QUERY SCHEMAS ────────────────────────────────────────────────

const assessmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
  category: z.string().trim().optional(),
});

module.exports = {
  updateProfileSchema,
  addSkillSchema,
  updateSkillSchema,
  addProjectSchema,
  updateProjectSchema,
  addInternshipSchema,
  addCertificationSchema,
  updateCertificationSchema,
  addEventSchema,
  updateEventSchema,
  assessmentQuerySchema,
  addResumeSchema,
  updateResumeSchema,
  DEPARTMENTS,
  YEARS_OF_STUDY,
  RESUME_CATEGORIES,
  PROJECT_STATUSES,
  EVENT_TYPES,
  EVENT_ACHIEVEMENTS,
};
