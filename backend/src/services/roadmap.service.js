// backend/src/services/roadmap.service.js
// AI Roadmap Generator service — Phase 7

'use strict';

const https = require('https');
const http = require('http');
const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { groqChat } = require('../utils/groq');

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

async function getStudentId(userId) {
  const student = await prisma.student.findFirst({ where: { userId, deletedAt: null } });
  if (!student) throw new AppError('Student profile not found', 404);
  return student.id;
}

/**
 * HEAD-check a URL. Returns true if reachable (2xx/3xx), false otherwise.
 * Times out after 5 s to keep generation fast.
 */
function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const lib = parsed.protocol === 'https:' ? https : http;
      const req = lib.request(
        { method: 'HEAD', hostname: parsed.hostname, path: parsed.pathname + parsed.search, port: parsed.port || undefined, timeout: 5000 },
        (res) => resolve(res.statusCode < 400)
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
      req.end();
    } catch {
      resolve(false);
    }
  });
}

/**
 * Find a curated fallback for a topic+platform combination.
 */
async function getFallbackResource(topic, platform, type) {
  return prisma.curatedResource.findFirst({
    where: { topic: { contains: topic, mode: 'insensitive' }, platform, type, verified: true },
  });
}

/**
 * Validate resource URLs in all modules; replace broken ones with curated fallbacks.
 * Operates in-place on the modules array.
 */
async function validateModuleResources(modules) {
  await Promise.all(
    modules.map(async (mod) => {
      if (!Array.isArray(mod.resources)) return;
      await Promise.all(
        mod.resources.map(async (res, idx) => {
          if (!res.url) return;
          const ok = await checkUrl(res.url);
          if (!ok) {
            const fallback = await getFallbackResource(mod.title, res.platform, res.type);
            if (fallback) {
              mod.resources[idx] = { title: fallback.title, url: fallback.url, platform: fallback.platform, type: fallback.type };
            }
          }
        })
      );
    })
  );
}

// ─────────────────────────────────────────────────────────────────
// AI prompt builder
// ─────────────────────────────────────────────────────────────────

function buildGenerationPrompt(targetRole, timeline, focusAreas) {
  const moduleCount = timeline === '1 month' ? 4 : timeline === '3 months' ? 8 : 12;
  const focusNote = focusAreas ? `Focus areas requested: ${focusAreas}.` : '';

  return `You are an expert career roadmap generator. Create a detailed, practical learning roadmap for a student targeting the role: "${targetRole}".
Timeline: ${timeline}. ${focusNote}

Generate exactly ${moduleCount} sequential learning modules. Return ONLY valid JSON — no markdown, no explanation outside the JSON.

Schema:
{
  "title": "string — roadmap title, concise",
  "description": "string — 1-2 sentence overview",
  "modules": [
    {
      "title": "string",
      "description": "string — 2-3 sentences explaining what the module covers",
      "estimatedHours": number,
      "keyConcepts": ["string", ...],  // 4-7 items
      "resources": [
        {
          "title": "string",
          "url": "string — real, publicly accessible URL (prefer MDN, official docs, freeCodeCamp, YouTube, GitHub)",
          "platform": "youtube|freecodecamp|mdn|docs|github|other",
          "type": "video|article|course|project"
        }
      ],  // 3-5 resources
      "quiz": [
        {
          "question": "string",
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
          "correctIndex": number,  // 0-3
          "explanation": "string — why the answer is correct"
        }
      ]  // exactly 5 MCQs
    }
  ]
}`;
}

// ─────────────────────────────────────────────────────────────────
// Service functions
// ─────────────────────────────────────────────────────────────────

/**
 * Generate and persist a new roadmap for a student.
 */
async function generateRoadmap(userId, { targetRole, timeline = '3 months', focusAreas }) {
  const studentId = await getStudentId(userId);

  if (!targetRole || !targetRole.trim()) throw new AppError('Target role is required', 400);

  const validTimelines = ['1 month', '3 months', '6 months'];
  if (!validTimelines.includes(timeline)) throw new AppError('Invalid timeline', 400);

  // Call Groq AI
  const prompt = buildGenerationPrompt(targetRole.trim(), timeline, focusAreas);
  let aiRaw;
  try {
    const response = await groqChat({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8000,
    });
    aiRaw = response.choices[0]?.message?.content || '';
  } catch (err) {
    throw new AppError('AI generation failed. Please try again.', 503);
  }

  // Parse JSON — strip potential markdown fences
  let parsed;
  try {
    const jsonStr = aiRaw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new AppError('AI returned invalid response. Please try again.', 500);
  }

  if (!parsed.modules || !Array.isArray(parsed.modules) || !parsed.modules.length) {
    throw new AppError('AI roadmap missing modules. Please try again.', 500);
  }

  // Validate resource URLs and replace broken ones with curated fallbacks
  await validateModuleResources(parsed.modules);

  // Persist roadmap
  const roadmap = await prisma.roadmap.create({
    data: {
      studentId,
      title: parsed.title || `${targetRole} Roadmap`,
      description: parsed.description || null,
      targetRole: targetRole.trim(),
      modules: parsed.modules,
      status: 'active',
      progress: 0,
    },
  });

  // Create a RoadmapProgress row for each module (all "not_started")
  await prisma.roadmapProgress.createMany({
    data: parsed.modules.map((_, idx) => ({
      roadmapId: roadmap.id,
      moduleIndex: idx,
      status: 'not_started',
    })),
  });

  return roadmap;
}

