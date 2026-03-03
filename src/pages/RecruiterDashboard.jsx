import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { recruiterService } from '../services/api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status) {
  const map = {
    applied:      'bg-blue-50 text-blue-700 ring-blue-600/20',
    shortlisted:  'bg-amber-50 text-amber-700 ring-amber-600/20',
    interviewing: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    offered:      'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    rejected:     'bg-red-50 text-red-700 ring-red-600/20',
    withdrawn:    'bg-slate-100 text-slate-500 ring-slate-300/40',
  };
  return map[status] ?? 'bg-slate-100 text-slate-500 ring-slate-300/40';
}

function statusLabel(status) {
  const map = {
    applied: 'New', shortlisted: 'Shortlisted', interviewing: 'Interviewing',
    offered: 'Offered', rejected: 'Rejected', withdrawn: 'Withdrawn',
  };
  return map[status] ?? status;
}

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

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

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecruiterDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    recruiterService
      .getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;
  const trend = data?.applicationTrend ?? [];
  const pipeline = data?.hiringPipeline ?? [];
  const recent = data?.recentApplicants ?? [];

  const maxTrendCount = trend.length ? Math.max(...trend.map((t) => t.count), 1) : 1;
  const maxPipeline = pipeline.length ? Math.max(...pipeline.map((p) => p.count), 1) : 1;

  const statCards = [
    { title: 'Active Jobs',        value: stats?.activeJobs,            icon: 'work',         highlight: true  },
    { title: 'Shortlisted',        value: stats?.shortlistedCandidates, icon: 'person_check', highlight: true  },
    { title: 'Total Applications', value: stats?.totalApplications,     icon: 'folder_open',  highlight: false },
    { title: 'Interviews',         value: stats?.interviewsScheduled,   icon: 'event',        highlight: false },
  ];

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-hide">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full flex flex-col gap-6 lg:gap-8">

        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: -16 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-1">Recruiter Portal</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary tracking-tight">
              {loading ? (
                <Skeleton className="h-8 w-52 inline-block" />
              ) : data?.recruiter ? (
                <>Welcome back, {data.recruiter.fullName.split(' ')[0]}</>
              ) : (
                'Welcome back'
              )}
            </h1>
            {data?.recruiter?.company && (
              <p className="text-slate-500 text-sm mt-1">{data.recruiter.company.name}</p>
            )}
            {!data?.recruiter?.company && !loading && (
              <p className="text-slate-500 text-sm mt-1">Here's what's happening with your recruitment pipeline today.</p>
            )}
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link to="/recruiter/jobs/new">
              <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary hover:bg-primary-dark text-secondary text-sm font-bold transition-all shadow-sm hover:shadow-md hover:scale-[1.02]">
                <span className="material-symbols-outlined !text-[18px]">add</span>
                <span className="hidden sm:inline">Post Job</span>
              </button>
            </Link>
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ title, value, icon, highlight }, i) => (
            <motion.div 
              key={title}
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-md ring-1 ring-slate-200 relative overflow-hidden hover:ring-primary/40 transition-all duration-300"
            >
              <div className={`absolute top-0 left-0 w-full h-[3px] ${highlight ? 'bg-gradient-to-r from-primary to-primary/30' : 'bg-slate-100'}`} />
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg ${highlight ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                  <span className="material-symbols-outlined !text-[20px]" style={highlight ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs font-medium">{title}</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <h4 className="text-2xl sm:text-3xl font-bold text-secondary mt-0.5">{value ?? '—'}</h4>
              )}
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Application Trends (7-day bar chart) */}
            <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h4 className="text-base font-bold text-secondary">Application Trends</h4>
                  <p className="text-sm text-slate-500 mt-0.5">Applications received over the last 7 days</p>
                </div>
              </div>

              {loading ? (
                <Skeleton className="h-48 w-full" />
              ) : trend.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No application data yet.</div>
              ) : (
                <>
                  <div className="h-48 sm:h-56 w-full relative">
                    <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between gap-1.5 sm:gap-2 px-2">
                      {trend.map((t, i) => {
                        const heightPct = Math.max((t.count / maxTrendCount) * 100, t.count > 0 ? 8 : 3);
                        const isLast = i === trend.length - 1;
                        return (
                          <div
                            key={t.day}
                            className="w-full rounded-t transition-all relative group cursor-pointer"
                            style={{
                              height: `${heightPct}%`,
                              background: isLast
                                ? 'linear-gradient(to top, #c6a43f, #ebdcb2)'
                                : 'rgba(198,164,63,0.15)',
                            }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs py-1 px-2 rounded-md pointer-events-none transition-opacity whitespace-nowrap shadow-lg z-10">
                              {t.count} app{t.count !== 1 ? 's' : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="absolute left-0 right-0 border-t border-slate-100" style={{ top: `${i * 25}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-3 text-xs text-slate-400 px-2">
                    {trend.map((t, i) => (
                      <span key={t.day} className={i === trend.length - 1 ? 'font-bold text-primary' : ''}>{t.day}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Recent Applicants Table */}
            <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-base font-bold text-secondary">Recent Applicants</h4>
                <Link to="/recruiter/candidates" className="text-primary text-sm font-medium hover:underline transition-colors">
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : recent.length === 0 ? (
                  <div className="px-6 py-10 text-center text-slate-400 text-sm">No applicants yet.</div>
                ) : (
                  <table className="w-full text-left text-sm min-w-[540px]">
                    <thead className="text-xs uppercase font-semibold text-slate-400 border-b border-slate-100 bg-slate-50/50">
                      <tr>
                        <th className="px-5 sm:px-6 py-4">Candidate</th>
                        <th className="px-5 sm:px-6 py-4 hidden sm:table-cell">Role Applied</th>
                        <th className="px-5 sm:px-6 py-4">Readiness</th>
                        <th className="px-5 sm:px-6 py-4">Status</th>
                        <th className="px-5 sm:px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                     <tbody className="divide-y divide-slate-100">
                      {recent.map((applicant, i) => {
                        const score = applicant.score ?? 0;
                        const color = avatarColor(applicant.name);
                        return (
                          <motion.tr 
                            key={applicant.id}
                            initial={{ opacity: 0, y: 8 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-5 sm:px-6 py-4">
                              <div className="flex items-center gap-3">
                                {applicant.avatarUrl ? (
                                  <img src={applicant.avatarUrl} alt={applicant.name} className="size-8 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                  <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${color}`}>
                                    {initials(applicant.name)}
                                  </div>
                                )}
                                <span className="font-medium text-secondary text-sm">{applicant.name}</span>
                              </div>
                            </td>
                            <td className="px-5 sm:px-6 py-4 text-slate-500 hidden sm:table-cell">{applicant.role}</td>
                            <td className="px-5 sm:px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-14 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${score}%`,
                                      background: score >= 80 ? '#10b981' : score >= 60 ? '#c6a43f' : '#f59e0b',
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-slate-600">{score}%</span>
                              </div>
                            </td>
                            <td className="px-5 sm:px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${statusBadge(applicant.status)}`}>
                                {statusLabel(applicant.status)}
                              </span>
                            </td>
                            <td className="px-5 sm:px-6 py-4 text-right">
                              <Link to={`/recruiter/candidates/${applicant.id}`}>
                                <button className="text-slate-400 hover:text-primary transition-colors">
                                  <span className="material-symbols-outlined !text-[20px]">visibility</span>
                                </button>
                              </Link>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">

            {/* Hiring Pipeline */}
            <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6">
              <h4 className="text-base font-bold text-secondary mb-5">Hiring Pipeline</h4>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {pipeline.map(({ stage, count }, idx) => {
                    const isLast = idx === pipeline.length - 1;
                    const pct = Math.round((count / maxPipeline) * 100);
                    return (
                      <div key={stage}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-semibold ${isLast ? 'text-emerald-600' : 'text-slate-500'}`}>{stage}</span>
                          <span className={`text-xs font-bold ${isLast ? 'text-emerald-600' : 'text-slate-600'}`}>{count}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${isLast ? 'bg-emerald-500' : 'bg-primary/70'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6">
              <h4 className="text-base font-bold text-secondary mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2">
                {[
                  { icon: 'work',         label: 'Manage Jobs',       to: '/recruiter/jobs' },
                  { icon: 'person_search',label: 'Browse Candidates', to: '/recruiter/candidates' },
                  { icon: 'manage_accounts',label: 'My Profile',      to: '/recruiter/profile' },
                ].map(({ icon, label, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                  >
                    <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined !text-[18px]">{icon}</span>
                    </div>
                    <span className="text-sm font-medium text-secondary">{label}</span>
                    <span className="material-symbols-outlined !text-[16px] text-slate-400 group-hover:text-primary ml-auto transition-colors">arrow_forward</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-secondary rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
              <h4 className="text-base font-bold mb-4 relative z-10">Quick Actions</h4>
              <div className="flex flex-col gap-2 relative z-10">
                <Link to="/recruiter/jobs/new">
                  <button className="w-full text-left px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined !text-[18px] text-primary">add_circle</span>
                      <span className="text-sm font-medium text-slate-200">Post a New Job</span>
                    </div>
                    <span className="material-symbols-outlined !text-[16px] text-slate-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all">arrow_forward</span>
                  </button>
                </Link>
                <Link to="/recruiter/candidates">
                  <button className="w-full text-left px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined !text-[18px] text-primary">person_search</span>
                      <span className="text-sm font-medium text-slate-200">Search Candidates</span>
                    </div>
                    <span className="material-symbols-outlined !text-[16px] text-slate-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all">arrow_forward</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
