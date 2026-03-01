import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/recruiter',            icon: 'dashboard',      label: 'Dashboard',  exact: true },
  { to: '/recruiter/jobs/new',   icon: 'work',           label: 'Jobs' },
  { to: '/recruiter/candidates', icon: 'group',          label: 'Candidates' },
  { to: '#',                     icon: 'calendar_month', label: 'Interviews', soon: true },
  { to: '#',                     icon: 'analytics',      label: 'Reports',    soon: true },
];

const BOTTOM_NAV_ITEMS = [
  { to: '/recruiter',            icon: 'dashboard', label: 'Home',       exact: true },
  { to: '/recruiter/candidates', icon: 'group',     label: 'Candidates' },
  { to: '/recruiter/jobs/new',   icon: 'work',      label: 'Jobs' },
];

export default function RecruiterSidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const drawerRef = useRef(null);

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('recruiterSidebarCollapsed') === 'true'
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

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

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  function toggleCollapsed() {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('recruiterSidebarCollapsed', String(next));
      return next;
    });
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function isActive(item) {
    if (!item.to || item.to === '#') return false;
    if (item.exact) return pathname === item.to;
    return pathname.startsWith(item.to);
  }

  return (
    <>
      {/* ── Desktop Sidebar (lg+) ────────────────────────────────────────────── */}
      <aside
        className={`relative hidden flex-shrink-0 flex-col justify-between bg-midnight text-white shadow-xl lg:flex h-full transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[4.5rem] p-2' : 'w-72 p-6'
        }`}
      >
        {/* Toggle button */}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-8 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-midnight border border-white/20 text-white shadow-md hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        {/* Scrollable top area */}
        <div className="flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 pb-2 scrollbar-hide">
          {/* Logo */}
          <Link
            to="/recruiter"
            className={`flex items-center flex-shrink-0 ${collapsed ? 'justify-center py-1' : 'gap-3 px-2 w-fit'}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-secondary flex-shrink-0 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-2xl">school</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white leading-tight whitespace-nowrap">EvolvEd</span>
                <span className="text-xs text-slate-400 font-normal">Recruiter Portal</span>
              </div>
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
                      ? 'bg-primary/20 text-primary border border-primary/10'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className="material-symbols-outlined flex-shrink-0"
                    style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && <span className="flex-1 whitespace-nowrap">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        {collapsed ? (
          <div className="flex flex-col items-center gap-3 flex-shrink-0 pt-2">
            <div
              title={user?.name || 'Recruiter'}
              className="size-9 rounded-full flex-shrink-0 bg-slate-700 flex items-center justify-center overflow-hidden border border-white/10"
            >
              <span className="material-symbols-outlined text-xl text-slate-400">person</span>
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
          <div className="flex flex-col gap-4 flex-shrink-0 pt-2">
            <div className="h-px bg-white/10" />
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5 border border-white/10">
              <div className="size-9 rounded-full flex-shrink-0 bg-[#c6a43f]/20 border border-[#c6a43f]/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[18px]">person</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Recruiter'}</p>
                <p className="text-xs text-slate-400 truncate">Tech Recruiter</p>
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch bg-midnight border-t border-white/10 shadow-2xl">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                active ? 'text-primary' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* More button opens full drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-slate-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      </nav>

      {/* ── Mobile Drawer ────────────────────────────────────────────────────── */}
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
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-midnight rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out ${
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
            <div className="flex flex-col">
              <span className="text-base font-bold text-white leading-tight">EvolvEd</span>
              <span className="text-xs text-slate-400">Recruiter Portal</span>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Nav list */}
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
                      ? 'bg-primary/20 text-primary border border-primary/10'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className="material-symbols-outlined flex-shrink-0"
                    style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User row */}
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full flex-shrink-0 bg-[#c6a43f]/20 border border-[#c6a43f]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">person</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Recruiter'}</p>
              <p className="text-xs text-slate-400 truncate">Tech Recruiter</p>
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
