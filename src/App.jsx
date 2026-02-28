import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

// Public Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import NotFound from './pages/NotFound.jsx';

// Student Pages
import StudentDashboard from './pages/StudentDashboard.jsx';
import AssessmentBreakdown from './pages/AssessmentBreakdown.jsx';

// Recruiter Pages
import RecruiterDashboard from './pages/RecruiterDashboard.jsx';
import CandidateSearch from './pages/CandidateSearch.jsx';
import CandidateProfile from './pages/CandidateProfile.jsx';
import PostJob from './pages/PostJob.jsx';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManageStudents from './pages/ManageStudents.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public Routes ── */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ── Student Routes (protected) ── */}
          <Route
            path="/student"
            element={<ProtectedRoute allowedRoles={['student']} />}
          >
            <Route index element={<StudentDashboard />} />
            <Route path="assessments/:id" element={<AssessmentBreakdown />} />
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
      </BrowserRouter>
    </AuthProvider>
  );
}
