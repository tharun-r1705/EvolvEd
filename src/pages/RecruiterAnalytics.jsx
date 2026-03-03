import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { recruiterService } from '../services/api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  applied:      { label: 'Applied',      cls: 'bg-blue-50 text-blue-700 ring-blue-600/20',         bar: '#3b82f6' },
  shortlisted:  { label: 'Shortlisted',  cls: 'bg-amber-50 text-amber-700 ring-amber-600/20',      bar: '#f59e0b' },
  interviewing: { label: 'Interviewing', cls: 'bg-purple-50 text-purple-700 ring-purple-600/20',   bar: '#8b5cf6' },
  offered:      { label: 'Offered',      cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',bar: '#10b981' },
  rejected:     { label: 'Rejected',     cls: 'bg-red-50 text-red-700 ring-red-600/20',            bar: '#ef4444' },
  withdrawn:    { label: 'Withdrawn',    cls: 'bg-slate-100 text-slate-500 ring-slate-300/40',     bar: '#94a3b8' },
};

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700',
  'bg-rose-100 text-rose-600',  'bg-teal-100 text-teal-700',
  'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700',
];
function avatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

// ─── Mini bar-chart for trend ─────────────────────────────────────────────────

function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="h-32 flex items-center justify-center text-slate-400 text-sm">No data for this period.</div>;
  }

  const max = Math.max(...data.map((d) => d.count), 1);
  // Show at most 30 bars; if more, sample evenly
  const bars = data.length > 30 ? data.filter((_, i) => i % Math.ceil(data.length / 30) === 0) : data;

  return (
    <div className="h-32 w-full relative">
      {/* Grid lines */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="absolute left-0 right-0 border-t border-slate-100" style={{ top: `${i * 33}%` }} />
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-full flex items-end gap-0.5 sm:gap-1">
        {bars.map((d, i) => {
          const heightPct = Math.max((d.count / max) * 100, d.count > 0 ? 6 : 2);
          return (
            <div
              key={d.date ?? i}
              className="flex-1 rounded-t group relative cursor-pointer transition-all"
              style={{
                height: `${heightPct}%`,
                background: i === bars.length - 1
                  ? 'linear-gradient(to top, #c6a43f, #ebdcb2)'
                  : 'rgba(198,164,63,0.20)',
              }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] py-1 px-1.5 rounded pointer-events-none whitespace-nowrap shadow-lg z-10">
                {d.count} · {d.date ?? ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecruiterAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    recruiterService
      .getAnalytics()
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const byStatus = data?.applicationsByStatus ?? [];
  const trend = data?.applicationTrendByDay ?? [];
  const shortlisted = data?.topShortlisted ?? [];
  const jobs = data?.jobsBreakdown ?? [];

  const totalApps = data?.totalApplicationsReceived ?? 0;
  const maxStatusCount = byStatus.length ? Math.max(...byStatus.map((s) => s.count), 1) : 1;
  const maxJobApps = jobs.length ? Math.max(...jobs.map((j) => j.applications), 1) : 1;

  const summaryCards = [
    { label: 'Total Jobs',         value: data?.totalJobs,                  icon: 'work',         highlight: false },
    { label: 'Active Jobs',        value: data?.activeJobs,                 icon: 'work_history',  highlight: true  },
    { label: 'Total Applications', value: data?.totalApplicationsReceived,  icon: 'folder_open',  highlight: false },
    { label: 'Shortlisted',        value: shortlisted.length,               icon: 'person_check', highlight: true  },
  ];

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-hide">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full flex flex-col gap-6 lg:gap-8">

        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          initial={{ opacity: 0, y: -16 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div>
            <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-1">Recruiter Portal</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary tracking-tight">Analytics & Reports</h1>
            <p className="text-slate-500 text-sm mt-1">An overview of your recruitment activity and pipeline performance.</p>
          </div>
          <Link to="/recruiter/jobs/new">
            <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary hover:bg-primary-dark text-secondary text-sm font-bold transition-all shadow-sm hover:shadow-md hover:scale-[1.02]">
              <span className="material-symbols-outlined !text-[18px]">add</span>
              <span className="hidden sm:inline">Post Job</span>
            </button>
          </Link>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map(({ label, value, icon, highlight }, i) => (
            <motion.div 
              key={label} 
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-md ring-1 ring-slate-200 relative overflow-hidden hover:ring-primary/40 transition-all duration-300"
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
            >
              <div className={`absolute top-0 left-0 w-full h-[3px] ${highlight ? 'bg-gradient-to-r from-primary to-primary/30' : 'bg-slate-100'}`} />
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg ${highlight ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                  <span className="material-symbols-outlined !text-[20px]" style={highlight ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs font-medium">{label}</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <h4 className="text-2xl sm:text-3xl font-bold text-secondary mt-0.5">{value ?? '—'}</h4>
              )}
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Left — 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Application Trend */}
            <motion.div 
              className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6"
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: 0.38 }}
            >
              <div className="mb-5">
                <h4 className="text-base font-bold text-secondary">Application Trend</h4>
                <p className="text-sm text-slate-500 mt-0.5">Daily applications received over the last 30 days</p>
              </div>
              {loading ? <Skeleton className="h-32 w-full" /> : <TrendChart data={trend} />}
              {!loading && trend.length > 0 && (
                <div className="flex justify-between mt-2 text-[10px] text-slate-400 px-0.5">
                  <span>{trend[0]?.date}</span>
                  <span>{trend[Math.floor(trend.length / 2)]?.date}</span>
                  <span>{trend[trend.length - 1]?.date}</span>
                </div>
              )}
            </motion.div>

            {/* Applications by Status */}
            <motion.div 
              className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6"
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              <h4 className="text-base font-bold text-secondary mb-5">Applications by Status</h4>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : byStatus.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">No application data yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {byStatus
                    .slice()
                    .sort((a, b) => b.count - a.count)
                    .map(({ status, count }) => {
                      const cfg = STATUS_CONFIG[status] ?? { label: status, bar: '#94a3b8', cls: '' };
                      const pct = Math.round((count / maxStatusCount) * 100);
                      const share = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;
                      return (
                        <div key={status}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ring-inset ${cfg.cls}`}>
                                {cfg.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-400">{share}%</span>
                              <span className="font-bold text-secondary">{count}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: cfg.bar }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </motion.div>

            {/* Jobs Breakdown */}
            <motion.div 
              className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 overflow-hidden"
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: 0.52 }}
            >
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-base font-bold text-secondary">Jobs Breakdown</h4>
                <Link to="/recruiter/jobs" className="text-primary text-sm font-medium hover:underline">
                  Manage Jobs
                </Link>
              </div>
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : jobs.length === 0 ? (
                <div className="px-6 py-10 text-center text-slate-400 text-sm">No jobs posted yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {jobs
                    .slice()
                    .sort((a, b) => b.applications - a.applications)
                    .slice(0, 10)
                    .map((j) => {
                      const barPct = Math.round((j.applications / maxJobApps) * 100);
                      return (
                        <div key={j.id} className="px-5 sm:px-6 py-3.5 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`inline-flex items-center h-4 w-4 rounded-full flex-shrink-0 ${j.isActive ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                              <span className="text-sm font-medium text-secondary truncate">{j.title}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-600 ml-3 flex-shrink-0">{j.applications} apps</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/60 transition-all duration-700"
                              style={{ width: `${barPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right — 1 col */}
          <div className="flex flex-col gap-6">

            {/* Top Shortlisted */}
            <motion.div 
              className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 overflow-hidden"
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: 0.38 }}
            >
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-base font-bold text-secondary">Top Shortlisted</h4>
                <Link to="/recruiter/candidates" className="text-primary text-sm font-medium hover:underline">
                  Browse All
                </Link>
              </div>
              {loading ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : shortlisted.length === 0 ? (
                <div className="px-5 py-10 text-center text-slate-400 text-sm">No shortlisted candidates yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {shortlisted.slice(0, 8).map((s) => {
                    const color = avatarColor(s.name);
                    const score = s.readinessScore ?? 0;
                    return (
                      <div key={s.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                        <div className={`size-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${color}`}>
                          {initials(s.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-secondary truncate">{s.name}</p>
                          <p className="text-xs text-slate-400 truncate">{s.department || '—'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`text-xs font-bold ${score >= 90 ? 'text-primary' : 'text-slate-500'}`}>{score}</span>
                          <span className="text-[10px] text-slate-400">{formatDate(s.shortlistedAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <motion.div 
              className="bg-secondary rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden shadow-md"
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
              <h4 className="text-base font-bold mb-4 relative z-10">Quick Actions</h4>
              <div className="flex flex-col gap-2 relative z-10">
                {[
                  { icon: 'add_circle',     label: 'Post a New Job',     to: '/recruiter/jobs/new' },
                  { icon: 'person_search',  label: 'Search Candidates',  to: '/recruiter/candidates' },
                  { icon: 'dashboard',      label: 'Back to Dashboard',  to: '/recruiter' },
                ].map(({ icon, label, to }) => (
                  <Link key={label} to={to}>
                    <button className="w-full text-left px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined !text-[18px] text-primary">{icon}</span>
                        <span className="text-sm font-medium text-slate-200">{label}</span>
                      </div>
                      <span className="material-symbols-outlined !text-[16px] text-slate-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all">arrow_forward</span>
                    </button>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
