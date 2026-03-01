import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { studentService, goalsService, feedService } from '../services/api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-500';
}

function statusBadge(status) {
  const map = {
    passed: 'bg-green-50 text-green-700 ring-green-600/20',
    failed: 'bg-red-50 text-red-700 ring-red-600/20',
    completed: 'bg-blue-50 text-blue-700 ring-blue-700/10',
    pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  };
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${map[status] ?? 'bg-slate-50 text-slate-700 ring-slate-600/20'}`;
}

function appStatusBadge(status) {
  const map = {
    applied: 'bg-blue-50 text-blue-700',
    shortlisted: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
    hired: 'bg-purple-50 text-purple-700',
    withdrawn: 'bg-slate-50 text-slate-500',
  };
  return `text-xs font-medium px-2 py-0.5 rounded-full ${map[status] ?? 'bg-slate-50 text-slate-500'}`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <Skeleton className="h-6 w-48 mb-3" />
          <Skeleton className="h-4 w-72 mb-6" />
          <div className="flex gap-8">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-40 w-40 rounded-full shrink-0" />
          </div>
        </div>
        <div className="lg:col-span-4 rounded-2xl bg-slate-200 p-6 h-48 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 space-y-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Circular Progress Ring ────────────────────────────────────────────────────

function CircularScore({ score }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner">
      <svg className="absolute h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
        <circle cx="50" cy="50" fill="transparent" r={radius} stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="50" cy="50" fill="transparent" r={radius}
          stroke="#c6a43f"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="8"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-black text-secondary">{score}</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest">/ 100</span>
      </div>
    </div>
  );
}

// ─── Score Breakdown Radar ────────────────────────────────────────────────────

const BREAKDOWN_LABELS = {
  technicalSkills:    'Technical',
  projects:           'Projects',
  internships:        'Internships',
  certifications:     'Certs',
  assessments:        'Assessments',
  events:             'Events',
  codingPractice:     'Coding',
  githubActivity:     'GitHub',
  learningPace:       'Learning Pace',
  roadmapProgress:    'Roadmaps',
  interviewReadiness: 'Interviews',
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function TrendTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-white shadow-lg">
        <p className="font-semibold">{label}</p>
        <p>Score: <span className="text-primary font-bold">{payload[0].value}%</span></p>
      </div>
    );
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goalsSummary, setGoalsSummary] = useState(null);

  // Phase 9 widget state
  const [interviewQuestion, setInterviewQuestion] = useState(null);
  const [interviewQLoading, setInterviewQLoading] = useState(true);
  const [techTrends, setTechTrends] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [dailyTip, setDailyTip] = useState(null);
  const [tipLoading, setTipLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);

  const fetchInterviewQuestion = useCallback(async () => {
    setInterviewQLoading(true);
    setShowAnswer(false);
    try {
      const res = await feedService.getInterviewQuestions({ limit: 1 });
      const questions = res.data?.data?.questions ?? res.data?.data ?? [];
      setInterviewQuestion(questions[0] ?? null);
    } catch (_) {
      setInterviewQuestion(null);
    } finally {
      setInterviewQLoading(false);
    }
  }, []);

  const fetchTechTrends = useCallback(async () => {
    setTrendsLoading(true);
    try {
      const res = await feedService.getMarketTrends({ limit: 6 });
      setTechTrends(res.data?.data?.trends ?? res.data?.data ?? []);
    } catch (_) {
      setTechTrends([]);
    } finally {
      setTrendsLoading(false);
    }
  }, []);

  const fetchDailyTip = useCallback(async () => {
    setTipLoading(true);
    try {
      const res = await feedService.getDailyTip();
      setDailyTip(res.data?.data ?? null);
    } catch (_) {
      setDailyTip(null);
    } finally {
      setTipLoading(false);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, goalsRes] = await Promise.allSettled([
        studentService.getDashboard(),
        goalsService.getSummary(),
      ]);
      if (dashRes.status === 'fulfilled') setData(dashRes.value.data);
      else throw new Error(dashRes.reason?.response?.data?.message || 'Failed to load dashboard.');
      if (goalsRes.status === 'fulfilled') setGoalsSummary(goalsRes.value.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => { fetchInterviewQuestion(); }, [fetchInterviewQuestion]);
  useEffect(() => { fetchTechTrends(); }, [fetchTechTrends]);
  useEffect(() => { fetchDailyTip(); }, [fetchDailyTip]);

  if (loading) {
    return (
      <main className="flex h-full flex-1 flex-col overflow-y-auto p-4 md:p-8 bg-background-light">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <DashboardSkeleton />
        </div>
      </main>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <main className="flex h-full flex-1 flex-col items-center justify-center p-8 bg-background-light">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-4 block">error_outline</span>
          <h2 className="text-xl font-bold text-secondary mb-2">Something went wrong</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={fetchDashboard}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-secondary hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const { student, readiness, metrics, scoreBreakdown, skills, recentAssessments,
    recentApplications, leetcodeSummary, githubSummary, readinessTrend, learningPace } = data;

  // ── Phase 9 helpers ──
  const trendCategoryColor = (cat) => {
    const map = {
      language:  'bg-blue-50 text-blue-700',
      framework: 'bg-purple-50 text-purple-700',
      tool:      'bg-slate-50 text-slate-700',
      domain:    'bg-orange-50 text-orange-700',
      database:  'bg-green-50 text-green-700',
    };
    return map[cat] ?? 'bg-slate-50 text-slate-600';
  };

  const trendScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const difficultyColor = (d) => {
    if (d === 'easy')   return 'bg-green-50 text-green-700';
    if (d === 'medium') return 'bg-yellow-50 text-yellow-700';
    if (d === 'hard')   return 'bg-red-50 text-red-700';
    return 'bg-slate-50 text-slate-600';
  };

  const tipCategoryColor = (cat) => {
    const map = {
      interview: 'bg-blue-50 text-blue-700',
      technical: 'bg-purple-50 text-purple-700',
      career:    'bg-green-50 text-green-700',
    };
    return map[cat] ?? 'bg-slate-50 text-slate-600';
  };

  const todayLabel = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Build radar data
  const radarData = scoreBreakdown
    ? Object.entries(BREAKDOWN_LABELS).map(([key, label]) => ({
        subject: label,
        value: Math.round(scoreBreakdown[key] ?? 0),
        fullMark: 100,
      }))
    : [];

  return (
    <main className="flex h-full flex-1 flex-col overflow-y-auto bg-background-light p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl">

          {/* ── Header ── */}
          <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-secondary md:text-4xl">
                Readiness Dashboard
              </h1>
              <p className="mt-2 text-slate-500">
                Welcome back, <span className="font-semibold text-secondary">{student.fullName}</span>
                {' '}— track your placement preparedness.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/student/profile"
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-secondary shadow-md hover:bg-primary/90 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
                Edit Profile
              </Link>
            </div>
          </header>

          {/* ── Hero: Score + Profile Completion ── */}
          <div className="grid gap-6 lg:grid-cols-12 mb-8">
            {/* Score Card */}
            <div className="lg:col-span-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
              <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
                <div className="flex flex-col gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-secondary">Overall Readiness Score</h2>
                    <p className="text-sm text-slate-500">
                      Composite of technical skills, projects, assessments &amp; more
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-black ${scoreColor(readiness.score)}`}>
                      {readiness.score}
                    </span>
                    <span className="text-xl text-slate-400">/100</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary ring-1 ring-inset ring-primary/30">
                      {readiness.label}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {readiness.classification}
                    </span>
                    {readiness.rank && (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Rank #{readiness.rank} of {readiness.totalStudents}
                      </span>
                    )}
                    {readiness.percentile != null && (
                      <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                        Top {readiness.percentile}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {student.department} · Year {student.yearOfStudy}
                  </p>
                </div>
                <CircularScore score={readiness.score} />
              </div>
            </div>

            {/* Profile Completion Card */}
            <div className="lg:col-span-4 rounded-2xl bg-secondary p-6 text-white shadow-lg relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(#c6a43f 1px, transparent 1px)', backgroundSize: '20px 20px' }}
              />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-primary">person_check</span>
                  </div>
                  <h3 className="text-lg font-bold">Profile Completion</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    {student.profileCompletion < 100
                      ? 'Complete your profile to unlock premium job listings.'
                      : 'Your profile is 100% complete!'}
                  </p>
                </div>
                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm font-medium">
                    <span>Progress</span>
                    <span className="text-primary">{student.profileCompletion}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-primary shadow-[0_0_10px_rgba(198,164,63,0.5)] transition-all duration-700"
                      style={{ width: `${student.profileCompletion}%` }}
                    />
                  </div>
                  <Link
                    to="/student/profile"
                    className="mt-6 block w-full rounded-lg bg-white py-2 text-center text-sm font-bold text-secondary hover:bg-slate-100 transition-colors"
                  >
                    {student.profileCompletion < 100 ? 'Complete Profile' : 'View Profile'}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Metrics Grid ── */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
            {[
              { icon: 'assignment', label: 'Assessments', value: metrics.assessments },
              { icon: 'work_history', label: 'Applications', value: metrics.applications },
              { icon: 'pending_actions', label: 'Pending Actions', value: metrics.pendingActions },
              { icon: 'groups', label: 'Profile Views', value: metrics.profileViews },
            ].map(({ icon, label, value }) => (
              <div key={label} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow">
                <div className="mb-2 text-slate-400">
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-secondary">{value ?? 0}</p>
              </div>
            ))}
          </div>

          {/* ── Main Content Grid ── */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Readiness Trend Chart */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-secondary">Readiness Trend</h3>
                  <p className="text-sm text-slate-500">Assessment performance over the last 6 months</p>
                </div>
                {readinessTrend.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2">show_chart</span>
                    <p className="text-sm">No assessment data yet — complete some assessments to see your trend.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={readinessTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<TrendTooltip />} cursor={{ fill: 'rgba(198,164,63,0.06)' }} />
                      <Bar dataKey="value" fill="#c6a43f" radius={[4, 4, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Score Breakdown Radar */}
              {scoreBreakdown && radarData.length > 0 && (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-secondary">Score Breakdown</h3>
                    <p className="text-sm text-slate-500">All 8 readiness components</p>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData} outerRadius="70%">
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#c6a43f"
                        fill="#c6a43f"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                      <Tooltip
                        formatter={(val) => [`${val}%`, 'Score']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>

                  {/* Component bars */}
                  <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-3">
                    {radarData.map(({ subject, value }) => (
                      <div key={subject}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-slate-600">{subject}</span>
                          <span className="font-bold text-secondary">{value}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Trends */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">trending_up</span>
                      <h3 className="text-lg font-bold text-secondary">Tech Trends</h3>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">What's hot in the industry</p>
                  </div>
                  <Link to="/student/interview-prep" className="text-xs font-semibold text-primary hover:underline">
                    View more
                  </Link>
                </div>
                {trendsLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="rounded-xl border border-slate-100 p-3 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16 rounded-full" />
                        <Skeleton className="h-1.5 w-full rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : techTrends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
                    <p className="text-sm">No trend data available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {techTrends.map((trend) => (
                      <div key={trend.id} className="rounded-xl border border-slate-100 p-3 hover:border-primary/30 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <p className="text-sm font-bold text-secondary leading-tight">{trend.title}</p>
                          <span className="text-xs font-bold text-slate-400 shrink-0">{trend.trendScore}</span>
                        </div>
                        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mb-2 ${trendCategoryColor(trend.category)}`}>
                          {trend.category}
                        </span>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${trend.trendScore}%`, backgroundColor: trendScoreColor(trend.trendScore) }}
                          />
                        </div>
                        <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2">{trend.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Assessments */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-secondary">Recent Assessments</h3>
                  <Link to="/student/assessments" className="text-xs font-semibold text-primary hover:underline">
                    View all
                  </Link>
                </div>
                {recentAssessments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2">assignment</span>
                    <p className="text-sm">No assessments completed yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {recentAssessments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-lg border border-slate-50 p-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 shrink-0">
                            <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-secondary">{a.title}</p>
                            <p className="text-xs text-slate-500">
                              {a.category} · {formatDate(a.completedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-sm font-bold ${scoreColor(a.score)}`}>{a.score}%</span>
                          <Link to={`/student/assessments/${a.id}`}>
                            <span className={statusBadge(a.status)}>
                              {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                            </span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Applications */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-secondary">Recent Applications</h3>
                  <Link to="/student/applications" className="text-xs font-semibold text-primary hover:underline">
                    View all
                  </Link>
                </div>
                {recentApplications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2">work_outline</span>
                    <p className="text-sm">No job applications yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {recentApplications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between rounded-lg border border-slate-50 p-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {app.companyLogoUrl ? (
                            <img src={app.companyLogoUrl} alt={app.companyName} className="h-9 w-9 rounded-lg object-contain border border-slate-100" />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-400 shrink-0">
                              <span className="material-symbols-outlined text-[18px]">business</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-secondary">{app.jobTitle}</p>
                            <p className="text-xs text-slate-500">{app.companyName} · {formatDate(app.appliedAt)}</p>
                          </div>
                        </div>
                        <span className={appStatusBadge(app.status)}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 flex flex-col gap-6">

              {/* Skill Proficiency */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-secondary">Skill Proficiency</h3>
                  <p className="text-sm text-slate-500">Top skills by proficiency</p>
                </div>
                {skills.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                    <span className="material-symbols-outlined text-3xl mb-2">psychology</span>
                    <p className="text-sm text-center">No skills added yet.</p>
                    <Link to="/student/profile" className="mt-3 text-xs font-semibold text-primary hover:underline">
                      Add skills
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {skills.map((s) => (
                      <div key={s.id}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-sm font-semibold text-secondary truncate max-w-[140px]">{s.name}</span>
                          <span className="text-sm font-bold text-primary">{s.proficiency}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-primary/80 transition-all duration-700"
                            style={{ width: `${s.proficiency}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">{s.level} · {s.category}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Goals Widget */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <span className="material-symbols-outlined text-primary text-[18px]">flag</span>
                    </div>
                    <h3 className="text-base font-bold text-secondary">My Goals</h3>
                  </div>
                  <Link to="/student/chat" className="text-xs font-semibold text-primary hover:underline">AI Chat</Link>
                </div>
                {goalsSummary && goalsSummary.totalActive > 0 ? (
                  <div className="space-y-3">
                    {goalsSummary.goals.map((goal) => {
                      const catColor = {
                        technical: '#3b82f6',
                        career: '#8b5cf6',
                        academic: '#10b981',
                        personal: '#f97316',
                      };
                      const color = catColor[goal.category] ?? '#64748b';
                      return (
                        <div key={goal.id}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-slate-700 truncate flex-1 mr-2">{goal.title}</p>
                            <span className="text-[10px] font-bold text-slate-500">{goal.progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${goal.progress}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
                      <span>{goalsSummary.totalActive} active goal{goalsSummary.totalActive !== 1 ? 's' : ''}</span>
                      {goalsSummary.totalCompleted > 0 && (
                        <span className="text-green-600 font-medium">{goalsSummary.totalCompleted} completed</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-400 mb-3">No active goals yet. Ask the AI assistant to help you create one!</p>
                    <Link
                      to="/student/chat"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-secondary hover:bg-secondary/90 px-3 py-2 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                      Ask AI Assistant
                    </Link>
                  </div>
                )}
              </div>

              {/* Daily Tip */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50">
                      <span className="material-symbols-outlined text-yellow-500 text-[18px]">lightbulb</span>
                    </div>
                    <h3 className="text-base font-bold text-secondary">Daily Tip</h3>
                  </div>
                  {dailyTip?.category && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tipCategoryColor(dailyTip.category)}`}>
                      {dailyTip.category}
                    </span>
                  )}
                </div>
                {tipLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                ) : dailyTip ? (
                  <>
                    <p className="text-sm text-slate-700 leading-relaxed">{dailyTip.tip}</p>
                    <p className="mt-3 text-[11px] text-slate-400">Today, {todayLabel}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">No tip available today.</p>
                )}
              </div>

              {/* Interview Question */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <span className="material-symbols-outlined text-primary text-[18px]">quiz</span>
                    </div>
                    <h3 className="text-base font-bold text-secondary">Interview Question</h3>
                  </div>
                  <Link to="/student/interview-prep" className="text-xs font-semibold text-primary hover:underline">View all</Link>
                </div>
                {interviewQLoading ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : interviewQuestion ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize">
                        {interviewQuestion.category}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${difficultyColor(interviewQuestion.difficulty)}`}>
                        {interviewQuestion.difficulty}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-secondary leading-relaxed">{interviewQuestion.question}</p>
                    {showAnswer && (
                      <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                        <p className="text-xs text-slate-600 leading-relaxed">{interviewQuestion.answer}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setShowAnswer((v) => !v)}
                        className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        {showAnswer ? 'Hide Answer' : 'Show Answer'}
                      </button>
                      <button
                        onClick={fetchInterviewQuestion}
                        className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-bold text-secondary hover:bg-primary/90 transition-colors"
                      >
                        Next Question
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                    <span className="material-symbols-outlined text-3xl mb-2">quiz</span>
                    <p className="text-xs text-center">Could not load question.</p>
                    <button onClick={fetchInterviewQuestion} className="mt-2 text-xs font-semibold text-primary hover:underline">Retry</button>
                  </div>
                )}
              </div>

              {/* Learning Pace Widget */}
              {learningPace ? (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
                      </div>
                      <h3 className="text-base font-bold text-secondary">Learning Pace</h3>
                    </div>
                    <Link to="/student/learning-pace" className="text-xs font-semibold text-primary hover:underline">View</Link>
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" fill="transparent" r="24" stroke="#e2e8f0" strokeWidth="6" />
                        <circle
                          cx="30" cy="30" fill="transparent" r="24"
                          stroke={learningPace.color}
                          strokeDasharray={2 * Math.PI * 24}
                          strokeDashoffset={2 * Math.PI * 24 - (learningPace.paceScore / 100) * 2 * Math.PI * 24}
                          strokeLinecap="round"
                          strokeWidth="6"
                          style={{ transition: 'stroke-dashoffset 1s ease' }}
                        />
                      </svg>
                      <span className="text-sm font-black text-secondary">{learningPace.paceScore}</span>
                    </div>
                    <div>
                      <span
                        className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-1"
                        style={{ background: `${learningPace.color}20`, color: learningPace.color }}
                      >
                        {learningPace.label}
                      </span>
                      {learningPace.percentile > 0 && (
                        <p className="text-xs text-slate-500">Faster than {learningPace.percentile}% of peers</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {learningPace.streak > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
                        <span className="material-symbols-outlined text-[12px]">local_fire_department</span>
                        {learningPace.streak}-day streak
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                      <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                      {learningPace.activeDaysLast30}d active
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">speed</span>
                    <h3 className="text-base font-bold text-secondary">Learning Pace</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">Start adding skills, projects, or certs to track your learning pace.</p>
                  <Link to="/student/learning-pace" className="text-xs font-semibold text-primary hover:underline">
                    View details →
                  </Link>
                </div>
              )}

              {/* LeetCode Summary */}
              {leetcodeSummary ? (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                        <span className="material-symbols-outlined text-orange-500 text-[18px]">code</span>
                      </div>
                      <h3 className="text-base font-bold text-secondary">LeetCode</h3>
                    </div>
                    <Link to="/student/coding" className="text-xs font-semibold text-primary hover:underline">View</Link>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">@{leetcodeSummary.username}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-green-50 p-2">
                      <p className="text-lg font-black text-green-700">{leetcodeSummary.easySolved}</p>
                      <p className="text-[10px] text-green-600 font-medium">Easy</p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 p-2">
                      <p className="text-lg font-black text-yellow-700">{leetcodeSummary.mediumSolved}</p>
                      <p className="text-[10px] text-yellow-600 font-medium">Medium</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-2">
                      <p className="text-lg font-black text-red-600">{leetcodeSummary.hardSolved}</p>
                      <p className="text-[10px] text-red-500 font-medium">Hard</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-slate-500">
                    <span>Total: <span className="font-bold text-secondary">{leetcodeSummary.totalSolved}</span></span>
                    {leetcodeSummary.streak > 0 && (
                      <span>🔥 {leetcodeSummary.streak}-day streak</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-orange-400 text-[20px]">code</span>
                    <h3 className="text-base font-bold text-secondary">LeetCode</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">No LeetCode username linked yet.</p>
                  <Link to="/student/coding" className="text-xs font-semibold text-primary hover:underline">
                    Connect LeetCode →
                  </Link>
                </div>
              )}

              {/* GitHub Summary */}
              {githubSummary ? (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                        <span className="material-symbols-outlined text-slate-600 text-[18px]">commit</span>
                      </div>
                      <h3 className="text-base font-bold text-secondary">GitHub</h3>
                    </div>
                    <Link to="/student/coding" className="text-xs font-semibold text-primary hover:underline">View</Link>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">@{githubSummary.username}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-lg font-black text-secondary">{githubSummary.publicRepos}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Repos</p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 p-2">
                      <p className="text-lg font-black text-yellow-700">{githubSummary.totalStars}</p>
                      <p className="text-[10px] text-yellow-600 font-medium">Stars</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-2">
                      <p className="text-lg font-black text-green-700">{githubSummary.contributionCount ?? githubSummary.followers}</p>
                      <p className="text-[10px] text-green-600 font-medium">
                        {githubSummary.contributionCount != null ? 'Commits' : 'Followers'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-slate-500 text-[20px]">commit</span>
                    <h3 className="text-base font-bold text-secondary">GitHub</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">No GitHub username linked yet.</p>
                  <Link to="/student/coding" className="text-xs font-semibold text-primary hover:underline">
                    Connect GitHub →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
    </main>
  );
}
