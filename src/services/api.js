import axios from 'axios';

// ---------------------------------------------------------------------------
// Axios instance – update VITE_API_URL in .env for your backend
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('evolvEd_auth');
    const auth = stored ? JSON.parse(stored) : null;
    if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`;
  } catch {
    // ignore
  }
  return config;
});

// Global 401 handler – redirect to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('evolvEd_auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ---------------------------------------------------------------------------
// Lightweight stale-while-revalidate cache
//
// • TTL_SHORT  (30 s)  – dashboard, goals summary (changes on user actions)
// • TTL_MEDIUM (2 min) – leaderboard, rankings
// • TTL_LONG   (5 min) – feed content: trends, daily tip, interview questions
//
// Behaviour:
//   cold miss  → wait for network
//   fresh hit  → return cached immediately (0 ms)
//   stale hit  → return cached immediately + refresh in background
// ---------------------------------------------------------------------------
const _cache = new Map();
const TTL_SHORT  = 30_000;
const TTL_MEDIUM = 2 * 60_000;
const TTL_LONG   = 5 * 60_000;

function _cacheGet(url, ttl, params) {
  const key = params && Object.keys(params).length
    ? `${url}?${new URLSearchParams(params)}`
    : url;
  const entry = _cache.get(key);
  const now   = Date.now();

  const doFetch = () =>
    api.get(url, params ? { params } : undefined).then((res) => {
      _cache.set(key, { res, ts: Date.now() });
      return res;
    });

  if (!entry) return doFetch();                         // cold miss
  if (now - entry.ts < ttl) return Promise.resolve(entry.res); // fresh hit
  doFetch();                                            // stale: bg refresh
  return Promise.resolve(entry.res);                   // serve stale immediately
}

/** Call after mutations that affect cached data (e.g. add project, cert, etc.) */
export function invalidateCache(...prefixes) {
  for (const key of _cache.keys()) {
    if (prefixes.some((p) => key.startsWith(p))) _cache.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  oauthCallback: (supabaseToken, role = 'student') =>
    api.post('/auth/oauth/callback', { supabaseToken, role }),
};

// ---------------------------------------------------------------------------
// Student endpoints
// ---------------------------------------------------------------------------
export const studentService = {
  getDashboard: () => _cacheGet('/student/dashboard', TTL_SHORT),
  getReadinessScore: () => api.get('/student/readiness-score'),
  getAssessments: () => api.get('/student/assessments'),
  getAssessmentById: (id) => api.get(`/student/assessments/${id}`),
  getSkills: () => api.get('/student/skills'),
  getApplications: () => api.get('/student/applications'),

  // Profile
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  uploadAvatar: (formData) =>
    api.post('/student/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  parseLinkedinPdf: (formData) =>
    api.post('/student/profile/linkedin-pdf', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Resumes
  getResumes: () => api.get('/student/resumes'),
  uploadResume: (formData) =>
    api.post('/student/resumes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateResume: (id, data) => api.put(`/student/resumes/${id}`, data),
  deleteResume: (id) => api.delete(`/student/resumes/${id}`),

  // Projects
  getProjects: () => api.get('/student/projects'),
  addProject: (data) => api.post('/student/projects', data),
  updateProject: (id, data) => api.put(`/student/projects/${id}`, data),
  uploadProjectImage: (id, formData) =>
    api.post(`/student/projects/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProject: (id) => api.delete(`/student/projects/${id}`),

  // Certifications
  getCertifications: () => api.get('/student/certifications'),
  addCertification: (data) => api.post('/student/certifications', data),
  updateCertification: (id, data) => api.put(`/student/certifications/${id}`, data),
  deleteCertification: (id) => api.delete(`/student/certifications/${id}`),

  // Events
  getEvents: () => api.get('/student/events'),
  addEvent: (data) => api.post('/student/events', data),
  updateEvent: (id, data) => api.put(`/student/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/student/events/${id}`),

  // Integrations — LeetCode
  getLeetCode: () => api.get('/student/integrations/leetcode'),
  refreshLeetCode: () => api.post('/student/integrations/leetcode/refresh'),

  // Integrations — GitHub
  getGitHub: () => api.get('/student/integrations/github'),
  refreshGitHub: () => api.post('/student/integrations/github/refresh'),

  // Learning Pace
  getLearningPace: () => api.get('/student/learning-pace'),
};

// ---------------------------------------------------------------------------
// Chat (AI Chatbot) endpoints
// ---------------------------------------------------------------------------
export const chatService = {
  listConversations: () => api.get('/student/chat/conversations'),
  createConversation: () => api.post('/student/chat/conversations'),
  deleteConversation: (id) => api.delete(`/student/chat/conversations/${id}`),
  getMessages: (id) => api.get(`/student/chat/conversations/${id}/messages`),
  sendMessage: (id, content) => api.post(`/student/chat/conversations/${id}/messages`, { content }),
};

