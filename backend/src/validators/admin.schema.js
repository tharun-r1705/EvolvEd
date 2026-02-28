'use strict';

const { z } = require('zod');

const adminStudentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().max(100).optional(),
  department: z.string().trim().optional(),
  yearOfStudy: z.string().trim().optional(),
  readiness: z.enum(['all', 'high', 'medium', 'low']).optional().default('all'),
  status: z.enum(['active', 'inactive', 'graduated', 'placed']).optional(),
  sortBy: z.enum(['name', 'score', 'gpa', 'createdAt']).optional().default('score'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const adminUpdateStudentSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  department: z.string().trim().min(2).max(100).optional(),
  yearOfStudy: z.string().trim().max(20).optional(),
  gpa: z.number().min(0).max(10).optional().nullable(),
  status: z.enum(['active', 'inactive', 'graduated', 'placed']).optional(),
  phone: z.string().trim().max(20).optional().nullable(),
});

const createPlacementDriveSchema = z.object({
  companyId: z
    .string({ required_error: 'Company ID is required.' })
    .uuid('Invalid company ID.'),

  role: z
    .string({ required_error: 'Role is required.' })
    .trim()
    .min(2)
    .max(200),

  description: z.string().trim().max(2000).optional().nullable(),

  driveDate: z
    .string({ required_error: 'Drive date is required.' })
    .datetime({ message: 'Drive date must be a valid ISO date string.' }),

  driveTime: z.string().trim().max(20).optional().nullable(),

  packageLpa: z.number().min(0).max(1000).optional().nullable(),
});

const updatePlacementDriveSchema = createPlacementDriveSchema.partial().extend({
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
});

const inviteRecruiterSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .email('Please provide a valid email.')
    .toLowerCase(),

  companyId: z
    .string({ required_error: 'Company ID is required.' })
    .uuid('Invalid company ID.'),
});

const createCompanySchema = z.object({
  name: z
    .string({ required_error: 'Company name is required.' })
    .trim()
    .min(2)
    .max(200),
  industry: z.string().trim().max(100).optional().nullable(),
  website: z.string().trim().url('Must be a valid URL.').optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
  logoUrl: z.string().trim().url('Must be a valid URL.').optional().nullable(),
});

module.exports = {
  adminStudentQuerySchema,
  adminUpdateStudentSchema,
  createPlacementDriveSchema,
  updatePlacementDriveSchema,
  inviteRecruiterSchema,
  createCompanySchema,
};
