import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Footer from './Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { isAuthenticated, role } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  function getDashboardLink() {
    if (role === 'student') return '/student';
    if (role === 'recruiter') return '/recruiter';
    if (role === 'admin') return '/admin';
    return '/';
  }

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#pricing', label: 'Pricing' },
  ];

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased">

      {/* ── Top Navbar ── */}
      <header
        className={[
          'fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500',
          isScrolled
            ? 'bg-[#080f1e]/95 backdrop-blur-xl shadow-[0_1px_0_rgba(198,164,63,0.12),0_8px_32px_rgba(0,0,0,0.4)]'
            : 'bg-transparent',
        ].join(' ')}
      >
        {/* Subtle top gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 h-16 flex items-center justify-between gap-8">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="size-8 flex items-center justify-center rounded-lg bg-primary/15 border border-primary/30 text-primary group-hover:bg-primary/25 transition-all duration-300 shadow-[0_0_12px_rgba(198,164,63,0.2)]">
              <span className="material-symbols-outlined !text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white text-lg font-bold tracking-[-0.02em] group-hover:text-primary transition-colors duration-300">EvolvEd</span>
              <span className="text-primary/60 text-[9px] font-semibold uppercase tracking-[0.15em] hidden sm:block">Placement Intelligence</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="nav-link-premium relative px-4 py-2 text-white/75 text-sm font-medium hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
              >
                {label}
              </a>
            ))}
            {isAuthenticated && (
              <Link
                to={getDashboardLink()}
                className="nav-link-premium relative px-4 py-2 text-white/75 text-sm font-medium hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
              >
                My Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="flex items-center gap-2 h-9 px-5 rounded-lg bg-primary hover:bg-primary-dark text-midnight-navy text-sm font-bold transition-all duration-300 shadow-[0_0_20px_rgba(198,164,63,0.25)] hover:shadow-[0_0_28px_rgba(198,164,63,0.4)] hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined !text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="h-9 px-5 rounded-lg border border-white/20 text-white/85 hover:text-white hover:border-white/40 hover:bg-white/5 text-sm font-semibold transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 h-9 px-5 rounded-lg bg-primary hover:bg-primary-dark text-midnight-navy text-sm font-bold transition-all duration-300 shadow-[0_0_20px_rgba(198,164,63,0.25)] hover:shadow-[0_0_28px_rgba(198,164,63,0.4)] hover:scale-[1.02]"
                >
                  Get Started
                  <span className="material-symbols-outlined !text-[15px]">arrow_forward</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden flex items-center justify-center size-9 rounded-lg border border-white/15 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined !text-[22px]">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ── */}
      <div
        className={[
          'lg:hidden fixed inset-0 z-40 transition-all duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        {/* Slide-in Panel */}
        <div
          className={[
            'absolute top-0 right-0 h-full w-72 bg-[#0a1628] border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-out',
            mobileOpen ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="size-7 flex items-center justify-center rounded-md bg-primary/20 border border-primary/30 text-primary">
                <span className="material-symbols-outlined !text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <span className="text-white text-base font-bold">EvolvEd</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="size-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined !text-[20px]">close</span>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1 px-4 pt-6 flex-1">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/75 hover:text-white hover:bg-white/8 text-base font-medium transition-colors"
              >
                {label}
              </a>
            ))}
            {isAuthenticated && (
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/75 hover:text-white hover:bg-white/8 text-base font-medium transition-colors"
              >
                <span className="material-symbols-outlined !text-[18px]">dashboard</span>
                My Dashboard
              </Link>
            )}
          </nav>

          {/* Panel Footer CTA */}
          <div className="px-4 pb-8 flex flex-col gap-3 border-t border-white/10 pt-6">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:bg-primary-dark text-midnight-navy font-bold text-base transition-all shadow-[0_0_20px_rgba(198,164,63,0.3)]"
              >
                <span className="material-symbols-outlined !text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center h-12 rounded-xl border border-white/25 text-white font-semibold text-base hover:bg-white/5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:bg-primary-dark text-midnight-navy font-bold text-base transition-all shadow-[0_0_20px_rgba(198,164,63,0.3)]"
                >
                  Get Started
                  <span className="material-symbols-outlined !text-[16px]">arrow_forward</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Page Content ── */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
