import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/student',                  icon: 'dashboard',          label: 'Dashboard',          exact: true },
  { to: '/student/profile',          icon: 'manage_accounts',    label: 'My Profile' },
  { to: '/student/projects',         icon: 'code',               label: 'Projects' },
  { to: '/student/certifications',   icon: 'workspace_premium',  label: 'Certifications' },
  { to: '/student/events',           icon: 'event',              label: 'Events' },
  { to: '/student/coding',           icon: 'terminal',           label: 'Coding Profile' },
  { to: '/student/resumes',          icon: 'receipt_long',       label: 'Resumes' },
  { to: '/student/learning-pace',    icon: 'speed',              label: 'Learning Pace' },
  { to: '/student/roadmaps',         icon: 'map',                label: 'Roadmaps' },
  { to: '/student/leaderboard',      icon: 'leaderboard',        label: 'Leaderboard' },
  { to: '/student/interviews',       icon: 'mic',                label: 'Mock Interviews' },
  { to: '/student/chat',             icon: 'smart_toy',          label: 'AI Assistant',       highlight: true },
  { to: null, icon: 'work',          label: 'Jobs & Placements', soon: true },
];

// The 5 most important nav items shown in the bottom bar
const BOTTOM_NAV_ITEMS = [
  { to: '/student',               icon: 'dashboard',   label: 'Home',      exact: true },
  { to: '/student/roadmaps',      icon: 'map',         label: 'Roadmaps' },
  { to: '/student/chat',          icon: 'smart_toy',   label: 'AI',        highlight: true },
  { to: '/student/interviews',    icon: 'mic',         label: 'Interviews' },
  { to: '/student/leaderboard',   icon: 'leaderboard', label: 'Leaderboard' },
];

export default function StudentSidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const drawerRef = useRef(null);

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );

  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Close drawer on outside click
  useEffect(() => {
    if (!drawerOpen) return;
    function handleClick(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [drawerOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  function toggleCollapsed() {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', String(next));
      return next;
    });
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function isActive(item) {
    if (!item.to) return false;
    if (item.exact) return pathname === item.to;
    return pathname.startsWith(item.to);
  }

  return (
    <>
      {/* ── Desktop Sidebar (lg+) ────────────────────────────────────────────── */}
      <aside
        className={`relative hidden flex-shrink-0 flex-col justify-between bg-secondary text-white shadow-xl lg:flex h-full transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[4.5rem] p-2' : 'w-72 p-6'
        }`}
      >
        {/* Toggle button */}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-8 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-secondary border border-white/20 text-white shadow-md hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        {/* Scrollable top area */}
        <div className="flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 pb-2 scrollbar-hide">
          {/* Logo */}
          <Link
            to="/student"
            className={`flex items-center flex-shrink-0 ${collapsed ? 'justify-center py-1' : 'gap-3 px-2 w-fit'}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-secondary flex-shrink-0">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            {!collapsed && (
              <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap overflow-hidden">EvolvEd</span>
            )}
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              if (item.soon) {
                return (
                  <div
                    key={item.label}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed select-none ${
                      collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
                    }`}
                  >
                    <span className="material-symbols-outlined flex-shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 whitespace-nowrap">{item.label}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">
                          Soon
                        </span>
                      </>
                    )}
                  </div>
                );
              }

              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
                    collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
                  } ${
                    active
                      ? 'bg-white/10 text-white'
                      : item.highlight
                      ? 'text-primary hover:bg-white/10 hover:text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined flex-shrink-0 ${
                      item.highlight && !active ? 'text-primary' : ''
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 whitespace-nowrap">{item.label}</span>
                      {item.highlight && !active && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        {collapsed ? (
          /* Collapsed: avatar + logout icon */
          <div className="flex flex-col items-center gap-3 flex-shrink-0 pt-2">
            <div
              title={user?.name || 'Student'}
              onClick={() => navigate('/student/profile')}
              className="h-9 w-9 rounded-full flex-shrink-0 bg-slate-700 flex items-center justify-center overflow-hidden cursor-pointer border border-white/10"
              style={
                user?.avatarUrl
                  ? { backgroundImage: `url(${user.avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : {}
              }
            >
              {!user?.avatarUrl && (
                <span className="material-symbols-outlined text-xl text-slate-400">person</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        ) : (
          /* Expanded: pro tip + full profile row */
          <div className="flex flex-col gap-4 flex-shrink-0 pt-2">
            <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 border border-primary/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-sm">stars</span>
                </div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Pro Tip</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Update your GitHub links to boost your technical score by 5%.
              </p>
            </div>

            <div className="h-px bg-white/10" />

            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5 border border-white/10">
              <div
                className="h-10 w-10 rounded-full flex-shrink-0 bg-slate-700 flex items-center justify-center overflow-hidden"
                style={
                  user?.avatarUrl
                    ? { backgroundImage: `url(${user.avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : {}
                }
              >
                {!user?.avatarUrl && (
                  <span className="material-symbols-outlined text-2xl text-slate-400">person</span>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Student'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.department || 'Student'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── Mobile Bottom Navigation Bar (below lg) ─────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch bg-secondary border-t border-white/10 shadow-2xl">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                active
                  ? 'text-primary'
                  : item.highlight
                  ? 'text-primary/70 hover:text-primary'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
              {item.highlight && !active && (
                <span className="absolute top-2 w-1.5 h-1.5 rounded-full bg-primary animate-ping opacity-75" />
              )}
            </Link>
          );
        })}

        {/* "More" button opens full drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-slate-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      </nav>

      {/* ── Mobile Drawer (full nav, slides up from bottom) ──────────────────── */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-secondary rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-secondary">
              <span className="material-symbols-outlined text-xl">school</span>
            </div>
            <span className="text-base font-bold text-white">EvolvEd</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable nav list */}
        <div className="overflow-y-auto px-4 py-3" style={{ maxHeight: 'calc(85vh - 130px)' }}>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              if (item.soon) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed select-none"
                  >
                    <span className="material-symbols-outlined flex-shrink-0">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">
                      Soon
                    </span>
                  </div>
                );
              }

              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-white/10 text-white'
                      : item.highlight
                      ? 'text-primary hover:bg-white/10 hover:text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined flex-shrink-0 ${
                      item.highlight && !active ? 'text-primary' : ''
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.highlight && !active && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User row + logout */}
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex-shrink-0 bg-slate-700 flex items-center justify-center overflow-hidden"
              style={
                user?.avatarUrl
                  ? { backgroundImage: `url(${user.avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : {}
              }
            >
              {!user?.avatarUrl && (
                <span className="material-symbols-outlined text-2xl text-slate-400">person</span>
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Student'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.department || 'Student'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
