import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '../services/api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
      type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
    }`}>
      <span className="material-symbols-outlined !text-[18px]">{type === 'success' ? 'check_circle' : 'error'}</span>
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined !text-[16px]">close</span>
      </button>
    </div>
  );
}

const INDUSTRY_OPTIONS = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
  'Retail', 'Consulting', 'Media', 'Energy', 'Government', 'Other',
];

const SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

// ─── Create Company Modal ─────────────────────────────────────────────────────

function CreateCompanyModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', industry: '', website: '', logoUrl: '',
    location: '', size: '', description: '', careersUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Company name is required.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => { if (v.trim()) payload[k] = v.trim(); });
      await adminService.createCompany(payload);
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create company.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-secondary">Add Company</h2>
            <p className="text-slate-500 text-sm mt-0.5">Register a new company in EvolvEd.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-secondary hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined !text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">{error}</div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Company Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none transition-all"
              required
            />
          </div>

          {/* Industry + Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Industry</label>
              <select
                value={form.industry}
                onChange={(e) => update('industry', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-secondary focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none transition-all"
              >
                <option value="">Select…</option>
                {INDUSTRY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Company Size</label>
              <select
                value={form.size}
                onChange={(e) => update('size', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-secondary focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none transition-all"
              >
                <option value="">Select…</option>
                {SIZE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Location</label>
            <input
              type="text"
              placeholder="e.g. Bengaluru, India"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none transition-all"
            />
          </div>

          {/* Website + Careers URL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Website</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.website}
                onChange={(e) => update('website', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Careers Page</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.careersUrl}
                onChange={(e) => update('careersUrl', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none transition-all"
              />
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Logo URL</label>
            <input
              type="url"
              placeholder="https://... (optional)"
              value={form.logoUrl}
              onChange={(e) => update('logoUrl', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Brief company description…"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-primary text-secondary text-sm font-bold hover:bg-primary-dark transition-all shadow-sm disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);

  const LIMIT = 15;

  const fetchCompanies = useCallback(
    async (p = page) => {
      setLoading(true);
      setError(null);
      try {
        const params = { page: p, limit: LIMIT };
        if (search.trim()) params.search = search.trim();
        const res = await adminService.getCompanies(params);
        setCompanies(res.data.data ?? []);
        setTotal(res.data.total ?? 0);
        setTotalPages(res.data.totalPages ?? 1);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load companies.');
      } finally {
        setLoading(false);
      }
    },
    [page, search]
  );

  useEffect(() => {
    fetchCompanies(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Debounced search
  const searchTimer = React.useRef(null);
  function handleSearch(val) {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchCompanies(1);
    }, 400);
  }

  function handleCreated() {
    setShowCreate(false);
    setToast({ message: 'Company created successfully.', type: 'success' });
    setPage(1);
    fetchCompanies(1);
  }

  const start = (page - 1) * LIMIT + 1;
  const end = Math.min(page * LIMIT, total);

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-hide">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showCreate && <CreateCompanyModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}

      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full flex flex-col gap-6">

        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div>
            <p className="text-[#c6a43f] text-xs font-semibold uppercase tracking-widest mb-1">Admin · Companies</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary tracking-tight">Companies</h1>
            <p className="text-slate-500 text-sm mt-1">
              {loading ? 'Loading…' : `${total.toLocaleString()} compan${total !== 1 ? 'ies' : 'y'} registered`}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#c6a43f] hover:bg-[#b8943a] text-[#1e293b] text-sm font-bold transition-all shadow-sm hover:shadow-md self-start sm:self-auto"
          >
            <span className="material-symbols-outlined !text-[18px]">add</span>
            Add Company
          </button>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        {/* Search */}
        <motion.div 
          className="relative max-w-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 !text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search companies…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-secondary placeholder:text-slate-400 focus:border-[#c6a43f] focus:ring-2 focus:ring-[#c6a43f]/30 outline-none transition-all shadow-sm"
          />
        </motion.div>

        {/* Companies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-md ring-1 ring-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 px-6 py-16 text-center">
            <span className="material-symbols-outlined text-slate-300 !text-[48px] mb-3 block">business</span>
            <p className="text-slate-500 text-sm font-medium">
              {search ? 'No companies match your search.' : 'No companies yet. Add the first one!'}
            </p>
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); fetchCompanies(1); }} className="mt-3 text-[#c6a43f] text-sm font-medium hover:underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c, i) => (
              <motion.div 
                key={c.id} 
                className="bg-white rounded-2xl p-5 shadow-md ring-1 ring-slate-200 hover:ring-[#c6a43f]/40 transition-all flex flex-col gap-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.07 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                {/* Card Header */}
                <div className="flex items-start gap-3">
                  {c.logoUrl ? (
                    <img
                      src={c.logoUrl}
                      alt={c.name}
                      className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-white p-1 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#c6a43f]/10 border border-[#c6a43f]/20 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined !text-[24px] text-[#c6a43f]">business</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-secondary text-sm truncate">{c.name}</h3>
                    {c.industry && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 ring-1 ring-slate-200 mt-1">
                        {c.industry}
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                  {c.location && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined !text-[14px]">location_on</span>
                      {c.location}
                    </div>
                  )}
                  {c.size && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined !text-[14px]">group</span>
                      {c.size} employees
                    </div>
                  )}
                  {c.website && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined !text-[14px]">language</span>
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#c6a43f] hover:underline truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Description */}
                {c.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{c.description}</p>
                )}

                {/* Footer Stats */}
                <div className="border-t border-slate-100 pt-3 mt-auto">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined !text-[13px]">work</span>
                        {c.jobCount ?? 0} job{(c.jobCount ?? 0) !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined !text-[13px]">person</span>
                        {c.recruiterCount ?? 0} recruiter{(c.recruiterCount ?? 0) !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined !text-[13px]">event_available</span>
                        {c.driveCount ?? 0} drive{(c.driveCount ?? 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium text-secondary">{start}–{end}</span> of <span className="font-medium text-secondary">{total.toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-500 hover:border-[#c6a43f] hover:text-[#c6a43f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm text-slate-500">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-500 hover:border-[#c6a43f] hover:text-[#c6a43f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
