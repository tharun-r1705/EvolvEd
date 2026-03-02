'use strict';

const { z } = require('zod');

const createJobSchema = z
  .object({
    title: z
      .string({ required_error: 'Job title is required.' })
      .trim()
      .min(3, 'Job title must be at least 3 characters.')
      .max(200),

    department: z
      .string({ required_error: 'Department is required.' })
      .trim()
      .min(1),

    employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship'], {
      required_error: 'Employment type is required.',
      invalid_type_error: 'Invalid employment type.',
    }),

    location: z
      .string({ required_error: 'Location is required.' })
      .trim()
      .min(1)
      .max(200),

    description: z
      .string({ required_error: 'Job description is required.' })
      .trim()
      .min(20, 'Description must be at least 20 characters.')
      .max(10000),

    minimumReadinessScore: z
      .number()
      .int()
      .min(0)
      .max(100)
      .optional()
      .default(0),

    requiredSkills: z
      .array(z.string().trim().min(1).max(100))
      .max(20, 'Maximum 20 required skills.')
      .optional()
      .default([]),

    notifyEligible: z.boolean().optional().default(false),

    visibility: z.enum(['public', 'private', 'draft']).optional().default('public'),

    salaryMin: z.number().positive('Minimum salary must be positive.').optional().nullable(),
    salaryMax: z.number().positive('Maximum salary must be positive.').optional().nullable(),

    workMode: z.enum(['on_site', 'remote', 'hybrid']).optional().nullable(),

    deadline: z
      .string()
      .datetime({ message: 'Deadline must be a valid ISO date-time string.' })
      .optional()
      .nullable(),

    responsibilities: z.string().trim().max(5000).optional().nullable(),
    qualifications:   z.string().trim().max(5000).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // salaryMax must be >= salaryMin when both are provided
    if (data.salaryMin != null && data.salaryMax != null && data.salaryMax < data.salaryMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Maximum salary must be greater than or equal to minimum salary.',
        path: ['salaryMax'],
      });
    }
    // deadline must be in the future
    if (data.deadline) {
      const deadline = new Date(data.deadline);
      if (deadline <= new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Deadline must be a future date.',
          path: ['deadline'],
        });
      }
    }
  });

// For updates we make everything partial; deadline can be past (recruiter extending a closed job)
const updateJobSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    department: z.string().trim().min(1).optional(),
    employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
    location: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(20).max(10000).optional(),
    minimumReadinessScore: z.number().int().min(0).max(100).optional(),
    requiredSkills: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
    notifyEligible: z.boolean().optional(),
    visibility: z.enum(['public', 'private', 'draft']).optional(),
    salaryMin: z.number().positive().optional().nullable(),
    salaryMax: z.number().positive().optional().nullable(),
    workMode: z.enum(['on_site', 'remote', 'hybrid']).optional().nullable(),
    deadline: z.string().datetime().optional().nullable(),
    responsibilities: z.string().trim().max(5000).optional().nullable(),
    qualifications: z.string().trim().max(5000).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.salaryMin != null && data.salaryMax != null && data.salaryMax < data.salaryMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Maximum salary must be greater than or equal to minimum salary.',
        path: ['salaryMax'],
      });
    }
  });

const candidateSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  minScore: z.coerce.number().int().min(0).max(100).optional(),
  maxScore: z.coerce.number().int().min(0).max(100).optional(),
  skills: z.string().trim().optional(), // comma-separated skill names
  department: z.string().trim().optional(),
  yearOfStudy: z.string().trim().optional(),
  readyForHire: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(['score', 'name', 'rank']).optional().default('score'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const shortlistSchema = z.object({
  jobId: z.string().uuid('Invalid job ID.').optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

const updateRecruiterProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100).optional(),
  designation: z.string().trim().max(100).optional().nullable(),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s\-()\\.]{7,20}$/, 'Invalid phone number format.')
    .optional()
    .nullable(),
  bio: z.string().trim().max(500, 'Bio must be 500 characters or less.').optional().nullable(),
  linkedin: z.string().trim().url('Invalid LinkedIn URL.').optional().nullable(),
  company: z
    .object({
      name: z.string().trim().min(1).max(200).optional(),
      industry: z.string().trim().max(100).optional().nullable(),
      website: z.string().trim().url('Invalid website URL.').optional().nullable(),
      location: z.string().trim().max(200).optional().nullable(),
      size: z.string().trim().max(50).optional().nullable(),
      description: z.string().trim().max(1000).optional().nullable(),
      careersUrl: z.string().trim().url('Invalid careers URL.').optional().nullable(),
    })
    .optional(),
});

const jobRankingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  minFitScore: z.coerce.number().min(0).max(100).optional(),
  sortBy: z.enum(['fitScore', 'readinessScore', 'applicationDate']).optional().default('fitScore'),
});

module.exports = {
  createJobSchema,
  updateJobSchema,
  candidateSearchSchema,
  shortlistSchema,
  updateRecruiterProfileSchema,
  jobRankingsQuerySchema,
};
