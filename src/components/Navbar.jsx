import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Global Navbar used on public-facing pages (/ and /login).
 * Shows role-aware links when the user is logged in.
 */
export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  function getDashboardLink() {
    if (role === 'student') return '/student';
    if (role === 'recruiter') return '/recruiter';
    if (role === 'admin') return '/admin';
    return '/';
  }

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 py-4 lg:px-40 bg-white dark:bg-background-dark sticky top-0 z-50 shadow-sm">
      {/* ── Brand ── */}
      <div className="flex items-center gap-4 text-midnight-navy dark:text-white">
        <div className="size-8 flex items-center justify-center rounded bg-primary/20 text-primary">
          <span className="material-symbols-outlined !text-[24px]">school</span>
        </div>
        <Link to="/">
          <h2 className="text-midnight-navy dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
            EvolvEd
          </h2>
        </Link>
      </div>

      {/* ── Desktop nav ── */}
      <div className="hidden lg:flex flex-1 justify-end gap-8 items-center">
        <div className="flex items-center gap-9">
          <a
            href="#features"
            className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal hover:text-primary transition-colors font-sans"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal hover:text-primary transition-colors font-sans"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal hover:text-primary transition-colors font-sans"
          >
            Pricing
          </a>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal hover:text-primary transition-colors font-sans"
              >
                {role === 'student' && 'My Dashboard'}
                {role === 'recruiter' && 'Recruiter Dashboard'}
                {role === 'admin' && 'Admin Dashboard'}
              </Link>
              <button
                onClick={handleLogout}
                className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal hover:text-primary transition-colors font-sans"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal hover:text-primary transition-colors font-sans"
            >
              Login
            </Link>
          )}
        </div>

        {!isAuthenticated && (
          <Link to="/login">
            <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary hover:bg-primary-dark text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors font-sans shadow-md">
              <span className="truncate">Get Started</span>
            </button>
          </Link>
        )}
      </div>

      {/* ── Mobile hamburger ── */}
      <button className="lg:hidden text-slate-900 dark:text-white">
        <span className="material-symbols-outlined">menu</span>
      </button>
    </header>
  );
}
