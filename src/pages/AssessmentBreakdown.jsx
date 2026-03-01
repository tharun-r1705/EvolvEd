import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { studentService } from '../services/api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function pctColor(pct) {
  if (pct >= 80) return '#16a34a';
  if (pct >= 60) return '#c6a43f';
  return '#dc2626';
}

function ordinal(n) {
  if (!n && n !== 0) return '—';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function statusBadgeClass(status) {
  const map = {
    passed: 'text-green-700 bg-green-50 ring-green-600/20',
    failed: 'text-red-700 bg-red-50 ring-red-600/20',
    completed: 'text-blue-700 bg-blue-50 ring-blue-700/10',
    pending: 'text-yellow-700 bg-yellow-50 ring-yellow-600/20',
  };
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${map[status] ?? 'text-slate-700 bg-slate-50 ring-slate-600/20'}`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-200 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-200">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />
          <Skeleton className="h-52 w-full rounded" />
        </div>
        <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-200 space-y-4">
          <Skeleton className="h-6 w-36" />
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      </div>
    </div>
  );
}

// ─── Custom Bar Tooltip ────────────────────────────────────────────────────────

function BarTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    const { score, maxScore, percentage } = payload[0].payload;
    return (
      <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-white shadow-lg">
        <p className="font-semibold mb-1">{label}</p>
        <p>Score: <span className="font-bold text-primary">{score} / {maxScore}</span></p>
        <p>Percentage: <span className="font-bold text-primary">{percentage}%</span></p>
      </div>
    );
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AssessmentBreakdown() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssessment = useCallback(async () => {
    if (!id) { setError('No assessment ID provided.'); setLoading(false); return; }
    if (!UUID_RE.test(id)) {
      setError('Invalid assessment link. Please open an assessment from the Assessments page.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await studentService.getAssessmentById(id);
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Assessment not found.');
      } else {
        setError(err.response?.data?.message || 'Failed to load assessment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAssessment(); }, [fetchAssessment]);

  if (loading) {
    return (
      <main className="flex-1 h-full overflow-y-auto py-8 px-4 md:px-8 bg-background-light">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-4 w-48 mb-3" />
          <Skeleton className="h-10 w-96 mb-2" />
          <Skeleton className="h-4 w-72 mb-8" />
          <PageSkeleton />
        </div>
      </main>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <main className="flex-1 h-full overflow-y-auto flex items-center justify-center p-8 bg-background-light">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-4 block">error_outline</span>
          <h2 className="text-xl font-bold text-secondary mb-2">
            {error === 'Assessment not found.' ? 'Assessment Not Found' : 'Something went wrong'}
          </h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchAssessment}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-secondary hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <Link
              to="/student/assessments"
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back to Assessments
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const {
    title, subtitle, category, overallScore, maxScore,
    percentileRank, timeTaken, maxTime, completedDate, status,
    categoryPerformance, improvements, history,
  } = data;

  const scorePct = Math.round((overallScore / maxScore) * 100);

  return (
    <main className="flex-1 h-full overflow-y-auto bg-background-light py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ── Header ── */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Link to="/student/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="font-medium text-secondary">Results Breakdown</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">{title}</h1>
              {subtitle && <p className="mt-1 text-slate-500 text-sm">{subtitle}</p>}
              <p className="mt-2 text-slate-500">
                Detailed performance analysis · <span className="font-medium text-secondary">{category}</span>
              </p>
            </div>
          </div>

          {/* ── Stats Overview ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Overall Score */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-500">Overall Score</p>
                <span className="material-symbols-outlined text-primary">school</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-secondary">{overallScore}</p>
                <p className="text-sm text-slate-400">/ {maxScore}</p>
              </div>
              <div className="mt-3 w-full rounded-full bg-slate-100 h-2">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${scorePct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">{scorePct}% score</p>
            </div>

            {/* Percentile */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-500">Percentile Rank</p>
                <span className="material-symbols-outlined text-primary">leaderboard</span>
              </div>
              {percentileRank != null ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-secondary">{ordinal(percentileRank)}</p>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Top {100 - percentileRank}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Higher than {percentileRank}% of peers</p>
                </>
              ) : (
                <p className="text-2xl font-bold text-slate-400 mt-1">—</p>
              )}
            </div>

            {/* Time Taken */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-500">Time Taken</p>
                <span className="material-symbols-outlined text-primary">schedule</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-secondary">
                  {timeTaken != null ? `${timeTaken}m` : '—'}
                </p>
                {maxTime != null && <p className="text-sm text-slate-400">/ {maxTime}m</p>}
              </div>
              <p className="mt-2 text-xs text-slate-400">Completed on {formatDate(completedDate)}</p>
            </div>

            {/* Status */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-500">Status</p>
                <span className="material-symbols-outlined text-primary">verified</span>
              </div>
              <div className="mt-1">
                <span className={statusBadgeClass(status)}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                {status === 'passed' ? 'Qualified for next round' : status === 'failed' ? 'Did not meet threshold' : 'Assessment recorded'}
              </p>
            </div>
          </div>

          {/* ── Chart + Improvements ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Category Performance Bar Chart */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-secondary">Category Performance</h2>
                <p className="text-sm text-slate-500">Breakdown of scores across evaluation categories.</p>
              </div>
              {categoryPerformance.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
                  <p className="text-sm">No category breakdown available for this assessment.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={categoryPerformance}
                    margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(198,164,63,0.06)' }} />
                    <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={52}>
                      {categoryPerformance.map((entry, index) => (
                        <Cell key={index} fill={pctColor(entry.percentage)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Score tags below chart */}
              {categoryPerformance.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {categoryPerformance.map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: pctColor(c.percentage) }}
                      />
                      <span className="font-medium text-slate-600">{c.label}:</span>
                      <span className="font-bold text-secondary">{c.percentage}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Improvement Focus */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md flex flex-col">
              <h2 className="text-lg font-bold text-secondary mb-4">Improvement Focus</h2>
              {improvements.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center text-slate-400 py-6">
                  <span className="material-symbols-outlined text-4xl mb-2 text-green-400">task_alt</span>
                  <p className="text-sm font-medium text-green-600">All categories above threshold!</p>
                  <p className="text-xs mt-1">Keep up the strong performance.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4">
                  {improvements.map((imp, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 items-start ${i > 0 ? 'border-t border-slate-200 pt-4' : ''}`}
                    >
                      <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary text-sm">{imp.area}</h3>
                        <p className="text-xs text-slate-500 mt-1">{imp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Assessment History ── */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-md overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-secondary">Assessment History</h2>
                <p className="text-sm text-slate-500">Your previous assessment records.</p>
              </div>
            </div>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2">history</span>
                <p className="text-sm">No assessment history yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Assessment Name</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Category</th>
                      <th className="px-6 py-3 font-medium">Score</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((h) => {
                      const hPct = h.maxScore > 0 ? Math.round((h.score / h.maxScore) * 100) : 0;
                      const isCurrentRow = h.id === id;
                      return (
                        <tr
                          key={h.id}
                          className={`group transition-colors ${isCurrentRow ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-secondary flex items-center gap-2">
                              {h.name}
                              {isCurrentRow && (
                                <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                                  Current
                                </span>
                              )}
                            </div>
                            {h.subtitle && <div className="text-xs text-slate-400">{h.subtitle}</div>}
                          </td>
                          <td className="px-6 py-4 text-slate-500">{formatDate(h.date)}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              {h.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-secondary">{h.score}</span>
                              <span className="text-xs text-slate-400">/ {h.maxScore}</span>
                              <span
                                className="text-xs font-medium"
                                style={{ color: pctColor(hPct) }}
                              >
                                ({hPct}%)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={statusBadgeClass(h.status)}>
                              {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isCurrentRow ? (
                              <span className="text-xs text-slate-300">—</span>
                            ) : (
                              <Link
                                to={`/student/assessments/${h.id}`}
                                className="text-slate-400 hover:text-primary transition-colors inline-flex"
                                title="View breakdown"
                              >
                                <span className="material-symbols-outlined">visibility</span>
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
  );
}
