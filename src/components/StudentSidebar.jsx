import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/student', icon: 'dashboard', label: 'Dashboard', exact: true },
  { to: '/student/assessments/latest', icon: 'description', label: 'Assessments' },
  { to: '#', icon: 'verified', label: 'Skills Profile' },
  { to: '#', icon: 'work', label: 'Jobs & Placements' },
  { to: '#', icon: 'analytics', label: 'Analytics' },
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
    if (item.exact) return pathname === item.to;
    return pathname.startsWith(item.to) && item.to !== '#';
  }

  return (
    <aside className="hidden w-72 flex-shrink-0 flex-col justify-between bg-secondary p-6 text-white shadow-xl lg:flex h-screen sticky top-0">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <Link to="/student" className="flex items-center gap-3 px-2 w-fit">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-secondary">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">EvolvEd</span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive(item)
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-4">
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

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pt-2 px-2">
          <div
            className="h-10 w-10 rounded-full bg-cover bg-center flex-shrink-0"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDCrZJKLhl8RTIQpkrAF7a4lJ1fB6xVt9WoZYc1XhyIhkvbXqkI0SKWUxLSN8QlHy-2DKy-MB3ASBCXbFfVajufE6pA3aA223SiZpLA1fanVPooiDg7Nd4J26QV0cUtS8LTBmjHUizHxLt6OYMBzrjKyjxem6NYNnmBacQEyCdPPHUwQ-y-7CTN8fIJV_u013JUIIoGDDpprR49BKMudxpxnP3oTfLtrOjUF09BjnFkljIS0cQRiUUuVnJHspZystILPFvz3EtRuWN0')",
            }}
          />
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Student'}</p>
            <p className="text-xs text-slate-400">Comp Sci, Year 4</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
