'use strict';

const authService = require('../services/auth.service');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const result = await authService.registerStudent(req.body);
    res.status(201).json({
      token: result.accessToken,
      refreshToken: result.refreshToken,
      role: result.user.role,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/register/recruiter
async function registerRecruiter(req, res, next) {
  try {
    const result = await authService.registerRecruiter(req.body);
    res.status(201).json({
      token: result.accessToken,
      refreshToken: result.refreshToken,
      role: result.user.role,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({
      token: result.accessToken,
      refreshToken: result.refreshToken,
      role: result.user.role,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/refresh
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.json({
      token: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout-all
async function logoutAll(req, res, next) {
  try {
    await authService.logoutAll(req.user.userId);
    res.json({ message: 'Logged out from all devices.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/oauth/callback
async function oauthCallback(req, res, next) {
  try {
    const { supabaseToken, role } = req.body;
    const result = await authService.oauthLogin(supabaseToken, role);
    res.json({
      token: result.accessToken,
      refreshToken: result.refreshToken,
      role: result.user.role,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  registerRecruiter,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  oauthCallback,
};
