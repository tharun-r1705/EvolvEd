// backend/src/services/interview.service.js
// Mock Interview service — Phase 8

'use strict';

const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { groqChat } = require('../utils/groq');

const MODEL = 'llama-3.3-70b-versatile';
const QUESTIONS_PER_INTERVIEW = 8;

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

async function getStudentId(userId) {
  const student = await prisma.student.findFirst({ where: { userId, deletedAt: null } });
  if (!student) throw new AppError('Student profile not found', 404);
  return student.id;
}

async function getStudentProfile(userId) {
  const student = await prisma.student.findFirst({
    where: { userId, deletedAt: null },
    include: {
      skills: { include: { skill: true } },
      projects: { orderBy: { createdAt: 'desc' }, take: 8 },
      internships: { orderBy: { startDate: 'desc' }, take: 5 },
      certifications: { orderBy: { issueDate: 'desc' }, take: 8 },
      events: { orderBy: { date: 'desc' }, take: 5 },
    },
  });
  if (!student) throw new AppError('Student profile not found', 404);
  return student;
}

// ─────────────────────────────────────────────────────────────────
// Question generation prompt builder
// ─────────────────────────────────────────────────────────────────

function buildQuestionPrompt(student, type, difficulty, resumeText) {
  const skills = student.skills.map((s) => s.skill.name).join(', ') || 'General programming';
  const projects = student.projects.map((p) => `"${p.title}" (${p.techStack.slice(0, 3).join(', ')})`).join(', ') || 'None listed';
  const internships = student.internships.map((i) => `${i.role} at ${i.company}`).join(', ') || 'None';
  const certs = student.certifications.map((c) => c.name).join(', ') || 'None';
  const events = student.events.map((e) => `${e.title} (${e.type})`).join(', ') || 'None';

  const typeInstructions = {
    technical: `Generate ${QUESTIONS_PER_INTERVIEW} technical interview questions based on the student's skills and projects. Mix conceptual questions, problem-solving scenarios, and architecture/design questions. Vary complexity based on difficulty level.`,
    hr: `Generate ${QUESTIONS_PER_INTERVIEW} HR interview questions. Include questions about career goals, strengths/weaknesses, teamwork, motivation, salary expectations, and company fit. Reference their background naturally.`,
    behavioral: `Generate ${QUESTIONS_PER_INTERVIEW} behavioral interview questions using the STAR method framework. Focus on past experiences, conflict resolution, leadership moments, challenges overcome, and achievements. Reference their actual internships, projects, and events.`,
    mixed: `Generate ${QUESTIONS_PER_INTERVIEW} interview questions: mix 3 technical (based on skills/projects), 3 behavioral (based on experiences), and 2 HR questions. Ensure diversity.`,
  };

  const difficultyNote = {
    easy: 'Keep questions accessible for a fresher or early-career candidate.',
    medium: 'Target a mid-level candidate with 1-2 years experience or strong academics.',
    hard: 'Challenge with advanced/in-depth questions appropriate for senior roles or competitive placements.',
  };

  const resumeNote = resumeText
    ? `\n\n## Resume Content (use this for context)\n${resumeText.slice(0, 2000)}`
    : '';

  return `You are an expert interviewer generating tailored mock interview questions.

## Student Profile
Name: ${student.fullName}
Department: ${student.department}
Year: ${student.yearOfStudy}
Skills: ${skills}
Projects: ${projects}
Internships: ${internships}
Certifications: ${certs}
Events: ${events}${resumeNote}

## Task
${typeInstructions[type] || typeInstructions.mixed}
Difficulty: ${difficulty} — ${difficultyNote[difficulty] || difficultyNote.medium}

## Output Format
Return ONLY valid JSON — no markdown fences, no extra text.

{
  "questions": [
    {
      "question": "string — the full interview question",
      "type": "technical|behavioral|hr",
      "expectedKeyPoints": ["point1", "point2", "point3"]
    }
  ]
}`;
}

// ─────────────────────────────────────────────────────────────────
// Answer evaluation prompt
// ─────────────────────────────────────────────────────────────────

