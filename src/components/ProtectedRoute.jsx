import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Wraps a group of routes.
 * - If not authenticated → redirect to /login (preserving intended URL)
 * - If authenticated but wrong role → redirect to their own dashboard
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'student') return <Navigate to="/student" replace />;
    if (role === 'recruiter') return <Navigate to="/recruiter" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
