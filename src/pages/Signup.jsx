import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api.js';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & ML',
  'Data Science',
  'Biotechnology',
  'Chemical Engineering',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    studentId: '',
    department: '',
    yearOfStudy: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    if (!agreedToTerms) {
      return setError('Please agree to the Terms of Service to continue.');
    }

    setLoading(true);
    try {
      await authService.register({
        fullName: form.fullName,
        email: form.email,
        studentId: form.studentId,
        department: form.department,
        yearOfStudy: form.yearOfStudy,
        password: form.password,
        role: 'student',
      });
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 min-h-screen w-full font-display bg-background-light dark:bg-background-dark">
      {/* ── Left Side: Brand & Visual ── */}
      <div className="hidden lg:flex w-[45%] bg-navy flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative radial gradient */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 10% 20%, rgba(198, 164, 63, 0.4) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(198, 164, 63, 0.2) 0%, transparent 25%)',
          }}
        />
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10 w-fit">
          <div className="flex items-center justify-center rounded-lg bg-primary/20 size-9 border border-primary/30">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.25rem' }}>school</span>
          </div>
          <h2 className="text-white text-xl font-semibold tracking-tight">EvolvEd</h2>
        </Link>

        {/* Content */}
        <div className="relative z-10 max-w-sm">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <span className="material-symbols-outlined text-primary !text-[16px]">verified</span>
            <span className="text-primary text-xs font-semibold tracking-wide uppercase">Student Registration</span>
          </div>
          <h1 className="text-white text-4xl font-semibold leading-snug tracking-tight mb-5">
            Start Your <br />
            <span className="text-primary">Career Journey</span><br />
            Today.
          </h1>
          <p className="text-slate-400 text-sm font-normal leading-relaxed mb-8">
            Join thousands of students using EvolvEd to track progress, showcase skills, and connect with top recruiters.
          </p>

          {/* Feature bullets */}
          <ul className="flex flex-col gap-3.5">
            {[
              { icon: 'insights', text: 'AI-powered placement readiness score' },
              { icon: 'work_history', text: 'Direct recruiter visibility to your profile' },
              { icon: 'assessment', text: 'Skill assessments & gap analytics' },
            ].map(({ icon, text }) => (
              <li key={icon} className="flex items-center gap-3">
                <span className="flex items-center justify-center size-8 rounded-full bg-primary/10 border border-primary/20 flex-shrink-0">
                  <span className="material-symbols-outlined text-primary !text-[16px]">{icon}</span>
                </span>
                <span className="text-slate-300 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-slate-400 text-sm font-medium flex gap-6">
          <span>© 2023 EvolvEd Inc.</span>
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
        </div>

        {/* Decorative SVG Illustration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <svg viewBox="0 0 520 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[90%] max-w-[480px] opacity-[0.04]">
            {Array.from({ length: 8 }).map((_, row) =>
              Array.from({ length: 8 }).map((_, col) => (
                <circle key={`${row}-${col}`} cx={40 + col * 64} cy={40 + row * 64} r="3" fill="white" />
              ))
            )}
            <rect x="60" y="300" width="40" height="120" rx="4" fill="white" />
            <rect x="120" y="260" width="40" height="160" rx="4" fill="white" />
            <rect x="180" y="220" width="40" height="200" rx="4" fill="white" />
            <rect x="240" y="180" width="40" height="240" rx="4" fill="white" />
            <rect x="300" y="240" width="40" height="180" rx="4" fill="white" />
            <rect x="360" y="200" width="40" height="220" rx="4" fill="white" />
            <polyline points="80,300 140,260 200,220 260,180 320,240 380,200" stroke="#c6a43f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {[[80,300],[140,260],[200,220],[260,180],[320,240],[380,200]].map(([x,y],i) => (
              <circle key={i} cx={x} cy={y} r="6" fill="#c6a43f" />
            ))}
            <circle cx="440" cy="120" r="55" stroke="white" strokeWidth="8" strokeDasharray="260 80" strokeLinecap="round" />
            <circle cx="440" cy="120" r="55" stroke="#c6a43f" strokeWidth="8" strokeDasharray="180 160" strokeLinecap="round" strokeDashoffset="-40" />
            <circle cx="440" cy="280" r="35" stroke="white" strokeWidth="6" strokeDasharray="160 60" strokeLinecap="round" />
            <line x1="80" y1="100" x2="360" y2="100" stroke="white" strokeWidth="1" strokeDasharray="6 4" />
            <line x1="80" y1="140" x2="280" y2="140" stroke="white" strokeWidth="1" strokeDasharray="6 4" />
            <path d="M200 90 L260 60 L320 90 L260 120 Z" stroke="white" strokeWidth="4" strokeLinejoin="round" fill="none" />
            <path d="M230 105 L230 135 Q260 148 290 135 L290 105" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </div>

      {/* ── Right Side: Signup Form ── */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 bg-background-light overflow-y-auto">
        <div className="w-full max-w-lg flex flex-col gap-6">
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-2 w-fit">
            <div className="flex items-center justify-center rounded-lg bg-primary/10 size-8 border border-primary/20">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.1rem' }}>school</span>
            </div>
            <h2 className="text-navy text-xl font-bold">EvolvEd</h2>
          </Link>

          {/* Header */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-navy text-3xl font-bold tracking-tight">Create Your Account</h2>
            <p className="text-charcoal/70 text-base">Fill in your details to register as a student.</p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <span className="material-symbols-outlined !text-[18px] mt-0.5 flex-shrink-0">error</span>
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-start gap-2">
              <span className="material-symbols-outlined !text-[18px] mt-0.5 flex-shrink-0">check_circle</span>
              {success}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Row: Full Name + Student ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-charcoal text-sm font-semibold" htmlFor="fullName">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-charcoal/50 material-symbols-outlined !text-[20px]">person</span>
                  <input
                    className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-3 text-charcoal placeholder:text-gray-400 focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all"
                    id="fullName"
                    name="fullName"
                    placeholder="Arjun Sharma"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Student ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-charcoal text-sm font-semibold" htmlFor="studentId">
                  Student / Roll No.
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-charcoal/50 material-symbols-outlined !text-[20px]">badge</span>
                  <input
                    className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-3 text-charcoal placeholder:text-gray-400 focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all"
                    id="studentId"
                    name="studentId"
                    placeholder="21CS045"
                    type="text"
                    value={form.studentId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-charcoal text-sm font-semibold" htmlFor="email">
                College Email Address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-charcoal/50 material-symbols-outlined !text-[20px]">mail</span>
                <input
                  className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-3 text-charcoal placeholder:text-gray-400 focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all"
                  id="email"
                  name="email"
                  placeholder="arjun@college.edu"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row: Department + Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Department */}
              <div className="flex flex-col gap-1.5">
                <label className="text-charcoal text-sm font-semibold" htmlFor="department">
                  Department
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-charcoal/50 material-symbols-outlined !text-[20px] pointer-events-none">account_balance</span>
                  <select
                    className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-3 text-charcoal focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all appearance-none cursor-pointer"
                    id="department"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <span className="absolute right-3.5 text-charcoal/40 material-symbols-outlined !text-[20px] pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Year of Study */}
              <div className="flex flex-col gap-1.5">
                <label className="text-charcoal text-sm font-semibold" htmlFor="yearOfStudy">
                  Year of Study
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-charcoal/50 material-symbols-outlined !text-[20px] pointer-events-none">calendar_today</span>
                  <select
                    className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-3 text-charcoal focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all appearance-none cursor-pointer"
                    id="yearOfStudy"
                    name="yearOfStudy"
                    value={form.yearOfStudy}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <span className="absolute right-3.5 text-charcoal/40 material-symbols-outlined !text-[20px] pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-charcoal text-sm font-semibold" htmlFor="password">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-charcoal/50 material-symbols-outlined !text-[20px]">lock</span>
                <input
                  className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 py-3 text-charcoal placeholder:text-gray-400 focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all"
                  id="password"
                  name="password"
                  placeholder="Min. 8 characters"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
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
              {/* Strength hint */}
              {form.password.length > 0 && (
                <div className="flex gap-1.5 mt-1">
                  {[1, 2, 3, 4].map((level) => {
                    const strength = Math.min(
                      Math.floor(form.password.length / 3),
                      4
                    );
                    return (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= strength
                            ? level <= 1 ? 'bg-red-400'
                            : level <= 2 ? 'bg-yellow-400'
                            : level <= 3 ? 'bg-blue-400'
                            : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    );
                  })}
                  <span className="text-xs text-charcoal/50 ml-1 whitespace-nowrap">
                    {form.password.length < 4 ? 'Weak'
                      : form.password.length < 7 ? 'Fair'
                      : form.password.length < 10 ? 'Good'
                      : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-charcoal text-sm font-semibold" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-charcoal/50 material-symbols-outlined !text-[20px]">lock_reset</span>
                <input
                  className={`w-full rounded-lg border bg-white pl-10 pr-10 py-3 text-charcoal placeholder:text-gray-400 focus:ring-1 outline-none transition-all ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                      : 'border-gray-200 focus:border-navy focus:ring-navy'
                  }`}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  className="absolute right-3.5 text-charcoal/50 hover:text-navy transition-colors flex items-center"
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  <span className="material-symbols-outlined !text-[20px]">
                    {showConfirm ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-0.5">Passwords do not match.</p>
              )}
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none mt-1">
              <input
                className="size-4 rounded border-gray-300 text-navy focus:ring-navy mt-0.5 flex-shrink-0"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <span className="text-sm text-charcoal/70 leading-relaxed">
                I agree to EvolvEd's{' '}
                <a className="font-semibold text-primary hover:text-navy transition-colors" href="#">Terms of Service</a>{' '}
                and{' '}
                <a className="font-semibold text-primary hover:text-navy transition-colors" href="#">Privacy Policy</a>.
              </span>
            </label>

            {/* Submit */}
            <button
              className="mt-2 w-full rounded-lg bg-navy hover:bg-primary text-white font-bold py-3.5 px-4 transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-navy/20 disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating Account…' : 'Create Student Account'}
            </button>
          </form>

          <p className="text-center text-sm text-charcoal/70">
            Already have an account?{' '}
            <Link className="font-semibold text-primary hover:text-navy transition-colors" to="/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
