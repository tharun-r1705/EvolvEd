// Vercel Serverless Function Entry Point for Express Backend
// This wraps the entire Express app as a single serverless function

const app = require('../backend/src/app');

// Export the Express app as a serverless function handler
module.exports = app;
