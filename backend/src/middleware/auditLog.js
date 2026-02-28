'use strict';

const prisma = require('../lib/prisma');

/**
 * Middleware factory: logs user actions to the audit_logs table asynchronously.
 * Does NOT block the request — fires and forgets.
 *
 * @param {string} action - Action name (e.g. 'login', 'create_job', 'update_student')
 * @param {string} [entity] - Entity name (e.g. 'student', 'job')
 * @param {Function} [getEntityId] - Optional function(req) => entityId for dynamic entity IDs
 */
function auditLog(action, entity = null, getEntityId = null) {
  return (req, res, next) => {
    // Continue request immediately; log in background
    res.on('finish', () => {
      // Only log successful operations (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.userId || null;
        const entityId = getEntityId ? getEntityId(req) : null;

        prisma.auditLog
          .create({
            data: {
              userId,
              action,
              entity,
              entityId,
              details: {
                method: req.method,
                path: req.originalUrl,
                statusCode: res.statusCode,
              },
              ipAddress: req.ip || req.connection?.remoteAddress || null,
              userAgent: req.headers['user-agent'] || null,
            },
          })
          .catch((err) => {
            // Never crash the app over audit logging failures
            console.error('[AuditLog Error]', err.message);
          });
      }
    });

    next();
  };
}

module.exports = auditLog;
