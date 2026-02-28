'use strict';

const { Prisma } = require('@prisma/client');
const AppError = require('../utils/AppError');
const config = require('../config');

/**
 * Map Prisma error codes to user-friendly AppErrors.
 */
function handlePrismaError(err) {
  switch (err.code) {
    case 'P2002': {
      // Unique constraint violation
      const field = err.meta?.target?.[0] || 'field';
      return AppError.conflict(`A record with this ${field} already exists.`);
    }
    case 'P2025':
      // Record not found (e.g. findFirstOrThrow, update, delete)
      return AppError.notFound('The requested record was not found.');
    case 'P2003':
      return AppError.badRequest('Related record not found. Check foreign key references.');
    case 'P2014':
      return AppError.badRequest('The change would violate a required relation.');
    default:
      return new AppError(`Database error: ${err.message}`, 500);
  }
}

/**
 * Centralized Express error handling middleware.
 * Must be registered LAST in the middleware chain.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Convert Prisma errors to AppErrors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    err = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    err = AppError.badRequest('Invalid data provided to the database.');
  }

  // Default to 500 for unexpected errors
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Log non-operational errors
  if (!isOperational) {
    console.error('[UNHANDLED ERROR]', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  }

  // Build response
  const response = {
    success: false,
    message: isOperational ? err.message : 'An unexpected error occurred. Please try again later.',
  };

  // Include field-level errors (from Zod validation)
  if (err.meta) {
    response.errors = err.meta;
  }

  // Include stack trace only in development
  if (config.isDev && !isOperational) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
