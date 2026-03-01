// backend/src/services/goals.service.js
// CRUD service for StudentGoal

'use strict';

const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');

async function getStudentId(userId) {
  const student = await prisma.student.findFirst({ where: { userId, deletedAt: null } });
  if (!student) throw new AppError('Student profile not found', 404);
  return student.id;
}

async function getGoals(userId, status) {
  const studentId = await getStudentId(userId);
  const where = { studentId };
  if (status) where.status = status;

  return prisma.studentGoal.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

async function getGoalsSummary(userId) {
  const studentId = await getStudentId(userId);
  const goals = await prisma.studentGoal.findMany({
    where: { studentId, status: 'active' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      category: true,
      progress: true,
      targetDate: true,
      createdBy: true,
    },
  });

  const totalActive = await prisma.studentGoal.count({ where: { studentId, status: 'active' } });
  const totalCompleted = await prisma.studentGoal.count({ where: { studentId, status: 'completed' } });

  return { totalActive, totalCompleted, goals };
}

async function createGoal(userId, data) {
  const studentId = await getStudentId(userId);
  return prisma.studentGoal.create({
    data: {
      studentId,
      title: data.title,
      description: data.description || null,
      category: data.category || 'technical',
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      milestones: data.milestones || null,
      status: 'active',
      progress: 0,
      createdBy: 'manual',
    },
  });
}

async function updateGoal(userId, goalId, data) {
  const studentId = await getStudentId(userId);
  const goal = await prisma.studentGoal.findUnique({ where: { id: goalId } });
  if (!goal || goal.studentId !== studentId) throw new AppError('Goal not found', 404);

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.targetDate !== undefined) updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.progress !== undefined) updateData.progress = Math.max(0, Math.min(100, Number(data.progress)));
  if (data.milestones !== undefined) updateData.milestones = data.milestones;

  return prisma.studentGoal.update({ where: { id: goalId }, data: updateData });
}

async function deleteGoal(userId, goalId) {
  const studentId = await getStudentId(userId);
  const goal = await prisma.studentGoal.findUnique({ where: { id: goalId } });
  if (!goal || goal.studentId !== studentId) throw new AppError('Goal not found', 404);
  await prisma.studentGoal.delete({ where: { id: goalId } });
}

module.exports = { getGoals, getGoalsSummary, createGoal, updateGoal, deleteGoal };