function buildEvaluationPrompt(question, type, expectedKeyPoints, studentAnswer) {
  return `You are an expert interviewer evaluating a candidate's answer.

## Question
${question}

## Expected Key Points
${expectedKeyPoints.join(', ')}

## Candidate's Answer
${studentAnswer}

## Task
Evaluate the answer on a scale of 1–10. Be fair but rigorous. Return ONLY valid JSON — no markdown, no extra text.

{
  "score": number (1-10),
  "feedback": "string — 2-3 sentences of specific, constructive feedback",
  "modelAnswer": "string — a strong model answer in 3-5 sentences",
  "strengths": ["string"],
  "improvements": ["string"]
}`;
}

// ─────────────────────────────────────────────────────────────────
// Overall feedback prompt
// ─────────────────────────────────────────────────────────────────

function buildOverallFeedbackPrompt(type, questions) {
  const answered = questions.filter((q) => q.answer && q.score != null);
  const avgScore = answered.length
    ? (answered.reduce((s, q) => s + q.score, 0) / answered.length).toFixed(1)
    : '0';

  const qaSummary = answered
    .map((q, i) => `Q${i + 1} [${q.type}, score ${q.score}/10]: "${q.question.slice(0, 100)}" — Answer: "${(q.answer || '').slice(0, 150)}"`)
    .join('\n');

  return `You are an expert career coach summarizing a ${type} mock interview.

## Interview Summary
Average Score: ${avgScore}/10
Questions & Answers:
${qaSummary}

## Task
Provide an overall performance summary. Return ONLY valid JSON — no markdown, no extra text.

{
  "summary": "string — 3-4 sentence overall assessment",
  "strengths": ["string (up to 3 key strengths observed)"],
  "weaknesses": ["string (up to 3 areas to improve)"],
  "tips": ["string (3-4 actionable preparation tips)"],
  "overallRating": "Excellent|Good|Average|Needs Improvement"
}`;
}

// ─────────────────────────────────────────────────────────────────
// TTS helper — browser-side speechSynthesis is used instead.
//              This endpoint is kept for API compatibility but
//              the frontend now uses Web Speech API directly.
// ─────────────────────────────────────────────────────────────────

async function textToSpeech(text) {
  // edge-tts is blocked by Microsoft (403). Returning 503 so the
  // frontend falls back to browser speechSynthesis.
  throw new AppError('Server-side TTS unavailable; use browser speech synthesis.', 503);
}

// ─────────────────────────────────────────────────────────────────
// Service functions
// ─────────────────────────────────────────────────────────────────

/**
 * Start a new interview session.
 */
async function startInterview(userId, { type, difficulty, resumeId }) {
  const student = await getStudentProfile(userId);

  const validTypes = ['technical', 'hr', 'behavioral', 'mixed'];
  const validDifficulties = ['easy', 'medium', 'hard'];
  if (!validTypes.includes(type)) throw new AppError('Invalid interview type', 400);
  if (!validDifficulties.includes(difficulty)) throw new AppError('Invalid difficulty', 400);

  // If resumeId provided, verify ownership
  let resumeText = null;
  if (resumeId) {
    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume || resume.studentId !== student.id) throw new AppError('Resume not found', 404);
    // Note: We don't fetch/parse the actual PDF here for speed; resume context is via profile
  }

  // Generate questions via AI
  const prompt = buildQuestionPrompt(student, type, difficulty, resumeText);
  let parsed;
  try {
    const res = await groqChat({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 3000,
    });
    const raw = res.choices[0]?.message?.content || '';
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new AppError('Failed to generate interview questions. Please try again.', 503);
  }

  if (!parsed.questions || !Array.isArray(parsed.questions) || !parsed.questions.length) {
    throw new AppError('AI returned invalid questions. Please try again.', 500);
  }

  // Trim to target count and add answer/score fields
  const questions = parsed.questions.slice(0, QUESTIONS_PER_INTERVIEW).map((q) => ({
    question: q.question,
    type: q.type || type,
    expectedKeyPoints: q.expectedKeyPoints || [],
    answer: null,
    score: null,
    feedback: null,
    modelAnswer: null,
    strengths: null,
    improvements: null,
  }));

  const interview = await prisma.mockInterview.create({
    data: {
      studentId: student.id,
      type,
      resumeId: resumeId || null,
      difficulty,
      status: 'in_progress',
      questions,
      currentIndex: 0,
    },
  });

  return {
    id: interview.id,
    type: interview.type,
    difficulty: interview.difficulty,
    status: interview.status,
    totalQuestions: questions.length,
    currentIndex: 0,
    createdAt: interview.createdAt,
  };
}

