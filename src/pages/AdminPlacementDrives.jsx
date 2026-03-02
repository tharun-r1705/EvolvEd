import React, { useState, useEffect, useCallback } from 'react';
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

function driveBadgeCls(status) {
  const m = {
    upcoming:  'bg-blue-50 text-blue-700 ring-blue-600/20',
    ongoing:   'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    completed: 'bg-slate-100 text-slate-600 ring-slate-300/40',
    cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
  };
  return m[(status || '').toLowerCase()] || 'bg-slate-100 text-slate-600 ring-slate-300/40';
}

const STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];

// ─── Create Drive Modal ───────────────────────────────────────────────────────
function CreateDriveModal({ open, onClose, onCreate }) {
  const [companies, setCompanies] = useState([]);
  const [fetching,  setFetching]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [form, setForm] = useState({
    companyId:     '',
    role:          '',
    driveDate:     '',
    packageLpa:    '',
    eligibilityGpa:'',
    totalSlots:    '',
    status:        'upcoming',
  });

  useEffect(() => {
    if (!open) return;
    setForm({ companyId: '', role: '', driveDate: '', packageLpa: '', eligibilityGpa: '', totalSlots: '', status: 'upcoming' });
    setError('');
    setFetching(true);
    adminService.getCompanies({ limit: 100 })
      .then((r) => setCompanies(r.data?.data || []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [open]);

  if (!open) return null;

  function field(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.companyId) { setError('Company is required'); return; }
    if (!form.role.trim()) { setError('Role is required'); return; }
    if (!form.driveDate) { setError('Drive date is required'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        companyId:      form.companyId,
        role:           form.role.trim(),
        driveDate:      form.driveDate,
        status:         form.status,
        packageLpa:     form.packageLpa    ? parseFloat(form.packageLpa)    : undefined,
        eligibilityGpa: form.eligibilityGpa ? parseFloat(form.eligibilityGpa) : undefined,
        totalSlots:     form.totalSlots    ? parseInt(form.totalSlots)      : undefined,
      };
      await onCreate(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create drive');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all bg-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-secondary">Create Placement Drive</h3>
            <p className="text-xs text-slate-500 mt-0.5">Schedule a new placement drive</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-secondary hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Company *</label>
            <select className={inputCls} value={form.companyId} onChange={field('companyId')} disabled={fetching}>
              <option value="">— Select company —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Role / Position *</label>
            <input className={inputCls} value={form.role} onChange={field('role')} placeholder="e.g. Software Engineer" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Drive Date *</label>
              <input type="date" className={inputCls} value={form.driveDate} onChange={field('driveDate')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
              <select className={inputCls} value={form.status} onChange={field('status')}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Package (LPA)</label>
              <input type="number" step="0.1" min="0" className={inputCls} value={form.packageLpa} onChange={field('packageLpa')} placeholder="e.g. 12" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Min GPA</label>
              <input type="number" step="0.1" min="0" max="10" className={inputCls} value={form.eligibilityGpa} onChange={field('eligibilityGpa')} placeholder="e.g. 7.0" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Total Slots</label>
              <input type="number" min="1" className={inputCls} value={form.totalSlots} onChange={field('totalSlots')} placeholder="e.g. 20" />
            </div>
          </div>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-secondary text-sm font-semibold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-10 rounded-xl bg-primary text-secondary text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Creating…' : 'Create Drive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Status Update Dropdown ───────────────────────────────────────────────────
function StatusDropdown({ drive, onUpdate }) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSelect(status) {
    setOpen(false);
    if (status === drive.status) return;
    setLoading(true);
    try {
      await onUpdate(drive.id, { status });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 ${driveBadgeCls(drive.status)}`}
      >
        {drive.status || 'upcoming'}
        <span className="material-symbols-outlined text-[12px]">expand_more</span>
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white rounded-xl shadow-lg ring-1 ring-slate-200 z-20 py-1 min-w-[130px]">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleSelect(s)}
              className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 ${s === drive.status ? 'text-primary' : 'text-secondary'}`}
            >
              {s === drive.status && <span className="material-symbols-outlined text-[12px]">check</span>}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Sk({ className }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
}

const FILTER_TABS = [
  { label: 'All',       value: '' },
  { label: 'Upcoming',  value: 'upcoming' },
  { label: 'Ongoing',   value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminPlacementDrives() {
  const [drives,     setDrives]     = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [toast,      setToast]      = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 12 };
      if (statusFilter) params.status = statusFilter;
      const res = await adminService.getPlacementDrives(params);
      const d   = res.data;
      setDrives(d.data || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 1);
      setPage(d.page || p);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load drives');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { load(1); }, [statusFilter]);

  async function handleCreate(payload) {
    await adminService.createPlacementDrive(payload);
    showToast('Placement drive created');
    setShowCreate(false);
    load(1);
  }

  async function handleUpdateStatus(id, data) {
    try {
      await adminService.updatePlacementDrive(id, data);
      showToast('Drive status updated');
      load(page);
    } catch (e) {
      showToast(e.response?.data?.message || 'Update failed', 'error');
    }
  }

  // Derived stats
  const upcoming  = drives.filter((d) => d.status === 'upcoming').length;
  const ongoing   = drives.filter((d) => d.status === 'ongoing').length;
  const completed = drives.filter((d) => d.status === 'completed').length;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <CreateDriveModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />

      <main className="flex-1 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Admin Portal</p>
              <h1 className="text-3xl font-bold text-secondary tracking-tight">Placement Drives</h1>
              <p className="text-slate-500 text-sm mt-1">Schedule and manage campus placement drives.</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-secondary rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Drive
            </button>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Drives', value: total.toLocaleString(),     icon: 'event_available', color: 'text-blue-600',    bg: 'bg-blue-50'    },
              { label: 'Upcoming',     value: upcoming.toLocaleString(),  icon: 'schedule',        color: 'text-amber-600',   bg: 'bg-amber-50'   },
              { label: 'Ongoing',      value: ongoing.toLocaleString(),   icon: 'play_circle',     color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Completed',    value: completed.toLocaleString(), icon: 'check_circle',    color: 'text-slate-600',   bg: 'bg-slate-100'  },
            ].map(({ label, value, icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 px-5 py-4 flex items-center gap-4 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
                <div className={`size-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`material-symbols-outlined text-[22px] ${color}`}>{icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-1.5 flex gap-1 w-fit">
            {FILTER_TABS.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setStatusFilter(value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  statusFilter === value
                    ? 'bg-primary text-secondary shadow-sm'
                    : 'text-slate-500 hover:text-secondary hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Drives Grid */}
          {error ? (
            <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 py-16 text-center">
              <span className="material-symbols-outlined text-4xl text-red-400 mb-2 block">error_outline</span>
              <p className="text-secondary font-semibold">{error}</p>
              <button onClick={() => load(1)} className="mt-4 text-sm text-primary hover:underline">Retry</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <Sk className="size-12 rounded-xl" />
                        <div className="flex-1">
                          <Sk className="h-4 w-32 mb-2" />
                          <Sk className="h-3 w-24" />
                        </div>
                      </div>
                      <Sk className="h-3 w-full" />
                      <Sk className="h-3 w-3/4" />
                      <Sk className="h-8 rounded-xl" />
                    </div>
                  ))
                : drives.length === 0
                  ? (
                    <div className="col-span-3 py-16 text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl mb-2 block">event_busy</span>
                      <p>No placement drives found</p>
                      <button onClick={() => setShowCreate(true)} className="mt-3 text-sm text-primary hover:underline">
                        Create your first drive
                      </button>
                    </div>
                  )
                  : drives.map((drive) => {
                      const slotsPercent = drive.totalSlots
                        ? Math.round(((drive.filledSlots || 0) / drive.totalSlots) * 100)
                        : null;
                      return (
                        <div
                          key={drive.id}
                          className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 flex flex-col gap-4 hover:ring-primary/30 transition-colors"
                        >
                          {/* Company header */}
                          <div className="flex items-start gap-3">
                            <div className="size-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {drive.company?.logoUrl
                                ? <img src={drive.company.logoUrl} alt={drive.company.name} className="size-full object-cover" />
                                : <span className="material-symbols-outlined text-slate-400 text-[22px]">business</span>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-secondary text-sm leading-tight truncate">{drive.company?.name || '—'}</p>
                              <p className="text-xs text-slate-500 truncate">{drive.role}</p>
                              {drive.company?.industry && (
                                <p className="text-[10px] text-slate-400 truncate">{drive.company.industry}</p>
                              )}
                            </div>
                            <StatusDropdown drive={drive} onUpdate={handleUpdateStatus} />
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-2 gap-2.5 text-xs">
                            <div className="bg-slate-50 rounded-lg p-2.5">
                              <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Date</p>
                              <p className="font-semibold text-secondary">{fmtDate(drive.driveDate)}</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-2.5">
                              <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Package</p>
                              <p className="font-semibold text-secondary">
                                {drive.packageLpa ? `${drive.packageLpa} LPA` : '—'}
                              </p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-2.5">
                              <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Min GPA</p>
                              <p className="font-semibold text-secondary">
                                {drive.eligibilityGpa ?? '—'}
                              </p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-2.5">
                              <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Slots</p>
                              <p className="font-semibold text-secondary">
                                {drive.totalSlots
                                  ? `${drive.filledSlots || 0} / ${drive.totalSlots}`
                                  : '—'}
                              </p>
                            </div>
                          </div>

                          {/* Slots fill bar */}
                          {slotsPercent !== null && (
                            <div>
                              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                <span>Slots filled</span>
                                <span>{slotsPercent}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    slotsPercent >= 100 ? 'bg-red-400' : slotsPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(slotsPercent, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
              }
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-secondary">{drives.length}</span> of{' '}
                <span className="font-semibold text-secondary">{total.toLocaleString()}</span> drives
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { const p = page - 1; setPage(p); load(p); }}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500 px-1">{page} / {totalPages}</span>
                <button
                  onClick={() => { const p = page + 1; setPage(p); load(p); }}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