/**
 * List all roadmaps for a student (with per-module progress count summary).
 */
async function listRoadmaps(userId, status) {
  const studentId = await getStudentId(userId);
  const where = { studentId };
  if (status) where.status = status;

  const roadmaps = await prisma.roadmap.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      targetRole: true,
      status: true,
      progress: true,
      createdAt: true,
      updatedAt: true,
      modules: true,
      moduleProgress: { select: { moduleIndex: true, status: true } },
    },
  });

  return roadmaps.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    targetRole: r.targetRole,
    status: r.status,
    progress: r.progress,
    moduleCount: Array.isArray(r.modules) ? r.modules.length : 0,
    completedModules: r.moduleProgress.filter((p) => p.status === 'completed').length,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

/**
 * Get a single roadmap with per-module progress merged in.
 */
async function getRoadmap(userId, roadmapId) {
  const studentId = await getStudentId(userId);

  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    include: { moduleProgress: true },
  });

  if (!roadmap || roadmap.studentId !== studentId) throw new AppError('Roadmap not found', 404);

  // Merge progress into each module
  const progressMap = {};
  for (const p of roadmap.moduleProgress) {
    progressMap[p.moduleIndex] = p;
  }

  const modulesWithProgress = (roadmap.modules || []).map((mod, idx) => {
    const prog = progressMap[idx] || { status: 'not_started', testScore: null, completedAt: null };
    return {
      ...mod,
      index: idx,
      status: prog.status,
      testScore: prog.testScore,
      completedAt: prog.completedAt,
    };
  });

  return {
    id: roadmap.id,
    title: roadmap.title,
    description: roadmap.description,
    targetRole: roadmap.targetRole,
    status: roadmap.status,
    progress: roadmap.progress,
    createdAt: roadmap.createdAt,
    updatedAt: roadmap.updatedAt,
    modules: modulesWithProgress,
  };
}

/**
 * Return quiz questions for a module — WITHOUT correctIndex or explanation.
 */
async function getModuleTest(userId, roadmapId, moduleIndex) {
  const studentId = await getStudentId(userId);
  const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });
  if (!roadmap || roadmap.studentId !== studentId) throw new AppError('Roadmap not found', 404);

  const modules = roadmap.modules || [];
  const mod = modules[moduleIndex];
  if (!mod) throw new AppError('Module not found', 404);

  const quiz = (mod.quiz || []).map((q, idx) => ({
    index: idx,
    question: q.question,
    options: q.options,
  }));

  return { moduleIndex, moduleTitle: mod.title, quiz };
}

/**
 * Score submitted answers, update progress, recalculate overall roadmap %.
 */
async function submitModuleTest(userId, roadmapId, moduleIndex, answers) {
  const studentId = await getStudentId(userId);
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    include: { moduleProgress: true },
  });
  if (!roadmap || roadmap.studentId !== studentId) throw new AppError('Roadmap not found', 404);

  const modules = roadmap.modules || [];
  const mod = modules[moduleIndex];
  if (!mod) throw new AppError('Module not found', 404);

  const quiz = mod.quiz || [];
  if (!quiz.length) throw new AppError('No quiz available for this module', 400);
  if (!Array.isArray(answers) || answers.length !== quiz.length) {
    throw new AppError(`Expected ${quiz.length} answers`, 400);
  }

  // Score
  let correct = 0;
  const feedback = quiz.map((q, idx) => {
    const isCorrect = answers[idx] === q.correctIndex;
    if (isCorrect) correct++;
    return {
      index: idx,
      question: q.question,
      yourAnswer: answers[idx],
      correctIndex: q.correctIndex,
      correct: isCorrect,
      explanation: q.explanation,
    };
  });

  const score = Math.round((correct / quiz.length) * 100);
  const passed = score >= 60;

  // Update module progress
  const existing = roadmap.moduleProgress.find((p) => p.moduleIndex === moduleIndex);
  if (existing) {
    await prisma.roadmapProgress.update({
      where: { id: existing.id },
      data: {
        status: passed ? 'completed' : 'in_progress',
        testScore: score,
        completedAt: passed ? new Date() : null,
      },
    });
  } else {
    await prisma.roadmapProgress.create({
      data: {
        roadmapId,
        moduleIndex,
        status: passed ? 'completed' : 'in_progress',
        testScore: score,
        completedAt: passed ? new Date() : null,
      },
    });
  }

  // Recalculate overall roadmap progress
  const allProgress = await prisma.roadmapProgress.findMany({ where: { roadmapId } });
  const completedCount = allProgress.filter((p) => p.status === 'completed').length;
  const overallProgress = Math.round((completedCount / modules.length) * 100);
  const allComplete = completedCount === modules.length;

  await prisma.roadmap.update({
    where: { id: roadmapId },
    data: {
      progress: overallProgress,
      status: allComplete ? 'completed' : roadmap.status === 'archived' ? 'archived' : 'active',
    },
  });

  return { score, passed, correct, total: quiz.length, feedback, overallProgress };
}