// ---------------------------------------------------------------------------
// Goals endpoints
// ---------------------------------------------------------------------------
export const goalsService = {
  getGoals: (status) => api.get('/student/goals', { params: status ? { status } : {} }),
  getSummary: () => _cacheGet('/student/goals/summary', TTL_SHORT),
  createGoal: (data) => api.post('/student/goals', data),
  updateGoal: (goalId, data) => api.put(`/student/goals/${goalId}`, data),
  deleteGoal: (goalId) => api.delete(`/student/goals/${goalId}`),
};

// ---------------------------------------------------------------------------
// Roadmap endpoints
// ---------------------------------------------------------------------------
export const roadmapService = {
  generate: (data) => api.post('/student/roadmaps', data),
  list: (status) => api.get('/student/roadmaps', { params: status ? { status } : {} }),
  get: (id) => api.get(`/student/roadmaps/${id}`),
  getModuleTest: (id, moduleIndex) => api.get(`/student/roadmaps/${id}/modules/${moduleIndex}/test`),
  submitModuleTest: (id, moduleIndex, answers) => api.post(`/student/roadmaps/${id}/modules/${moduleIndex}/test`, { answers }),
  updateModuleStatus: (id, moduleIndex, status) => api.patch(`/student/roadmaps/${id}/modules/${moduleIndex}/status`, { status }),
  archive: (id) => api.patch(`/student/roadmaps/${id}/archive`),
};

// ---------------------------------------------------------------------------
// Interview endpoints
// ---------------------------------------------------------------------------
export const interviewService = {
  start: (data) => api.post('/student/interviews', data),
  list: (status) => api.get('/student/interviews', { params: status ? { status } : {} }),
  get: (id) => api.get(`/student/interviews/${id}`),
  getQuestion: (id, index) => api.get(`/student/interviews/${id}/questions/${index}`),
  // Audio URL — returned as a plain URL string for <audio src=...>
  getQuestionAudioUrl: (id, index) => `/api/student/interviews/${id}/questions/${index}/audio`,
  submitAnswer: (id, index, answer) => api.post(`/student/interviews/${id}/questions/${index}/answer`, { answer }),
  complete: (id) => api.post(`/student/interviews/${id}/complete`),
  abandon: (id) => api.patch(`/student/interviews/${id}/abandon`),
};

// ---------------------------------------------------------------------------
// Feed endpoints (Phase 9)
// ---------------------------------------------------------------------------
export const feedService = {
  getInterviewQuestions: (params) =>
    _cacheGet('/student/feed/interview-questions', TTL_LONG, params),
  getInterviewQuestionsFresh: (params) =>
    api.get('/student/feed/interview-questions', { params }),
  listInterviewQuestions: (params) =>
    api.get('/student/feed/interview-questions/all', { params }),
  getInterviewQuestionById: (id) =>
    api.get(`/student/feed/interview-questions/${id}`),
  getMarketTrends: (params) =>
    _cacheGet('/student/feed/market-trends', TTL_LONG, params),
  getDailyTip: () =>
    _cacheGet('/student/feed/daily-tip', TTL_LONG),
};

// ---------------------------------------------------------------------------
// Recruiter endpoints
// ---------------------------------------------------------------------------
export const recruiterService = {
  getDashboard: () => api.get('/recruiter/dashboard'),
  getCandidates: (params) => api.get('/recruiter/candidates', { params }),
  getCandidateById: (id) => api.get(`/recruiter/candidates/${id}`),
  shortlistCandidate: (id) => api.post(`/recruiter/candidates/${id}/shortlist`),
  getJobs: () => api.get('/recruiter/jobs'),
  createJob: (data) => api.post('/recruiter/jobs', data),
  getAnalytics: () => api.get('/recruiter/analytics'),
};

// ---------------------------------------------------------------------------
// Leaderboard endpoints (Phase 10)
// ---------------------------------------------------------------------------
export const leaderboardService = {
  // scope: 'global' | 'department' | 'weekly' | 'skill'
  getLeaderboard: (params) => _cacheGet('/student/leaderboard', TTL_MEDIUM, params),
  getMyRank: () => _cacheGet('/student/leaderboard/me', TTL_MEDIUM),
  getMeta: () => _cacheGet('/student/leaderboard/meta', TTL_MEDIUM),
};

// ---------------------------------------------------------------------------
// Admin endpoints
// ---------------------------------------------------------------------------
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStudents: (params) => api.get('/admin/students', { params }),
  getStudentById: (id) => api.get(`/admin/students/${id}`),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  getPlacementDrives: () => api.get('/admin/placement-drives'),
  createPlacementDrive: (data) => api.post('/admin/placement-drives', data),
  getRecruiters: () => api.get('/admin/recruiters'),
  generateReport: () => api.get('/admin/reports/generate'),
};
