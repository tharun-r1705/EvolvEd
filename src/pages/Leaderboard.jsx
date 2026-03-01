import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

import { leaderboardService } from '../services/api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-500';
}

function scoreBg(score) {
  if (score >= 80) return 'bg-green-50';
  if (score >= 60) return 'bg-yellow-50';
  return 'bg-red-50';
}

function TrendIcon({ trend }) {
  if (trend === 'up')
    return <span className="material-symbols-outlined text-[16px] text-green-500">trending_up</span>;
  if (trend === 'down')
    return <span className="material-symbols-outlined text-[16px] text-red-400">trending_down</span>;
  return <span className="material-symbols-outlined text-[16px] text-slate-300">trending_flat</span>;
}

function MedalIcon({ rank }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-sm font-bold text-slate-500 w-7 text-center tabular-nums">#{rank}</span>;
}

function Avatar({ avatarUrl, name, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${sizeClass} rounded-full object-cover ring-2 ring-white`} />;
  }
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div className={`${sizeClass} rounded-full bg-primary/20 ring-2 ring-white flex items-center justify-center font-bold text-secondary shrink-0`}>
      {initials}
    </div>
  );
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'global',     label: 'Global',         icon: 'public' },
  { id: 'department', label: 'Department',      icon: 'corporate_fare' },
  { id: 'weekly',     label: 'Weekly Active',   icon: 'local_fire_department' },
  { id: 'skill',      label: 'By Skill',        icon: 'psychology' },
];

// ─── My Rank Card ─────────────────────────────────────────────────────────────

function MyRankCard({ myRank, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-secondary p-6 text-white shadow-lg mb-6 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <Skeleton className="h-5 w-40 bg-white/20" />
          <div className="flex gap-6">
            <Skeleton className="h-12 w-24 bg-white/20" />
            <Skeleton className="h-12 w-24 bg-white/20" />
            <Skeleton className="h-12 w-24 bg-white/20" />
          </div>
        </div>
      </div>
    );
  }
  if (!myRank) return null;

  return (
    <div className="rounded-2xl bg-secondary p-6 text-white shadow-lg mb-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(#c6a43f 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Your Position</p>
            <h2 className="text-xl font-black text-white">{myRank.name}</h2>
            <p className="text-sm text-slate-300">{myRank.department} · Year {myRank.yearOfStudy}</p>
          </div>
          <Avatar avatarUrl={myRank.avatarUrl} name={myRank.name} size="md" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-white/10 p-3 text-center">
            <p className="text-2xl font-black text-primary">
              {myRank.globalRank != null ? `#${myRank.globalRank}` : '—'}
            </p>
            <p className="text-[11px] text-slate-300 font-medium">Global Rank</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center">
            <p className="text-2xl font-black text-primary">
              {myRank.percentile != null ? `${myRank.percentile}%` : '—'}
            </p>
            <p className="text-[11px] text-slate-300 font-medium">Percentile</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center">
            <p className="text-2xl font-black text-primary">
              {myRank.departmentRank != null ? `#${myRank.departmentRank}` : '—'}
            </p>
            <p className="text-[11px] text-slate-300 font-medium">Dept. Rank</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center">
            <p className="text-2xl font-black text-primary">{myRank.readinessScore}</p>
            <p className="text-[11px] text-slate-300 font-medium">Score</p>
          </div>
        </div>
        {myRank.nearbyCompetitors?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Nearby Competitors</p>
            <div className="flex gap-2 flex-wrap">
              {myRank.nearbyCompetitors.map((c) => (
                <div key={c.studentId} className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                  <Avatar avatarUrl={c.avatarUrl} name={c.name} size="sm" />
                  <span className="text-xs font-medium text-white">{c.name.split(' ')[0]}</span>
                  <span className="text-[11px] text-primary font-bold">{c.readinessScore}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Leaderboard Table ────────────────────────────────────────────────────────

function LeaderboardTable({ entries, loading, scope, myStudentId, totalPages, page, onPageChange }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-md ring-1 ring-slate-200">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <span className="material-symbols-outlined text-5xl mb-3">leaderboard</span>
        <p className="text-base font-medium">No entries found</p>
        <p className="text-sm mt-1">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {entries.map((entry) => {
          const isMe = entry.studentId === myStudentId;
          return (
            <div
              key={entry.studentId}
              className={`flex items-center gap-3 rounded-xl p-4 shadow-md ring-1 transition-all ${
                isMe
                  ? 'bg-primary/5 ring-primary/30 shadow-md'
                  : 'bg-white ring-slate-200 hover:shadow-md hover:ring-primary/20'
              }`}
            >
              {/* Rank / Medal */}
              <div className="w-8 flex items-center justify-center shrink-0">
                <MedalIcon rank={entry.rank} />
              </div>

              {/* Avatar */}
              <Avatar avatarUrl={entry.avatarUrl} name={entry.name} />

              {/* Name + dept */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-bold truncate ${isMe ? 'text-secondary' : 'text-slate-800'}`}>
                    {entry.name}
                    {isMe && (
                      <span className="ml-2 text-[10px] font-semibold bg-primary text-secondary px-1.5 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {entry.department}
                  {entry.yearOfStudy ? ` · Year ${entry.yearOfStudy}` : ''}
                  {scope === 'weekly' && entry.activityCount != null
                    ? ` · ${entry.activityCount} activities this week`
                    : ''}
                  {scope === 'skill' && entry.skillProficiency != null
                    ? ` · ${entry.skillProficiency}% proficiency`
                    : ''}
                </p>
                {entry.topSkills?.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {entry.topSkills.slice(0, 3).map((sk) => (
                      <span key={sk.name} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Score + trend */}
              <div className="flex items-center gap-2 shrink-0">
                <TrendIcon trend={entry.trend} />
                <div className={`rounded-lg px-3 py-2 text-center min-w-[52px] ${scoreBg(entry.readinessScore)}`}>
                  <p className={`text-base font-black ${scoreColor(entry.readinessScore)}`}>
                    {entry.readinessScore}
                  </p>
                  {entry.label && (
                    <p className="text-[9px] font-semibold text-slate-400 leading-tight">{entry.label}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            Prev
          </button>
          <span className="text-sm text-slate-500 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('global');

  // My rank
  const [myRank, setMyRank]             = useState(null);
  const [myRankLoading, setMyRankLoading] = useState(true);
  const [myStudentId, setMyStudentId]   = useState(null);

  // Meta (departments, skills)
  const [departments, setDepartments]   = useState([]);
  const [skills, setSkills]             = useState([]);

  // Leaderboard data
  const [entries, setEntries]           = useState([]);
  const [total, setTotal]               = useState(0);
  const [totalPages, setTotalPages]     = useState(1);
  const [page, setPage]                 = useState(1);
  const [listLoading, setListLoading]   = useState(true);
  const [listError, setListError]       = useState(null);

  // Filters
  const [deptFilter, setDeptFilter]     = useState('');
  const [yearFilter, setYearFilter]     = useState('');
  const [skillFilter, setSkillFilter]   = useState('');
  const [search, setSearch]             = useState('');
  const searchDebounce = useRef(null);

  // ── Fetch meta + my rank on mount ──
  useEffect(() => {
    async function init() {
      try {
        const [metaRes, myRes] = await Promise.allSettled([
          leaderboardService.getMeta(),
          leaderboardService.getMyRank(),
        ]);
        if (metaRes.status === 'fulfilled') {
          setDepartments(metaRes.value.data?.data?.departments ?? []);
          setSkills(metaRes.value.data?.data?.skills ?? []);
        }
        if (myRes.status === 'fulfilled') {
          const d = myRes.value.data?.data;
          setMyRank(d);
          setMyStudentId(d?.studentId ?? null);
          // Default department filter to student's department for dept tab
          if (d?.department) setDeptFilter(d.department);
        }
      } catch (_) {/* ignore */} finally {
        setMyRankLoading(false);
      }
    }
    init();
  }, []);

  // ── Fetch leaderboard entries ──
  const fetchLeaderboard = useCallback(async (tab, pg, dept, year, sk, srch) => {
    setListLoading(true);
    setListError(null);
    try {
      const params = { scope: tab, page: pg, limit: 20 };
      if (tab === 'department') params.department = dept || undefined;
      if (tab === 'global') {
        if (dept)  params.department = dept;
        if (year)  params.yearOfStudy = year;
        if (srch)  params.search = srch;
      }
      if (tab === 'skill') params.skill = sk || undefined;

      const res = await leaderboardService.getLeaderboard(params);
      const d = res.data?.data ?? {};
      setEntries(d.entries ?? []);
      setTotal(d.total ?? 0);
      setTotalPages(d.totalPages ?? 1);
    } catch (err) {
      setListError(err?.response?.data?.message || 'Failed to load leaderboard.');
      setEntries([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  // Trigger fetch whenever tab / page / filters change
  useEffect(() => {
    fetchLeaderboard(activeTab, page, deptFilter, yearFilter, skillFilter, search);
  }, [fetchLeaderboard, activeTab, page, deptFilter, yearFilter, skillFilter, search]);

  // ── Tab change resets page ──
  function handleTabChange(tab) {
    setActiveTab(tab);
    setPage(1);
    setEntries([]);
  }

  // ── Search debounce ──
  function handleSearchChange(e) {
    const val = e.target.value;
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  }

  // ── Filter change resets page ──
  function handleFilterChange(setter) {
    return (e) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  return (
    <main className="flex h-full flex-1 flex-col overflow-y-auto bg-background-light p-4 md:p-8">
      <div className="mx-auto w-full max-w-5xl">

          {/* ── Header ── */}
          <header className="mb-6">
            <h1 className="text-3xl font-black tracking-tight text-secondary md:text-4xl">Leaderboard</h1>
            <p className="mt-1 text-slate-500">See how you rank against your peers across departments and skills.</p>
          </header>

          {/* ── My Rank Card ── */}
          <MyRankCard myRank={myRank} loading={myRankLoading} />

          {/* ── Tab Bar ── */}
          <div className="flex gap-1 rounded-xl bg-white p-1.5 shadow-md ring-1 ring-slate-200 mb-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-secondary text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-secondary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-5">
            {/* Global: search + dept + year */}
            {activeTab === 'global' && (
              <>
                <div className="relative flex-1 min-w-0 w-full sm:min-w-[180px]">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    onChange={handleSearchChange}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <select
                  value={deptFilter}
                  onChange={handleFilterChange(setDeptFilter)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-full sm:min-w-[160px]"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.department} value={d.department}>{d.department}</option>
                  ))}
                </select>
                <select
                  value={yearFilter}
                  onChange={handleFilterChange(setYearFilter)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">All Years</option>
                  {['1', '2', '3', '4'].map((y) => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </>
            )}

            {/* Department: dept dropdown */}
            {activeTab === 'department' && (
              <select
                value={deptFilter}
                onChange={handleFilterChange(setDeptFilter)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-w-[200px]"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.department} value={d.department}>{d.department} ({d.count})</option>
                ))}
              </select>
            )}

            {/* Skill: skill dropdown */}
            {activeTab === 'skill' && (
              <select
                value={skillFilter}
                onChange={handleFilterChange(setSkillFilter)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-w-[200px]"
              >
                <option value="">Select a Skill</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            )}

            {/* Total count badge */}
            {!listLoading && total > 0 && (
              <div className="flex items-center ml-auto">
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-2 rounded-lg">
                  {total} student{total !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* ── Scope description ── */}
          {activeTab === 'weekly' && (
            <div className="flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-100 px-4 py-2.5 mb-5 text-sm text-orange-700">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Ranked by number of learning activities in the last 7 days. Resets every Monday.
            </div>
          )}
          {activeTab === 'skill' && !skillFilter && (
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-4 py-2.5 mb-5 text-sm text-blue-700">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Select a skill above to see who's top in that technology.
            </div>
          )}

          {/* ── Error ── */}
          {listError && !listLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-3">error_outline</span>
              <p className="text-sm font-medium">{listError}</p>
              <button
                onClick={() => fetchLeaderboard(activeTab, page, deptFilter, yearFilter, skillFilter, search)}
                className="mt-3 text-xs font-semibold text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Table ── */}
          {!listError && (
            <LeaderboardTable
              entries={entries}
              loading={listLoading}
              scope={activeTab}
              myStudentId={myStudentId}
              totalPages={totalPages}
              page={page}
              onPageChange={setPage}
            />
          )}

        </div>
    </main>
  );
}