/**
 * Manually update a module's status.
 */
async function updateModuleStatus(userId, roadmapId, moduleIndex, status) {
  const validStatuses = ['not_started', 'in_progress', 'completed'];
  if (!validStatuses.includes(status)) throw new AppError('Invalid status', 400);

  const studentId = await getStudentId(userId);
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    include: { moduleProgress: true },
  });
  if (!roadmap || roadmap.studentId !== studentId) throw new AppError('Roadmap not found', 404);

  const modules = roadmap.modules || [];
  if (moduleIndex < 0 || moduleIndex >= modules.length) throw new AppError('Module not found', 404);

  const existing = roadmap.moduleProgress.find((p) => p.moduleIndex === moduleIndex);
  if (existing) {
    await prisma.roadmapProgress.update({
      where: { id: existing.id },
      data: { status, completedAt: status === 'completed' ? new Date() : null },
    });
  } else {
    await prisma.roadmapProgress.create({
      data: { roadmapId, moduleIndex, status, completedAt: status === 'completed' ? new Date() : null },
    });
  }

  // Recalculate overall progress
  const allProgress = await prisma.roadmapProgress.findMany({ where: { roadmapId } });
  const completedCount = allProgress.filter((p) => p.status === 'completed').length;
  const overallProgress = Math.round((completedCount / modules.length) * 100);

  await prisma.roadmap.update({
    where: { id: roadmapId },
    data: {
      progress: overallProgress,
      status: completedCount === modules.length ? 'completed' : roadmap.status === 'archived' ? 'archived' : 'active',
    },
  });

  return { moduleIndex, status, overallProgress };
}

/**
 * Archive a roadmap.
 */
async function archiveRoadmap(userId, roadmapId) {
  const studentId = await getStudentId(userId);
  const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });
  if (!roadmap || roadmap.studentId !== studentId) throw new AppError('Roadmap not found', 404);

  return prisma.roadmap.update({ where: { id: roadmapId }, data: { status: 'archived' } });
}

/**
 * Permanently delete a roadmap (and its modules via cascade).
 */
async function deleteRoadmap(userId, roadmapId) {
  const studentId = await getStudentId(userId);
  const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });
  if (!roadmap || roadmap.studentId !== studentId) throw new AppError('Roadmap not found', 404);

  await prisma.roadmap.delete({ where: { id: roadmapId } });
  return { deleted: true };
}

/**
 * Conversational roadmap creator.
 * Takes a conversation history, responds naturally using the student's real profile,
 * and when it has gathered enough info (role + timeline) returns a GENERATE signal
 * which triggers the existing generateRoadmap() pipeline.
 *
 * @param {string} userId
 * @param {Array<{role:'user'|'assistant', content:string}>} messages  – full history so far
 * @returns {{ type:'message', content:string } | { type:'generated', roadmap, summary:string }}
 */
