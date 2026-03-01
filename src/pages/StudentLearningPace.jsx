import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import StudentSidebar from '../components/StudentSidebar.jsx';
import { studentService } from '../services/api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatWeekLabel(dateStr) {
  // "2026-02-22" → "Feb 22"
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const ACTIVITY_META = {
  skill_added:        { icon: 'psychology',           label: 'Skill Added',          color: 'bg-blue-100 text-blue-700' },
  project_completed:  { icon: 'code',                  label: 'Project Completed',     color: 'bg-green-100 text-green-700' },
  cert_earned:        { icon: 'workspace_premium',     label: 'Certification Earned',  color: 'bg-purple-100 text-purple-700' },
  assessment_taken:   { icon: 'assignment_turned_in',  label: 'Assessment Taken',      color: 'bg-yellow-100 text-yellow-800' },
  event_attended:     { icon: 'event',                 label: 'Event Attended',        color: 'bg-pink-100 text-pink-700' },
  internship_added:   { icon: 'work',                  label: 'Internship Added',      color: 'bg-teal-100 text-teal-700' },
  leetcode_solved:    { icon: 'terminal',              label: 'LeetCode Problem',      color: 'bg-orange-100 text-orange-700' },
  github_push:        { icon: 'commit',                label: 'GitHub Push',           color: 'bg-slate-100 text-slate-700' },
};

function getActivityMeta(type) {
  return ACTIVITY_META[type] ?? { icon: 'fiber_manual_record', label: type, color: 'bg-slate-100 text-slate-600' };
}

const COMPONENT_LABELS = {
  skillAcquisition:      { label: 'Skill Acquisition',       icon: 'psychology',          tip: 'Add new skills regularly' },
  assessmentImprovement: { label: 'Assessment Improvement',  icon: 'trending_up',         tip: 'Improve assessment scores over time' },
  projectCompletion:     { label: 'Project Completion',      icon: 'code',                tip: 'Complete projects every few months' },
  certificationVelocity: { label: 'Certification Velocity',  icon: 'workspace_premium',   tip: 'Earn certifications each quarter' },
  consistency:           { label: 'Consistency',             icon: 'calendar_today',      tip: 'Log activity daily' },
  leetcodeActivity:      { label: 'LeetCode Activity',       icon: 'terminal',            tip: 'Solve 20+ problems per month' },
};

function componentBarColor(score) {
  if (score >= 75) return 'bg-green-500';
  if (score >= 50) return 'bg-primary';
  if (score >= 25) return 'bg-orange-400';
  return 'bg-red-400';
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <Skeleton className="h-8 w-48 mb-3" />
        <Skeleton className="h-20 w-20 rounded-full mb-4" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function WeekTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-white shadow-lg">
        <p className="font-semibold">Week of {label}</p>
        <p>Activities: <span className="text-primary font-bold">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
}

// ─── Hero Score Circle ────────────────────────────────────────────────────────

function ScoreCircle({ score, color }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" fill="transparent" r={radius} stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="60" cy="60" fill="transparent" r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="10"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-3xl font-black text-secondary">{score}</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}

// ─── Tips ─────────────────────────────────────────────────────────────────────

