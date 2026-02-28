'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('./AppError');

/**
 * Sign an access token (short-lived, 15 min).
 */
function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'evolved-api',
  });
}

/**
 * Sign a refresh token (long-lived, 7 days).
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'evolved-api',
  });
}

/**
 * Verify an access token. Throws AppError on failure.
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret, { issuer: 'evolved-api' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw AppError.unauthorized('Access token has expired. Please refresh your session.');
    }
    throw AppError.unauthorized('Invalid access token.');
  }
}

/**
 * Verify a refresh token. Throws AppError on failure.
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, { issuer: 'evolved-api' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw AppError.unauthorized('Refresh token has expired. Please log in again.');
    }
    throw AppError.unauthorized('Invalid refresh token.');
  }
}

/**
 * Generate both access and refresh tokens for a user.
 * @param {{ id: string, role: string }} user
 */
function generateTokenPair(user) {
  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
};
