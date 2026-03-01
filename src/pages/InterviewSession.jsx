import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { interviewService } from '../services/api.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pad(n) {
  return String(n).padStart(2, '0');
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${pad(m)}:${pad(s)}`;
}

function scoreColor(score) {
  if (score >= 8) return 'text-emerald-600';
  if (score >= 6) return 'text-amber-600';
  if (score >= 4) return 'text-orange-500';
  return 'text-red-500';
}

function scoreBg(score) {
  if (score >= 8) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (score >= 6) return 'bg-amber-50 text-amber-700 border border-amber-200';
  if (score >= 4) return 'bg-orange-50 text-orange-700 border border-orange-200';
  return 'bg-red-50 text-red-700 border border-red-200';
}

function ratingLabel(rating) {
  const map = {
    Excellent: { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: 'emoji_events' },
    Good: { bg: 'bg-amber-50 text-amber-700 border border-amber-200', icon: 'thumb_up' },
    Average: { bg: 'bg-orange-50 text-orange-700 border border-orange-200', icon: 'trending_flat' },
    'Needs Improvement': { bg: 'bg-red-50 text-red-700 border border-red-200', icon: 'trending_down' },
  };
  return map[rating] || map['Average'];
}

function difficultyBadge(d) {
  const map = {
    easy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border border-amber-200',
    hard: 'bg-red-50 text-red-700 border border-red-200',
  };
  return map[d?.toLowerCase()] || 'bg-slate-100 text-slate-600 border border-slate-200';
}

function typeBadge(t) {
  const map = {
    technical: 'bg-blue-50 text-blue-700 border border-blue-200',
    hr: 'bg-purple-50 text-purple-700 border border-purple-200',
    behavioral: 'bg-teal-50 text-teal-700 border border-teal-200',
    resume: 'bg-primary/10 text-primary border border-primary/30',
  };
  return map[t?.toLowerCase()] || 'bg-slate-100 text-slate-600 border border-slate-200';
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressBar({ current, total }) {
  const pct = total > 0 ? ((current) / total) * 100 : 0;
  return (
    <div className="w-full bg-white/20 rounded-full h-1.5">
      <div
        className="bg-primary h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function EvalPanel({ eval: ev, onNext, isLast, onComplete, completing }) {
  const [showModel, setShowModel] = useState(false);

  return (
    <div className="mt-4 rounded-2xl ring-1 ring-slate-200 bg-white shadow-sm p-5 space-y-4 animate-fade-in">
      {/* Score */}
      <div className="flex items-center gap-3">
        <span className={`text-3xl font-bold ${scoreColor(ev.score)}`}>{ev.score}</span>
        <span className="text-slate-400 text-lg font-medium">/10</span>
        <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${scoreBg(ev.score)}`}>
          {ev.score >= 8 ? 'Excellent' : ev.score >= 6 ? 'Good' : ev.score >= 4 ? 'Average' : 'Needs Work'}
        </span>
      </div>

      {/* Feedback */}
      {ev.feedback && (
        <p className="text-slate-600 text-sm leading-relaxed">{ev.feedback}</p>
      )}

      {/* Strengths + Improvements */}
      <div className="grid sm:grid-cols-2 gap-3">
        {ev.strengths?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1.5">Strengths</p>
            <ul className="space-y-1">
              {ev.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5">check_circle</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {ev.improvements?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1.5">Improvements</p>
            <ul className="space-y-1">
              {ev.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">arrow_upward</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Model answer toggle */}
      {ev.modelAnswer && (
        <div>
          <button
            onClick={() => setShowModel((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">{showModel ? 'expand_less' : 'expand_more'}</span>
            {showModel ? 'Hide Model Answer' : 'Show Model Answer'}
          </button>
          {showModel && (
            <div className="mt-2 p-3 rounded-xl bg-slate-50 ring-1 ring-slate-200 text-sm text-slate-600 leading-relaxed">
              {ev.modelAnswer}
            </div>
          )}
        </div>
      )}

      {/* Next / Complete */}
      <div className="pt-2">
        {isLast ? (
          <button
            onClick={onComplete}
            disabled={completing}
            className="w-full py-3 rounded-xl bg-primary text-secondary font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {completing ? (
              <>
                <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                Generating Final Report…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Complete Interview
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="w-full py-3 rounded-xl bg-primary text-secondary font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            Next Question
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Results Screen
// ---------------------------------------------------------------------------
function ResultsScreen({ interview, onNewInterview }) {
  const navigate = useNavigate();
  const fb = interview.feedback || {};
  const rating = fb.overallRating || 'Average';
  const { bg: rBg, icon: rIcon } = ratingLabel(rating);
  const [openQ, setOpenQ] = useState(null);

  const questions = interview.questions || [];

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <div className="border-b border-secondary/20 bg-secondary sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/student/interviews')}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Interviews
          </button>
          <span className="text-xs text-slate-400 font-mono">
            {new Date(interview.completedAt || interview.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero score card */}
        <div className="rounded-2xl bg-white shadow-md ring-1 ring-slate-200 p-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${typeBadge(interview.type)}`}>
              {interview.type}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${difficultyBadge(interview.difficulty)}`}>
              {interview.difficulty}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-secondary">Interview Complete</h1>

          {/* Big score */}
          <div className="flex items-end justify-center gap-2">
            <span className={`text-7xl font-bold ${scoreColor(interview.overallScore)}`}>
              {interview.overallScore?.toFixed(1) ?? '—'}
            </span>
            <span className="text-2xl text-slate-400 mb-2">/10</span>
          </div>

          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${rBg}`}>
            <span className="material-symbols-outlined text-base">{rIcon}</span>
            {rating}
          </span>

          {fb.summary && (
            <p className="text-slate-600 text-sm leading-relaxed max-w-xl mx-auto">{fb.summary}</p>
          )}
        </div>

        {/* Strengths / Weaknesses / Tips */}
        {(fb.strengths?.length > 0 || fb.weaknesses?.length > 0 || fb.tips?.length > 0) && (
          <div className="grid sm:grid-cols-3 gap-4">
            {fb.strengths?.length > 0 && (
              <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-4 space-y-2">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Strengths</p>
                <ul className="space-y-1.5">
                  {fb.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5">check_circle</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {fb.weaknesses?.length > 0 && (
              <div className="rounded-xl bg-red-50 ring-1 ring-red-200 p-4 space-y-2">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Weaknesses</p>
                <ul className="space-y-1.5">
                  {fb.weaknesses.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">cancel</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {fb.tips?.length > 0 && (
              <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 p-4 space-y-2">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Tips</p>
                <ul className="space-y-1.5">
                  {fb.tips.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">lightbulb</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Per-question accordion */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Question Breakdown</h2>
          {questions.map((q, i) => {
            const isOpen = openQ === i;
            const answered = q.score != null;
            return (
              <div
                key={i}
                className="rounded-xl ring-1 ring-slate-200 bg-white shadow-sm overflow-hidden"
              >
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setOpenQ(isOpen ? null : i)}
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-secondary line-clamp-1">{q.question}</span>
                  {answered && (
                    <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${scoreBg(q.score)}`}>
                      {q.score}/10
                    </span>
                  )}
                  <span className="material-symbols-outlined text-slate-400 flex-shrink-0">
                    {isOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Your Answer</p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {q.answer || <span className="italic text-slate-400">Not answered</span>}
                      </p>
                    </div>
                    {q.feedback && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">AI Feedback</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{q.feedback}</p>
                      </div>
                    )}
                    {q.modelAnswer && (
                      <div>
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Model Answer</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{q.modelAnswer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onNewInterview}
            className="flex-1 py-3 rounded-xl bg-primary text-secondary font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Start New Interview
          </button>
          <button
            onClick={() => navigate('/student/interviews')}
            className="flex-1 py-3 rounded-xl bg-white ring-1 ring-slate-200 text-secondary font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">list</span>
            Back to Interviews
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main InterviewSession page
// ---------------------------------------------------------------------------
export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Current question index (mirrors interview.currentIndex)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answer input
  const [answer, setAnswer] = useState('');
  const [inputMode, setInputMode] = useState('type'); // 'type' | 'speak'

  // Speech recognition
  const [speechSupported] = useState(
    typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const [recognizing, setRecognizing] = useState(false);
  const recognitionRef = useRef(null);

  // Audio playback
  const [audioState, setAudioState] = useState('idle'); // 'idle' | 'loading' | 'playing' | 'done' | 'error'

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState(null); // per-question eval from submitAnswer

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Completing
  const [completing, setCompleting] = useState(false);

  // ── Load interview ─────────────────────────────────────────────────────────
  const loadInterview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await interviewService.get(id);
      const iv = res.data?.data || res.data;
      setInterview(iv);
      setCurrentIndex(iv.currentIndex ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load interview.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInterview();
  }, [loadInterview]);

  // ── Timer (only runs for in_progress interviews) ───────────────────────────
  useEffect(() => {
    if (interview?.status !== 'in_progress') return;
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [interview?.status]);

  // ── Reset state when question changes ─────────────────────────────────────
  useEffect(() => {
    setAnswer('');
    setEvalResult(null);
  }, [currentIndex]);

  // ── Speech recognition ─────────────────────────────────────────────────────
  function startSpeech() {
    if (!speechSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(' ');
      setAnswer(transcript);
    };
    rec.onend = () => setRecognizing(false);
    rec.start();
    recognitionRef.current = rec;
    setRecognizing(true);
  }

  function stopSpeech() {
    recognitionRef.current?.stop();
    setRecognizing(false);
  }

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  // ── Audio playback via browser Web Speech API ────────────────────────────
  const speechRef = useRef(null);

  // Check browser support
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  function playAudio() {
    const questionText = interview?.questions?.[currentIndex]?.question;
    if (!questionText) return;
    if (!ttsSupported) { setAudioState('error'); return; }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(questionText);
    utter.lang = 'en-GB';
    utter.rate = 0.95;
    utter.pitch = 0.95;

    // Pick a male British voice — priority order matches common browser/OS voice names
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.lang === 'en-GB' && /george|daniel|oliver|ryan|male/i.test(v.name)) ||
      voices.find((v) => v.lang === 'en-GB' && !/female|woman|zira|hazel|susan|libby/i.test(v.name)) ||
      voices.find((v) => v.lang === 'en-GB') ||
      voices.find((v) => v.lang.startsWith('en') && /george|daniel|ryan|male/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];
    if (preferred) utter.voice = preferred;

    utter.onstart = () => setAudioState('playing');
    utter.onend = () => setAudioState('done');
    utter.onerror = () => setAudioState('error');

    speechRef.current = utter;
    setAudioState('loading');
    window.speechSynthesis.speak(utter);
  }

  function stopAudio() {
    window.speechSynthesis.cancel();
    setAudioState('idle');
  }

  // Cancel speech on unmount / question change
  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    setAudioState('idle');
  }, [currentIndex]);

  // ── Submit answer ──────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!answer.trim()) return;
    if (recognizing) stopSpeech();
    try {
      setSubmitting(true);
      const res = await interviewService.submitAnswer(id, currentIndex, answer.trim());
      const data = res.data?.data || res.data;
      // data = { question, index, score, feedback, modelAnswer, strengths, improvements }
      setEvalResult(data);
      // Also update the local interview questions array for results display later
      setInterview((prev) => {
        if (!prev) return prev;
        const qs = [...(prev.questions || [])];
        if (qs[currentIndex]) {
          qs[currentIndex] = {
            ...qs[currentIndex],
            answer: answer.trim(),
            score: data.score,
            feedback: data.feedback,
            modelAnswer: data.modelAnswer,
            strengths: data.strengths,
            improvements: data.improvements,
          };
        }
        return { ...prev, questions: qs };
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Next question ──────────────────────────────────────────────────────────
  function handleNext() {
    setCurrentIndex((i) => i + 1);
    setInterview((prev) => prev ? { ...prev, currentIndex: currentIndex + 1 } : prev);
  }

  // ── Complete interview ─────────────────────────────────────────────────────
  async function handleComplete() {
    try {
      setCompleting(true);
      const res = await interviewService.complete(id);
      const data = res.data?.data || res.data;
      setInterview(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete interview.');
    } finally {
      setCompleting(false);
    }
  }

  // ── Abandon ────────────────────────────────────────────────────────────────
  async function handleAbandon() {
    if (!window.confirm('Are you sure you want to abandon this interview?')) return;
    try {
      await interviewService.abandon(id);
      navigate('/student/interviews');
    } catch {
      navigate('/student/interviews');
    }
  }

  // ── Render: loading / error ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="animate-spin material-symbols-outlined text-4xl text-primary">progress_activity</span>
          <p className="text-slate-500">Loading interview…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-red-400">error</span>
          <p className="text-secondary font-semibold">{error}</p>
          <button
            onClick={() => navigate('/student/interviews')}
            className="px-6 py-2 rounded-xl bg-primary text-secondary font-bold text-sm hover:bg-primary/90"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  // ── Render: completed ──────────────────────────────────────────────────────
  if (interview?.status === 'completed') {
    return (
      <ResultsScreen
        interview={interview}
        onNewInterview={() => navigate('/student/interviews')}
      />
    );
  }

  // ── Render: abandoned ─────────────────────────────────────────────────────
  if (interview?.status === 'abandoned') {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto px-6">
          <span className="material-symbols-outlined text-5xl text-slate-400">cancel</span>
          <h2 className="text-secondary text-xl font-bold">Interview Abandoned</h2>
          <p className="text-slate-500 text-sm">This interview session was abandoned and cannot be resumed.</p>
          <button
            onClick={() => navigate('/student/interviews')}
            className="px-6 py-2 rounded-xl bg-primary text-secondary font-bold text-sm hover:bg-primary/90"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  // ── Render: in_progress interview screen ───────────────────────────────────
  const questions = interview?.questions || [];
  const totalQ = questions.length;
  const currentQ = questions[currentIndex];
  const isLast = currentIndex === totalQ - 1;
  const alreadyAnswered = currentQ?.score != null;

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* ── Top bar ── */}
      <div className="border-b border-secondary/20 bg-secondary sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={handleAbandon}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors text-sm"
            title="Abandon interview"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>

          <div className="flex items-center gap-2 flex-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${typeBadge(interview?.type)}`}>
              {interview?.type}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${difficultyBadge(interview?.difficulty)}`}>
              {interview?.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="font-mono">{formatTime(elapsed)}</span>
            <span className="font-semibold text-white">
              Q {currentIndex + 1} <span className="text-slate-500">/ {totalQ}</span>
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-2">
          <ProgressBar current={currentIndex} total={totalQ} />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

        {/* Interviewer avatar + question */}
        <div className="rounded-2xl bg-white shadow-md ring-1 ring-slate-200 p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary" />
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Interviewer</p>
              <p className="text-sm text-slate-500">Question {currentIndex + 1} of {totalQ}</p>
            </div>
          </div>

          {/* Question text */}
          {currentQ ? (
            <p className="text-lg font-semibold text-secondary leading-relaxed">
              {currentQ.question}
            </p>
          ) : (
            <p className="text-slate-400 italic">Loading question…</p>
          )}

          {/* Audio button */}
          <div className="flex items-center gap-3">
            {(audioState === 'idle' || audioState === 'loading') && (
              <button
                onClick={playAudio}
                className="flex items-center gap-2 text-sm text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">volume_up</span>
                Listen to question
              </button>
            )}
            {audioState === 'playing' && (
              <button
                onClick={stopAudio}
                className="flex items-center gap-2 text-sm text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                <span className="material-symbols-outlined text-base animate-pulse">graphic_eq</span>
                Playing… (click to stop)
              </button>
            )}
            {(audioState === 'done' || audioState === 'error') && (
              <button
                onClick={playAudio}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors font-medium"
              >
                <span className="material-symbols-outlined text-base">replay</span>
                {audioState === 'error' ? 'Not supported – retry' : 'Listen again'}
              </button>
            )}
          </div>
        </div>

        {/* Answer section — only show if not already answered */}
        {!alreadyAnswered && !evalResult && (
          <div className="space-y-3">
            {/* Mode toggle */}
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex-1">Your Answer</p>
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => { if (recognizing) stopSpeech(); setInputMode('type'); }}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${inputMode === 'type' ? 'bg-primary text-secondary' : 'text-slate-500 hover:text-secondary'}`}
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1">keyboard</span>
                  Type
                </button>
                <button
                  onClick={() => setInputMode('speak')}
                  disabled={!speechSupported}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${inputMode === 'speak' ? 'bg-primary text-secondary' : 'text-slate-500 hover:text-secondary'}`}
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1">mic</span>
                  Speak
                </button>
              </div>
            </div>

            {/* Type mode */}
            {inputMode === 'type' && (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                placeholder="Type your answer here…"
                className="w-full rounded-xl bg-white ring-1 ring-slate-200 text-secondary placeholder-slate-400 text-sm p-4 resize-none focus:outline-none focus:ring-primary/50 transition-colors leading-relaxed shadow-sm"
              />
            )}

            {/* Speak mode */}
            {inputMode === 'speak' && (
              <div className="space-y-3">
                {!speechSupported ? (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-300">
                    Speech recognition is not supported in this browser. Please use the Type mode.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-wrap">
                      {!recognizing ? (
                        <button
                          onClick={startSpeech}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-secondary font-semibold text-sm hover:bg-primary/90 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">mic</span>
                          Start Speaking
                        </button>
                      ) : (
                        <button
                          onClick={stopSpeech}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg animate-pulse">stop</span>
                          Stop
                        </button>
                      )}
                      {recognizing && (
                        <span className="flex items-center gap-2 text-sm text-red-400">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                          </span>
                          Recording…
                        </span>
                      )}
                    </div>
                  <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      rows={6}
                      placeholder="Your speech will appear here… you can also edit the text."
                      className="w-full rounded-xl bg-white ring-1 ring-slate-200 text-secondary placeholder-slate-400 text-sm p-4 resize-none focus:outline-none focus:ring-primary/50 transition-colors leading-relaxed shadow-sm"
                    />
                  </>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
              className="w-full py-3 rounded-xl bg-primary text-secondary font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                  Evaluating…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">send</span>
                  Submit Answer
                </>
              )}
            </button>
          </div>
        )}

        {/* Already answered (re-visiting question) */}
        {alreadyAnswered && !evalResult && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Answer</p>
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4 text-sm text-slate-600 leading-relaxed">
              {currentQ.answer}
            </div>
            <div className={`rounded-xl p-3 text-sm font-semibold flex items-center gap-2 ${scoreBg(currentQ.score)}`}>
              <span className="material-symbols-outlined text-base">grade</span>
              Score: {currentQ.score}/10
            </div>
            {/* Show eval inline */}
            <EvalPanel
              eval={{
                score: currentQ.score,
                feedback: currentQ.feedback,
                modelAnswer: currentQ.modelAnswer,
                strengths: currentQ.strengths,
                improvements: currentQ.improvements,
              }}
              onNext={handleNext}
              isLast={isLast}
              onComplete={handleComplete}
              completing={completing}
            />
          </div>
        )}

        {/* Evaluation result after submit */}
        {evalResult && (
          <EvalPanel
            eval={evalResult}
            onNext={handleNext}
            isLast={isLast}
            onComplete={handleComplete}
            completing={completing}
          />
        )}
      </div>
    </div>
  );
}
