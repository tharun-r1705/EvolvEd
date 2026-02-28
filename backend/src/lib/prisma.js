'use strict';

const { PrismaClient } = require('@prisma/client');
const config = require('../config');

// Prisma singleton - prevents multiple instances during hot reload in dev
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: config.isDev ? ['error', 'warn'] : ['error'],
  });

if (config.isDev) {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
