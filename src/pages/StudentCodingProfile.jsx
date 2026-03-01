import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../services/api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiError(err) {
  return (
    err?.response?.data?.errors?.[0]?.message ||
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    'Something went wrong.'
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-medium transition-all ${isError ? 'bg-red-600' : 'bg-emerald-600'}`}>
      <span className="material-symbols-outlined text-lg">{isError ? 'error' : 'check_circle'}</span>
      {toast.message}
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
}

// ─── Donut / Ring Chart ───────────────────────────────────────────────────────

function DonutRing({ easy, medium, hard, total, totalSolved }) {
  const easyQ = easy || 0;
  const medQ = medium || 0;
  const hardQ = hard || 0;
  const totalQ = total || 1;

  const size = 130;
  const cx = size / 2;
  const cy = size / 2;
  const r = 50;
  const strokeW = 14;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { value: easyQ, color: '#22c55e', label: 'Easy' },
    { value: medQ, color: '#f59e0b', label: 'Medium' },
    { value: hardQ, color: '#ef4444', label: 'Hard' },
  ];

  let offset = 0;
  const arcs = segments.map((seg) => {
    const fraction = totalQ > 0 ? seg.value / totalQ : 0;
    const dashArray = `${fraction * circumference} ${circumference}`;
    const rotation = offset * 360 - 90;
    offset += fraction;
    return { ...seg, dashArray, rotation };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeW} />
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeW}
            strokeDasharray={arc.dashArray}
            strokeDashoffset={0}
            strokeLinecap="butt"
            transform={`rotate(${arc.rotation} ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        ))}
        {/* Center text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#0B1E33" fontSize="22" fontWeight="700">
          {totalSolved}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize="10">
          Solved
        </text>
      </svg>
      {/* Legend */}
      <div className="flex gap-4 text-xs">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-slate-600">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Submission Heatmap ───────────────────────────────────────────────────────

