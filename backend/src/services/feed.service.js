// backend/src/services/feed.service.js
// Phase 9 — Interview questions, tech trends, daily tips

'use strict';

const prisma = require('../lib/prisma');

// ─────────────────────────────────────────────────────────────────────────────
// Daily Tips (in-memory, no DB model needed)
// ─────────────────────────────────────────────────────────────────────────────

const DAILY_TIPS = [
  { tip: 'Practice explaining your code out loud — interviewers value communication as much as the solution.', category: 'interview' },
  { tip: 'For DSA problems, always clarify constraints and edge cases before coding.', category: 'technical' },
  { tip: 'The STAR method (Situation, Task, Action, Result) is your best friend for behavioral questions.', category: 'interview' },
  { tip: 'Always ask clarifying questions in system design — the interviewer rewards structured thinking.', category: 'technical' },
  { tip: 'Time your mock interviews — most coding rounds are 45 minutes. Practice finishing on time.', category: 'interview' },
  { tip: 'Before any interview, re-read the company\'s engineering blog and recent tech choices.', category: 'career' },
  { tip: 'A brute-force solution first, then optimize — showing iterative thinking impresses interviewers.', category: 'technical' },
  { tip: 'LinkedIn connections from your target company can give insights about the interview process.', category: 'career' },
  { tip: 'Review your own projects thoroughly — interviewers love asking deep questions about what you built.', category: 'interview' },
  { tip: 'Practice "narrating" your thought process while coding — silence makes interviewers nervous.', category: 'interview' },
  { tip: 'Know your resume\'s every word. Be ready to expand on any bullet point with a 2-minute story.', category: 'interview' },
  { tip: 'LeetCode patterns to master: two-pointer, sliding window, BFS/DFS, dynamic programming, binary search.', category: 'technical' },
  { tip: 'Behavioral interviews test culture fit as much as experience. Know the company\'s values.', category: 'interview' },
  { tip: 'For distributed systems questions, always discuss trade-offs — there\'s no one-size-fits-all answer.', category: 'technical' },
  { tip: 'Send a thank-you email within 24 hours of every interview — 80% of candidates don\'t bother.', category: 'career' },
  { tip: 'Mock interviews with friends are more effective than solo practice for reducing anxiety.', category: 'interview' },
  { tip: 'Follow up on your applications after 5–7 business days if you haven\'t heard back.', category: 'career' },
  { tip: 'Prepare 5 questions to ask your interviewer — it shows genuine interest and curiosity.', category: 'interview' },
  { tip: 'When stuck in a technical interview, think out loud — partial credit is real.', category: 'interview' },
  { tip: 'Negotiate your salary — 70% of employers expect it and first offers are rarely the best.', category: 'career' },
  { tip: 'Keep a list of accomplishments with metrics. "Improved performance by 40%" beats "improved performance."', category: 'career' },
  { tip: 'GitHub contributions, open source PRs, and technical blogs make your resume stand out.', category: 'career' },
  { tip: 'Build a portfolio with 2–3 polished projects rather than 10 mediocre ones.', category: 'career' },
  { tip: 'Review OS basics — many top companies ask OS questions regardless of the role.', category: 'technical' },
  { tip: 'Tailor your "walk me through your resume" story depending on the type of company you\'re interviewing at.', category: 'interview' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function getStudentId(userId) {
  const student = await prisma.student.findFirst({ where: { userId, deletedAt: null } });
  return student ? student.id : null;
}

async function getStudentSkillTags(studentId) {
  if (!studentId) return [];
  const skills = await prisma.studentSkill.findMany({
    where: { studentId },
    include: { skill: true },
    take: 20,
  });
  return skills.map((s) => s.skill.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, ''));
}

// ─────────────────────────────────────────────────────────────────────────────
// Interview Questions
// ─────────────────────────────────────────────────────────────────────────────

async function getInterviewQuestions({ userId, category, difficulty, limit = 5 }) {
  const studentId = await getStudentId(userId);
  const skillTags = studentId ? await getStudentSkillTags(studentId) : [];

  const where = {};
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;

  const total = await prisma.interviewQuestion.count({ where });
  if (total === 0) return [];

  // Fetch more than needed so we can personalise order
  const all = await prisma.interviewQuestion.findMany({
    where,
    take: Math.min(total, 50),
    skip: Math.floor(Math.random() * Math.max(0, total - 50)),
    orderBy: { createdAt: 'asc' },
  });

  // Prefer questions whose tags overlap with student skills
  const scored = all.map((q) => {
    const overlap = q.tags.filter((t) => skillTags.includes(t)).length;
    return { ...q, _relevance: overlap };
  });
  scored.sort((a, b) => b._relevance - a._relevance || Math.random() - 0.5);

  return scored.slice(0, limit).map(({ _relevance, ...q }) => q);
}

async function listInterviewQuestions({ category, difficulty, search, page = 1, limit = 20 }) {
  const where = {};
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;
  if (search) {
    where.OR = [
      { question: { contains: search, mode: 'insensitive' } },
      { answer: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [questions, total] = await Promise.all([
    prisma.interviewQuestion.findMany({ where, orderBy: { createdAt: 'asc' }, skip, take: limit }),
    prisma.interviewQuestion.count({ where }),
  ]);

  return { questions, total, page, limit, pages: Math.ceil(total / limit) };
}

async function getInterviewQuestionById(id) {
  const q = await prisma.interviewQuestion.findUnique({ where: { id } });
  if (!q) return null;
  return q;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tech Trends
// ─────────────────────────────────────────────────────────────────────────────

async function getMarketTrends({ userId, category, limit = 8 }) {
  const studentId = await getStudentId(userId);
  const skillTags = studentId ? await getStudentSkillTags(studentId) : [];

  const where = {};
  if (category) where.category = category;

  const all = await prisma.techTrend.findMany({
    where,
    orderBy: { trendScore: 'desc' },
  });

  // Boost trends matching student skills
  const scored = all.map((t) => {
    const titleLower = t.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const tagMatch = skillTags.some((tag) => titleLower.includes(tag) || tag.includes(titleLower));
    return { ...t, _relevant: tagMatch ? 1 : 0 };
  });
  scored.sort((a, b) => b._relevant - a._relevant || b.trendScore - a.trendScore);

  return scored.slice(0, limit).map(({ _relevant, ...t }) => t);
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily Tip
// ─────────────────────────────────────────────────────────────────────────────

function getDailyTip() {
  // Deterministic rotation: changes every day, same for all users that day
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const tip = DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
  return { ...tip, date: new Date().toISOString().split('T')[0] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin: add question / refresh trends
// ─────────────────────────────────────────────────────────────────────────────

async function createInterviewQuestion(data) {
  return prisma.interviewQuestion.create({ data });
}

async function refreshTrendScores() {
  // In production this would call GitHub Trending API / SO API.
  // For now, apply a small random drift to keep scores "live"
  const trends = await prisma.techTrend.findMany();
  const updates = trends.map((t) => {
    const drift = (Math.random() - 0.45) * 3; // slight upward bias
    const newScore = Math.min(100, Math.max(10, t.trendScore + drift));
    return prisma.techTrend.update({
      where: { id: t.id },
      data: { trendScore: parseFloat(newScore.toFixed(1)), lastUpdatedAt: new Date() },
    });
  });
  await Promise.all(updates);
  return { updated: trends.length };
}

module.exports = {
  getInterviewQuestions,
  listInterviewQuestions,
  getInterviewQuestionById,
  getMarketTrends,
  getDailyTip,
  createInterviewQuestion,
  refreshTrendScores,
};
