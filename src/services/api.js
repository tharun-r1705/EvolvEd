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
// Auth endpoints
// ---------------------------------------------------------------------------
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ---------------------------------------------------------------------------
// Student endpoints
// ---------------------------------------------------------------------------
export const studentService = {
  getDashboard: () => api.get('/student/dashboard'),
  getReadinessScore: () => api.get('/student/readiness-score'),
  getAssessments: () => api.get('/student/assessments'),
  getAssessmentById: (id) => api.get(`/student/assessments/${id}`),
  getSkills: () => api.get('/student/skills'),
  getApplications: () => api.get('/student/applications'),
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
