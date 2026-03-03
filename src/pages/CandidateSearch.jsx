import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { recruiterService } from '../services/api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700',
  'bg-rose-100 text-rose-600',  'bg-teal-100 text-teal-700',
  'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700',
  'bg-amber-100 text-amber-700',  'bg-emerald-100 text-emerald-700',
];

function avatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

// ─── Filter Panel ─────────────────────────────────────────────────────────────

function FilterPanel({ filters, onChange, onReset }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-base text-secondary">Filters</h3>
        <button
          onClick={onReset}
          className="text-xs font-medium text-slate-400 hover:text-primary flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined !text-[14px]">restart_alt</span>
          Reset
        </button>
      </div>
      <div className="p-5 flex flex-col gap-7">

        {/* Readiness Score Slider */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-secondary">Min Readiness Score</label>
            <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
              {filters.minScore}–100
            </span>
          </div>
          <input
            className="w-full cursor-pointer accent-primary"
            max="100" min="0" type="range"
            value={filters.minScore}
            onChange={(e) => onChange({ minScore: Number(e.target.value) })}
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>0</span><span>50</span><span>100</span>
          </div>
        </div>

        {/* Department Filter */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-secondary">Department</label>
          <input
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/40 outline-none transition-all"
            placeholder="e.g. Computer Science"
            type="text"
            value={filters.department}
            onChange={(e) => onChange({ department: e.target.value })}
          />
        </div>

        {/* Year of Study */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-secondary">Year of Study</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="yearOfStudy"
                className="border-slate-300 text-primary focus:ring-primary/40 accent-primary"
                checked={filters.yearOfStudy === ''}
                onChange={() => onChange({ yearOfStudy: '' })}
              />
              <span className="text-sm text-slate-600 group-hover:text-secondary transition-colors">All Years</span>
            </label>
            {YEAR_OPTIONS.map((yr) => (
              <label key={yr} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="yearOfStudy"
                  className="border-slate-300 text-primary focus:ring-primary/40 accent-primary"
                  checked={filters.yearOfStudy === yr}
                  onChange={() => onChange({ yearOfStudy: yr })}
                />
                <span className="text-sm text-slate-600 group-hover:text-secondary transition-colors">{yr}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ready for Hire */}
        <div className="flex flex-col gap-3 pb-4">
          <label className="text-sm font-semibold text-secondary">Availability</label>
          <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
            <span className="text-sm text-slate-600">Ready for hire (score ≥ 70)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={filters.readyForHire}
                onChange={(e) => onChange({ readyForHire: e.target.checked })}
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DEFAULT_FILTERS = {
  minScore: 0,
  department: '',
  yearOfStudy: '',
  readyForHire: false,
};

export default function CandidateSearch() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const LIMIT = 20;

  // Active filter tags (for the display bar)
  const activeTags = [];
  if (filters.minScore > 0) activeTags.push({ key: 'minScore', label: `Score ≥ ${filters.minScore}` });
  if (filters.department) activeTags.push({ key: 'department', label: `Dept: ${filters.department}` });
  if (filters.yearOfStudy) activeTags.push({ key: 'yearOfStudy', label: filters.yearOfStudy });
  if (filters.readyForHire) activeTags.push({ key: 'readyForHire', label: 'Ready for Hire' });
  if (search) activeTags.push({ key: 'search', label: `"${search}"` });

  const fetchCandidates = useCallback(
    async (overridePage = page) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: overridePage,
          limit: LIMIT,
        };
        if (search) params.search = search;
        if (filters.department) params.department = filters.department;
        if (filters.yearOfStudy) params.yearOfStudy = filters.yearOfStudy;
        if (filters.minScore > 0) params.minScore = filters.minScore;
        if (filters.readyForHire) params.readyForHire = true;

        const res = await recruiterService.getCandidates(params);
        setCandidates(res.data.data ?? []);
        setTotal(res.data.total ?? 0);
        setTotalPages(res.data.totalPages ?? 1);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load candidates.');
      } finally {
        setLoading(false);
      }
    },
    [search, filters, page]
  );

  useEffect(() => {
    fetchCandidates(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  // Debounce search
  const searchTimer = useRef(null);
  function handleSearchChange(val) {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchCandidates(1);
    }, 400);
  }

  function handleFilterChange(patch) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  function removeTag(key) {
    if (key === 'search') { setSearch(''); setPage(1); return; }
    const reset = { minScore: 0, department: '', yearOfStudy: '', readyForHire: false };
    setFilters((prev) => ({ ...prev, [key]: reset[key] }));
    setPage(1);
  }

  function clearAll() {
    setFilters(DEFAULT_FILTERS);
    setSearch('');
    setPage(1);
  }

  const start = (page - 1) * LIMIT + 1;
  const end = Math.min(page * LIMIT, total);

  return (
    <>
      {/* Mobile Filter Drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white border-l border-slate-200 shadow-2xl overflow-hidden">
            <FilterPanel filters={filters} onChange={handleFilterChange} onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1); }} />
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Filter Sidebar */}
        <aside className="w-[272px] bg-white border-r border-slate-200 flex-col overflow-hidden hidden lg:flex shrink-0 shadow-sm">
          <FilterPanel filters={filters} onChange={handleFilterChange} onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1); }} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full bg-background-light overflow-hidden">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="px-4 sm:px-6 lg:px-8 py-5 pb-0 flex-shrink-0"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-1">Talent Discovery</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary tracking-tight">Candidate Search</h1>
                {!loading && (
                  <p className="text-slate-500 mt-1 text-sm">
                    Showing <span className="font-semibold text-secondary">{total.toLocaleString()}</span> candidate{total !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0 items-center">
                {/* Search input */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 !text-[18px]">search</span>
                  <input
                    type="text"
                    placeholder="Search name, ID, dept…"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="h-9 pl-9 pr-3 w-44 sm:w-56 bg-white border border-slate-200 rounded-lg text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/40 outline-none transition-all shadow-sm"
                  />
                </div>
                <button
                  onClick={() => setFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined !text-[18px]">filter_list</span>
                  Filters
                </button>
              </div>
            </div>

            {/* Active Filter Tags */}
            {activeTags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center pb-4">
                <span className="text-xs font-semibold uppercase text-slate-400 mr-1">Active:</span>
                {activeTags.map((tag) => (
                  <div key={tag.key} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium">
                    <span>{tag.label}</span>
                    <button onClick={() => removeTag(tag.key)} className="hover:text-secondary transition-colors flex items-center ml-0.5">
                      <span className="material-symbols-outlined !text-[14px]">close</span>
                    </button>
                  </div>
                ))}
                <button onClick={clearAll} className="text-xs text-slate-400 font-medium hover:text-primary transition-colors ml-1">
                  Clear all
                </button>
              </div>
            )}
          </motion.div>

          {/* Table Container */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 overflow-hidden flex flex-col">
            <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 flex flex-col h-full overflow-hidden">

              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-5 sm:px-6 py-4 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider items-center flex-shrink-0 bg-slate-50/50">
                <div className="col-span-1">Rank</div>
                <div className="col-span-3">Candidate</div>
                <div className="col-span-2 hidden md:block">Department</div>
                <div className="col-span-3">Top Skills</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {/* Table Body */}
              <div className="overflow-y-auto flex-1 scrollbar-hide divide-y divide-slate-100">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                  </div>
                ) : error ? (
                  <div className="px-6 py-12 text-center text-red-500 text-sm">{error}</div>
                ) : candidates.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <span className="material-symbols-outlined text-slate-300 !text-[48px] mb-3 block">person_search</span>
                    <p className="text-slate-500 text-sm font-medium">No candidates match your filters.</p>
                    <button onClick={clearAll} className="mt-3 text-primary text-sm font-medium hover:underline">Clear all filters</button>
                  </div>
                ) : (
                  candidates.map((c, i) => {
                    const gold = c.readinessScore >= 90;
                    const color = avatarColor(c.name);
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 8 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
                        className="sm:grid sm:grid-cols-12 gap-4 px-5 sm:px-6 py-4 hover:bg-slate-50 transition-colors group flex items-center"
                      >
                        {/* Mobile */}
                        <div className="sm:hidden flex items-center gap-3 w-full">
                          {c.avatarUrl ? (
                            <img src={c.avatarUrl} alt={c.name} className="size-10 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${color}`}>
                              {initials(c.name)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-secondary text-sm truncate">{c.name}</h4>
                              {gold && <span className="material-symbols-outlined text-primary !text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>}
                            </div>
                            <p className="text-xs text-slate-400 truncate">{c.department} · {c.class || c.yearOfStudy || '—'}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`font-bold text-sm ${gold ? 'text-primary' : 'text-slate-400'}`}>{c.readinessScore}</span>
                            <Link to={`/recruiter/candidates/${c.id}`}>
                              <button className="text-primary hover:text-secondary hover:bg-primary border border-primary/40 rounded-lg p-1.5 transition-all ml-2">
                                <span className="material-symbols-outlined !text-[18px]">visibility</span>
                              </button>
                            </Link>
                          </div>
                        </div>

                        {/* Desktop */}
                        <div className="hidden sm:contents">
                          <div className="col-span-1 font-medium text-slate-400 text-sm">#{c.rank}</div>
                          <div className="col-span-3 flex items-center gap-3">
                            {c.avatarUrl ? (
                              <img src={c.avatarUrl} alt={c.name} className="size-9 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className={`size-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${color}`}>
                                {initials(c.name)}
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-secondary text-sm">{c.name}</h4>
                              <p className="text-xs text-slate-400">{c.class || c.yearOfStudy || '—'}</p>
                            </div>
                          </div>
                          <div className="col-span-2 text-sm text-slate-500 hidden md:flex items-center truncate">{c.department || '—'}</div>
                          <div className="col-span-3 flex flex-wrap gap-1 items-center">
                            {(c.skills ?? []).slice(0, 3).map((s) => (
                              <span key={s.id ?? s.name} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {s.name}
                              </span>
                            ))}
                            {(c.skills ?? []).length > 3 && (
                              <span className="text-xs text-slate-400">+{c.skills.length - 3}</span>
                            )}
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${gold ? 'bg-primary/10 border border-primary/20' : 'bg-slate-100 border border-slate-200'}`}>
                              {gold && (
                                <span className="material-symbols-outlined text-primary !text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                              )}
                              <span className={`font-bold text-sm ${gold ? 'text-primary' : 'text-slate-500'}`}>{c.readinessScore}/100</span>
                            </div>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Link to={`/recruiter/candidates/${c.id}`}>
                              <button className="text-primary hover:text-secondary hover:bg-primary border border-primary/40 hover:border-primary rounded-lg p-1.5 transition-all" title="View Profile">
                                <span className="material-symbols-outlined !text-[18px]">visibility</span>
                              </button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              <div className="border-t border-slate-100 p-4 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
                <div className="text-sm text-slate-500">
                  {loading ? (
                    <Skeleton className="h-4 w-40 inline-block" />
                  ) : total > 0 ? (
                    <>Showing <span className="font-medium text-secondary">{start}–{end}</span> of <span className="font-medium text-secondary">{total.toLocaleString()}</span></>
                  ) : (
                    'No results'
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page <= 1 || loading}
                    className="px-3 py-1 rounded-lg border border-slate-200 text-sm text-slate-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-slate-500 flex items-center">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages || loading}
                    className="px-3 py-1 rounded-lg border border-slate-200 text-sm text-slate-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
