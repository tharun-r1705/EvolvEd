import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/recruiter', icon: 'dashboard', label: 'Dashboard', exact: true },
  { to: '/recruiter/jobs/new', icon: 'work', label: 'Jobs' },
  { to: '/recruiter/candidates', icon: 'group', label: 'Candidates' },
  { to: '#', icon: 'calendar_month', label: 'Interviews' },
  { to: '#', icon: 'analytics', label: 'Reports' },
];

export default function RecruiterSidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function isActive(item) {
    if (item.exact) return pathname === item.to;
    return pathname.startsWith(item.to) && item.to !== '#';
  }

  return (
    <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col justify-between bg-midnight px-4 py-6 border-r border-slate-800 text-slate-100 h-full">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <Link to="/recruiter" className="flex items-center gap-3 px-2 w-fit">
          <div className="flex items-center justify-center rounded-lg bg-primary size-10 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-2xl">school</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-lg font-bold leading-tight tracking-tight">EvolvEd</h1>
            <p className="text-slate-400 text-xs font-normal">Recruiter Portal</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item)
                  ? 'bg-primary/20 text-primary border border-primary/10'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive(item) ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors w-full text-left text-sm font-medium"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
        <div className="mt-3 border-t border-slate-700 pt-4 px-3 flex items-center gap-3">
          <div
            className="size-8 rounded-full bg-slate-600 bg-cover bg-center flex-shrink-0"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCPP7j22FyeRJxcRCZoZ0LtmefnbkePCpYKhE3dUdLeyr-ykzyGYWHlpo3fqlFAd3iaNAx8huH-ZWJmQAQJT1o5KL0e_EUrrk-YZcVSFNWfcizCBlD4qKXIMgSE3jUJQhSVO1ndiiKWyqaAMobOzQXSpJYUFJWZQWtSmD0I50hBLWE8QwXGSxzYRqnul6FQSr-Jhp6MThy9xcdKDqOdY2KoU-JVKnPd8OcdeF3QP9wu7fdzZvOywyoseWwTMsYQRxGxwqMPJoe3WPWO')",
            }}
          />
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Alex Morgan'}</p>
            <p className="text-xs text-slate-400">Tech Recruiter</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
