'use strict';

const AppError = require('../utils/AppError');

/**
 * Middleware factory: restrict access to specific roles.
 * Must be used AFTER authenticate middleware.
 *
 * Usage: router.get('/route', authenticate, authorize('admin', 'recruiter'), handler)
 *
 * @param {...string} roles - Allowed roles
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Role '${req.user.role}' is not permitted to access this resource.`
        )
      );
    }

    next();
  };
}

module.exports = authorize;