function ImprovementTips({ components }) {
  const weak = Object.entries(components)
    .filter(([, v]) => v < 60)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3);

  if (weak.length === 0) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-100 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-green-600">emoji_events</span>
          <h3 className="text-sm font-bold text-green-800">All components are strong!</h3>
        </div>
        <p className="text-sm text-green-700">Keep up your current pace to stay at the top.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">tips_and_updates</span>
        <h3 className="text-base font-bold text-secondary">How to improve your pace</h3>
      </div>
      <div className="space-y-3">
        {weak.map(([key, score]) => {
          const meta = COMPONENT_LABELS[key];
          return (
            <div key={key} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
              <span className={`material-symbols-outlined text-[18px] mt-0.5 ${score < 25 ? 'text-red-500' : 'text-orange-500'}`}>
                {meta.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-secondary">{meta.label} — {score}%</p>
                <p className="text-xs text-slate-500 mt-0.5">{meta.tip}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentLearningPace() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPace = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentService.getLearningPace();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load learning pace.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPace(); }, [fetchPace]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex h-screen w-full flex-row overflow-hidden bg-background-light">
        <StudentSidebar />
        <main className="flex h-full flex-1 flex-col overflow-y-auto p-4 md:p-8">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-8">
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <PageSkeleton />
          </div>
        </main>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex h-screen w-full flex-row overflow-hidden bg-background-light">
        <StudentSidebar />
        <main className="flex h-full flex-1 flex-col items-center justify-center p-8">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-5xl text-red-400 mb-4 block">error_outline</span>
            <h2 className="text-xl font-bold text-secondary mb-2">Something went wrong</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <button
              onClick={fetchPace}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-secondary hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  const {
    paceScore, label, color, percentile, streak,
    activeDaysLast30, totalActivities, components,
    weeklyTrend, recentActivities,
  } = data;

  const trendData = weeklyTrend.map((w) => ({
    week: formatWeekLabel(w.week),
    count: w.count,
  }));

  return (
    <div className="flex h-screen w-full flex-row overflow-hidden bg-background-light font-display">
      <StudentSidebar />

      <main className="flex h-full flex-1 flex-col overflow-y-auto bg-background-light p-4 md:p-8">
        <div className="mx-auto w-full max-w-4xl">

          {/* Header */}
          <header className="mb-8 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link to="/student" className="text-slate-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </Link>
                <h1 className="text-3xl font-black tracking-tight text-secondary">Learning Pace</h1>
              </div>
              <p className="text-slate-500 ml-8">
                How fast you are growing compared to your peers.
              </p>
            </div>
          </header>

          {/* Hero */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 mb-6 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-5 blur-3xl" style={{ background: color }} />
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <ScoreCircle score={paceScore} color={color} />
              <div className="flex-1 text-center sm:text-left">
                <span
                  className="inline-block text-sm font-bold px-3 py-1 rounded-full mb-3"
                  style={{ background: `${color}20`, color }}
                >
                  {label}
                </span>
                <h2 className="text-2xl font-black text-secondary mb-1">
                  Pace Score: {paceScore}/100
                </h2>
                <p className="text-slate-500 text-sm mb-4">
                  {percentile > 0
                    ? `You're learning faster than ${percentile}% of students on the platform.`
                    : 'Start logging activities to see your peer comparison.'}
                </p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  {streak > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
                      <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                      {streak}-day streak
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {activeDaysLast30} active days (last 30)
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                    <span className="material-symbols-outlined text-[14px]">history</span>
                    {totalActivities} total activities
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left: Components + Chart + Tips */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Component Scores */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <h3 className="text-base font-bold text-secondary mb-5">Pace Components</h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  {Object.entries(components).map(([key, score]) => {
                    const meta = COMPONENT_LABELS[key];
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">{meta.icon}</span>
                            <span className="text-xs font-semibold text-slate-700">{meta.label}</span>
                          </div>
                          <span className="text-xs font-bold text-secondary">{score}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${componentBarColor(score)}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Trend Chart */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-5">
                  <h3 className="text-base font-bold text-secondary">12-Week Activity Trend</h3>
                  <p className="text-xs text-slate-500">Number of learning activities per week</p>
                </div>
                {trendData.every((d) => d.count === 0) ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
                    <p className="text-sm">No activities logged in the last 12 weeks yet.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="week"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        interval={1}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<WeekTooltip />} cursor={{ fill: 'rgba(198,164,63,0.06)' }} />
                      <Bar dataKey="count" fill="#c6a43f" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Improvement Tips */}
              <ImprovementTips components={components} />
            </div>

            {/* Right: Recent Activities */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sticky top-6">
                <h3 className="text-base font-bold text-secondary mb-4">Recent Activities</h3>
                {recentActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center">
                    <span className="material-symbols-outlined text-4xl mb-2">history</span>
                    <p className="text-sm">No activities logged yet.</p>
                    <p className="text-xs mt-1">Adding skills, projects, or certs will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivities.map((a) => {
                      const meta = getActivityMeta(a.type);
                      return (
                        <div key={a.id} className="flex items-start gap-3">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
                            <span className="material-symbols-outlined text-[16px]">{meta.icon}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-secondary">{meta.label}</p>
                            <p className="text-[11px] text-slate-400">{formatRelativeTime(a.completedAt)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
