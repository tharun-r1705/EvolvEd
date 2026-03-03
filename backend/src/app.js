'use strict';

require('./config'); // Load and validate env vars first

const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// ─── Gzip compression (must come before other middleware) ────────
app.use(compression({ level: 6, threshold: 512 }));

// ─── Security headers ────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://localhost:3000',
];

// Add Vercel deployment domains
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}
if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
}
// Add custom domain if configured
if (process.env.FRONTEND_DOMAIN) {
  allowedOrigins.push(`https://${process.env.FRONTEND_DOMAIN}`);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list or matches Vercel preview pattern
      if (
        allowedOrigins.includes(origin) ||
        origin.match(/^https:\/\/.*\.vercel\.app$/)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Body parsing ────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// ─── Global rate limiter (production only) ──────────────────────
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests. Please try again later.',
  },
});
if (config.isProd) app.use('/api', globalLimiter);

// ─── Auth-specific stricter rate limiter ─────────────────────────
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many authentication attempts. Please try again later.',
  },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Routes ──────────────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 handler ─────────────────────────────────────────────────
app.use((req, res, next) => {
  next(AppError.notFound(`Cannot ${req.method} ${req.path}`));
});

// ─── Centralized error handler ───────────────────────────────────
app.use(errorHandler);

module.exports = app;