function SubmissionHeatmap({ calendar }) {
  if (!calendar || typeof calendar !== 'object') {
    return (
      <div className="flex items-center justify-center h-20 text-slate-400 text-sm">
        No submission data available.
      </div>
    );
  }

  // Build last 52 weeks of data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);

  // Align to Sunday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const weeks = [];
  let current = new Date(startDate);

  while (current <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const ts = Math.floor(current.getTime() / 1000);
      const count = calendar[String(ts)] || 0;
      week.push({
        date: new Date(current),
        count,
        ts,
      });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  const maxCount = Math.max(...Object.values(calendar).map(Number), 1);

  function getColor(count) {
    if (count === 0) return '#f1f5f9';
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.25) return '#bbf7d0';
    if (intensity < 0.5) return '#4ade80';
    if (intensity < 0.75) return '#16a34a';
    return '#14532d';
  }

  const months = [];
  for (let i = 0; i < weeks.length; i++) {
    const firstDay = weeks[i][0];
    if (firstDay.date.getDate() <= 7) {
      months.push({ label: firstDay.date.toLocaleString('default', { month: 'short' }), index: i });
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col gap-1 min-w-max">
        {/* Month labels */}
        <div className="flex gap-1 pl-6 mb-0.5">
          {weeks.map((_, i) => {
            const m = months.find((m) => m.index === i);
            return (
              <div key={i} className="w-3 text-[9px] text-slate-400 text-center flex-shrink-0">
                {m ? m.label : ''}
              </div>
            );
          })}
        </div>

        {/* Grid: 7 rows (days), N cols (weeks) */}
        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="w-3 h-3 text-[9px] text-slate-400 flex items-center justify-center flex-shrink-0">
                {i % 2 === 1 ? d : ''}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => (
                <div
                  key={di}
                  title={`${day.date.toDateString()}: ${day.count} submission${day.count !== 1 ? 's' : ''}`}
                  className="w-3 h-3 rounded-[2px] flex-shrink-0 cursor-default"
                  style={{ background: getColor(day.count) }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-1 self-end text-[10px] text-slate-400">
          <span>Less</span>
          {['#f1f5f9', '#bbf7d0', '#4ade80', '#16a34a', '#14532d'].map((c) => (
            <div key={c} className="w-3 h-3 rounded-[2px]" style={{ background: c }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

// ─── Language Bar ─────────────────────────────────────────────────────────────

function LanguageBar({ languages, maxVal }) {
  if (!languages || languages.length === 0) {
    return <p className="text-sm text-slate-400">No language data available.</p>;
  }
  const max = maxVal || Math.max(...languages.map((l) => l.count), 1);
  const COLORS = ['#c6a43f', '#1E5F5F', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4'];

  return (
    <div className="flex flex-col gap-2.5">
      {languages.map((lang, i) => {
        const pct = Math.round((lang.count / max) * 100);
        return (
          <div key={lang.name} className="flex items-center gap-3">
            <span className="text-xs text-slate-600 w-20 flex-shrink-0 truncate font-medium">{lang.name}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
              />
            </div>
            <span className="text-xs text-slate-400 w-8 text-right flex-shrink-0">{lang.count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({ icon, label, value, accent = false }) {
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${accent ? 'bg-primary/10 border-primary/20' : 'bg-slate-50 border-slate-200'}`}>
      <span className={`material-symbols-outlined text-xl ${accent ? 'text-primary' : 'text-slate-400'}`}>{icon}</span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`text-sm font-bold ${accent ? 'text-primary' : 'text-secondary'}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── LeetCode Card ────────────────────────────────────────────────────────────

function LeetCodeCard({ data, loading, onRefresh, refreshing }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 animate-pulse">
        <div className="h-6 bg-slate-100 rounded w-1/3 mb-4" />
        <div className="h-32 bg-slate-100 rounded mb-4" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
      </div>
    );
  }

  if (!data?.connected) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-orange-400">code</span>
        </div>
        <div>
          <h3 className="text-base font-bold text-secondary mb-1">LeetCode Not Connected</h3>
          <p className="text-sm text-slate-500 max-w-xs">{data?.message || 'Set your LeetCode username in your profile to connect.'}</p>
        </div>
        <Link
          to="/student/profile"
          className="px-4 py-2 bg-primary text-secondary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Go to Profile
        </Link>
      </div>
    );
  }

  const d = data.data;
  const totalQ = (d.easyTotal || 0) + (d.mediumTotal || 0) + (d.hardTotal || 0) || d.totalQuestions || 1;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-xl text-orange-500">code</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-secondary">LeetCode</h2>
            <a
              href={`https://leetcode.com/${d.username}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline"
            >
              @{d.username}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Updated {timeAgo(d.lastFetchedAt)}</span>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh from LeetCode"
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
          >
            <span className={`material-symbols-outlined text-base ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut ring + breakdown */}
        <div className="flex flex-col items-center gap-4">
          <DonutRing
            easy={d.easySolved}
            medium={d.mediumSolved}
            hard={d.hardSolved}
            total={totalQ}
            totalSolved={d.totalSolved}
          />
          <div className="w-full grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Easy', solved: d.easySolved, total: d.easyTotal, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Medium', solved: d.mediumSolved, total: d.mediumTotal, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Hard', solved: d.hardSolved, total: d.hardTotal, color: 'text-red-500', bg: 'bg-red-50' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl py-2.5 px-2`}>
                <p className={`text-lg font-bold ${s.color}`}>{s.solved}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
                {s.total > 0 && <p className="text-[9px] text-slate-400">/ {s.total}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Stats + languages */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <StatPill icon="local_fire_department" label="Streak" value={`${d.streak} days`} accent />
            <StatPill icon="military_tech" label="Acceptance" value={`${d.acceptanceRate}%`} />
            {d.contestRating && (
              <StatPill icon="emoji_events" label="Contest Rating" value={Math.round(d.contestRating)} accent />
            )}
            {d.ranking && (
              <StatPill icon="leaderboard" label="Global Rank" value={`#${d.ranking.toLocaleString()}`} />
            )}
          </div>

          {/* Top languages */}
          {d.topLanguages && d.topLanguages.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Top Languages</p>
              <LanguageBar languages={d.topLanguages.slice(0, 5)} />
            </div>
          )}
        </div>
      </div>

      {/* Submission heatmap */}
      {d.submissionCalendar && (
        <div className="px-6 pb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Submission Activity</p>
          <SubmissionHeatmap calendar={d.submissionCalendar} />
        </div>
      )}
    </div>
  );
}

// ─── GitHub Card ──────────────────────────────────────────────────────────────

function GitHubCard({ data, loading, onRefresh, refreshing }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 animate-pulse">
        <div className="h-6 bg-slate-100 rounded w-1/3 mb-4" />
        <div className="h-32 bg-slate-100 rounded mb-4" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
      </div>
    );
  }

  if (!data?.connected) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-slate-400">hub</span>
        </div>
        <div>
          <h3 className="text-base font-bold text-secondary mb-1">GitHub Not Connected</h3>
          <p className="text-sm text-slate-500 max-w-xs">{data?.message || 'Set your GitHub username in your profile to connect.'}</p>
        </div>
        <Link
          to="/student/profile"
          className="px-4 py-2 bg-primary text-secondary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Go to Profile
        </Link>
      </div>
    );
  }

  const d = data.data;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
        <div className="flex items-center gap-3">
          {d.avatarUrl ? (
            <img src={d.avatarUrl} alt={d.username} className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl text-slate-400">hub</span>
            </div>
          )}
          <div>
            <h2 className="text-sm font-bold text-secondary">{d.name || 'GitHub'}</h2>
            <a
              href={`https://github.com/${d.username}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline"
            >
              @{d.username}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Updated {timeAgo(d.lastFetchedAt)}</span>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh from GitHub"
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
          >
            <span className={`material-symbols-outlined text-base ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stats grid */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <StatPill icon="folder_open" label="Public Repos" value={d.publicRepos} accent />
            <StatPill icon="star" label="Total Stars" value={d.totalStars} />
            <StatPill icon="fork_right" label="Total Forks" value={d.totalForks} />
            <StatPill icon="commit" label="Contributions" value={d.contributionCount} accent />
            <StatPill icon="group" label="Followers" value={d.followers} />
            <StatPill icon="person_add" label="Following" value={d.following} />
          </div>
          {d.bio && (
            <p className="text-xs text-slate-500 italic border-l-2 border-primary/30 pl-3">{d.bio}</p>
          )}
        </div>

        {/* Top languages */}
        <div className="flex flex-col gap-4">
          {d.topLanguages && d.topLanguages.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Top Languages</p>
              <LanguageBar languages={d.topLanguages} />
            </div>
          )}
        </div>
      </div>

      {/* Top repos */}
      {d.repos && d.repos.length > 0 && (
        <div className="px-6 pb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Top Repositories</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {d.repos.slice(0, 6).map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-colors group"
              >
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-base mt-0.5 flex-shrink-0">
                  {repo.fork ? 'fork_right' : 'folder_open'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-secondary group-hover:text-primary truncate">{repo.name}</p>
                  {repo.description && (
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    {repo.language && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                        {repo.language}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <span className="material-symbols-outlined" style={{ fontSize: 11 }}>star</span>
                      {repo.stars}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <span className="material-symbols-outlined" style={{ fontSize: 11 }}>fork_right</span>
                      {repo.forks}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentCodingProfile() {
  const [leetcode, setLeetcode] = useState(null);
  const [github, setGithub] = useState(null);
  const [lcLoading, setLcLoading] = useState(true);
  const [ghLoading, setGhLoading] = useState(true);
  const [lcRefreshing, setLcRefreshing] = useState(false);
  const [ghRefreshing, setGhRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        const res = await studentService.getLeetCode();
        setLeetcode(res.data);
      } catch (err) {
        showToast('Failed to load LeetCode data: ' + getApiError(err), 'error');
        setLeetcode({ connected: false, message: getApiError(err) });
      } finally {
        setLcLoading(false);
      }
    })();
  }, [showToast]);

  useEffect(() => {
    (async () => {
      try {
        const res = await studentService.getGitHub();
        setGithub(res.data);
      } catch (err) {
        showToast('Failed to load GitHub data: ' + getApiError(err), 'error');
        setGithub({ connected: false, message: getApiError(err) });
      } finally {
        setGhLoading(false);
      }
    })();
  }, [showToast]);

  async function handleRefreshLeetCode() {
    setLcRefreshing(true);
    try {
      const res = await studentService.refreshLeetCode();
      setLeetcode(res.data);
      showToast('LeetCode profile refreshed successfully.');
    } catch (err) {
      showToast('Refresh failed: ' + getApiError(err), 'error');
    } finally {
      setLcRefreshing(false);
    }
  }

  async function handleRefreshGitHub() {
    setGhRefreshing(true);
    try {
      const res = await studentService.refreshGitHub();
      setGithub(res.data);
      showToast('GitHub profile refreshed successfully.');
    } catch (err) {
      showToast('Refresh failed: ' + getApiError(err), 'error');
    } finally {
      setGhRefreshing(false);
    }
  }

  return (
    <>
    <main className="flex-1 overflow-y-auto bg-background-light">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">terminal</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Coding Profile
                </h1>
                <p className="text-sm text-slate-500">LeetCode & GitHub activity, synced automatically every 6 hours.</p>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-6">
            <LeetCodeCard
              data={leetcode}
              loading={lcLoading}
              onRefresh={handleRefreshLeetCode}
              refreshing={lcRefreshing}
            />
            <GitHubCard
              data={github}
              loading={ghLoading}
              onRefresh={handleRefreshGitHub}
              refreshing={ghRefreshing}
            />
          </div>

          {/* Info footer */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Data is cached for 6 hours. Use the refresh button on each card to force an update.
            LeetCode and GitHub scores contribute to your overall readiness score.
          </p>
        </div>
      </main>

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
