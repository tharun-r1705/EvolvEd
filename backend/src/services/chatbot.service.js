// backend/src/services/chatbot.service.js
// AI Chatbot service — context-aware Groq-powered assistant

'use strict';

const prisma = require('../lib/prisma');
const { groqChat } = require('../utils/groq');
const AppError = require('../utils/AppError');

const MODEL = 'llama-3.3-70b-versatile';
const MAX_HISTORY = 20;    // messages to inject as context
const TITLE_MAX_TOKENS = 20;
const RESPONSE_MAX_TOKENS = 1024;

// ─── Resolve student from userId ──────────────────────────────────────────────

async function getStudent(userId) {
  const student = await prisma.student.findFirst({ where: { userId, deletedAt: null } });
  if (!student) throw new AppError('Student profile not found', 404);
  return student;
}

// ─── System Prompt Builder ─────────────────────────────────────────────────────

async function buildSystemPrompt(studentId) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      skills: { include: { skill: true } },
      projects: { orderBy: { createdAt: 'desc' }, take: 10 },
      internships: { orderBy: { startDate: 'desc' }, take: 5 },
      certifications: { orderBy: { issueDate: 'desc' }, take: 10 },
      events: { orderBy: { date: 'desc' }, take: 10 },
      assessments: { orderBy: { completedAt: 'desc' }, take: 5, include: { scores: true } },
      scoreBreakdown: true,
      leetcodeProfile: true,
      githubProfile: true,
      goals: { where: { status: 'active' }, orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });

  if (!student) throw new AppError('Student not found', 404);

  const sb = student.scoreBreakdown;
  const lc = student.leetcodeProfile;
  const gh = student.githubProfile;

  const skills = student.skills.map((s) => `${s.skill.name} (${s.level ?? 'Beginner'}, ${s.proficiency}%)`).join(', ') || 'None added';
  const projects = student.projects.map((p) => `"${p.title}" [${p.status}] — ${p.techStack.join(', ')}`).join('\n  ') || 'None';
  const internships = student.internships.map((i) => `${i.role} at ${i.company}`).join(', ') || 'None';
  const certs = student.certifications.map((c) => `${c.name} by ${c.issuer}`).join(', ') || 'None';
  const events = student.events.map((e) => `${e.title} (${e.type}, ${e.achievement})`).join(', ') || 'None';
  const goals = student.goals.map((g) => `"${g.title}" [${g.category}] ${g.progress}% done`).join(', ') || 'None';

  const scoreSection = sb
    ? `Readiness Score: ${Number(student.readinessScore).toFixed(1)}/100
  - Technical Skills: ${Number(sb.technicalSkills).toFixed(1)}
  - Projects: ${Number(sb.projects).toFixed(1)}
  - Internships: ${Number(sb.internships).toFixed(1)}
  - Certifications: ${Number(sb.certifications).toFixed(1)}
  - Assessments: ${Number(sb.assessments).toFixed(1)}
  - Events: ${Number(sb.events).toFixed(1)}
  - Coding Practice: ${Number(sb.codingPractice).toFixed(1)}
  - GitHub Activity: ${Number(sb.githubActivity).toFixed(1)}`
    : `Readiness Score: ${Number(student.readinessScore).toFixed(1)}/100 (breakdown unavailable)`;

  const lcSection = lc
    ? `LeetCode (@${lc.username}): ${lc.totalSolved} solved (${lc.easySolved}E/${lc.mediumSolved}M/${lc.hardSolved}H), streak: ${lc.streak} days`
    : 'LeetCode: not linked';

  const ghSection = gh
    ? `GitHub (@${gh.username}): ${gh.publicRepos} repos, ${gh.totalStars} stars, ${gh.contributionCount} contributions, top langs: ${Array.isArray(gh.topLanguages) ? gh.topLanguages.slice(0, 3).join(', ') : 'N/A'}`
    : 'GitHub: not linked';

  return `You are an AI placement assistant for EvolvEd, a college placement platform. You help students improve their placement readiness, plan their career goals, and prepare for interviews.

## Student Profile
Name: ${student.fullName}
Department: ${student.department}
Year: ${student.yearOfStudy}
GPA: ${student.gpa ? Number(student.gpa).toFixed(2) : 'Not set'}
Profile Completion: ${student.profileCompletion}%

## Scores
${scoreSection}

## Skills
${skills}

## Projects (recent)
  ${projects}

## Internships
${internships}

## Certifications
${certs}

## Events & Achievements
${events}

## Coding Profiles
${lcSection}
${ghSection}

## Active Goals
${goals}

## Your Role
- Be concise, actionable, and encouraging.
- Reference the student's actual data when giving advice.
- If asked to create a goal, respond with a JSON block in this exact format (fenced with \`\`\`json ... \`\`\`):
  \`\`\`json
  {"action":"create_goal","title":"...","description":"...","category":"technical|career|academic|personal","targetDate":"YYYY-MM-DD or null","milestones":["step1","step2"]}
  \`\`\`
  Then add a short explanation after the JSON block.
- For roadmap requests, acknowledge and note that roadmap generation is coming in the next feature update.
- Do not hallucinate data. Only reference what is listed above.
- Keep responses under 400 words unless the user asks for something detailed.
- Use markdown formatting (bold, lists) for readability.
- Today's date: ${new Date().toISOString().split('T')[0]}`;
}

