import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/student',                  icon: 'dashboard',          label: 'Dashboard',          exact: true },
  { to: '/student/profile',          icon: 'manage_accounts',    label: 'My Profile' },
  { to: '/student/projects',         icon: 'code',               label: 'Projects' },
  { to: '/student/certifications',   icon: 'workspace_premium',  label: 'Certifications' },
  { to: '/student/events',           icon: 'event',              label: 'Events' },
  { to: '/student/coding',           icon: 'terminal',           label: 'Coding Profile' },
  { to: '/student/assessments',      icon: 'description',        label: 'Assessments' },
  { to: '/student/resumes',          icon: 'receipt_long',       label: 'Resumes' },
  { to: '/student/learning-pace',    icon: 'speed',              label: 'Learning Pace' },
  { to: '/student/roadmaps',         icon: 'map',                label: 'Roadmaps' },
  { to: '/student/leaderboard',      icon: 'leaderboard',        label: 'Leaderboard' },
  { to: '/student/interviews',       icon: 'mic',                label: 'Mock Interviews' },
  { to: '/student/chat',             icon: 'smart_toy',          label: 'AI Assistant',       highlight: true },
  { to: null, icon: 'work',          label: 'Jobs & Placements', soon: true },
];

export default function StudentSidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );

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
  );
}
