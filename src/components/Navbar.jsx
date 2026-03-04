import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Premium Navbar — refined glassmorphism, gold top-accent,
 * elegant typography, and smooth scroll-aware transitions.
 */
export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  function handleLogout() {
    logout();
    navigate('/');
    setMobileOpen(false);
  }

  function getDashboardLink() {
    if (role === 'student') return '/student';
    if (role === 'recruiter') return '/recruiter';
    if (role === 'admin') return '/admin';
    return '/';
  }

  const navLinks = [
    { name: 'Features', href: 'features' },
    { name: 'How It Works', href: 'how-it-works' },
    { name: 'Pricing', href: 'pricing' },
  ];

  const handleNavClick = (id) => (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setMobileOpen(false);
      }
    } else {
      setMobileOpen(false);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ease-out ${
          scrolled || mobileOpen
            ? 'bg-midnight-navy/95 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.45)] border-b border-white/10 py-3'
            : 'bg-midnight-navy/92 backdrop-blur-md border-b border-white/10 py-4'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between">

            {/* ── Brand ── */}
            <Link
              to="/"
              className="flex items-center gap-3 group relative z-50 shrink-0"
              onClick={() => setMobileOpen(false)}
            >
              <div className="size-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-midnight-navy shadow-[0_0_12px_rgba(198,164,63,0.2)] group-hover:shadow-[0_0_20px_rgba(198,164,63,0.4)] transition-all duration-300">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  school
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold text-white leading-none group-hover:text-primary-light transition-colors duration-300">
                  EvolvEd
                </span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-primary/60 font-medium leading-none mt-0.5">
                  Placement Intelligence
                </span>
              </div>
            </Link>

            {/* ── Desktop Links ── */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={`/#${link.href}`}
                  onClick={handleNavClick(link.href)}
                  className="relative px-5 py-2.5 text-sm font-medium text-white/85 hover:text-white transition-colors duration-200 group rounded-md hover:bg-white/10"
                >
                  {link.name}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-primary rounded-full transition-all duration-250 group-hover:w-6" />
                </a>
              ))}
            </div>

            {/* ── Auth (Desktop) ── */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()}>
                    <button className="px-5 py-2 text-sm font-medium text-white/90 hover:text-white rounded-md hover:bg-white/10 border border-white/15 hover:border-white/30 transition-all duration-200">
                      Dashboard
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 text-sm font-medium text-primary hover:text-primary-light transition-colors duration-200 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <button className="px-5 py-2 text-sm font-medium text-white/90 hover:text-white rounded-md border border-white/15 hover:border-white/30 hover:bg-white/10 transition-all duration-200">
                      Sign In
                    </button>
                  </Link>
                  <Link to="/login">
                    <button className="group flex items-center gap-2 px-5 py-2 text-sm font-semibold text-midnight-navy rounded-lg bg-primary hover:bg-primary-dark shadow-[0_2px_12px_rgba(198,164,63,0.3)] hover:shadow-[0_4px_20px_rgba(198,164,63,0.45)] transition-all duration-200 active:scale-[0.98]">
                      Get Started
                      <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile Toggle ── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden relative z-50 p-2 rounded-md text-slate-200 hover:text-white hover:bg-white/[0.07] transition-all duration-200"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-[2px] bg-current rounded-full transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[9px]' : ''}`} />
                <span className={`block h-[2px] bg-current rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block h-[2px] bg-current rounded-full transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
              </div>
            </button>

          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Fullscreen Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-midnight-navy/[0.97] backdrop-blur-2xl lg:hidden"
          >
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-primary/[0.06] to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-deep-teal/[0.08] to-transparent rounded-full blur-3xl" />

            <div className="relative flex flex-col items-center justify-center h-full gap-10 px-8">
              {/* Nav links */}
              <nav className="flex flex-col items-center gap-6">
                {navLinks.map((link, idx) => (
                  <motion.a
                    key={link.name}
                    href={`/#${link.href}`}
                    onClick={handleNavClick(link.href)}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-3xl font-serif font-bold text-white/80 hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </motion.a>
                ))}
              </nav>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
              />

              {/* Auth buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-4 w-full max-w-xs"
              >
                {isAuthenticated ? (
                  <>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold py-4 rounded-xl transition-all duration-300"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-300"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="w-full"
                    >
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        className="w-full bg-gradient-to-r from-primary to-[#d4b44a] text-midnight-navy font-bold text-base py-4 rounded-xl shadow-[0_4px_20px_rgba(198,164,63,0.3)] hover:shadow-[0_6px_28px_rgba(198,164,63,0.5)] transition-all duration-300"
                      >
                        Get Started
                      </motion.button>
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium tracking-wide text-slate-400 hover:text-white transition-colors duration-300 mt-1"
                    >
                      Already have an account? Sign In
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
