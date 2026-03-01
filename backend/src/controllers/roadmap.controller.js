// backend/src/controllers/roadmap.controller.js
// Thin HTTP wrappers for roadmap service — Phase 7

'use strict';

const roadmapService = require('../services/roadmap.service');

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const chatRoadmap = catchAsync(async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages)) {
    return res.status(400).json({ success: false, message: '`messages` array is required.' });
  }
  const result = await roadmapService.chatForRoadmap(req.user.userId, messages);
  res.json({ success: true, data: result });
});

const generateRoadmap = catchAsync(async (req, res) => {
  const { targetRole, timeline, focusAreas } = req.body;
  const roadmap = await roadmapService.generateRoadmap(req.user.userId, { targetRole, timeline, focusAreas });
  res.status(201).json({ success: true, data: roadmap });
});

const listRoadmaps = catchAsync(async (req, res) => {
  const { status } = req.query;
  const roadmaps = await roadmapService.listRoadmaps(req.user.userId, status);
  res.json({ success: true, data: roadmaps });
});

const getRoadmap = catchAsync(async (req, res) => {
  const roadmap = await roadmapService.getRoadmap(req.user.userId, req.params.id);
  res.json({ success: true, data: roadmap });
});

const getModuleTest = catchAsync(async (req, res) => {
  const moduleIndex = parseInt(req.params.moduleIndex, 10);
  const test = await roadmapService.getModuleTest(req.user.userId, req.params.id, moduleIndex);
  res.json({ success: true, data: test });
});

const submitModuleTest = catchAsync(async (req, res) => {
  const moduleIndex = parseInt(req.params.moduleIndex, 10);
  const { answers } = req.body;
  const result = await roadmapService.submitModuleTest(req.user.userId, req.params.id, moduleIndex, answers);
  res.json({ success: true, data: result });
});

const updateModuleStatus = catchAsync(async (req, res) => {
  const moduleIndex = parseInt(req.params.moduleIndex, 10);
  const { status } = req.body;
  const result = await roadmapService.updateModuleStatus(req.user.userId, req.params.id, moduleIndex, status);
  res.json({ success: true, data: result });
});

const archiveRoadmap = catchAsync(async (req, res) => {
  const roadmap = await roadmapService.archiveRoadmap(req.user.userId, req.params.id);
  res.json({ success: true, data: roadmap });
});

const deleteRoadmap = catchAsync(async (req, res) => {
  await roadmapService.deleteRoadmap(req.user.userId, req.params.id);
  res.json({ success: true, data: { deleted: true } });
});

module.exports = {
  chatRoadmap,
  generateRoadmap,
  listRoadmaps,
  getRoadmap,
  getModuleTest,
  submitModuleTest,
  updateModuleStatus,
  archiveRoadmap,
  deleteRoadmap,
};
