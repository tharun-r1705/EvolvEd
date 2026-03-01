import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/student',                  icon: 'dashboard',          label: 'Dashboard',          exact: true },
  { to: '/student/profile',          icon: 'manage_accounts',    label: 'My Profile' },
  { to: '/student/projects',         icon: 'code',               label: 'Projects' },
  { to: '/student/certifications',   icon: 'workspace_premium',  label: 'Certifications' },
  { to: '/student/events',           icon: 'event',              label: 'Events' },
  { to: '/student/coding',           icon: 'terminal',           label: 'Coding Profile' },
  { to: '/student/assessments/1',    icon: 'description',        label: 'Assessments' },
  { to: '/student/resumes',          icon: 'description',        label: 'Resumes' },
  { to: '/student/learning-pace',    icon: 'speed',              label: 'Learning Pace' },
  { to: '/student/roadmaps',         icon: 'map',                label: 'Roadmaps' },
  { to: '/student/chat',             icon: 'smart_toy',          label: 'AI Assistant',       highlight: true },
  { to: null, icon: 'work',          label: 'Jobs & Placements', soon: true },
];

export default function StudentSidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
    <aside className="hidden w-72 flex-shrink-0 flex-col justify-between bg-secondary p-6 text-white shadow-xl lg:flex h-full">
      <div className="flex flex-col gap-8 overflow-y-auto flex-1 min-h-0 pb-2">
        {/* Logo */}
        <Link to="/student" className="flex items-center gap-3 px-2 w-fit flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-secondary">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">EvolvEd</span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) =>
            item.soon ? (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed select-none"
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">Soon</span>
              </div>
            ) : (
            <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(item)
                    ? 'bg-white/10 text-white'
                    : item.highlight
                    ? 'text-primary hover:bg-white/10 hover:text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined ${item.highlight && !isActive(item) ? 'text-primary' : ''}`}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.highlight && !isActive(item) && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                )}
              </Link>
            )
          )}
        </nav>
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-4 flex-shrink-0 pt-2">
        {/* Pro Tip */}
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

        {/* Profile + Logout */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5 border border-white/10">
          <div
            className="h-10 w-10 rounded-full flex-shrink-0 bg-slate-700 flex items-center justify-center overflow-hidden"
            style={user?.avatarUrl ? { backgroundImage: `url(${user.avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
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
    </aside>
  );
}
