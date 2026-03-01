import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Global Navbar used on public-facing pages (/ and /login).
 * Shows role-aware links when the user is logged in.
 */
export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  function handleLogout() {
    logout();
    navigate('/');
    setMobileOpen(false);
  }

  function getDashboardLink() {
    if (role === 'student') return '/student';
    if (role === 'recruiter') return '/recruiter';
    if (role === 'admin') return '/admin';
    return '/';
  }

  // Close menu when clicking outside
  useEffect(() => {
    if (!mobileOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen]);

  return (
    <header className="relative border-b border-white/10 bg-midnight-navy sticky top-0 z-50">
      <div className="flex items-center justify-between whitespace-nowrap px-6 py-4 lg:px-40">
        {/* ── Brand ── */}
        <div className="flex items-center gap-4 text-white">
          <div className="size-8 flex items-center justify-center rounded bg-primary/20 text-primary">
            <span className="material-symbols-outlined !text-[24px]">school</span>
          </div>
          <Link to="/">
            <h2 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
              EvolvEd
            </h2>
          </Link>
        </div>

        {/* ── Desktop nav ── */}
        <div className="hidden lg:flex flex-1 justify-end gap-8 items-center">
          <div className="flex items-center gap-9">
            <a
              href="#features"
              className="text-slate-300 text-sm font-medium leading-normal hover:text-white transition-colors font-sans"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-slate-300 text-sm font-medium leading-normal hover:text-white transition-colors font-sans"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-slate-300 text-sm font-medium leading-normal hover:text-white transition-colors font-sans"
            >
              Pricing
            </a>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-slate-300 text-sm font-medium leading-normal hover:text-white transition-colors font-sans"
                >
                  {role === 'student' && 'My Dashboard'}
                  {role === 'recruiter' && 'Recruiter Dashboard'}
                  {role === 'admin' && 'Admin Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-300 text-sm font-medium leading-normal hover:text-white transition-colors font-sans"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-slate-300 text-sm font-medium leading-normal hover:text-white transition-colors font-sans"
              >
                Login
              </Link>
            )}
          </div>

          {!isAuthenticated && (
            <Link to="/login">
              <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary hover:bg-primary-dark text-midnight-navy text-sm font-bold leading-normal tracking-[0.015em] transition-colors font-sans shadow-md">
                <span className="truncate">Get Started</span>
              </button>
            </Link>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="lg:hidden text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span className="material-symbols-outlined">
            {mobileOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* ── Mobile dropdown menu ── */}
      <div
        ref={menuRef}
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 pb-4 bg-midnight-navy border-t border-white/10">
          <a
            href="#features"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2.5 text-slate-300 text-sm font-medium hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2.5 text-slate-300 text-sm font-medium hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2.5 text-slate-300 text-sm font-medium hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Pricing
          </a>

          <div className="h-px bg-white/10 my-1" />

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-slate-300 text-sm font-medium hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {role === 'student' && 'My Dashboard'}
                {role === 'recruiter' && 'Recruiter Dashboard'}
                {role === 'admin' && 'Admin Dashboard'}
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2.5 text-left text-slate-300 text-sm font-medium hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-slate-300 text-sm font-medium hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full mt-1 flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary hover:bg-primary-dark text-midnight-navy text-sm font-bold leading-normal tracking-[0.015em] transition-colors font-sans shadow-md">
                  <span className="truncate">Get Started</span>
                </button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