/**
 * Get a specific question (no answer/score leaked).
 */
async function getQuestion(userId, interviewId, questionIndex) {
  const studentId = await getStudentId(userId);
  const interview = await prisma.mockInterview.findUnique({ where: { id: interviewId } });
  if (!interview || interview.studentId !== studentId) throw new AppError('Interview not found', 404);
  if (interview.status === 'completed') throw new AppError('Interview already completed', 400);

  const questions = interview.questions;
  if (questionIndex < 0 || questionIndex >= questions.length) throw new AppError('Question not found', 404);

  const q = questions[questionIndex];
  return {
    index: questionIndex,
    question: q.question,
    type: q.type,
    totalQuestions: questions.length,
    alreadyAnswered: q.answer !== null,
  };
}

/**
 * Get question audio via Edge TTS.
 */
async function getQuestionAudio(userId, interviewId, questionIndex) {
  const studentId = await getStudentId(userId);
  const interview = await prisma.mockInterview.findUnique({ where: { id: interviewId } });
  if (!interview || interview.studentId !== studentId) throw new AppError('Interview not found', 404);

  const questions = interview.questions;
  if (questionIndex < 0 || questionIndex >= questions.length) throw new AppError('Question not found', 404);

  const text = questions[questionIndex].question;
  const audioBuffer = await textToSpeech(text);
  return audioBuffer;
}

/**
 * Submit an answer to a question. Evaluates immediately.
 */
async function submitAnswer(userId, interviewId, questionIndex, answerText) {
  const studentId = await getStudentId(userId);
  const interview = await prisma.mockInterview.findUnique({ where: { id: interviewId } });
  if (!interview || interview.studentId !== studentId) throw new AppError('Interview not found', 404);
  if (interview.status === 'completed') throw new AppError('Interview already completed', 400);

  const questions = [...interview.questions];
  if (questionIndex < 0 || questionIndex >= questions.length) throw new AppError('Question not found', 404);

  if (!answerText || !answerText.trim()) throw new AppError('Answer cannot be empty', 400);

  const q = questions[questionIndex];

  // Evaluate answer with AI
  let evaluation;
  try {
    const prompt = buildEvaluationPrompt(q.question, q.type, q.expectedKeyPoints || [], answerText.trim());
    const res = await groqChat({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 600,
    });
    const raw = res.choices[0]?.message?.content || '';
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    evaluation = JSON.parse(jsonStr);
  } catch {
    // Fallback evaluation if AI fails
    evaluation = { score: 5, feedback: 'Answer recorded.', modelAnswer: 'N/A', strengths: [], improvements: [] };
  }

  // Update the question in-place
  questions[questionIndex] = {
    ...q,
    answer: answerText.trim(),
    score: Math.min(10, Math.max(1, Number(evaluation.score) || 5)),
    feedback: evaluation.feedback || '',
    modelAnswer: evaluation.modelAnswer || '',
    strengths: evaluation.strengths || [],
    improvements: evaluation.improvements || [],
  };

  const newIndex = Math.max(interview.currentIndex, questionIndex + 1);

  await prisma.mockInterview.update({
    where: { id: interviewId },
    data: { questions, currentIndex: newIndex },
  });

  return {
    index: questionIndex,
    score: questions[questionIndex].score,
    feedback: questions[questionIndex].feedback,
    modelAnswer: questions[questionIndex].modelAnswer,
    strengths: questions[questionIndex].strengths,
    improvements: questions[questionIndex].improvements,
    nextIndex: newIndex < questions.length ? newIndex : null,
  };
}

/**
 * Complete the interview — compute overall score + AI feedback summary.
 */
