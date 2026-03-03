import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import FloatingChatButton from './components/FloatingChatButton.jsx';
import StudentSidebar from './components/StudentSidebar.jsx';
import RecruiterSidebar from './components/RecruiterSidebar.jsx';
import AdminSidebar from './components/AdminSidebar.jsx';

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
const StudentAssessments  = lazy(() => import('./pages/StudentAssessments.jsx'));
const AssessmentBreakdown = lazy(() => import('./pages/AssessmentBreakdown.jsx'));
const StudentResumes      = lazy(() => import('./pages/StudentResumes.jsx'));
const StudentLearningPace = lazy(() => import('./pages/StudentLearningPace.jsx'));
const StudentChat         = lazy(() => import('./pages/StudentChat.jsx'));
const StudentRoadmaps     = lazy(() => import('./pages/StudentRoadmaps.jsx'));
const RoadmapView         = lazy(() => import('./pages/RoadmapView.jsx'));
const MockInterview       = lazy(() => import('./pages/MockInterview.jsx'));
const InterviewSession    = lazy(() => import('./pages/InterviewSession.jsx'));
const Leaderboard         = lazy(() => import('./pages/Leaderboard.jsx'));
const StudentApplications = lazy(() => import('./pages/StudentApplications.jsx'));

// Recruiter Pages (lazy-loaded)
const RecruiterDashboard  = lazy(() => import('./pages/RecruiterDashboard.jsx'));
const CandidateSearch     = lazy(() => import('./pages/CandidateSearch.jsx'));
const CandidateProfile    = lazy(() => import('./pages/CandidateProfile.jsx'));
const RecruiterJobs       = lazy(() => import('./pages/RecruiterJobs.jsx'));
const PostJob             = lazy(() => import('./pages/PostJob.jsx'));
const JobApplicants       = lazy(() => import('./pages/JobApplicants.jsx'));
const RecruiterProfile    = lazy(() => import('./pages/RecruiterProfile.jsx'));
const RecruiterAnalytics  = lazy(() => import('./pages/RecruiterAnalytics.jsx'));

// Admin Pages (lazy-loaded)
const AdminDashboard      = lazy(() => import('./pages/AdminDashboard.jsx'));
const ManageStudents      = lazy(() => import('./pages/ManageStudents.jsx'));
const AdminStudentDetail  = lazy(() => import('./pages/AdminStudentDetail.jsx'));
const AdminRecruiters     = lazy(() => import('./pages/AdminRecruiters.jsx'));
const AdminPlacementDrives = lazy(() => import('./pages/AdminPlacementDrives.jsx'));
const AdminCompanies      = lazy(() => import('./pages/AdminCompanies.jsx'));

// ── Page-level transition variants ────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

// ── Animated page wrapper (used inside shells) ─────────────────────────────────
function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ display: 'contents' }}
    >
      {children}
    </motion.div>
  );
}

// ── Content-area spinner (sidebar stays visible) ──────────────────────────────
function ContentLoader() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background-light">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Full-page spinner for full-screen routes without a shell (e.g. InterviewSession)
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── Animated outlet wrapper — keeps sidebar stable, only animates content ──────
function AnimatedOutlet() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

// ── Persistent student shell ───────────────────────────────────────────────────
function StudentShell() {
  return (
    <div className="flex h-screen w-full flex-row overflow-hidden bg-background-light">
      <StudentSidebar />
      <div className="flex flex-1 flex-col overflow-hidden pb-16 lg:pb-0">
        <Suspense fallback={<ContentLoader />}>
          <AnimatedOutlet />
        </Suspense>
      </div>
    </div>
  );
}

// ── Persistent recruiter shell ─────────────────────────────────────────────────
function RecruiterShell() {
  return (
    <div className="flex h-screen w-full flex-row overflow-hidden bg-background-light">
      <RecruiterSidebar />
      <div className="flex flex-1 flex-col overflow-hidden pb-16 lg:pb-0">
        <Suspense fallback={<ContentLoader />}>
          <AnimatedOutlet />
        </Suspense>
      </div>
    </div>
  );
}

// ── Persistent admin shell ─────────────────────────────────────────────────────
function AdminShell() {
  return (
    <div className="flex h-screen w-full flex-row overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden pb-16 lg:pb-0">
        <Suspense fallback={<ContentLoader />}>
          <AnimatedOutlet />
        </Suspense>
      </div>
    </div>
  );
}

// ── Top-level route transition (public pages) ──────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
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
          <Route element={<StudentShell />}>
            <Route index element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="projects" element={<StudentProjects />} />
            <Route path="certifications" element={<StudentCertifications />} />
            <Route path="events" element={<StudentEvents />} />
            <Route path="coding" element={<StudentCodingProfile />} />
            <Route path="assessments" element={<StudentAssessments />} />
            <Route path="assessments/:id" element={<AssessmentBreakdown />} />
            <Route path="resumes" element={<StudentResumes />} />
            <Route path="learning-pace" element={<StudentLearningPace />} />
            <Route path="roadmaps" element={<StudentRoadmaps />} />
            <Route path="roadmaps/:id" element={<RoadmapView />} />
            <Route path="interviews" element={<MockInterview />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="chat" element={<StudentChat />} />
            <Route path="applications" element={<StudentApplications />} />
          </Route>
          {/* Full-screen immersive interview — no sidebar, outside the shell */}
          <Route
            path="interviews/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <InterviewSession />
              </Suspense>
            }
          />
        </Route>

        {/* ── Recruiter Routes (protected) ── */}
        <Route
          path="/recruiter"
          element={<ProtectedRoute allowedRoles={['recruiter']} />}
        >
          <Route element={<RecruiterShell />}>
            <Route index element={<RecruiterDashboard />} />
            <Route path="candidates" element={<CandidateSearch />} />
            <Route path="candidates/:id" element={<CandidateProfile />} />
            <Route path="jobs" element={<RecruiterJobs />} />
            <Route path="jobs/new" element={<PostJob />} />
            <Route path="jobs/:jobId/edit" element={<PostJob />} />
            <Route path="jobs/:jobId/applicants" element={<JobApplicants />} />
            <Route path="profile" element={<RecruiterProfile />} />
            <Route path="analytics" element={<RecruiterAnalytics />} />
          </Route>
        </Route>

        {/* ── Admin Routes (protected) ── */}
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={['admin']} />}
        >
          <Route element={<AdminShell />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="students/:id" element={<AdminStudentDetail />} />
            <Route path="recruiters" element={<AdminRecruiters />} />
            <Route path="placement-drives" element={<AdminPlacementDrives />} />
            <Route path="companies" element={<AdminCompanies />} />
          </Route>
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AnimatedRoutes />
        {/* Floating AI chat button — renders on all student pages except /student/chat */}
        <FloatingChatButton />
      </BrowserRouter>
    </AuthProvider>
  );
}
