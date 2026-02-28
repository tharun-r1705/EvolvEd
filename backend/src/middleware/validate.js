'use strict';

const { ZodError } = require('zod');
const AppError = require('../utils/AppError');

/**
 * Middleware factory: validate request data against a Zod schema.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Which part of req to validate
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {});

      return next(
        AppError.badRequest('Validation failed. Please check your input.', errors)
      );
    }

    // Replace with parsed/coerced data
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
