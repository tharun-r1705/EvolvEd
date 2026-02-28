'use strict';

/**
 * Custom application error class.
 * isOperational = true means this is an expected, handled error (e.g. bad input, not found).
 * isOperational = false (default for native Error) means unexpected system error.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 409, 500, ...)
   * @param {object} [meta] - Optional additional data (field errors, etc.)
   */
  constructor(message, statusCode = 500, meta = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.meta = meta;

    // Capture stack trace (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  // Convenience factories
  static badRequest(message, meta) {
    return new AppError(message, 400, meta);
  }

  static unauthorized(message = 'Authentication required') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  static conflict(message) {
    return new AppError(message, 409);
  }

  static internal(message = 'An unexpected error occurred') {
    return new AppError(message, 500);
  }
}

module.exports = AppError;
