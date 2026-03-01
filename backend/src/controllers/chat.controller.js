// backend/src/controllers/chat.controller.js
'use strict';

const chatbotService = require('../services/chatbot.service');
const AppError = require('../utils/AppError');

// GET /student/chat/conversations
async function listConversations(req, res, next) {
  try {
    const conversations = await chatbotService.listConversations(req.user.userId);
    res.json({ success: true, data: conversations });
  } catch (err) {
    next(err);
  }
}

// POST /student/chat/conversations
async function createConversation(req, res, next) {
  try {
    const conversation = await chatbotService.createConversation(req.user.userId);
    res.status(201).json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
}

// DELETE /student/chat/conversations/:id
async function deleteConversation(req, res, next) {
  try {
    await chatbotService.deleteConversation(req.user.userId, req.params.id);
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err) {
    next(err);
  }
}

// GET /student/chat/conversations/:id/messages
async function getMessages(req, res, next) {
  try {
    const messages = await chatbotService.getMessages(req.user.userId, req.params.id);
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
}

// POST /student/chat/conversations/:id/messages
async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      throw new AppError('Message content is required', 400);
    }
    const result = await chatbotService.sendMessage(req.user.userId, req.params.id, content.trim());
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { listConversations, createConversation, deleteConversation, getMessages, sendMessage };
