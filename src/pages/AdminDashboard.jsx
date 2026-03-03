import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminService } from '../services/api';

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);
  const cls = type === 'success'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : 'bg-red-50 border-red-200 text-red-800';
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${cls}`}>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose}>
        <span className="material-symbols-outlined text-[18px] opacity-60 hover:opacity-100">close</span>
      </button>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function driveBadgeCls(status) {
  const m = {
    upcoming:  'bg-blue-50 text-blue-700 ring-blue-600/20',
    ongoing:   'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    completed: 'bg-slate-100 text-slate-600 ring-slate-300/40',
    cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
  };
  return m[(status || '').toLowerCase()] || 'bg-slate-100 text-slate-600 ring-slate-300/40';
}

function placementBadgeCls(status) {
  const m = {
    placed:   'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    pending:  'bg-amber-50 text-amber-700 ring-amber-600/20',
    rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  };
  return m[(status || '').toLowerCase()] || 'bg-slate-100 text-slate-600 ring-slate-300/40';
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
  'bg-rose-100 text-rose-700',  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700','bg-cyan-100 text-cyan-700',
];
function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <main className="flex-1 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8"><Skeleton className="h-8 w-64 mb-2" /><Skeleton className="h-4 w-80" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
          <div className="flex flex-col gap-5">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </main>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [toast, setToast]     = useState(null);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getDashboard();
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRecalculate() {
    setRecalcLoading(true);
    try {
      await adminService.recalculateScores();
      showToast('Scores recalculated and rankings updated');
      load();
    } catch (e) {
      showToast(e.response?.data?.message || 'Recalculation failed', 'error');
    } finally {
      setRecalcLoading(false);
    }
  }

  async function handleReport() {
    setReportLoading(true);
    try {
      const res = await adminService.generateReport();
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-report-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Report downloaded');
    } catch (e) {
      showToast('Report generation failed', 'error');
    } finally {
      setReportLoading(false);
    }
  }

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <main className="flex-1 h-full overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-3 block">error_outline</span>
          <p className="text-secondary font-semibold mb-1">Failed to load dashboard</p>
          <p className="text-slate-500 text-sm mb-5">{error}</p>
          <button onClick={load} className="px-5 py-2 bg-primary text-secondary font-semibold rounded-lg text-sm hover:bg-primary/90 transition-colors">
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const raw = data || {};
  const stats = raw.stats || raw.kpis || {};
  const departmentStats = raw.departmentStats || raw.departmentPerformance || [];
  const upcomingDrives = raw.upcomingDrives || [];
  const recentPlacements = raw.recentPlacements || [];

  // bar chart max for dept stats
  const maxDeptScore = departmentStats.length
    ? Math.max(...departmentStats.map((d) => d.avgScore || 0), 1)
    : 100;

  // readiness delta
  const parsedTrend = typeof stats.readinessTrend === 'string'
    ? parseFloat(stats.readinessTrend.replace('%', ''))
    : null;

  const readinessDelta = stats.avgReadinessScore != null && stats.avgReadinessLastSemester != null
    ? (stats.avgReadinessScore - stats.avgReadinessLastSemester).toFixed(1)
    : (Number.isFinite(parsedTrend) ? parsedTrend.toFixed(1) : null);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="flex-1 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <motion.header 
            className="mb-8"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Admin Portal</p>
            <h2 className="text-3xl font-bold text-secondary mb-1">System Overview</h2>
            <p className="text-slate-500">Here's what's happening across campus today.</p>
          </motion.header>

          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: 'Total Students',
                value: stats.totalStudents?.toLocaleString() ?? '—',
                badge: null,
                note: 'enrolled',
                icon: 'groups',
                iconColor: 'text-blue-600',
                iconBg: 'bg-blue-50',
              },
              {
                label: 'Active Recruiters',
                value: (stats.totalRecruiters ?? stats.activeRecruiters)?.toLocaleString() ?? '—',
                badge: null,
                note: 'registered',
                icon: 'business_center',
                iconColor: 'text-purple-600',
                iconBg: 'bg-purple-50',
              },
              {
                label: 'Avg Readiness',
                value: stats.avgReadinessScore != null ? `${Math.round(stats.avgReadinessScore)}%` : '—',
                badge: readinessDelta != null ? `${readinessDelta > 0 ? '+' : ''}${readinessDelta}%` : null,
                positive: readinessDelta != null ? parseFloat(readinessDelta) >= 0 : true,
                note: 'vs last semester',
                icon: 'speed',
                iconColor: 'text-primary',
                iconBg: 'bg-primary/10',
              },
            ].map(({ label, value, badge, positive, note, icon, iconColor, iconBg }, i) => (
              <motion.div
                key={label}
                className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-6 flex flex-col justify-between hover:ring-primary/40 transition-colors group"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
                    <h3 className="text-4xl font-bold text-secondary">{value}</h3>
                  </div>
                  <div className={`p-2.5 rounded-xl ${iconBg} group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {badge && (
                    <span className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ${
                      positive
                        ? 'text-emerald-600 bg-emerald-50 ring-emerald-600/20'
                        : 'text-red-600 bg-red-50 ring-red-600/20'
                    }`}>
                      <span className="material-symbols-outlined text-sm mr-0.5">{positive ? 'trending_up' : 'trending_down'}</span>
                      {badge}
                    </span>
                  )}
                  <span className="text-slate-400 text-xs">{note}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts + Widgets Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Department Performance Bar Chart */}
            <motion.div 
              className="lg:col-span-2 bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-secondary">Department Performance</h3>
                  <p className="text-slate-500 text-sm">Average readiness score by department</p>
                </div>
              </div>

              {departmentStats.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
                  No department data available
                </div>
              ) : (
                <div className="relative h-56 flex items-end justify-between gap-2 sm:gap-3 px-2 pb-2 border-b border-slate-100">
                  {/* Y-axis lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2">
                    {[100, 75, 50, 25, 0].map((l) => (
                      <div key={l} className="w-full border-t border-slate-100 flex items-center">
                        <span className="text-xs text-slate-400 -ml-7 w-6 text-right">{l}</span>
                      </div>
                    ))}
                  </div>
                  {departmentStats.map(({ department, avgScore, count, studentCount }) => {
                    const totalCount = count ?? studentCount ?? 0;
                    const h = Math.round(((avgScore || 0) / 100) * 100);
                    const shortDept = department?.replace('Computer ', 'CS ').replace('Engineering', 'Eng').replace('Science', 'Sci') || '—';
                    return (
                      <div key={department} className="relative z-10 flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                        <div
                          className="w-full max-w-[56px] rounded-t-md transition-all duration-500 relative"
                          style={{
                            height: `${h}%`,
                            background: 'linear-gradient(to top, #c6a43f, #ebdcb2)',
                            opacity: 0.9,
                          }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-opacity shadow-lg z-20 pointer-events-none">
                            <p className="font-semibold">{department}</p>
                            <p>{Math.round(avgScore || 0)}% avg · {totalCount} students</p>
                          </div>
                        </div>
                        <span className="mt-2 text-xs font-semibold text-slate-400 group-hover:text-secondary transition-colors text-center">{shortDept}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-5">
              {/* Upcoming Drives */}
              <motion.div 
                className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 flex-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-secondary">Upcoming Drives</h3>
                  <Link to="/admin/placement-drives" className="text-xs text-primary font-medium hover:underline">View All</Link>
                </div>
                {upcomingDrives.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No upcoming drives</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingDrives.slice(0, 4).map((drive) => (
                      <div key={drive.id} className="flex gap-3 items-start p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="size-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {drive.company?.logoUrl
                            ? <img src={drive.company.logoUrl} alt={drive.company?.name || drive.company} className="size-full object-cover" />
                            : <span className="material-symbols-outlined text-slate-400 text-[18px]">business</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-secondary truncate">{drive.company?.name || drive.company || '—'}</p>
                          <p className="text-xs text-slate-400 truncate">{drive.role}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ring-1 ring-inset ${driveBadgeCls(drive.status)}`}>
                              {drive.status}
                            </span>
                            {drive.packageLpa && (
                              <span className="text-[10px] text-slate-400">{drive.packageLpa} LPA</span>
                            )}
                            <span className="text-[10px] text-slate-400">{fmtDate(drive.driveDate || drive.date)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                className="bg-secondary rounded-2xl p-5 relative overflow-hidden shadow-md flex-shrink-0"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <div className="absolute -right-3 -top-3 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-[100px] text-primary">bolt</span>
                </div>
                <h3 className="text-base font-bold text-white mb-4 relative z-10">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2.5 relative z-10">
                  <button
                    onClick={() => navigate('/admin/students')}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 p-3 rounded-xl text-left transition-all flex flex-col gap-1.5 group"
                  >
                    <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">school</span>
                    <span className="text-xs font-medium text-slate-300">Students</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/placement-drives')}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 p-3 rounded-xl text-left transition-all flex flex-col gap-1.5 group"
                  >
                    <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">event_available</span>
                    <span className="text-xs font-medium text-slate-300">New Drive</span>
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={reportLoading}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 p-3 rounded-xl text-left transition-all flex flex-col gap-1.5 group disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">analytics</span>
                    <span className="text-xs font-medium text-slate-300">{reportLoading ? 'Exporting…' : 'Export CSV'}</span>
                  </button>
                  <button
                    onClick={handleRecalculate}
                    disabled={recalcLoading}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 p-3 rounded-xl text-left transition-all flex flex-col gap-1.5 group disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform ${recalcLoading ? 'animate-spin' : ''}`}>refresh</span>
                    <span className="text-xs font-medium text-slate-300">{recalcLoading ? 'Recalculating…' : 'Recalc Scores'}                    </span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Recent Placements */}
          <motion.div 
            className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-secondary">Recent Placements</h3>
              <button
                onClick={handleReport}
                disabled={reportLoading}
                className="flex items-center gap-1.5 p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-secondary disabled:opacity-50"
                title="Download CSV report"
              >
                <span className="material-symbols-outlined text-xl">download</span>
              </button>
            </div>

            {recentPlacements.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">No recent placements</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider font-medium border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3">Student</th>
                        <th className="px-6 py-3 hidden sm:table-cell">Department</th>
                        <th className="px-6 py-3">Company</th>
                        <th className="px-6 py-3 hidden md:table-cell">Package (LPA)</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentPlacements.map((p, i) => {
                        const name    = p.student?.fullName || p.studentName || '—';
                        const dept    = p.student?.department || p.studentDept || '—';
                        const company = p.company?.name || p.company || '—';
                        const avatar  = p.student?.avatarUrl || p.studentAvatar;
                        const color   = avatarColor(name);
                        return (
                          <motion.tr 
                            key={p.id} 
                            className="hover:bg-slate-50 transition-colors"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 + i * 0.04 }}
                          >
                            <td className="px-6 py-4 font-medium text-secondary">
                              <div className="flex items-center gap-3">
                                {avatar
                                  ? <img src={avatar} alt={name} className="size-8 rounded-full object-cover flex-shrink-0" />
                                  : <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${color}`}>{initials(name)}</div>
                                }
                                {name}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500 hidden sm:table-cell">{dept}</td>
                            <td className="px-6 py-4 text-slate-600">{company}</td>
                            <td className="px-6 py-4 text-secondary font-semibold hidden md:table-cell">
                              {p.packageLpa ? `${p.packageLpa} LPA` : '—'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ring-1 ring-inset ${placementBadgeCls(p.status)}`}>
                                <span className="size-1.5 rounded-full bg-current opacity-70" />
                                {p.status || 'placed'}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex justify-center">
                  <button
                    onClick={handleReport}
                    disabled={reportLoading}
                    className="text-sm text-primary font-medium hover:underline disabled:opacity-50"
                  >
                    {reportLoading ? 'Generating…' : 'Export Full Report'}
                  </button>
                </div>
              </>
            )}
          </motion.div>

        </div>
      </main>
    </>
  );
}
