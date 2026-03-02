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

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Invite Recruiter Modal ────────────────────────────────────────────────────
function InviteModal({ open, onClose, onInvite }) {
  const [email,     setEmail]     = useState('');
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (!open) return;
    setEmail(''); setCompanyId(''); setError('');
    setFetching(true);
    adminService.getCompanies({ limit: 100 })
      .then((r) => setCompanies(r.data?.data || []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true);
    setError('');
    try {
      await onInvite({ email: email.trim(), companyId: companyId || undefined });
    } catch (err) {
      setError(err.response?.data?.message || 'Invite failed');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all bg-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-secondary">Invite Recruiter</h3>
            <p className="text-xs text-slate-500 mt-0.5">Send a 7-day invitation link</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-secondary hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Recruiter Email *</label>
            <input
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recruiter@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Company (optional)</label>
            <select
              className={inputCls}
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              disabled={fetching}
            >
              <option value="">— Select company —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-secondary text-sm font-semibold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-10 rounded-xl bg-primary text-secondary text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Sk({ className }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminRecruiters() {
  const [recruiters, setRecruiters]     = useState([]);
  const [total,      setTotal]          = useState(0);
  const [page,       setPage]           = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [loading,    setLoading]        = useState(true);
  const [error,      setError]          = useState(null);
  const [toast,      setToast]          = useState(null);
  const [search,     setSearch]         = useState('');
  const [showInvite, setShowInvite]     = useState(false);
  const [toggleLoading, setToggleLoading] = useState(null); // userId being toggled

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: 12 };
      if (search) params.search = search;
      const res = await adminService.getRecruiters(params);
      const d   = res.data;
      setRecruiters(d.data || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 1);
      setPage(d.page || p);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load recruiters');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(() => load(1), 350);
    return () => clearTimeout(t);
  }, [search]);

  async function handleInvite(payload) {
    await adminService.inviteRecruiter(payload);
    showToast(`Invite sent to ${payload.email}`);
    setShowInvite(false);
  }

  async function handleToggle(recruiter) {
    setToggleLoading(recruiter.userId || recruiter.id);
    try {
      await adminService.toggleUserStatus(recruiter.userId || recruiter.id, {
        isActive: !recruiter.isActive,
      });
      showToast(`${recruiter.fullName} ${recruiter.isActive ? 'deactivated' : 'activated'}`);
      load(page);
    } catch (e) {
      showToast(e.response?.data?.message || 'Status update failed', 'error');
    } finally {
      setToggleLoading(null);
    }
  }

  // Derived stats
  const activeCount    = recruiters.filter((r) => r.isActive).length;
  const companyCount   = new Set(recruiters.map((r) => r.company?.id).filter(Boolean)).size;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} onInvite={handleInvite} />

      <main className="flex-1 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Admin Portal</p>
              <h1 className="text-3xl font-bold text-secondary tracking-tight">Recruiters</h1>
              <p className="text-slate-500 text-sm mt-1">Manage recruiter accounts and send invitations.</p>
            </div>
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-secondary rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Invite Recruiter
            </button>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Recruiters', value: total.toLocaleString(),        icon: 'business_center', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Active',           value: activeCount.toLocaleString(),  icon: 'check_circle',    color: 'text-emerald-600',bg: 'bg-emerald-50'},
              { label: 'Companies',        value: companyCount.toLocaleString(), icon: 'apartment',       color: 'text-blue-600',   bg: 'bg-blue-50'   },
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

          {/* Search */}
          <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-4">
            <div className="relative group max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 text-sm transition-all"
                placeholder="Search by name, email, or company…"
              />
            </div>
          </div>

          {/* Recruiter Grid */}
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
                    <div key={i} className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <Sk className="size-12 rounded-full" />
                        <div className="flex-1">
                          <Sk className="h-4 w-32 mb-2" />
                          <Sk className="h-3 w-24" />
                        </div>
                      </div>
                      <Sk className="h-3 w-full mb-2" />
                      <Sk className="h-3 w-3/4" />
                    </div>
                  ))
                : recruiters.length === 0
                  ? (
                    <div className="col-span-3 py-16 text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl mb-2 block">person_search</span>
                      <p>No recruiters match your search</p>
                    </div>
                  )
                  : recruiters.map((r) => {
                      const name  = r.fullName || '—';
                      const color = avatarColor(name);
                      const isToggling = toggleLoading === (r.userId || r.id);
                      return (
                        <div
                          key={r.id}
                          className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 flex flex-col gap-4 hover:ring-primary/30 transition-colors"
                        >
                          {/* Header */}
                          <div className="flex items-start gap-3">
                            {r.avatarUrl
                              ? <img src={r.avatarUrl} alt={name} className="size-12 rounded-full object-cover flex-shrink-0" />
                              : <div className={`size-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${color}`}>{initials(name)}</div>
                            }
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-secondary text-sm leading-tight truncate">{name}</p>
                              <p className="text-xs text-slate-500 truncate">{r.designation || '—'}</p>
                              <p className="text-xs text-slate-400 truncate">{r.email}</p>
                            </div>
                            <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${
                              r.isActive
                                ? 'bg-green-50 text-green-700 ring-green-600/20'
                                : 'bg-slate-100 text-slate-500 ring-slate-300/40'
                            }`}>
                              {r.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          {/* Company */}
                          {r.company && (
                            <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                              <div className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {r.company.logoUrl
                                  ? <img src={r.company.logoUrl} alt={r.company.name} className="size-full object-cover" />
                                  : <span className="material-symbols-outlined text-slate-400 text-[16px]">business</span>
                                }
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-secondary truncate">{r.company.name}</p>
                                {r.company.industry && (
                                  <p className="text-[10px] text-slate-400 truncate">{r.company.industry}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {[
                              { label: 'Jobs',       value: r.jobCount       ?? '—' },
                              { label: 'Shortlists', value: r.shortlistCount ?? '—' },
                              { label: 'Joined',     value: fmtDate(r.createdAt) },
                            ].map(({ label, value }) => (
                              <div key={label} className="bg-slate-50 rounded-lg py-2 px-1">
                                <p className="text-sm font-bold text-secondary leading-tight">{value}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
                              </div>
                            ))}
                          </div>

                          {/* Toggle */}
                          <button
                            onClick={() => handleToggle(r)}
                            disabled={isToggling}
                            className={`w-full h-9 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50 ${
                              r.isActive
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {isToggling ? 'Updating…' : r.isActive ? 'Deactivate' : 'Activate'}
                          </button>
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
                Showing <span className="font-semibold text-secondary">{recruiters.length}</span> of{' '}
                <span className="font-semibold text-secondary">{total.toLocaleString()}</span> recruiters
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
