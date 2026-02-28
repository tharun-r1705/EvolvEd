'use strict';

const http = require('http');
const app = require('./app');
const config = require('./config');
const prisma = require('./lib/prisma');

const server = http.createServer(app);

async function start() {
  try {
    // Verify DB connection
    await prisma.$connect();
    console.log('Database connected.');

    server.listen(config.port, () => {
      console.log(`Server running on port ${config.port} [${config.env}]`);
      console.log(`API base: http://localhost:${config.port}/api`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// ─── Graceful shutdown ───────────────────────────────────────────
async function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

start();
