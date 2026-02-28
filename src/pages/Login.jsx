import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/api.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const { token, role, user } = res.data;
      login(token, role, user);
      // Navigate to intended page or role dashboard
      if (from) return navigate(from, { replace: true });
      if (role === 'student') navigate('/student', { replace: true });
      else if (role === 'recruiter') navigate('/recruiter', { replace: true });
      else if (role === 'admin') navigate('/admin', { replace: true });
      else navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 min-h-screen w-full font-display bg-background-light dark:bg-background-dark">
      {/* ── Left Side: Brand & Visual ── */}
      <div className="hidden lg:flex w-1/2 bg-navy flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative Abstract Background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 10% 20%, rgba(198, 164, 63, 0.4) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(198, 164, 63, 0.2) 0%, transparent 25%)',
          }}
        />
        {/* Logo Area */}
        <Link to="/" className="flex items-center gap-3 relative z-10 w-fit">
          <div className="flex items-center justify-center rounded-lg bg-primary/20 size-9 border border-primary/30">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.25rem' }}>school</span>
          </div>
          <h2 className="text-white text-xl font-semibold tracking-tight">EvolvEd</h2>
        </Link>
        {/* Content */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-white text-5xl font-semibold leading-snug tracking-tight mb-6">
            Placement Intelligence <br />
            <span className="text-primary font-semibold">Redefined.</span>
          </h1>
          <p className="text-slate-400 text-base font-normal leading-relaxed">
            Empowering students and recruiters with AI-driven readiness scoring and predictive
            analytics for the future workforce.
          </p>
        </div>
        {/* Footer / Credentials */}
        <div className="relative z-10 text-slate-400 text-sm font-medium flex gap-6">
          <span>© 2023 EvolvEd Inc.</span>
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
        </div>
        {/* Decorative SVG Illustration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <svg viewBox="0 0 520 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[90%] max-w-[480px] opacity-[0.04]">
            {/* Grid dots */}
            {Array.from({ length: 8 }).map((_, row) =>
              Array.from({ length: 8 }).map((_, col) => (
                <circle key={`${row}-${col}`} cx={40 + col * 64} cy={40 + row * 64} r="3" fill="white" />
              ))
            )}
            {/* Bar chart */}
            <rect x="60" y="300" width="40" height="120" rx="4" fill="white" />
            <rect x="120" y="260" width="40" height="160" rx="4" fill="white" />
            <rect x="180" y="220" width="40" height="200" rx="4" fill="white" />
            <rect x="240" y="180" width="40" height="240" rx="4" fill="white" />
            <rect x="300" y="240" width="40" height="180" rx="4" fill="white" />
            <rect x="360" y="200" width="40" height="220" rx="4" fill="white" />
            {/* Trend line */}
            <polyline points="80,300 140,260 200,220 260,180 320,240 380,200" stroke="#c6a43f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Trend dots */}
            {[[80,300],[140,260],[200,220],[260,180],[320,240],[380,200]].map(([x,y],i) => (
              <circle key={i} cx={x} cy={y} r="6" fill="#c6a43f" />
            ))}
            {/* Circular progress rings */}
            <circle cx="440" cy="120" r="55" stroke="white" strokeWidth="8" strokeDasharray="260 80" strokeLinecap="round" />
            <circle cx="440" cy="120" r="55" stroke="#c6a43f" strokeWidth="8" strokeDasharray="180 160" strokeLinecap="round" strokeDashoffset="-40" />
            <circle cx="440" cy="280" r="35" stroke="white" strokeWidth="6" strokeDasharray="160 60" strokeLinecap="round" />
            {/* Connecting lines */}
            <line x1="80" y1="100" x2="360" y2="100" stroke="white" strokeWidth="1" strokeDasharray="6 4" />
            <line x1="80" y1="140" x2="280" y2="140" stroke="white" strokeWidth="1" strokeDasharray="6 4" />
            {/* Cap icon outline */}
            <path d="M200 90 L260 60 L320 90 L260 120 Z" stroke="white" strokeWidth="4" strokeLinejoin="round" fill="none" />
            <path d="M230 105 L230 135 Q260 148 290 135 L290 105" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </div>

      {/* ── Right Side: Login Form ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 bg-background-light">
        <div className="w-full max-w-md flex flex-col gap-8">
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-4 w-fit">
            <div className="flex items-center justify-center rounded-lg bg-primary/10 size-8 border border-primary/20">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.1rem' }}>school</span>
            </div>
            <h2 className="text-navy text-xl font-bold">EvolvEd</h2>
          </Link>

          <div className="flex flex-col gap-2">
            <h2 className="text-navy text-3xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-charcoal/80 text-base">Please enter your details to access your dashboard.</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSignIn}>
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-charcoal text-sm font-semibold" htmlFor="email">
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-charcoal/50 material-symbols-outlined !text-[20px]">mail</span>
                <input
                  className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-3 text-charcoal placeholder:text-gray-400 focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all"
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-charcoal text-sm font-semibold" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-charcoal/50 material-symbols-outlined !text-[20px]">lock</span>
                <input
                  className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 py-3 text-charcoal placeholder:text-gray-400 focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all"
                  id="password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-3.5 text-charcoal/50 hover:text-navy transition-colors flex items-center"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <span className="material-symbols-outlined !text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  className="size-4 rounded border-gray-300 text-navy focus:ring-navy"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-sm text-charcoal/80 font-medium">Remember me</span>
              </label>
              <a className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors" href="#">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              className="mt-4 w-full rounded-lg bg-navy hover:bg-primary text-white font-bold py-3.5 px-4 transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-navy/20 disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-medium tracking-wider">
              Or continue with
            </span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 px-4 hover:bg-gray-50 hover:border-gray-300 transition-all group">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-medium text-charcoal group-hover:text-navy">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 px-4 hover:bg-gray-50 hover:border-gray-300 transition-all group">
              <svg aria-hidden="true" className="h-5 w-5 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span className="text-sm font-medium text-charcoal group-hover:text-navy">LinkedIn</span>
            </button>
          </div>

          <p className="text-center text-sm text-charcoal/70 mt-4">
            Don't have an account?{' '}
            <Link className="font-semibold text-primary hover:text-navy transition-colors" to="/signup">
              Apply for Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
