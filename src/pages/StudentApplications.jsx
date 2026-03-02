import React, { useEffect, useState } from 'react';
import { studentService } from '../services/api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  applied:      { label: 'Applied',      cls: 'bg-blue-50 text-blue-700 ring-blue-600/20',       icon: 'send' },
  shortlisted:  { label: 'Shortlisted',  cls: 'bg-amber-50 text-amber-700 ring-amber-600/20',    icon: 'bookmark_added' },
  interviewing: { label: 'Interviewing', cls: 'bg-purple-50 text-purple-700 ring-purple-600/20', icon: 'mic' },
  offered:      { label: 'Offer Received',cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',icon: 'celebration' },
  rejected:     { label: 'Rejected',     cls: 'bg-red-50 text-red-700 ring-red-600/20',          icon: 'cancel' },
  withdrawn:    { label: 'Withdrawn',    cls: 'bg-slate-100 text-slate-500 ring-slate-300/40',   icon: 'undo' },
};

const STATUS_ORDER = ['applied', 'shortlisted', 'interviewing', 'offered', 'rejected', 'withdrawn'];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-slate-100 text-slate-500 ring-slate-300/40', icon: 'help' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${cfg.cls}`}>
      <span className="material-symbols-outlined !text-[13px]">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

const EMPLOYMENT_TYPE_COLORS = {
  'full-time':  'bg-blue-50 text-blue-700 ring-blue-600/20',
  'part-time':  'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  'internship': 'bg-teal-50 text-teal-700 ring-teal-600/20',
  'contract':   'bg-orange-50 text-orange-700 ring-orange-600/20',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    studentService
      .getApplications()
      .then((res) => setApplications(res.data ?? []))
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load applications.'))
      .finally(() => setLoading(false));
  }, []);

  // Counts by status
  const counts = { all: applications.length };
  for (const s of STATUS_ORDER) {
    counts[s] = applications.filter((a) => a.status === s).length;
  }

  // Filtered list
  const filtered = applications.filter((a) => {
    const matchesFilter = activeFilter === 'all' || a.status === activeFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q
      || a.job?.title?.toLowerCase().includes(q)
      || a.job?.company?.name?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const TAB_FILTERS = [
    { key: 'all',          label: 'All' },
    { key: 'applied',      label: 'Applied' },
    { key: 'shortlisted',  label: 'Shortlisted' },
    { key: 'interviewing', label: 'Interviewing' },
    { key: 'offered',      label: 'Offered' },
    { key: 'rejected',     label: 'Rejected' },
    { key: 'withdrawn',    label: 'Withdrawn' },
  ];

  // Summary stat cards
  const summaryStats = [
    { label: 'Total Applied',  value: counts.all,          icon: 'send',           color: 'text-primary',       bg: 'bg-primary/10' },
    { label: 'Shortlisted',    value: counts.shortlisted,  icon: 'bookmark_added', color: 'text-amber-600',     bg: 'bg-amber-50' },
    { label: 'Interviewing',   value: counts.interviewing, icon: 'mic',            color: 'text-purple-600',    bg: 'bg-purple-50' },
    { label: 'Offers',         value: counts.offered,      icon: 'celebration',    color: 'text-emerald-600',   bg: 'bg-emerald-50' },
  ];

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-hide">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto w-full flex flex-col gap-6">

        {/* Header */}
        <div>
          <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-1">Jobs & Placements</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary tracking-tight">My Applications</h1>
          <p className="text-slate-500 text-sm mt-1">Track the status of all your job applications.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {summaryStats.map(({ label, value, icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-4 sm:p-5 shadow-md ring-1 ring-slate-200 flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${bg} flex-shrink-0`}>
                <span className={`material-symbols-outlined !text-[22px] ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">{label}</p>
                {loading ? (
                  <Skeleton className="h-7 w-10 mt-0.5" />
                ) : (
                  <p className="text-2xl font-bold text-secondary mt-0.5">{value ?? 0}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {TAB_FILTERS.map(({ key, label }) => {
              const count = counts[key] ?? 0;
              const active = activeFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-primary text-secondary shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-secondary/20 text-secondary' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative flex-shrink-0">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 !text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search company or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-3 w-full sm:w-52 bg-white border border-slate-200 rounded-lg text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/40 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <span className="material-symbols-outlined text-slate-300 !text-[48px] mb-3 block">work_off</span>
              <p className="text-slate-500 text-sm font-medium">
                {applications.length === 0
                  ? "You haven't applied to any jobs yet."
                  : 'No applications match this filter.'}
              </p>
              {activeFilter !== 'all' && (
                <button onClick={() => setActiveFilter('all')} className="mt-3 text-primary text-sm font-medium hover:underline">
                  Show all
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((app) => {
                const job = app.job ?? {};
                const company = job.company ?? {};
                const salary = formatSalary(job.salaryMin, job.salaryMax);
                const isPast = ['rejected', 'withdrawn'].includes(app.status);
                const typeColor = EMPLOYMENT_TYPE_COLORS[job.employmentType?.toLowerCase()] ?? 'bg-slate-100 text-slate-600 ring-slate-300/40';

                return (
                  <div
                    key={app.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 px-5 sm:px-6 py-5 hover:bg-slate-50 transition-colors ${isPast ? 'opacity-70' : ''}`}
                  >
                    {/* Company Logo / Fallback */}
                    <div className="flex-shrink-0">
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-white p-1"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <span className="material-symbols-outlined !text-[24px] text-primary">business</span>
                        </div>
                      )}
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-secondary text-sm">{job.title || 'Job'}</h3>
                        {job.employmentType && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ring-inset uppercase tracking-wide ${typeColor}`}>
                            {job.employmentType}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mb-2">{company.name || '—'}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        {job.workMode && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined !text-[13px]">location_on</span>
                            {job.workMode}
                          </span>
                        )}
                        {salary && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined !text-[13px]">payments</span>
                            {salary}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined !text-[13px]">calendar_today</span>
                          Applied {formatDate(app.appliedAt)}
                        </span>
                        {job.deadline && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined !text-[13px]">schedule</span>
                            Deadline {formatDate(job.deadline)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0">
                      <StatusBadge status={app.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Empty State CTA */}
        {!loading && applications.length === 0 && (
          <div className="bg-secondary rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h4 className="text-base font-bold mb-1">Start Your Job Search</h4>
                <p className="text-slate-300 text-sm">Browse open positions and apply directly through EvolvEd.</p>
              </div>
              <div className="flex-shrink-0">
                <a
                  href="/student"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-secondary rounded-lg text-sm font-bold hover:bg-primary-dark transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined !text-[18px]">explore</span>
                  Explore Jobs
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
