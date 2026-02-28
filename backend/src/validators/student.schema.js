'use strict';

const { z } = require('zod');

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(20).optional().nullable(),
  linkedin: z.string().trim().url('Must be a valid URL.').optional().nullable(),
  website: z.string().trim().url('Must be a valid URL.').optional().nullable(),
  location: z.string().trim().max(100).optional().nullable(),
  expectedGrad: z.string().trim().max(20).optional().nullable(),
  bio: z.string().trim().max(1000).optional().nullable(),
  gpa: z.number().min(0).max(10).optional().nullable(),
  department: z.string().trim().min(2).max(100).optional(),
  yearOfStudy: z.string().trim().max(20).optional(),
});

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

const addProjectSchema = z.object({
  title: z
    .string({ required_error: 'Project title is required.' })
    .trim()
    .min(2)
    .max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  tags: z.array(z.string().trim().max(50)).max(10).optional().default([]),
  url: z.string().trim().url('Must be a valid URL.').optional().nullable(),
  imageUrl: z.string().trim().url('Must be a valid URL.').optional().nullable(),
});

const addInternshipSchema = z.object({
  company: z
    .string({ required_error: 'Company name is required.' })
    .trim()
    .min(1)
    .max(200),
  role: z
    .string({ required_error: 'Role is required.' })
    .trim()
    .min(1)
    .max(200),
  startDate: z
    .string({ required_error: 'Start date is required.' })
    .datetime({ message: 'Start date must be a valid ISO date string.' }),
  endDate: z.string().datetime().optional().nullable(),
  description: z.string().trim().max(1000).optional().nullable(),
});

const addCertificationSchema = z.object({
  name: z
    .string({ required_error: 'Certification name is required.' })
    .trim()
    .min(1)
    .max(200),
  issuer: z
    .string({ required_error: 'Issuer is required.' })
    .trim()
    .min(1)
    .max(200),
  issueDate: z
    .string({ required_error: 'Issue date is required.' })
    .datetime({ message: 'Issue date must be a valid ISO date string.' }),
  expiryDate: z.string().datetime().optional().nullable(),
  credentialUrl: z.string().trim().url('Must be a valid URL.').optional().nullable(),
});

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
  addInternshipSchema,
  addCertificationSchema,
  assessmentQuerySchema,
};