async function completeInterview(userId, interviewId) {
  const studentId = await getStudentId(userId);
  const interview = await prisma.mockInterview.findUnique({ where: { id: interviewId } });
  if (!interview || interview.studentId !== studentId) throw new AppError('Interview not found', 404);
  if (interview.status === 'completed') throw new AppError('Interview already completed', 400);

  const questions = interview.questions;
  const answered = questions.filter((q) => q.answer !== null && q.score != null);
  if (!answered.length) throw new AppError('No questions answered yet', 400);

  const overallScore = answered.reduce((s, q) => s + q.score, 0) / answered.length;
  const duration = Math.round((Date.now() - new Date(interview.createdAt).getTime()) / 1000);

  // Generate AI overall feedback
  let feedback;
  try {
    const prompt = buildOverallFeedbackPrompt(interview.type, questions);
    const res = await groqChat({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 600,
    });
    const raw = res.choices[0]?.message?.content || '';
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    feedback = JSON.parse(jsonStr);
  } catch {
    feedback = {
      summary: 'Interview completed.',
      strengths: [],
      weaknesses: [],
      tips: ['Practice regularly.', 'Review model answers.'],
      overallRating: overallScore >= 8 ? 'Excellent' : overallScore >= 6 ? 'Good' : overallScore >= 4 ? 'Average' : 'Needs Improvement',
    };
  }

  const updated = await prisma.mockInterview.update({
    where: { id: interviewId },
    data: {
      status: 'completed',
      overallScore: parseFloat(overallScore.toFixed(2)),
      feedback,
      duration,
      completedAt: new Date(),
    },
  });

  return {
    id: updated.id,
    type: updated.type,
    difficulty: updated.difficulty,
    overallScore: updated.overallScore,
    totalQuestions: questions.length,
    answeredCount: answered.length,
    duration,
    feedback,
    questions: questions.map((q, i) => ({
      index: i,
      question: q.question,
      type: q.type,
      answer: q.answer,
      score: q.score,
      feedback: q.feedback,
      modelAnswer: q.modelAnswer,
      strengths: q.strengths,
      improvements: q.improvements,
    })),
  };
}

/**
 * Get full interview details (with answers/scores).
 */
async function getInterview(userId, interviewId) {
  const studentId = await getStudentId(userId);
  const interview = await prisma.mockInterview.findUnique({ where: { id: interviewId } });
  if (!interview || interview.studentId !== studentId) throw new AppError('Interview not found', 404);

  const questions = interview.questions;
  const answered = questions.filter((q) => q.answer !== null);

  return {
    id: interview.id,
    type: interview.type,
    difficulty: interview.difficulty,
    status: interview.status,
    currentIndex: interview.currentIndex,
    totalQuestions: questions.length,
    answeredCount: answered.length,
    overallScore: interview.overallScore,
    feedback: interview.feedback,
    duration: interview.duration,
    createdAt: interview.createdAt,
    completedAt: interview.completedAt,
    questions: questions.map((q, i) => ({
      index: i,
      question: q.question,
      type: q.type,
      answer: q.answer,
      score: q.score,
      feedback: q.feedback,
      modelAnswer: q.modelAnswer,
      strengths: q.strengths,
      improvements: q.improvements,
      alreadyAnswered: q.answer !== null,
    })),
  };
}

/**
 * List all interviews for a student.
 */
async function listInterviews(userId, status) {
  const studentId = await getStudentId(userId);
  const where = { studentId };
  if (status) where.status = status;

  const interviews = await prisma.mockInterview.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      type: true,
      difficulty: true,
      status: true,
      overallScore: true,
      currentIndex: true,
      questions: true,
      duration: true,
      createdAt: true,
      completedAt: true,
    },
  });

  return interviews.map((i) => ({
    id: i.id,
    type: i.type,
    difficulty: i.difficulty,
    status: i.status,
    overallScore: i.overallScore,
    totalQuestions: Array.isArray(i.questions) ? i.questions.length : 0,
    answeredCount: Array.isArray(i.questions) ? i.questions.filter((q) => q.answer !== null).length : 0,
    currentIndex: i.currentIndex,
    duration: i.duration,
    createdAt: i.createdAt,
    completedAt: i.completedAt,
  }));
}

/**
 * Abandon an in-progress interview.
 */
async function abandonInterview(userId, interviewId) {
  const studentId = await getStudentId(userId);
  const interview = await prisma.mockInterview.findUnique({ where: { id: interviewId } });
  if (!interview || interview.studentId !== studentId) throw new AppError('Interview not found', 404);
  if (interview.status !== 'in_progress') throw new AppError('Interview is not in progress', 400);

  return prisma.mockInterview.update({
    where: { id: interviewId },
    data: { status: 'abandoned' },
  });
}

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
