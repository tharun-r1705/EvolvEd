'use strict';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse pagination query params into skip/take values for Prisma.
 * @param {object} query - Express req.query
 * @returns {{ page: number, limit: number, skip: number, take: number }}
 */
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip, take: limit };
}

/**
 * Build a standardized paginated response envelope.
 * @param {Array} data
 * @param {number} total - Total count of items (without pagination)
 * @param {number} page
 * @param {number} limit
 */
function paginatedResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

module.exports = { parsePagination, paginatedResponse };
