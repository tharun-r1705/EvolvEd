import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

import { feedService } from '../services/api.js';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: '', label: 'All Categories', icon: 'apps' },
  { value: 'technical', label: 'Technical', icon: 'code' },
  { value: 'behavioral', label: 'Behavioral', icon: 'psychology' },
  { value: 'hr', label: 'HR', icon: 'people' },
  { value: 'aptitude', label: 'Aptitude', icon: 'calculate' },
  { value: 'system_design', label: 'System Design', icon: 'architecture' },
];

const DIFFICULTIES = [
  { value: '', label: 'All Levels' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const DIFF_STYLES = {
  easy: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  hard: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
};

const CAT_STYLES = {
  technical: 'bg-blue-50 text-blue-700',
  behavioral: 'bg-purple-50 text-purple-700',
  hr: 'bg-pink-50 text-pink-700',
  aptitude: 'bg-amber-50 text-amber-700',
  system_design: 'bg-teal-50 text-teal-700',
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

function CardSkeleton() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Question Card
// ─────────────────────────────────────────────────────────────────────────────

function QuestionCard({ q, practiceMode }) {
  const [showAnswer, setShowAnswer] = useState(!practiceMode);
  const [bookmarked, setBookmarked] = useState(() => {
    try {
      const bms = JSON.parse(localStorage.getItem('evolvEd_bookmarks') || '[]');
      return bms.includes(q.id);
    } catch { return false; }
  });

  function toggleBookmark(e) {
    e.stopPropagation();
    try {
      const bms = JSON.parse(localStorage.getItem('evolvEd_bookmarks') || '[]');
      const next = bookmarked ? bms.filter((id) => id !== q.id) : [...bms, q.id];
      localStorage.setItem('evolvEd_bookmarks', JSON.stringify(next));
      setBookmarked(!bookmarked);
    } catch {}
  }

  // Reset when practice mode toggles
  useEffect(() => { setShowAnswer(!practiceMode); }, [practiceMode]);

  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CAT_STYLES[q.category] ?? 'bg-slate-50 text-slate-600'}`}>
            {q.category.replace('_', ' ')}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${DIFF_STYLES[q.difficulty] ?? 'bg-slate-50 text-slate-600'}`}>
            {q.difficulty}
          </span>
          {q.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs text-slate-500 bg-slate-100">
              #{tag}
            </span>
          ))}
        </div>
        <button
          onClick={toggleBookmark}
          className={`flex-shrink-0 transition-colors ${bookmarked ? 'text-primary' : 'text-slate-300 hover:text-slate-400'}`}
          title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <span className="material-symbols-outlined text-[20px]">{bookmarked ? 'bookmark' : 'bookmark_border'}</span>
        </button>
      </div>

      {/* Question */}
      <div className="px-5 pb-3">
        <p className="text-sm font-semibold text-secondary leading-relaxed">{q.question}</p>
      </div>

      {/* Answer toggle */}
      <div className="border-t border-slate-50 px-5 py-3">
        <button
          onClick={() => setShowAnswer((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">{showAnswer ? 'visibility_off' : 'visibility'}</span>
          {showAnswer ? 'Hide Answer' : 'Show Answer'}
        </button>

        {showAnswer && (
          <div className="mt-3 text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-100">
            {q.answer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function InterviewPrep() {
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // UI
  const [practiceMode, setPracticeMode] = useState(false);
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('evolvEd_bookmarks') || '[]'); } catch { return []; }
  });

  const searchTimeout = useRef(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 20 };
      if (category) params.category = category;
      if (difficulty) params.difficulty = difficulty;
      if (search) params.search = search;

      const res = await feedService.listInterviewQuestions(params);
      let qs = res.data?.questions || [];
      if (bookmarksOnly) qs = qs.filter((q) => bookmarkedIds.includes(q.id));
      setQuestions(qs);
      setTotal(res.data?.total || 0);
      setPages(res.data?.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
  }, [page, category, difficulty, search, bookmarksOnly, bookmarkedIds]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  // Debounce search input
  function handleSearchInput(val) {
    setSearchInput(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  }

  function handleCategoryChange(val) {
    setCategory(val);
    setPage(1);
  }

  function handleDifficultyChange(val) {
    setDifficulty(val);
    setPage(1);
  }

  // Sync bookmarks from localStorage when toggling bookmarks-only
  function handleBookmarksOnly() {
    try {
      const bms = JSON.parse(localStorage.getItem('evolvEd_bookmarks') || '[]');
      setBookmarkedIds(bms);
    } catch {}
    setBookmarksOnly((v) => !v);
    setPage(1);
  }

  const statsMap = {
    technical: questions.filter((q) => q.category === 'technical').length,
    behavioral: questions.filter((q) => q.category === 'behavioral').length,
    hr: questions.filter((q) => q.category === 'hr').length,
    aptitude: questions.filter((q) => q.category === 'aptitude').length,
  };

  return (
    <main className="flex h-full flex-1 flex-col overflow-y-auto bg-background-light p-4 md:p-8">
      <div className="mx-auto w-full max-w-5xl">

          {/* ── Header ── */}
          <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-secondary md:text-4xl">
                Interview Prep
              </h1>
              <p className="mt-2 text-slate-500">
                Browse {total > 0 ? total.toLocaleString() : '—'} curated questions — practice, bookmark, and master them.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {/* Practice Mode toggle */}
              <button
                onClick={() => setPracticeMode((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  practiceMode
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-white text-secondary ring-1 ring-slate-200 hover:ring-primary/40'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {practiceMode ? 'visibility_off' : 'quiz'}
                </span>
                {practiceMode ? 'Practice: ON' : 'Practice Mode'}
              </button>
              <Link
                to="/student/interviews"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-secondary text-sm font-bold shadow-md hover:bg-primary/90 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">mic</span>
                Mock Interview
              </Link>
            </div>
          </header>

          {/* ── Quick stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Technical', value: total > 0 ? '30+' : '—', icon: 'code', color: 'text-blue-600 bg-blue-50' },
              { label: 'Behavioral', value: total > 0 ? '15+' : '—', icon: 'psychology', color: 'text-purple-600 bg-purple-50' },
              { label: 'HR', value: total > 0 ? '10+' : '—', icon: 'people', color: 'text-pink-600 bg-pink-50' },
              { label: 'Aptitude', value: total > 0 ? '10+' : '—', icon: 'calculate', color: 'text-amber-600 bg-amber-50' },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => handleCategoryChange(category === s.label.toLowerCase() ? '' : s.label.toLowerCase())}
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow text-left"
              >
                <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${s.color}`}>
                  <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                </div>
                <p className="text-lg font-black text-secondary">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              </button>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="Search questions…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>

              {/* Category */}
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              {/* Difficulty */}
              <select
                value={difficulty}
                onChange={(e) => handleDifficultyChange(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-white"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>

              {/* Bookmarks */}
              <button
                onClick={handleBookmarksOnly}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  bookmarksOnly
                    ? 'bg-primary text-secondary border-primary'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {bookmarksOnly ? 'bookmark' : 'bookmark_border'}
                </span>
                Bookmarks
              </button>
            </div>

            {/* Active filter chips */}
            {(category || difficulty || search || bookmarksOnly) && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                {category && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                    {CATEGORIES.find((c) => c.value === category)?.label}
                    <button onClick={() => handleCategoryChange('')} className="hover:text-red-500">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                )}
                {difficulty && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                    {difficulty}
                    <button onClick={() => handleDifficultyChange('')} className="hover:text-red-500">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                    "{search}"
                    <button onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }} className="hover:text-red-500">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                )}
                {bookmarksOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    Bookmarks only
                    <button onClick={() => setBookmarksOnly(false)} className="hover:text-red-500">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                )}
                <button
                  onClick={() => { setCategory(''); setDifficulty(''); setSearch(''); setSearchInput(''); setBookmarksOnly(false); setPage(1); }}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* ── Practice mode banner ── */}
          {practiceMode && (
            <div className="flex items-center gap-3 rounded-xl bg-secondary text-white px-5 py-3 mb-4 text-sm font-medium shadow">
              <span className="material-symbols-outlined text-primary text-xl">quiz</span>
              <span>Practice Mode is ON — answers are hidden by default. Click "Show Answer" to reveal.</span>
              <button
                onClick={() => setPracticeMode(false)}
                className="ml-auto text-white/60 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* ── Questions Grid ── */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-red-400 mb-3 block">error_outline</span>
              <p className="text-slate-500 mb-4">{error}</p>
              <button
                onClick={fetchQuestions}
                className="px-5 py-2 rounded-lg bg-primary text-secondary font-bold text-sm hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl ring-1 ring-slate-100">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">
                {bookmarksOnly ? 'bookmark_border' : 'search_off'}
              </span>
              <p className="text-secondary font-semibold mb-1">
                {bookmarksOnly ? 'No bookmarks yet' : 'No questions found'}
              </p>
              <p className="text-sm text-slate-400">
                {bookmarksOnly
                  ? 'Bookmark questions by clicking the bookmark icon on any card.'
                  : 'Try adjusting your filters or search term.'}
              </p>
              {(category || difficulty || search || bookmarksOnly) && (
                <button
                  onClick={() => { setCategory(''); setDifficulty(''); setSearch(''); setSearchInput(''); setBookmarksOnly(false); setPage(1); }}
                  className="mt-4 text-xs font-semibold text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-400 mb-3">
                Showing {questions.length} of {total} questions
                {bookmarksOnly && ' (bookmarks only)'}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {questions.map((q) => (
                  <QuestionCard key={q.id} q={q} practiceMode={practiceMode} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-white ring-1 ring-slate-200 text-slate-600 hover:ring-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    Previous
                  </button>
                  <span className="text-sm text-slate-500">
                    Page <span className="font-bold text-secondary">{page}</span> of {pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-white ring-1 ring-slate-200 text-slate-600 hover:ring-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
    </main>
  );
}
