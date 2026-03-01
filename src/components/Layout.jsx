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
      setIsScrolled(window.scrollY > 50);
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

  const headerClass = [
    'fixed top-4 left-1/2 -translate-x-1/2',
    'w-[95%] max-w-7xl',
    'flex items-center justify-between whitespace-nowrap',
    'px-8 py-4',
    'rounded-2xl',
    'border border-[rgba(255,215,0,0.15)]',
    'shadow-[0_8px_30px_rgba(0,0,0,0.4)]',
    'z-50 transition-all duration-300',
    isScrolled
      ? 'bg-[rgba(7,22,43,0.85)] backdrop-blur-md'
      : 'bg-[rgba(7,22,43,0.55)] backdrop-blur-xl',
  ].join(' ');

  const brandClass = 'flex items-center gap-3 text-white';
  const navLinkClass = 'nav-link-premium text-white/80 text-sm font-medium hover:text-primary transition-colors duration-300';
  const mobileMenuButtonClass = 'lg:hidden text-white';

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
              <button className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black text-sm font-semibold px-6 py-2 rounded-lg shadow-lg hover:scale-105 hover:shadow-yellow-500/40 transition-all duration-300">
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
