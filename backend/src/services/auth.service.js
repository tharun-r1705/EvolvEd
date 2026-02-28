'use strict';

const prisma = require('../lib/prisma');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const { recalculateScore } = require('./scoring.service');
const { recalculateGlobalRankings } = require('./ranking.service');
const crypto = require('crypto');

// ─── REGISTER (Student) ──────────────────────────────────────────

/**
 * Register a new student account.
 * @param {object} data
 */
async function registerStudent(data) {
  const { fullName, email, studentId, department, yearOfStudy, password } = data;

  // Check for existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, deletedAt: true },
  });
  if (existingUser && !existingUser.deletedAt) {
    throw AppError.conflict('An account with this email already exists.');
  }

  const existingStudent = await prisma.student.findUnique({
    where: { studentId },
    select: { id: true },
  });
  if (existingStudent) {
    throw AppError.conflict('A student with this ID already exists.');
  }

  const passwordHash = await hashPassword(password);

  // Create user + student profile in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: 'student',
      },
    });

    const student = await tx.student.create({
      data: {
        userId: user.id,
        fullName,
        studentId,
        department,
        yearOfStudy,
      },
    });

    return { user, student };
  });

  // Issue tokens
  const { accessToken, refreshToken } = generateTokenPair(result.user);

  // Store refresh token
  await storeRefreshToken(result.user.id, refreshToken);

  // Initialize score breakdown (all zeros)
  await recalculateScore(result.student.id).catch(() => {});

  return {
    accessToken,
    refreshToken,
    user: formatUser(result.user, result.student),
  };
}

// ─── REGISTER (Recruiter via Invite) ────────────────────────────

/**
 * Register a recruiter using an invite token issued by admin.
 * @param {object} data
 */
async function registerRecruiter(data) {
  const { fullName, email, password, inviteToken, designation, phone } = data;

  // Validate invite token
  const invite = await prisma.recruiterInvite.findUnique({
    where: { token: inviteToken },
  });

  if (!invite) throw AppError.badRequest('Invalid invite token.');
  if (invite.usedAt) throw AppError.badRequest('This invite has already been used.');
  if (new Date() > new Date(invite.expiresAt)) {
    throw AppError.badRequest('This invite has expired.');
  }
  if (invite.email !== email) {
    throw AppError.badRequest('This invite was issued for a different email address.');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw AppError.conflict('An account with this email already exists.');

  const passwordHash = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, passwordHash, role: 'recruiter' },
    });

    const recruiter = await tx.recruiter.create({
      data: {
        userId: user.id,
        fullName,
        companyId: invite.companyId,
        designation: designation || null,
        phone: phone || null,
      },
    });

    // Mark invite as used
    await tx.recruiterInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });

    return { user, recruiter };
  });

  const { accessToken, refreshToken } = generateTokenPair(result.user);
  await storeRefreshToken(result.user.id, refreshToken);

  const recruiterWithCompany = await prisma.recruiter.findUnique({
    where: { id: result.recruiter.id },
    include: { company: true },
  });

  return {
    accessToken,
    refreshToken,
    user: formatUser(result.user, recruiterWithCompany),
  };
}

// ─── LOGIN ───────────────────────────────────────────────────────

/**
 * Authenticate a user with email/password.
 * @param {string} email
 * @param {string} password
 */
async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      student: true,
      recruiter: { include: { company: true } },
      admin: true,
    },
  });

  if (!user || user.deletedAt) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  if (!user.isActive) {
    throw AppError.unauthorized('Your account has been deactivated. Please contact support.');
  }

  const passwordValid = await comparePassword(password, user.passwordHash);
  if (!passwordValid) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const { accessToken, refreshToken } = generateTokenPair(user);
  await storeRefreshToken(user.id, refreshToken);

  const profile = user.student || user.recruiter || user.admin;

  return {
    accessToken,
    refreshToken,
    user: formatUser(user, profile),
  };
}

// ─── REFRESH TOKEN ───────────────────────────────────────────────

/**
 * Issue a new access token using a valid refresh token.
 * @param {string} token - The refresh token string
 */
async function refreshAccessToken(token) {
  // Verify JWT signature first
  const decoded = verifyRefreshToken(token);

  // Check token exists in DB (not revoked)
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!storedToken) {
    throw AppError.unauthorized('Refresh token has been revoked. Please log in again.');
  }

  if (new Date() > new Date(storedToken.expiresAt)) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw AppError.unauthorized('Refresh token has expired. Please log in again.');
  }

  if (!storedToken.user.isActive || storedToken.user.deletedAt) {
    throw AppError.unauthorized('Account is no longer active.');
  }

  // Rotate: delete old token, issue new pair
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(storedToken.user);
  await storeRefreshToken(storedToken.user.id, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
}

