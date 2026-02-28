import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Footer from './Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { isAuthenticated, role } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 60);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function getDashboardLink() {
    if (role === 'student') return '/student';
    if (role === 'recruiter') return '/recruiter';
    if (role === 'admin') return '/admin';
    return '/';
  }

  const headerClass = isScrolled
    ? 'fixed inset-x-0 top-0 flex items-center justify-between whitespace-nowrap px-6 py-4 lg:px-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.08)] z-50 transition-all duration-300'
    : 'fixed inset-x-0 top-0 flex items-center justify-between whitespace-nowrap px-6 py-4 lg:px-40 bg-transparent border-b border-transparent shadow-none z-50 transition-all duration-300';

  const brandClass = isScrolled ? 'flex items-center gap-3 text-midnight-navy' : 'flex items-center gap-3 text-white';
  const navLinkClass = isScrolled
    ? 'text-slate-700 text-sm font-medium hover:text-primary transition-colors'
    : 'text-white/85 text-sm font-medium hover:text-primary transition-colors';
  const mobileMenuButtonClass = isScrolled ? 'lg:hidden text-midnight-navy' : 'lg:hidden text-white';

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased">
      {/* Top Navbar */}
      <header className={headerClass}>
        <Link to="/" className={brandClass}>
          <div className="size-8 flex items-center justify-center rounded bg-primary/20 text-primary">
            <span className="material-symbols-outlined !text-[24px]">school</span>
          </div>
          <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em]">EvolvEd</h2>
        </Link>

        <div className="hidden lg:flex flex-1 justify-end gap-8 items-center">
          <div className="flex items-center gap-9">
            <a href="#features" className={navLinkClass}>Features</a>
            <a href="#how-it-works" className={navLinkClass}>How It Works</a>
            <a href="#pricing" className={navLinkClass}>Pricing</a>
            {isAuthenticated ? (
              <Link to={getDashboardLink()} className={navLinkClass}>
                My Dashboard
              </Link>
            ) : (
              <Link to="/login" className={navLinkClass}>Login</Link>
            )}
          </div>
          {!isAuthenticated && (
            <Link to="/signup">
              <button className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary hover:bg-primary/90 text-midnight-navy text-sm font-bold tracking-wide transition-colors shadow-lg shadow-primary/20">
                Get Started
              </button>
            </Link>
          )}
        </div>

        <button className={mobileMenuButtonClass} onClick={() => setMobileOpen((v) => !v)}>
          <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
        </button>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-2xl backdrop-saturate-150 flex flex-col px-6 pt-20 pb-8 gap-4">
          {['#features', '#how-it-works', '#pricing'].map((href, i) => (
            <a key={href} href={href} onClick={() => setMobileOpen(false)}
              className="text-white/80 hover:text-primary py-3 border-b border-white/15 text-base font-medium"
            >{['Features', 'How It Works', 'Pricing'][i]}</a>
          ))}
          <div className="flex flex-col gap-3 mt-4">
            {isAuthenticated ? (
              <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)}
                className="text-center py-3 rounded-lg bg-primary text-midnight-navy font-bold"
              >My Dashboard</Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="text-center py-3 rounded-lg border border-white/25 text-white font-semibold"
                >Login</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)}
                  className="text-center py-3 rounded-lg bg-primary text-midnight-navy font-bold"
                >Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
