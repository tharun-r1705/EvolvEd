import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recruiterService } from '../services/api';

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  const colours =
    type === 'success'
      ? 'bg-green-50 text-green-800 ring-green-600/20'
      : type === 'error'
      ? 'bg-red-50 text-red-800 ring-red-600/20'
      : 'bg-blue-50 text-blue-800 ring-blue-600/20';
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-1 ring-inset ${colours}`}>
      {type === 'success' ? (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.704 5.296a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414L8.5 12.086l6.796-6.79a1 1 0 011.408 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
      )}
      {message}
    </div>
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ value, max = 100, colour = 'bg-primary' }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100">
      <div className={`h-1.5 rounded-full transition-all ${colour}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function fitColour(score) {
  if (score >= 75) return 'bg-green-500';
  if (score >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

function fitTextColour(score) {
  if (score >= 75) return 'text-green-700';
  if (score >= 50) return 'text-amber-700';
  return 'text-red-600';
}

// ─── Rank badge ───────────────────────────────────────────────────────────────
function RankBadge({ rank }) {
  if (rank === 1) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900">#1</span>;
  if (rank === 2) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-slate-700">#2</span>;
  if (rank === 3) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-xs font-bold text-amber-100">#3</span>;
  return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">#{rank}</span>;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-200">
      <div className="flex items-start gap-4">
        <div className="h-5 w-5 rounded bg-slate-200" />
        <div className="h-12 w-12 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-3 w-24 rounded bg-slate-200" />
        </div>
        <div className="h-10 w-16 rounded-lg bg-slate-200" />
      </div>
      <div className="mt-4 h-2 w-full rounded bg-slate-200" />
      <div className="mt-2 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 w-16 rounded-full bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

// ─── Candidate card ───────────────────────────────────────────────────────────
function CandidateCard({ item, onShortlist, checked, onCheck }) {
  const [expanded, setExpanded] = useState(false);
  const [shortlisting, setShortlisting] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);

  const bd = item.scoreBreakdown || {};

  async function handleShortlist() {
    setShortlisting(true);
    try {
      await onShortlist(item.student.id);
      setShortlisted(true);
    } finally {
      setShortlisting(false);
    }
  }

  return (
    <div
      className={`rounded-2xl bg-white p-5 shadow-md ring-1 transition-shadow hover:shadow-lg ${
        checked ? 'ring-primary/50 bg-primary/[0.02]' : 'ring-slate-200'
      }`}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start gap-4">
        {/* Checkbox */}
        <div className="flex items-center pt-1 flex-shrink-0">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheck(item.rankingId, e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-primary cursor-pointer"
            aria-label={`Select ${item.student.fullName}`}
          />
        </div>

        {/* Rank + avatar */}
        <div className="flex items-center gap-3">
          <RankBadge rank={item.rank} />
          {item.student.avatarUrl ? (
            <img
              src={item.student.avatarUrl}
              alt={item.student.fullName}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-200"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {item.student.fullName?.charAt(0) ?? '?'}
            </div>
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/recruiter/candidates/${item.student.id}`}
            className="font-semibold text-secondary hover:text-primary transition-colors truncate block"
          >
            {item.student.fullName}
          </Link>
          <p className="text-xs text-slate-500">
            {item.student.department}
            {item.student.yearOfStudy ? ` · Year ${item.student.yearOfStudy}` : ''}
          </p>
          {item.student.application && (
            <p className="mt-0.5 text-xs text-slate-400">
              Applied {new Date(item.student.application.appliedAt).toLocaleDateString()}
              {' '}·{' '}
              <span className="capitalize">{item.student.application.status}</span>
            </p>
          )}
        </div>

        {/* Fit score */}
        <div className="text-right">
          <p className={`text-2xl font-extrabold tabular-nums ${fitTextColour(item.fitScore)}`}>
            {item.fitScore.toFixed(1)}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Fit Score</p>
        </div>

        {/* Shortlist button */}
        <button
          onClick={handleShortlist}
          disabled={shortlisting || shortlisted}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            shortlisted
              ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 cursor-default'
              : 'bg-primary text-secondary hover:bg-primary/90 disabled:opacity-60'
          }`}
        >
          {shortlisting ? '…' : shortlisted ? 'Shortlisted' : 'Shortlist'}
        </button>
      </div>

      {/* Fit score bar */}
      <div className="mt-3">
        <ScoreBar value={item.fitScore} colour={fitColour(item.fitScore)} />
      </div>

      {/* Secondary: readiness */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-slate-400">Readiness</span>
        <div className="flex-1">
          <ScoreBar value={item.student.readinessScore} colour="bg-blue-400" />
        </div>
        <span className="text-xs font-medium text-slate-600 tabular-nums w-8 text-right">
          {item.student.readinessScore.toFixed(0)}
        </span>
      </div>

      {/* Top skills */}
      {item.student.topSkills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.student.topSkills.slice(0, 4).map((sk) => (
            <span
              key={sk.name}
              className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {sk.name}
            </span>
          ))}
        </div>
      )}

      {/* Score breakdown mini-bars */}
      {Object.keys(bd).length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
          {[
            { label: 'Skills', key: 'skillMatch' },
            { label: 'Experience', key: 'experience' },
            { label: 'Projects', key: 'projects' },
            { label: 'Assessments', key: 'assessments' },
            { label: 'Certs', key: 'certifications' },
          ].map(({ label, key }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-slate-500">{label}</span>
                <span className="text-[10px] font-medium text-slate-600 tabular-nums">
                  {(bd[key] ?? 0).toFixed(0)}
                </span>
              </div>
              <ScoreBar value={bd[key] ?? 0} colour="bg-slate-400" />
            </div>
          ))}
        </div>
      )}

      {/* AI Justification toggle */}
      {item.aiJustification ? (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between text-xs font-semibold text-primary hover:text-primary/80"
          >
            <span>Why this candidate?</span>
            <svg
              className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded && (
            <p className="mt-2 text-xs leading-relaxed text-slate-600 bg-slate-50 rounded-lg p-3">
              {item.aiJustification}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-[10px] text-slate-300 italic">
          AI justification generating…
        </p>
      )}
    </div>
  );
}

// ─── Send Email Modal ─────────────────────────────────────────────────────────
function SendEmailModal({ count, jobId, selectedIds, onClose, onSuccess }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      const res = await recruiterService.sendShortlistEmails(jobId, {
        candidateIds: selectedIds,
        message: message.trim() || undefined,
      });
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send emails. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-secondary">Send Shortlist Emails</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Notify <span className="font-semibold text-secondary">{count}</span> candidate{count !== 1 ? 's' : ''} they've been shortlisted.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined !text-[20px]">close</span>
          </button>
        </div>

        {/* Info box */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-5 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary !text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
          <p className="text-xs text-slate-600 leading-relaxed">
            A branded EvolvEd email will be sent to each candidate, congratulating them on being shortlisted. They will also be added to your shortlist.
          </p>
        </div>

        {/* Custom message */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-secondary mb-1.5">
            Custom Message <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            placeholder="Add a personal note to the candidates, e.g. interview details, next steps..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-secondary placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
          />
          <p className="text-right text-xs text-slate-400 mt-1">{message.length}/1000</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-center gap-2 text-red-700 text-sm">
            <span className="material-symbols-outlined !text-[16px]">error</span>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={sending}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-secondary text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 h-10 rounded-xl bg-primary text-secondary text-sm font-bold hover:bg-amber-500 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <span className="material-symbols-outlined !text-[16px] animate-spin">progress_activity</span>
                Sending…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined !text-[16px]">send</span>
                Send {count} Email{count !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function JobApplicants() {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [toast, setToast] = useState(null);

  // Selection state — Set of rankingIds
  const [selected, setSelected] = useState(new Set());

  // Modal state
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Filters
  const [minFitScore, setMinFitScore] = useState(0);
  const [sortBy, setSortBy] = useState('fitScore');

  // ── Initial load ───────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [jobRes, rankRes] = await Promise.allSettled([
        recruiterService.getJobById(jobId),
        recruiterService.getJobRankings(jobId, { page: 1, limit: 50, sortBy }),
      ]);

      if (jobRes.status === 'fulfilled') setJob(jobRes.value.data);
      if (rankRes.status === 'fulfilled') setRankings(rankRes.value.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [jobId, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Filtered items ─────────────────────────────────────────────────────────
  const items = (rankings?.items ?? []).filter((item) => item.fitScore >= minFitScore);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total = rankings?.total ?? 0;
  const avgFit = items.length
    ? Math.round(items.reduce((s, i) => s + i.fitScore, 0) / items.length)
    : 0;
  const topScore = items[0]?.fitScore ?? 0;
  const above75 = items.filter((i) => i.fitScore >= 75).length;

  // ── Selection helpers ──────────────────────────────────────────────────────
  function handleCheck(rankingId, checked) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(rankingId);
      else next.delete(rankingId);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function selectTopN(n) {
    const ids = items.slice(0, n).map((i) => i.rankingId);
    setSelected(new Set(ids));
  }

  function selectAbovePct(pct) {
    const ids = items.filter((i) => i.fitScore >= pct).map((i) => i.rankingId);
    setSelected(new Set(ids));
  }

  // Map rankingId → studentId for the email payload
  const selectedStudentIds = Array.from(selected)
    .map((rankingId) => items.find((i) => i.rankingId === rankingId)?.student?.id)
    .filter(Boolean);

  // ── Bulk shortlist ─────────────────────────────────────────────────────────
  async function handleBulkShortlist() {
    if (selected.size === 0) return;
    let success = 0;
    let fail = 0;
    for (const rankingId of selected) {
      const item = items.find((i) => i.rankingId === rankingId);
      if (!item) continue;
      try {
        await recruiterService.shortlistCandidate(item.student.id);
        success++;
      } catch {
        fail++;
      }
    }
    clearSelection();
    setToast({
      message: `Shortlisted ${success} candidate${success !== 1 ? 's' : ''}${fail > 0 ? `, ${fail} failed` : ''}`,
      type: fail > 0 ? 'error' : 'success',
    });
  }

  // ── Calculate matches ──────────────────────────────────────────────────────
  async function handleCalculate() {
    setCalculating(true);
    try {
      await recruiterService.calculateMatches(jobId);
      await new Promise((r) => setTimeout(r, 3000));
      const res = await recruiterService.getJobRankings(jobId, { page: 1, limit: 50, sortBy });
      setRankings(res.data);
      clearSelection();
      setToast({ message: `Ranked ${res.data.total} candidates`, type: 'success' });
    } catch (err) {
      setToast({ message: err?.response?.data?.message ?? 'Calculation failed', type: 'error' });
    } finally {
      setCalculating(false);
    }
  }

  // ── Re-fetch when sort changes ─────────────────────────────────────────────
  async function applyFilters(newSort) {
    const s = newSort ?? sortBy;
    try {
      const res = await recruiterService.getJobRankings(jobId, { page: 1, limit: 50, sortBy: s });
      setRankings(res.data);
    } catch {/* ignore */}
  }

  // ── Shortlist single handler ───────────────────────────────────────────────
  async function handleShortlist(studentId) {
    try {
      await recruiterService.shortlistCandidate(studentId);
      setToast({ message: 'Candidate shortlisted', type: 'success' });
    } catch (err) {
      setToast({ message: err?.response?.data?.message ?? 'Shortlist failed', type: 'error' });
    }
  }

  // ── Email modal success ────────────────────────────────────────────────────
  function handleEmailSuccess(result) {
    setShowEmailModal(false);
    clearSelection();
    setToast({
      message: `Sent ${result.sent} email${result.sent !== 1 ? 's' : ''}${result.failed > 0 ? `, ${result.failed} failed` : ''} successfully`,
      type: result.failed > 0 ? 'error' : 'success',
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="flex flex-col h-full overflow-y-auto bg-background-light">
      {/* Calculating overlay */}
      {calculating && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-8 text-center shadow-2xl w-72">
            <div className="mx-auto h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
            <p className="font-semibold text-secondary">Running AI Matching Engine…</p>
            <p className="mt-1 text-xs text-slate-500">Scoring all candidates against this role</p>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <SendEmailModal
          count={selectedStudentIds.length}
          jobId={jobId}
          selectedIds={selectedStudentIds}
          onClose={() => setShowEmailModal(false)}
          onSuccess={handleEmailSuccess}
        />
      )}

      <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link to="/recruiter" className="hover:text-primary">Dashboard</Link>
          <span>/</span>
          <Link to="/recruiter/jobs" className="hover:text-primary">Jobs</Link>
          <span>/</span>
          <span className="text-slate-600 truncate max-w-[160px]">{job?.title ?? '…'}</span>
          <span>/</span>
          <span className="text-secondary font-medium">Applicants</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary">
              {loading ? 'Loading…' : job?.title ?? 'Job Applicants'}
            </h1>
            {job && (
              <p className="mt-1 text-sm text-slate-500">
                {job.department ?? ''}{job.location ? ` · ${job.location}` : ''}
              </p>
            )}
          </div>
          <button
            onClick={handleCalculate}
            disabled={calculating || loading}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-secondary shadow hover:bg-primary/90 disabled:opacity-60 transition-all"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {rankings?.total > 0 ? 'Re-calculate Matches' : 'Calculate Matches'}
          </button>
        </div>

        {/* Stats strip */}
        {!loading && rankings?.total > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total Ranked', value: total },
              { label: 'Avg Fit Score', value: `${avgFit}%` },
              { label: 'Top Score', value: `${topScore.toFixed(1)}%` },
              { label: 'Above 75%', value: above75 },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-white p-4 text-center shadow-md ring-1 ring-slate-200">
                <p className="text-xl font-extrabold text-secondary tabular-nums">{value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter bar */}
        {!loading && rankings?.total > 0 && (
          <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-200">
            {/* Min fit score */}
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-slate-600 whitespace-nowrap">
                Min Fit Score: <span className="font-bold text-secondary">{minFitScore}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={minFitScore}
                onChange={(e) => setMinFitScore(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  applyFilters(e.target.value);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
              >
                <option value="fitScore">Fit Score</option>
                <option value="readinessScore">Readiness</option>
                <option value="applicationDate">Application Date</option>
              </select>
            </div>
          </div>
        )}

        {/* Quick-select row */}
        {!loading && items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Quick select:</span>
            {[5, 10, 20].map((n) => (
              items.length >= n && (
                <button
                  key={n}
                  onClick={() => selectTopN(n)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  Top {n}
                </button>
              )
            ))}
            {above75 > 0 && (
              <button
                onClick={() => selectAbovePct(75)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:border-primary/40 hover:text-primary transition-colors"
              >
                All above 75%
                <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5">
                  {above75}
                </span>
              </button>
            )}
            {selected.size > 0 && (
              <button
                onClick={clearSelection}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : rankings === null || rankings?.total === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-md ring-1 ring-slate-200 text-center px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-secondary mb-1">No rankings yet</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-sm">
              Run the AI matching engine to score and rank all eligible candidates for this role.
            </p>
            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-secondary shadow hover:bg-primary/90 disabled:opacity-60"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Calculate Matches
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-md ring-1 ring-slate-200 text-center">
            <p className="text-sm text-slate-500">No candidates above the selected fit score threshold.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-24">
            {items.map((item) => (
              <CandidateCard
                key={item.rankingId}
                item={item}
                onShortlist={handleShortlist}
                checked={selected.has(item.rankingId)}
                onCheck={handleCheck}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Sticky bulk actions bar ───────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 bg-secondary px-4 sm:px-8 py-3 shadow-2xl border-t border-white/10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-full bg-primary text-secondary text-xs font-bold px-2.5 py-0.5 min-w-[28px]">
              {selected.size}
            </span>
            <span className="text-sm text-white font-medium">
              candidate{selected.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearSelection}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleBulkShortlist}
              className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined !text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
              Shortlist Selected
            </button>
            <button
              onClick={() => setShowEmailModal(true)}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-secondary hover:bg-amber-500 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined !text-[14px]">send</span>
              Send Shortlist Email
            </button>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </main>
  );
}
