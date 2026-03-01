import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const MAIN_NAV = [
  { to: '/admin',          icon: 'dashboard',        label: 'Dashboard',       exact: true },
  { to: '/admin/students', icon: 'school',            label: 'Students' },
  { to: '#',               icon: 'business_center',   label: 'Recruiters',      soon: true },
  { to: '#',               icon: 'event_available',   label: 'Placement Drives', soon: true },
];

const SETTINGS_NAV = [
  { to: '#', icon: 'settings', label: 'System Settings', soon: true },
];

const BOTTOM_NAV_ITEMS = [
  { to: '/admin',          icon: 'dashboard', label: 'Home',     exact: true },
  { to: '/admin/students', icon: 'school',    label: 'Students' },
];

export default function AdminSidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const drawerRef = useRef(null);

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('adminSidebarCollapsed') === 'true'
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
      localStorage.setItem('adminSidebarCollapsed', String(next));
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

  const allNavItems = [...MAIN_NAV, ...SETTINGS_NAV];

  return (
    <>
      {/* ── Desktop Sidebar (lg+) ────────────────────────────────────────────── */}
      <aside
        className={`relative hidden flex-shrink-0 flex-col justify-between bg-[#0a1628] text-white shadow-xl lg:flex h-full transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[4.5rem] p-2' : 'w-72 p-6'
        }`}
      >
        {/* Toggle button */}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-8 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-[#0a1628] border border-white/20 text-white shadow-md hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        {/* Scrollable top area */}
        <div className="flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 pb-2 scrollbar-hide">
          {/* Logo */}
          <Link
            to="/admin"
            className={`flex items-center flex-shrink-0 ${collapsed ? 'justify-center py-1' : 'gap-3 px-2 w-fit'}`}
          >
            <div className="size-9 bg-[#c6a43f] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#0d1b2e]">school</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white leading-tight whitespace-nowrap">EvolvEd</span>
                <span className="text-xs text-slate-400">Admin Portal</span>
              </div>
            )}
          </Link>

          {/* Main Nav */}
          <div className="flex flex-col gap-5">
            <div>
              {!collapsed && (
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Main Menu</p>
              )}
              <nav className="flex flex-col gap-1">
                {MAIN_NAV.map((item) => {
                  if (item.soon) {
                    return (
                      <div
                        key={item.label}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed select-none ${
                          collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2.5'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] flex-shrink-0">{item.icon}</span>
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
                      className={`flex items-center rounded-lg font-medium transition-colors text-sm ${
                        collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2.5'
                      } ${
                        active
                          ? 'bg-[#c6a43f]/10 text-[#c6a43f] border border-[#c6a43f]/20'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[20px] flex-shrink-0"
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

            {/* Settings Nav */}
            <div>
              {!collapsed && (
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Settings</p>
              )}
              <nav className="flex flex-col gap-1">
                {SETTINGS_NAV.map((item) => (
                  <div
                    key={item.label}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed select-none ${
                      collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2.5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] flex-shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 whitespace-nowrap">{item.label}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">
                          Soon
                        </span>
                      </>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleLogout}
                  title={collapsed ? 'Log Out' : undefined}
                  className={`flex items-center rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors mt-1 ${
                    collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2.5'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] flex-shrink-0">logout</span>
                  {!collapsed && <span className="whitespace-nowrap">Log Out</span>}
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Profile strip */}
        {collapsed ? (
          <div className="flex flex-col items-center gap-3 flex-shrink-0 pt-2">
            <div
              title={user?.name || 'Admin'}
              className="size-9 rounded-full bg-[#c6a43f]/20 border border-[#c6a43f]/30 flex items-center justify-center flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[#c6a43f] text-[18px]">admin_panel_settings</span>
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 pt-4 border-t border-slate-800/60">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5 border border-white/10">
              <div className="size-9 rounded-full bg-[#c6a43f]/20 border border-[#c6a43f]/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#c6a43f] text-[18px]">admin_panel_settings</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-400 truncate">Placement Officer</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── Mobile Bottom Navigation Bar (below lg) ─────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch bg-[#0a1628] border-t border-white/10 shadow-2xl">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                active ? 'text-[#c6a43f]' : 'text-slate-400 hover:text-white'
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

        {/* More button */}
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
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a1628] rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out ${
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
            <div className="size-8 bg-[#c6a43f] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0d1b2e] text-xl">school</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white leading-tight">EvolvEd</span>
              <span className="text-xs text-slate-400">Admin Portal</span>
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
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Main Menu</p>
          <nav className="flex flex-col gap-1 mb-4">
            {MAIN_NAV.map((item) => {
              if (item.soon) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed select-none"
                  >
                    <span className="material-symbols-outlined flex-shrink-0 text-[20px]">{item.icon}</span>
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
                      ? 'bg-[#c6a43f]/10 text-[#c6a43f] border border-[#c6a43f]/20'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className="material-symbols-outlined flex-shrink-0 text-[20px]"
                    style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Settings</p>
          <nav className="flex flex-col gap-1">
            {SETTINGS_NAV.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed select-none"
              >
                <span className="material-symbols-outlined flex-shrink-0 text-[20px]">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">
                  Soon
                </span>
              </div>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <span className="material-symbols-outlined flex-shrink-0 text-[20px]">logout</span>
              <span>Log Out</span>
            </button>
          </nav>
        </div>

        {/* User row */}
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-[#c6a43f]/20 border border-[#c6a43f]/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#c6a43f] text-2xl">admin_panel_settings</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">Placement Officer</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
