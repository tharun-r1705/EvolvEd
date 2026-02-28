'use strict';

const { verifyAccessToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

/**
 * Middleware: verify Bearer token and attach decoded payload to req.user.
 * req.user = { userId, role }
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(AppError.unauthorized('No authentication token provided.'));
  }

  const token = authHeader.slice(7); // Remove "Bearer "

  try {
    const decoded = verifyAccessToken(token);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticate;