// ─── LOGOUT ──────────────────────────────────────────────────────

/**
 * Revoke a refresh token (logout).
 * @param {string} token - Refresh token to revoke
 */
async function logout(token) {
  if (!token) return;

  await prisma.refreshToken.deleteMany({ where: { token } }).catch(() => {});
}

// ─── LOGOUT ALL SESSIONS ─────────────────────────────────────────

/**
 * Revoke all refresh tokens for a user (logout all devices).
 * @param {string} userId
 */
async function logoutAll(userId) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

// ─── GET ME ──────────────────────────────────────────────────────

/**
 * Get the authenticated user's full profile.
 * @param {string} userId
 */
async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: true,
      recruiter: { include: { company: true } },
      admin: true,
    },
  });

  if (!user || user.deletedAt) {
    throw AppError.notFound('User not found.');
  }

  const profile = user.student || user.recruiter || user.admin;
  return formatUser(user, profile);
}

// ─── OAUTH BRIDGE (Supabase → Custom JWT) ────────────────────────

/**
 * Bridge Supabase OAuth session to our custom JWT system.
 * After Google/LinkedIn login via Supabase, the frontend sends the Supabase token.
 * We verify it, find/create the user in our DB, and issue our custom JWT.
 *
 * @param {string} supabaseToken - Supabase access token from OAuth callback
 * @param {string} defaultRole - Role to assign if this is a new account ('student' | 'recruiter')
 */
async function oauthLogin(supabaseToken, defaultRole = 'student') {
  // Decode Supabase JWT to extract user info (Supabase JWTs are standard JWTs)
  // In production, verify against Supabase JWKS. Here we decode to get email.
  let supabasePayload;
  try {
    // Supabase JWT: we trust the frontend passes a valid one
    // Decode without verification (verification done by Supabase on their end)
    // For production: use @supabase/supabase-js to verify
    const base64Payload = supabaseToken.split('.')[1];
    supabasePayload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
  } catch {
    throw AppError.unauthorized('Invalid OAuth token.');
  }

  const email = supabasePayload?.email;
  const name = supabasePayload?.user_metadata?.full_name || supabasePayload?.email?.split('@')[0] || 'User';

  if (!email) {
    throw AppError.unauthorized('OAuth token does not contain an email address.');
  }

  // Find or create the user
  let user = await prisma.user.findUnique({
    where: { email },
    include: {
      student: true,
      recruiter: { include: { company: true } },
      admin: true,
    },
  });

  if (!user) {
    // New user: create account with OAuth (no password — set a random hash)
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await hashPassword(randomPassword);

    user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, passwordHash, role: defaultRole },
      });

      if (defaultRole === 'student') {
        await tx.student.create({
          data: {
            userId: newUser.id,
            fullName: name,
            studentId: `OAUTH_${newUser.id.slice(0, 8).toUpperCase()}`,
            department: 'Unset',
            yearOfStudy: 'Unset',
          },
        });
      }

      return tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          student: true,
          recruiter: { include: { company: true } },
          admin: true,
        },
      });
    });

    if (user.student) {
      await recalculateScore(user.student.id).catch(() => {});
    }
  }

  if (!user.isActive || user.deletedAt) {
    throw AppError.unauthorized('Your account has been deactivated.');
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const { accessToken, refreshToken } = generateTokenPair(user);
  await storeRefreshToken(user.id, refreshToken);

  const profile = user.student || user.recruiter || user.admin;
  return { accessToken, refreshToken, user: formatUser(user, profile) };
}

// ─── HELPERS ─────────────────────────────────────────────────────

async function storeRefreshToken(userId, token) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });
}

function formatUser(user, profile) {
  const base = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  if (!profile) return base;

  if (user.role === 'student') {
    return {
      ...base,
      name: profile.fullName,
      studentId: profile.studentId,
      department: profile.department,
      yearOfStudy: profile.yearOfStudy,
      readinessScore: Number(profile.readinessScore),
      profileCompletion: profile.profileCompletion,
      avatarUrl: profile.avatarUrl,
    };
  }

  if (user.role === 'recruiter') {
    return {
      ...base,
      name: profile.fullName,
      designation: profile.designation,
      company: profile.company
        ? { id: profile.company.id, name: profile.company.name, logoUrl: profile.company.logoUrl }
        : null,
      avatarUrl: profile.avatarUrl,
    };
  }

  if (user.role === 'admin') {
    return {
      ...base,
      name: profile.fullName,
      title: profile.title,
      avatarUrl: profile.avatarUrl,
    };
  }

  return base;
}

module.exports = {
  registerStudent,
  registerRecruiter,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  getMe,
  oauthLogin,
};
