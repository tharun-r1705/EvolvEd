import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const MAIN_NAV = [
  { to: '/admin', icon: 'dashboard', label: 'Dashboard', exact: true },
  { to: '/admin/students', icon: 'school', label: 'Students' },
  { to: '#', icon: 'business_center', label: 'Recruiters' },
  { to: '#', icon: 'event_available', label: 'Placement Drives' },
];

const SETTINGS_NAV = [
  { to: '#', icon: 'settings', label: 'System Settings' },
];

export default function AdminSidebar() {
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
    <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col bg-[#0a1628] border-r border-slate-800/60 h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800/60">
        <Link to="/admin" className="flex items-center gap-3 w-fit">
          <div className="size-9 bg-[#c6a43f] rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[#0d1b2e]">school</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">EvolvEd</h1>
            <p className="text-slate-400 text-xs">Admin Portal</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex flex-col flex-1 px-4 py-6 overflow-y-auto">
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Main Menu</p>
          <nav className="space-y-1">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                  isActive(item)
                    ? 'bg-[#c6a43f]/10 text-[#c6a43f] border border-[#c6a43f]/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Settings</p>
          <nav className="space-y-1">
            {SETTINGS_NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white font-medium transition-colors text-sm"
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg font-medium transition-colors mt-1 text-sm"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Log Out
            </button>
          </nav>
        </div>
      </div>

      {/* Profile strip */}
      <div className="px-5 py-4 border-t border-slate-800/60 flex items-center gap-3">
        <div className="size-9 rounded-full bg-[#c6a43f]/20 border border-[#c6a43f]/30 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[#c6a43f] text-[18px]">admin_panel_settings</span>
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
          <p className="text-xs text-slate-400">Placement Officer</p>
        </div>
      </div>
    </aside>
  );
}