// ─── Auto-title Generator ──────────────────────────────────────────────────────

async function generateTitle(firstUserMessage, firstAssistantMessage) {
  try {
    const res = await groqChat({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'Generate a concise 4-6 word title for this conversation. Return ONLY the title, no quotes, no punctuation at end.',
        },
        {
          role: 'user',
          content: `User said: "${firstUserMessage.slice(0, 200)}"\nAssistant replied: "${firstAssistantMessage.slice(0, 200)}"`,
        },
      ],
      temperature: 0.4,
      max_tokens: TITLE_MAX_TOKENS,
    });
    return res.choices[0]?.message?.content?.trim() || 'New Conversation';
  } catch {
    return 'New Conversation';
  }
}

// ─── Extract goal action from AI response ─────────────────────────────────────

function extractGoalAction(content) {
  const match = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) return null;
  try {
    const data = JSON.parse(match[1]);
    if (data.action === 'create_goal') return data;
  } catch {
    // malformed json — ignore
  }
  return null;
}

// ─── Public API ────────────────────────────────────────────────────────────────

async function createConversation(userId) {
  const student = await getStudent(userId);
  return prisma.chatConversation.create({
    data: { studentId: student.id, title: 'New Conversation' },
  });
}

async function listConversations(userId) {
  const student = await getStudent(userId);
  const convos = await prisma.chatConversation.findMany({
    where: { studentId: student.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, role: true, createdAt: true },
      },
    },
  });

  return convos.map((c) => ({
    id: c.id,
    title: c.title,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    lastMessage: c.messages[0]
      ? {
          content: c.messages[0].content.slice(0, 120),
          role: c.messages[0].role,
          createdAt: c.messages[0].createdAt,
        }
      : null,
  }));
}

async function deleteConversation(userId, conversationId) {
  const student = await getStudent(userId);
  const convo = await prisma.chatConversation.findUnique({ where: { id: conversationId } });
  if (!convo || convo.studentId !== student.id) throw new AppError('Conversation not found', 404);
  await prisma.chatConversation.delete({ where: { id: conversationId } });
}

async function getMessages(userId, conversationId) {
  const student = await getStudent(userId);
  const convo = await prisma.chatConversation.findUnique({ where: { id: conversationId } });
  if (!convo || convo.studentId !== student.id) throw new AppError('Conversation not found', 404);

  return prisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 50,
    select: { id: true, role: true, content: true, metadata: true, createdAt: true },
  });
}

async function sendMessage(userId, conversationId, userContent) {
  const student = await getStudent(userId);
  const studentId = student.id;

  // Verify ownership
  const convo = await prisma.chatConversation.findUnique({ where: { id: conversationId } });
  if (!convo || convo.studentId !== studentId) throw new AppError('Conversation not found', 404);

  // Save user message
  await prisma.chatMessage.create({
    data: { conversationId, role: 'user', content: userContent },
  });

  // Build history for context (last MAX_HISTORY messages)
  const history = await prisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: MAX_HISTORY,
    select: { role: true, content: true },
  });

  // Build system prompt with live student context
  const systemPrompt = await buildSystemPrompt(studentId);

  // Call Groq
  const groqResponse = await groqChat({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.7,
    max_tokens: RESPONSE_MAX_TOKENS,
  });

  const assistantContent = groqResponse.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';

  // Check for goal action
  let goalCreated = null;
  const goalAction = extractGoalAction(assistantContent);
  if (goalAction) {
    try {
      goalCreated = await prisma.studentGoal.create({
        data: {
          studentId,
          title: goalAction.title,
          description: goalAction.description || null,
          category: goalAction.category || 'technical',
          targetDate: goalAction.targetDate ? new Date(goalAction.targetDate) : null,
          milestones: goalAction.milestones || null,
          createdBy: 'ai',
        },
      });
    } catch {
      // Non-fatal — goal creation failure should not break the chat
    }
  }

  // Save assistant message
  const assistantMsg = await prisma.chatMessage.create({
    data: {
      conversationId,
      role: 'assistant',
      content: assistantContent,
      metadata: goalCreated ? { goalId: goalCreated.id } : null,
    },
  });

  // Update conversation updatedAt
  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Auto-title on first AI response (title is still "New Conversation")
  if (convo.title === 'New Conversation') {
    const title = await generateTitle(userContent, assistantContent);
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  return {
    message: {
      id: assistantMsg.id,
      role: 'assistant',
      content: assistantContent,
      metadata: assistantMsg.metadata,
      createdAt: assistantMsg.createdAt,
    },
    goalCreated: goalCreated
      ? {
          id: goalCreated.id,
          title: goalCreated.title,
          category: goalCreated.category,
          progress: goalCreated.progress,
          status: goalCreated.status,
        }
      : null,
  };
}

module.exports = {
  createConversation,
  listConversations,
  deleteConversation,
  getMessages,
  sendMessage,
};
