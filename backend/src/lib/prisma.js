'use strict';

const { PrismaClient } = require('@prisma/client');
const config = require('../config');

// Prisma singleton - prevents multiple instances during hot reload in dev
const globalForPrisma = globalThis;

// ── Build a connection URL with safe pool parameters ─────────────────────────
// Supabase transaction-mode pooler needs:
//   pgbouncer=true        → disables Prisma's prepared statements (incompatible)
//   connection_limit=5    → Prisma pool size (PgBouncer manages the server-side pool)
//   pool_timeout=30       → wait up to 30s for a free connection before erroring
//   connect_timeout=30    → TCP connect timeout
function buildDatasourceUrl(raw) {
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    const set = (k, v) => { if (!url.searchParams.has(k)) url.searchParams.set(k, v); };
    set('pgbouncer', 'true');
    set('connection_limit', '5');
    set('pool_timeout', '30');
    set('connect_timeout', '30');
    return url.toString();
  } catch {
    return raw;
  }
}

const DB_CONN_ERRORS = new Set(['P1001', 'P1002', 'P1008', 'P1017']);
function isConnectionError(err) {
  return (
    DB_CONN_ERRORS.has(err?.code) ||
    /Can't reach database server/i.test(err?.message || '') ||
    /connection.*reset|ECONNRESET|ETIMEDOUT/i.test(err?.message || '')
  );
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ── Create base client ────────────────────────────────────────────────────────
function createClient() {
  const base = new PrismaClient({
    datasourceUrl: buildDatasourceUrl(process.env.DATABASE_URL),
    log: config.isDev ? ['error', 'warn'] : ['error'],
  });

  // Wrap every model operation with automatic retry for transient connection drops
  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const MAX_RETRIES = 3;
          let lastErr;
          for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
              return await query(args);
            } catch (err) {
              lastErr = err;
              if (isConnectionError(err) && attempt < MAX_RETRIES) {
                console.warn(`[prisma] connection error on attempt ${attempt}, retrying in ${attempt}s…`);
                await sleep(attempt * 1000);
                try { await base.$connect(); } catch { /* ignore reconnect errors */ }
                continue;
              }
              throw err;
            }
          }
          throw lastErr;
        },
      },
    },
  });
}

const prisma = globalForPrisma.prisma ?? createClient();

if (config.isDev) {
  globalForPrisma.prisma = prisma;
}

// ── withRetry: manual helper for use outside Prisma models (e.g. $transaction) ─
async function withRetry(fn, retries = 3) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (isConnectionError(err) && attempt < retries) {
        console.warn(`[withRetry] connection error on attempt ${attempt}, retrying in ${attempt}s…`);
        await sleep(attempt * 1000);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

module.exports = prisma;
module.exports.withRetry = withRetry;
module.exports.isConnectionError = isConnectionError;
