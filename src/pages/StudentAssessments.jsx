import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../services/api.js';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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

function SkeletonRow() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <div className="animate-pulse space-y-2">
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="h-3 w-1/4 rounded bg-slate-200" />
      </div>
    </div>
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function StudentAssessments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentService.getAssessments();
      setItems(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  return (
    <main className="flex-1 h-full overflow-y-auto bg-background-light py-8 px-4 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link to="/student" className="hover:text-primary transition-colors">Dashboard</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="font-medium text-secondary">Assessments</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-secondary">Assessments</h1>
          <p className="mt-1 text-slate-500 text-sm">View your completed assessments and open detailed breakdowns.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">Unable to load assessments</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchAssessments}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-secondary hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2 block text-slate-400">assignment</span>
            <p>No assessments found yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-md hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-secondary">{a.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{a.category} · {formatDate(a.completedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-secondary">{a.score}%</p>
                    <span className={statusBadgeClass(a.status)}>{a.status}</span>
                    {UUID_RE.test(a.id)
                      ? (
                        <Link
                          to={`/student/assessments/${a.id}`}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          View
                        </Link>
                      )
                      : (
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                          Invalid ID
                        </span>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
