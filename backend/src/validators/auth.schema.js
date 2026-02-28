'use strict';

const { z } = require('zod');

const registerSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required.' })
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(100, 'Full name must be at most 100 characters.'),

  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .email('Please provide a valid email address.')
    .toLowerCase(),

  studentId: z
    .string({ required_error: 'Student ID is required.' })
    .trim()
    .min(3, 'Student ID must be at least 3 characters.')
    .max(20, 'Student ID must be at most 20 characters.'),

  department: z
    .string({ required_error: 'Department is required.' })
    .trim()
    .min(2, 'Department is required.'),

  yearOfStudy: z
    .string({ required_error: 'Year of study is required.' })
    .trim()
    .min(1, 'Year of study is required.'),

  password: z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password must be at most 128 characters.'),

  role: z.enum(['student']).optional().default('student'),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .email('Please provide a valid email address.')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

const refreshSchema = z.object({
  refreshToken: z
    .string({ required_error: 'Refresh token is required.' })
    .min(1, 'Refresh token is required.'),
});

const recruiterRegisterSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required.' })
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(100),

  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .email('Please provide a valid email address.')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters.')
    .max(128),

  inviteToken: z
    .string({ required_error: 'Invite token is required.' })
    .min(1, 'Invite token is required.'),

  designation: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(20).optional(),
});

const oauthCallbackSchema = z.object({
  supabaseToken: z
    .string({ required_error: 'Supabase token is required.' })
    .min(1),
  role: z.enum(['student', 'recruiter']).optional().default('student'),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  recruiterRegisterSchema,
  oauthCallbackSchema,
};
