'use strict';

const { z } = require('zod');

const createJobSchema = z.object({
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
});

const updateJobSchema = createJobSchema.partial();

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

module.exports = {
  createJobSchema,
  updateJobSchema,
  candidateSearchSchema,
  shortlistSchema,
};
