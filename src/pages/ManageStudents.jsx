import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

// ─── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-6 max-w-sm w-full">
        <h3 className="text-base font-bold text-secondary mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-secondary text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-colors ${
              danger ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-primary hover:bg-primary/90 text-secondary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function initials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
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

function statusBadgeCls(status) {
  const m = {
    active:   'bg-green-50 text-green-700 ring-green-600/20',
    inactive: 'bg-slate-100 text-slate-500 ring-slate-300/40',
    alumni:   'bg-blue-50 text-blue-700 ring-blue-600/20',
    placed:   'bg-purple-50 text-purple-700 ring-purple-600/20',
  };
  return m[(status || '').toLowerCase()] || 'bg-slate-100 text-slate-600 ring-slate-300/40';
}

function scoreBarColor(score) {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-400';
}

function scoreLabel(score) {
  if (score >= 70) return { label: 'Ready', cls: 'text-emerald-600' };
  if (score >= 50) return { label: 'In Review', cls: 'text-amber-600' };
  return { label: 'Needs Prep', cls: 'text-red-500' };
}

// ─── Row Dropdown Menu ────────────────────────────────────────────────────────
function RowMenu({ student, onView, onToggleStatus, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const isActive = student.status !== 'inactive';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        title="More Actions"
      >
        <span className="material-symbols-outlined text-[18px]">more_vert</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg ring-1 ring-slate-200 z-30 py-1">
          <button
            onClick={() => { setOpen(false); onView(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-secondary hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-400">open_in_new</span>
            View Full Profile
          </button>
          <button
            onClick={() => { setOpen(false); onToggleStatus(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-secondary hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-400">
              {isActive ? 'person_off' : 'person'}
            </span>
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
          <div className="border-t border-slate-100 my-1" />
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">delete_outline</span>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[250, 80, 100, 60, 120, 80, 60].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 animate-pulse bg-slate-200 rounded-lg" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

const DEPARTMENTS = ['All Departments', 'Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'MBA'];
const YEARS       = ['All Years', '1', '2', '3', '4'];
const STATUSES    = ['All Status', 'active', 'inactive', 'placed', 'alumni'];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ManageStudents() {
  const navigate = useNavigate();

  const [students,  setStudents]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [totalPages,setTotalPages] = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [toast,     setToast]     = useState(null);

  // Filters
  const [search,     setSearch]     = useState('');
  const [department, setDepartment] = useState('');
  const [year,       setYear]       = useState('');
  const [status,     setStatus]     = useState('');

  // Modals
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [toggleTarget,  setToggleTarget]  = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Stats
  const [statsData, setStatsData] = useState({ total: 0, ready: 0, inReview: 0, needsPrep: 0 });
  const [reportLoading, setReportLoading] = useState(false);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 20 };
      if (search)     params.search     = search;
      if (department) params.department = department;
      if (year)       params.yearOfStudy = year;
      if (status)     params.status     = status;

      const res = await adminService.getStudents(params);
      const d   = res.data;
      setStudents(d.data || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 1);
      setPage(d.page || p);

      // derive stats from first full unfiltered call
      if (!search && !department && !year && !status) {
        const all = d.data || [];
        setStatsData({
          total:     d.total || 0,
          ready:     all.filter((s) => (s.readinessScore || 0) >= 70).length,
          inReview:  all.filter((s) => { const sc = s.readinessScore || 0; return sc >= 50 && sc < 70; }).length,
          needsPrep: all.filter((s) => (s.readinessScore || 0) < 50).length,
        });
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [search, department, year, status, page]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { load(1); }, 400);
    return () => clearTimeout(t);
  }, [search, department, year, status]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminService.deleteStudent(deleteTarget.id);
      showToast(`${deleteTarget.name} deleted`);
      load(page);
    } catch (e) {
      showToast(e.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setActionLoading(false);
      setDeleteTarget(null);
    }
  }

  async function handleToggleStatus() {
    if (!toggleTarget) return;
    const isActive = toggleTarget.status !== 'inactive';
    setActionLoading(true);
    try {
      await adminService.toggleUserStatus(toggleTarget.userId, { isActive: !isActive });
      showToast(`${toggleTarget.name} ${isActive ? 'deactivated' : 'activated'}`);
      load(page);
    } catch (e) {
      showToast(e.response?.data?.message || 'Status update failed', 'error');
    } finally {
      setActionLoading(false);
      setToggleTarget(null);
    }
  }

  async function handleExport() {
    setReportLoading(true);
    try {
      const res = await adminService.generateReport();
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export ready — check your downloads');
    } catch {
      showToast('Export failed', 'error');
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Student"
        message={`Permanently delete ${deleteTarget?.name}? This cannot be undone.`}
        confirmLabel={actionLoading ? 'Deleting…' : 'Delete'}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        open={!!toggleTarget}
        title={toggleTarget?.status !== 'inactive' ? 'Deactivate Student' : 'Activate Student'}
        message={
          toggleTarget?.status !== 'inactive'
            ? `Deactivate ${toggleTarget?.name}? They won't be able to log in.`
            : `Reactivate ${toggleTarget?.name}?`
        }
        confirmLabel={toggleTarget?.status !== 'inactive' ? 'Deactivate' : 'Activate'}
        danger={toggleTarget?.status !== 'inactive'}
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleTarget(null)}
      />

      <main className="flex-1 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

          {/* Page Header */}
          <motion.div 
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Admin Portal</p>
              <h1 className="text-3xl font-bold text-secondary tracking-tight">Manage Students</h1>
              <p className="text-slate-500 text-sm mt-1">
                Search, filter and manage student placement readiness records.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={handleExport}
                disabled={reportLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-secondary hover:border-slate-300 font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                {reportLoading ? 'Exporting…' : 'Export CSV'}
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-secondary hover:border-slate-300 font-medium text-sm transition-colors shadow-sm"
                title="Import CSV (coming soon)"
              >
                <span className="material-symbols-outlined text-[18px]">file_upload</span>
                Import CSV
              </button>
            </div>
          </motion.div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Students', value: total.toLocaleString(),                    icon: 'groups',          color: 'text-blue-600',    bg: 'bg-blue-50'    },
              { label: 'Ready to Place', value: statsData.ready.toLocaleString(),           icon: 'check_circle',    color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'In Review',      value: statsData.inReview.toLocaleString(),        icon: 'pending_actions', color: 'text-amber-600',   bg: 'bg-amber-50'   },
              { label: 'Needs Prep',     value: statsData.needsPrep.toLocaleString(),       icon: 'warning',         color: 'text-red-600',     bg: 'bg-red-50'     },
            ].map(({ label, value, icon, color, bg }, i) => (
              <motion.div 
                key={label} 
                className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 px-5 py-4 flex items-center gap-4 relative overflow-hidden"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
                <div className={`size-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`material-symbols-outlined text-[22px] ${color}`}>{icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search & Filters */}
          <motion.div 
            className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Search */}
              <div className="lg:col-span-4 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 text-sm transition-all"
                  placeholder="Search by name, ID, or department…"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="lg:col-span-8 flex flex-wrap gap-2.5 items-center lg:justify-end">
                {[
                  { value: department, onChange: setDepartment, opts: DEPARTMENTS },
                  { value: year,       onChange: setYear,       opts: YEARS },
                  { value: status,     onChange: setStatus,     opts: STATUSES },
                ].map(({ value: val, onChange, opts }) => (
                  <div key={opts[0]} className="relative inline-block">
                    <select
                      value={val}
                      onChange={(e) => onChange(e.target.value === opts[0] ? '' : e.target.value)}
                      className="appearance-none bg-white border border-slate-200 text-slate-600 py-2.5 pl-3 pr-8 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/40 hover:border-slate-300 transition-colors"
                    >
                      {opts.map((o) => <option key={o} value={o === opts[0] ? '' : o}>{o}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                  </div>
                ))}
                {(search || department || year || status) && (
                  <button
                    onClick={() => { setSearch(''); setDepartment(''); setYear(''); setStatus(''); }}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    Clear
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Data Table */}
          <motion.div 
            className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            {error ? (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-4xl text-red-400 mb-2 block">error_outline</span>
                <p className="text-secondary font-semibold">{error}</p>
                <button onClick={() => load(1)} className="mt-4 text-sm text-primary hover:underline">Retry</button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-semibold bg-slate-50/60">
                        <th className="px-6 py-4 min-w-[200px]">Student</th>
                        <th className="px-6 py-4 hidden sm:table-cell">ID</th>
                        <th className="px-6 py-4 hidden md:table-cell">Department</th>
                        <th className="px-6 py-4 hidden lg:table-cell text-center">GPA</th>
                        <th className="px-6 py-4">Readiness</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading
                        ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                        : students.length === 0
                          ? (
                            <tr>
                              <td colSpan={7} className="py-16 text-center text-slate-400 text-sm">
                                No students match your search
                              </td>
                            </tr>
                          )
                          : students.map((s) => {
                            const name  = s.name || '—';
                            const score = s.readinessScore || 0;
                            const { label: sl, cls: sc } = scoreLabel(score);
                            const color = avatarColor(name);
                            return (
                              <tr key={s.id} className="group hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {s.avatarUrl
                                      ? <img src={s.avatarUrl} alt={name} className="size-9 rounded-full object-cover flex-shrink-0" />
                                      : <div className={`size-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${color}`}>{initials(name)}</div>
                                    }
                                    <div>
                                      <div className="text-sm font-semibold text-secondary">{name}</div>
                                      <div className="text-xs text-slate-400">
                                        {s.yearOfStudy ? `Year ${s.yearOfStudy}` : '—'}
                                        {s.rank ? ` · Rank #${s.rank}` : ''}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500 font-mono hidden sm:table-cell">{s.studentId || '—'}</td>
                                <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">{s.department || '—'}</td>
                                <td className="px-6 py-4 text-sm text-secondary text-center font-semibold hidden lg:table-cell">
                                  {s.gpa != null ? s.gpa.toFixed(2) : '—'}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="w-32">
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                                      <div className={`${scoreBarColor(score)} h-1.5 rounded-full transition-all`} style={{ width: `${score}%` }} />
                                    </div>
                                    <span className={`text-xs font-semibold ${sc}`}>{sl} · {Math.round(score)}%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeCls(s.status)}`}>
                                    {s.status || 'active'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => navigate(`/admin/students/${s.id}`)}
                                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                      title="View Profile"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                                    </button>
                                    <button
                                      onClick={() => navigate(`/admin/students/${s.id}`)}
                                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                    </button>
                                    <RowMenu
                                      student={s}
                                      onView={() => navigate(`/admin/students/${s.id}`)}
                                      onToggleStatus={() => setToggleTarget(s)}
                                      onDelete={() => setDeleteTarget(s)}
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      }
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">
                    {loading ? 'Loading…' : (
                      <>Showing <span className="font-semibold text-secondary">{students.length}</span> of{' '}
                      <span className="font-semibold text-secondary">{total.toLocaleString()}</span> students</>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { const p = page - 1; setPage(p); load(p); }}
                      disabled={page <= 1 || loading}
                      className="px-3 py-1.5 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-500 px-1">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => { const p = page + 1; setPage(p); load(p); }}
                      disabled={page >= totalPages || loading}
                      className="px-3 py-1.5 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>

        </div>
      </main>
    </>
  );
}
