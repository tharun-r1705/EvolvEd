import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Global Navbar used on public-facing pages.
 * Features a premium glassmorphic design with gold accents.
 */
export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
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

  // Define nav links.
  const navLinks = [
    { name: 'Features', href: 'features' },
    { name: 'How It Works', href: 'how-it-works' },
    { name: 'Pricing', href: 'pricing' },
  ];

  const handleNavClick = (id) => (e) => {
    // If we're on the home page, prevent default and scroll smoothly
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setMobileOpen(false);
      }
    } else {
      // If not on home page, normal navigation to /#id will happen naturally via the href
      setMobileOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled || mobileOpen
          ? 'bg-midnight-navy/90 backdrop-blur-md border-white/10 py-3 shadow-xl'
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* ── Brand Logo ── */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group relative z-50"
            onClick={() => setMobileOpen(false)}
          >
            <div className={`
              size-10 flex items-center justify-center rounded-xl 
              bg-gradient-to-br from-primary to-primary-dark text-midnight-navy
              shadow-[0_0_15px_rgba(198,164,63,0.3)] 
              group-hover:shadow-[0_0_25px_rgba(198,164,63,0.5)] 
              transition-all duration-300 transform group-hover:scale-105
            `}>
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                school
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold text-white tracking-tight leading-none group-hover:text-primary-light transition-colors">
                EvolvEd
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-medium leading-none mt-1 group-hover:text-primary transition-colors">
                Placement Intelligence
              </span>
            </div>
          </Link>

          {/* ── Desktop Navigation ── */}
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
            <div className={`
              flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/5 backdrop-blur-sm
              transition-all duration-300 ${scrolled ? 'bg-midnight-navy/50 border-white/10' : ''}
            `}>
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={`/#${link.href}`}
                  onClick={handleNavClick(link.href)}
                  className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* ── Auth Buttons (Desktop) ── */}
          <div className="hidden lg:flex items-center gap-6">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to={getDashboardLink()}>
                  <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Dashboard
                  </button>
                </Link>
                <div className="w-px h-4 bg-white/20" />
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-primary hover:text-primary-light transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-2 relative group"
                >
                  Sign In
                  <span className="absolute bottom-0 left-2 w-0 h-px bg-white transition-all duration-300 group-hover:w-[calc(100%-16px)]" />
                </Link>
                <Link to="/login">
                  <button className="group relative overflow-hidden rounded-full bg-primary px-6 py-2.5 text-midnight-navy shadow-[0_0_20px_rgba(198,164,63,0.3)] transition-all duration-300 hover:bg-white hover:text-primary hover:shadow-[0_0_30px_rgba(198,164,63,0.5)] active:scale-95">
                    <span className="relative z-10 text-sm font-bold tracking-wide">Get Started</span>
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white hover:text-primary transition-colors relative z-50 rounded-lg hover:bg-white/10"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className="material-symbols-outlined text-3xl">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile Fullscreen Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-40 bg-midnight-navy/97 backdrop-blur-xl lg:hidden flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center gap-8 w-full max-w-md px-6">
              <div className="flex flex-col items-center gap-2 w-full">
                {navLinks.map((link, idx) => (
                  <motion.a
                    key={link.name}
                    href={`/#${link.href}`}
                    onClick={handleNavClick(link.href)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="text-3xl font-serif font-bold text-slate-300 hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </motion.a>
                ))}
              </div>

              <div className="w-12 h-0.5 bg-white/10" />

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-col items-center gap-4 w-full"
              >
                {isAuthenticated ? (
                  <>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all shadow-lg"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      Log Out
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
                        className="w-full bg-primary text-midnight-navy font-bold text-lg py-4 rounded-2xl shadow-[0_0_20px_rgba(198,164,63,0.3)] hover:shadow-[0_0_30px_rgba(198,164,63,0.5)] transition-all"
                      >
                        Get Started
                      </motion.button>
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-medium text-slate-300 hover:text-white transition-colors mt-2"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
