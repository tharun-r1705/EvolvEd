// backend/src/controllers/interview.controller.js
// Thin HTTP wrappers for interview service — Phase 8

'use strict';

const interviewService = require('../services/interview.service');

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const startInterview = catchAsync(async (req, res) => {
  const { type, difficulty, resumeId } = req.body;
  const interview = await interviewService.startInterview(req.user.userId, { type, difficulty, resumeId });
  res.status(201).json({ success: true, data: interview });
});

const listInterviews = catchAsync(async (req, res) => {
  const { status } = req.query;
  const interviews = await interviewService.listInterviews(req.user.userId, status);
  res.json({ success: true, data: interviews });
});

const getInterview = catchAsync(async (req, res) => {
  const interview = await interviewService.getInterview(req.user.userId, req.params.id);
  res.json({ success: true, data: interview });
});

const getQuestion = catchAsync(async (req, res) => {
  const questionIndex = parseInt(req.params.index, 10);
  const question = await interviewService.getQuestion(req.user.userId, req.params.id, questionIndex);
  res.json({ success: true, data: question });
});

const getQuestionAudio = catchAsync(async (req, res) => {
  const questionIndex = parseInt(req.params.index, 10);
  const audioBuffer = await interviewService.getQuestionAudio(req.user.userId, req.params.id, questionIndex);
  res.set('Content-Type', 'audio/mpeg');
  res.set('Content-Length', audioBuffer.length);
  res.send(audioBuffer);
});

const submitAnswer = catchAsync(async (req, res) => {
  const questionIndex = parseInt(req.params.index, 10);
  const { answer } = req.body;
  const result = await interviewService.submitAnswer(req.user.userId, req.params.id, questionIndex, answer);
  res.json({ success: true, data: result });
});

const completeInterview = catchAsync(async (req, res) => {
  const result = await interviewService.completeInterview(req.user.userId, req.params.id);
  res.json({ success: true, data: result });
});

const abandonInterview = catchAsync(async (req, res) => {
  await interviewService.abandonInterview(req.user.userId, req.params.id);
  res.json({ success: true, message: 'Interview abandoned' });
});

module.exports = {
  startInterview,
  listInterviews,
  getInterview,
  getQuestion,
  getQuestionAudio,
  submitAnswer,
  completeInterview,
  abandonInterview,
};
