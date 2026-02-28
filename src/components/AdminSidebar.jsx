import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const MAIN_NAV = [
  { to: '/admin', icon: 'dashboard', label: 'Dashboard', exact: true },
  { to: '/admin/students', icon: 'school', label: 'Students' },
  { to: '#', icon: 'work', label: 'Recruiters' },
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
    <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col bg-surface-light border-r border-gray-200 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link to="/admin" className="flex items-center gap-3 w-fit">
          <div className="size-9 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-tight text-secondary leading-tight">EvolvEd</h1>
            <p className="text-text-muted text-xs">Admin Portal</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex flex-col flex-1 px-4 py-6 overflow-y-auto">
        <div className="mb-6">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-2">Main Menu</p>
          <nav className="space-y-1">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                  isActive(item)
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-muted hover:bg-gray-50 hover:text-secondary'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-2">Settings</p>
          <nav className="space-y-1">
            {SETTINGS_NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:bg-gray-50 hover:text-secondary font-medium transition-colors text-sm"
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors mt-1 text-sm"
            >
              <span className="material-symbols-outlined">logout</span>
              Log Out
            </button>
          </nav>
        </div>
      </div>

      {/* Profile strip */}
      <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
        <div
          className="h-9 w-9 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white shadow-sm flex-shrink-0"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDt47R6dTB7pGUnquj1hpZbcYarpFyBeSO4qfXy0qdRSNBTwhnUAkCy24Su6CssXotJBspSzYur5qBiSOhWvE1qW4UD7Rs0a39GtrHf9XwfvFq2GkPB9hbPH4J4pOLPBFYr_jeZBQiY86OTzGhuPjsKEV1qGEXnfc2OmQdysMv69EeI7rEFtNEX1oDSaXDDG3Vd9cS-J7IGrmrDIJEilLkzDwVMEjDJXfFkGqiFOP4CXD-QhS9bh1iheBiJP9Yg055CAX0VVO05dsoc')" }}
        />
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium text-secondary truncate">{user?.name || 'Alex Morgan'}</p>
          <p className="text-xs text-text-muted">Placement Officer</p>
        </div>
      </div>
    </aside>
  );
}
