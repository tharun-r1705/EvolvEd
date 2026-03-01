import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import FloatingChatButton from './components/FloatingChatButton.jsx';

// Public Pages (small, loaded eagerly)
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import NotFound from './pages/NotFound.jsx';
import OAuthCallback from './pages/OAuthCallback.jsx';

// Student Pages (lazy-loaded for performance)
const StudentDashboard    = lazy(() => import('./pages/StudentDashboard.jsx'));
const StudentProfile      = lazy(() => import('./pages/StudentProfile.jsx'));
const StudentProjects     = lazy(() => import('./pages/StudentProjects.jsx'));
const StudentCertifications = lazy(() => import('./pages/StudentCertifications.jsx'));
const StudentEvents       = lazy(() => import('./pages/StudentEvents.jsx'));
const StudentCodingProfile = lazy(() => import('./pages/StudentCodingProfile.jsx'));
const AssessmentBreakdown = lazy(() => import('./pages/AssessmentBreakdown.jsx'));
const StudentResumes      = lazy(() => import('./pages/StudentResumes.jsx'));
const StudentLearningPace = lazy(() => import('./pages/StudentLearningPace.jsx'));
const StudentChat         = lazy(() => import('./pages/StudentChat.jsx'));
const StudentRoadmaps     = lazy(() => import('./pages/StudentRoadmaps.jsx'));
const RoadmapView         = lazy(() => import('./pages/RoadmapView.jsx'));
const MockInterview       = lazy(() => import('./pages/MockInterview.jsx'));
const InterviewSession    = lazy(() => import('./pages/InterviewSession.jsx'));
const InterviewPrep       = lazy(() => import('./pages/InterviewPrep.jsx'));
const Leaderboard         = lazy(() => import('./pages/Leaderboard.jsx'));

// Recruiter Pages (lazy-loaded)
const RecruiterDashboard  = lazy(() => import('./pages/RecruiterDashboard.jsx'));
const CandidateSearch     = lazy(() => import('./pages/CandidateSearch.jsx'));
const CandidateProfile    = lazy(() => import('./pages/CandidateProfile.jsx'));
const PostJob             = lazy(() => import('./pages/PostJob.jsx'));

// Admin Pages (lazy-loaded)
const AdminDashboard      = lazy(() => import('./pages/AdminDashboard.jsx'));
const ManageStudents      = lazy(() => import('./pages/ManageStudents.jsx'));

// Minimal full-page spinner shown while lazy chunks load
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public Routes ── */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />

            {/* ── Student Routes (protected) ── */}
            <Route
              path="/student"
              element={<ProtectedRoute allowedRoles={['student']} />}
            >
              <Route index element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="projects" element={<StudentProjects />} />
              <Route path="certifications" element={<StudentCertifications />} />
              <Route path="events" element={<StudentEvents />} />
              <Route path="coding" element={<StudentCodingProfile />} />
              <Route path="assessments/:id" element={<AssessmentBreakdown />} />
              <Route path="resumes" element={<StudentResumes />} />
              <Route path="learning-pace" element={<StudentLearningPace />} />
              <Route path="roadmaps" element={<StudentRoadmaps />} />
              <Route path="roadmaps/:id" element={<RoadmapView />} />
              <Route path="interviews" element={<MockInterview />} />
              <Route path="interviews/:id" element={<InterviewSession />} />
              <Route path="interview-prep" element={<InterviewPrep />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="chat" element={<StudentChat />} />
            </Route>

            {/* ── Recruiter Routes (protected) ── */}
            <Route
              path="/recruiter"
              element={<ProtectedRoute allowedRoles={['recruiter']} />}
            >
              <Route index element={<RecruiterDashboard />} />
              <Route path="candidates" element={<CandidateSearch />} />
              <Route path="candidates/:id" element={<CandidateProfile />} />
              <Route path="jobs/new" element={<PostJob />} />
            </Route>

            {/* ── Admin Routes (protected) ── */}
            <Route
              path="/admin"
              element={<ProtectedRoute allowedRoles={['admin']} />}
            >
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<ManageStudents />} />
            </Route>

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        {/* Floating AI chat button — renders on all student pages except /student/chat */}
        <FloatingChatButton />
      </BrowserRouter>
    </AuthProvider>
  );
}
