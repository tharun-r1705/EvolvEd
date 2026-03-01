import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/api.js';
import { signInWithProvider } from '../lib/supabase.js';

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
  const [oauthLoading, setOauthLoading] = useState(null);

  async function handleOAuth(provider) {
    try {
      setOauthLoading(provider);
      setError('');
      // Store intended role so the callback page can include it
      sessionStorage.setItem('oauth_role', 'student');
      await signInWithProvider(provider);
      // Page will redirect to Supabase → comes back at /auth/callback
    } catch (err) {
      setError('Could not connect to ' + (provider === 'google' ? 'Google' : 'LinkedIn') + '. Please try again.');
      setOauthLoading(null);
    }
  }

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
          <button
            onClick={() => handleOAuth('linkedin_oidc')}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 px-4 hover:bg-gray-50 hover:border-gray-300 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {oauthLoading === 'linkedin_oidc' ? (
              <div className="size-5 rounded-full border-2 border-[#0077b5] border-t-transparent animate-spin" />
            ) : (
              <svg aria-hidden="true" className="h-5 w-5 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            )}
            <span className="text-sm font-medium text-charcoal group-hover:text-navy">
              {oauthLoading === 'linkedin_oidc' ? 'Connecting…' : 'Continue with LinkedIn'}
            </span>
          </button>

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