async function chatForRoadmap(userId, messages) {
  // ── Load student context ─────────────────────────────────────
  const student = await prisma.student.findFirst({
    where: { userId, deletedAt: null },
    include: {
      skills:        { include: { skill: true }, take: 20, orderBy: { proficiency: 'desc' } },
      projects:      { take: 10, orderBy: { createdAt: 'desc' } },
      internships:   { take: 5,  orderBy: { startDate: 'desc' } },
      certifications:{ take: 10 },
      events:        { take: 10 },
      scoreBreakdown: true,
      leetcodeProfile: true,
      githubProfile:   true,
    },
  });

  if (!student) throw new AppError('Student profile not found', 404);

  const skills      = student.skills.map(s => `${s.skill.name} (${s.level}, ${s.proficiency}%)`).join(', ') || 'None added';
  const projects    = student.projects.map(p => `"${p.title}" — ${(p.techStack || []).join(', ') || 'unspecified stack'}`).join('; ') || 'None';
  const internships = student.internships.map(i => `${i.role} at ${i.company}`).join('; ') || 'None';
  const certs       = student.certifications.map(c => c.title).join(', ') || 'None';
  const lc          = student.leetcodeProfile
    ? `${student.leetcodeProfile.totalSolved} problems solved (Easy: ${student.leetcodeProfile.easySolved}, Medium: ${student.leetcodeProfile.mediumSolved}, Hard: ${student.leetcodeProfile.hardSolved})`
    : 'Not connected';
  const gh          = student.githubProfile
    ? `${student.githubProfile.publicRepos} repos, ${student.githubProfile.contributionCount} contributions`
    : 'Not connected';
  const readiness   = student.scoreBreakdown
    ? Number(student.scoreBreakdown.totalScore).toFixed(1)
    : 'Unknown';

  // ── System prompt ────────────────────────────────────────────
  const systemPrompt = `You are an expert AI career mentor inside EvolvEd, a placement-readiness platform. Your job is to have a SHORT, focused conversation with the student to understand their learning goal, then generate a personalised roadmap.

STUDENT PROFILE:
- Name: ${student.fullName}
- Department: ${student.department}, Year: ${student.yearOfStudy}
- Readiness Score: ${readiness}/100
- Skills: ${skills}
- Projects: ${projects}
- Internships: ${internships}
- Certifications: ${certs}
- LeetCode: ${lc}
- GitHub: ${gh}

YOUR GOAL:
Gather ONLY these three things through natural, friendly conversation (1–2 turns max):
1. Target role/goal (e.g. "Full Stack Developer", "ML Engineer", "DevOps")
2. Preferred timeline: exactly one of "1 month", "3 months", or "6 months"
3. Any specific focus areas (optional)

Use the student's actual data to make personalised observations. Reference their existing skills, gaps, or projects. Keep each reply to 2–4 sentences max — be concise and warm.

WHEN YOU HAVE ENOUGH INFO:
Once you have the target role and timeline (after at most 2 exchanges), respond with ONLY this exact JSON and nothing else — no text before or after:
{"GENERATE":true,"targetRole":"<role>","timeline":"<1 month|3 months|6 months>","focusAreas":"<comma-separated, or empty string>","summary":"<one friendly sentence telling the student what roadmap you are creating for them>"}

RULES:
- Never ask for info already obvious from the profile.
- After at most 2 back-and-forth exchanges you MUST generate.
- If the user's first message already names a role, you only need to confirm the timeline; if both are mentioned, generate immediately.
- Always be encouraging.`;

  // ── Call Groq ────────────────────────────────────────────────
  const response = await groqChat({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: 0.7,
    max_tokens: 600,
  });

  const aiContent = response.choices[0]?.message?.content?.trim() || '';

  // ── Check for GENERATE signal ────────────────────────────────
  try {
    const stripped = aiContent
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    if (stripped.startsWith('{') && stripped.includes('"GENERATE"')) {
      const parsed = JSON.parse(stripped);
      if (parsed.GENERATE && parsed.targetRole) {
        const roadmap = await generateRoadmap(userId, {
          targetRole:  parsed.targetRole,
          timeline:    parsed.timeline || '3 months',
          focusAreas:  parsed.focusAreas || '',
        });
        return { type: 'generated', roadmap, summary: parsed.summary || `Your ${parsed.targetRole} roadmap is ready!` };
      }
    }
  } catch {
    // Not a JSON GENERATE signal — treat as plain message
  }

  return { type: 'message', content: aiContent };
}

/**
 * Get active roadmaps summary for chatbot context.
 */
async function getRoadmapContextForChat(userId) {
  const studentId = await getStudentId(userId).catch(() => null);
  if (!studentId) return null;

  const roadmaps = await prisma.roadmap.findMany({
    where: { studentId, status: 'active' },
    orderBy: { updatedAt: 'desc' },
    take: 3,
    select: {
      title: true,
      targetRole: true,
      progress: true,
      moduleProgress: { select: { status: true } },
      modules: true,
    },
  });

  return roadmaps.map((r) => ({
    title: r.title,
    targetRole: r.targetRole,
    progress: r.progress,
    totalModules: Array.isArray(r.modules) ? r.modules.length : 0,
    completedModules: r.moduleProgress.filter((p) => p.status === 'completed').length,
  }));
}

module.exports = {
  generateRoadmap,
  chatForRoadmap,
  listRoadmaps,
  getRoadmap,
  getModuleTest,
  submitModuleTest,
  updateModuleStatus,
  archiveRoadmap,
  deleteRoadmap,
  getRoadmapContextForChat,
};
