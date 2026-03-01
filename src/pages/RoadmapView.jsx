import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roadmapService } from '../services/api.js';

// ─────────────────────────────────────────────────────────────────
// Helpers / small components
// ─────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  not_started: { label: 'Not Started', icon: 'radio_button_unchecked', cls: 'text-slate-400', ring: 'border-slate-300', bg: 'bg-slate-100' },
  in_progress:  { label: 'In Progress',  icon: 'pending',               cls: 'text-blue-500',  ring: 'border-blue-300',  bg: 'bg-blue-50' },
  completed:    { label: 'Completed',    icon: 'check_circle',           cls: 'text-emerald-500', ring: 'border-emerald-300', bg: 'bg-emerald-50' },
};

const PLATFORM_ICONS = { youtube: '▶', freecodecamp: 'fCC', mdn: 'MDN', docs: '📄', github: 'GH', other: '🔗' };

function PlatformBadge({ platform }) {
  const icon = PLATFORM_ICONS[platform] || '🔗';
  const colors = {
    youtube: 'bg-red-50 text-red-600',
    freecodecamp: 'bg-green-50 text-green-600',
    mdn: 'bg-blue-50 text-blue-600',
    docs: 'bg-slate-100 text-slate-600',
    github: 'bg-slate-100 text-slate-700',
    other: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors[platform] || colors.other}`}>{icon}</span>
  );
}

function ModuleStatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.not_started;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${s.cls}`}>
      <span className="material-symbols-outlined text-sm">{s.icon}</span>
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Quiz Modal
// ─────────────────────────────────────────────────────────────────
function QuizModal({ roadmapId, moduleIndex, moduleTitle, onClose, onPassed }) {
  const [phase, setPhase] = useState('loading'); // loading | questions | result | cooldown
  const [quiz, setQuiz] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const timerRef = useRef(null);

  const fetchQuiz = useCallback(async () => {
    setPhase('loading');
    setError('');
    try {
      const res = await roadmapService.getModuleTest(roadmapId, moduleIndex);
      const q = res.data.data.quiz;
      setQuiz(q);
      setAnswers(new Array(q.length).fill(null));
      setCurrent(0);
      setPhase('questions');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz.');
      setPhase('error');
    }
  }, [roadmapId, moduleIndex]);

  useEffect(() => { fetchQuiz(); }, [fetchQuiz]);

  async function handleSubmit() {
    if (answers.some((a) => a === null)) { setError('Please answer all questions.'); return; }
    setPhase('loading');
    try {
      const res = await roadmapService.submitModuleTest(roadmapId, moduleIndex, answers);
      setResult(res.data.data);
      setPhase('result');
      if (res.data.data.passed) onPassed(res.data.data.overallProgress);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
      setPhase('questions');
    }
  }

  function startCooldown() {
    setPhase('cooldown');
    setCooldown(60);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  function handleRetry() {
    clearInterval(timerRef.current);
    setResult(null);
    setError('');
    fetchQuiz();
  }

  const q = quiz[current];
  const totalQ = quiz.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0f2135] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Module Test</p>
            <h2 className="text-base font-bold text-white mt-0.5 leading-snug">{moduleTitle}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors flex-shrink-0">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Loading */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <p className="text-sm text-slate-400">Loading questions…</p>
          </div>
        )}

        {/* Error */}
        {phase === 'error' && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-sm">
            <span className="material-symbols-outlined text-base">error</span>{error}
          </div>
        )}

        {/* Questions */}
        {phase === 'questions' && q && (
          <>
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((current + 1) / totalQ) * 100}%` }} />
              </div>
              <span className="text-xs font-semibold text-primary whitespace-nowrap">Q {current + 1} of {totalQ}</span>
            </div>

            {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded px-3 py-1.5">{error}</p>}

            <div>
              <p className="text-sm font-semibold text-white leading-relaxed">{q.question}</p>
            </div>

            <div className="flex flex-col gap-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => { const next = [...answers]; next[current] = i; setAnswers(next); }}
                  className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    answers[current] === i
                      ? 'bg-primary/20 border-primary text-white font-medium'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              {current > 0 && (
                <button onClick={() => { setError(''); setCurrent(current - 1); }} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                  Back
                </button>
              )}
              {current < totalQ - 1 ? (
                <button
                  onClick={() => { if (answers[current] === null) { setError('Please select an answer.'); return; } setError(''); setCurrent(current + 1); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-secondary hover:bg-primary/90 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-secondary hover:bg-primary/90 transition-colors"
                >
                  Submit Test
                </button>
              )}
            </div>
          </>
        )}

        {/* Result */}
        {phase === 'result' && result && (
          <>
            <div className={`rounded-2xl p-5 text-center border ${result.passed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <span className={`material-symbols-outlined text-4xl ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.passed ? 'check_circle' : 'cancel'}
              </span>
              <p className={`text-lg font-bold mt-2 ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.passed ? 'Passed!' : 'Not Passed'}
              </p>
              <p className="text-2xl font-extrabold text-white mt-1">{result.score}%</p>
              <p className="text-xs text-slate-400 mt-1">{result.correct} / {result.total} correct</p>
            </div>

            {/* Per-question feedback */}
            <div className="flex flex-col gap-3">
              {result.feedback.map((fb, i) => (
                <div key={i} className={`rounded-xl p-3 border text-sm ${fb.correct ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <div className="flex items-start gap-2">
                    <span className={`material-symbols-outlined text-base mt-0.5 flex-shrink-0 ${fb.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                      {fb.correct ? 'check_circle' : 'cancel'}
                    </span>
                    <div>
                      <p className="font-medium text-white leading-snug">{fb.question}</p>
                      {!fb.correct && (
                        <p className="text-xs text-slate-400 mt-1">
                          Correct: <span className="text-emerald-400">{quiz[i]?.options?.[fb.correctIndex]}</span>
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{fb.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              {!result.passed && (
                <button onClick={startCooldown} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                  Retake
                </button>
              )}
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-secondary hover:bg-primary/90 transition-colors">
                Done
              </button>
            </div>
          </>
        )}

        {/* Cooldown */}
        {phase === 'cooldown' && (
          <div className="flex flex-col items-center gap-5 py-8 text-center">
            <div className="h-16 w-16 rounded-full border-4 border-primary/30 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">{cooldown}</span>
            </div>
            <div>
              <p className="text-white font-semibold">Cooldown</p>
              <p className="text-xs text-slate-400 mt-1">You can retake the test in {cooldown}s</p>
            </div>
            {cooldown === 0 && (
              <button onClick={handleRetry} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-secondary hover:bg-primary/90 transition-colors">
                Retake Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Module Card
// ─────────────────────────────────────────────────────────────────
function ModuleCard({ mod, index, total, onStatusChange, onTakeTest }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const s = STATUS_MAP[mod.status] || STATUS_MAP.not_started;
  const isLast = index === total - 1;

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    try { await onStatusChange(index, newStatus); } finally { setUpdating(false); }
  }

  return (
    <div className="flex gap-4">
      {/* Stepper line */}
      <div className="flex flex-col items-center flex-shrink-0 w-8">
        <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
          mod.status === 'completed' ? 'border-emerald-400 bg-emerald-50 text-emerald-600' :
          mod.status === 'in_progress' ? 'border-blue-400 bg-blue-50 text-blue-600' :
          'border-slate-300 bg-slate-100 text-slate-400'
        }`}>
          {mod.status === 'completed'
            ? <span className="material-symbols-outlined text-sm">check</span>
            : index + 1}
        </div>
        {!isLast && <div className={`w-0.5 flex-1 min-h-[2rem] mt-1 rounded ${mod.status === 'completed' ? 'bg-emerald-200' : 'bg-slate-200'}`} />}
      </div>

      {/* Card */}
      <div className="flex-1 pb-6">
        <div className={`bg-white border rounded-2xl overflow-hidden shadow-md transition-all ${
          mod.status === 'completed' ? 'border-emerald-200' :
          mod.status === 'in_progress' ? 'border-blue-200' :
          'border-slate-200'
        }`}>
          {/* Card header */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-secondary">{mod.title}</h3>
                <ModuleStatusBadge status={mod.status} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{mod.estimatedHours}h estimated</p>
            </div>
            <span className={`material-symbols-outlined text-slate-400 transition-transform flex-shrink-0 mt-0.5 ${expanded ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          {/* Expanded content */}
          {expanded && (
            <div className="px-5 pb-5 flex flex-col gap-5 border-t border-slate-200">
              {/* Description */}
              {mod.description && (
                <p className="text-sm text-slate-600 leading-relaxed pt-4">{mod.description}</p>
              )}

              {/* Key concepts */}
              {Array.isArray(mod.keyConcepts) && mod.keyConcepts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Concepts</p>
                  <div className="flex flex-wrap gap-2">
                    {mod.keyConcepts.map((kc, i) => (
                      <span key={i} className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium">{kc}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {Array.isArray(mod.resources) && mod.resources.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Resources</p>
                  <div className="flex flex-col gap-2">
                    {mod.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-primary/30 rounded-xl transition-all group"
                      >
                        <PlatformBadge platform={res.platform} />
                        <span className="flex-1 text-sm text-slate-600 group-hover:text-secondary truncate">{res.title}</span>
                        <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-primary transition-colors">open_in_new</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Test score */}
              {mod.testScore != null && (
                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${
                  mod.testScore >= 60
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  <span className="material-symbols-outlined text-base">quiz</span>
                  Last test score: <span className="font-bold">{mod.testScore}%</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-1">
                {mod.status === 'not_started' && (
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={updating}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 text-sm font-medium rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                    Start Module
                  </button>
                )}
                {mod.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusChange('not_started')}
                    disabled={updating}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 text-sm font-medium rounded-xl transition-colors"
                  >
                    Reset
                  </button>
                )}
                {mod.status === 'completed' && (
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={updating}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 text-sm font-medium rounded-xl transition-colors"
                  >
                    Reopen
                  </button>
                )}
                <button
                  onClick={() => onTakeTest(index, mod.title)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-sm font-medium rounded-xl transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">quiz</span>
                  Take Test
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function RoadmapView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [archiving, setArchiving] = useState(false);
  const [quiz, setQuiz] = useState(null); // { moduleIndex, moduleTitle }

  const fetchRoadmap = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await roadmapService.get(id);
      setRoadmap(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load roadmap.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchRoadmap(); }, [fetchRoadmap]);

  async function handleStatusChange(moduleIndex, status) {
    try {
      const res = await roadmapService.updateModuleStatus(id, moduleIndex, status);
      // Optimistically update
      setRoadmap((prev) => ({
        ...prev,
        progress: res.data.data.overallProgress,
        modules: prev.modules.map((m, i) => i === moduleIndex ? { ...m, status } : m),
      }));
    } catch (err) {
      console.error('Status update failed', err);
    }
  }

  async function handleArchive() {
    if (!window.confirm('Archive this roadmap? You can still view it later.')) return;
    setArchiving(true);
    try {
      await roadmapService.archive(id);
      navigate('/student/roadmaps');
    } catch {
      setArchiving(false);
    }
  }

  function handleTestPassed(overallProgress) {
    // Refetch to get updated statuses
    fetchRoadmap();
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-slate-500">Loading roadmap…</p>
        </div>
      </main>
    );
  }

  if (error || !roadmap) {
    return (
      <main className="flex-1 flex items-center justify-center p-8 bg-background-light">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Roadmap not found.'}</p>
          <button onClick={() => navigate('/student/roadmaps')} className="px-5 py-2 bg-primary text-secondary rounded-xl text-sm font-semibold">
            Back to Roadmaps
          </button>
        </div>
      </main>
    );
  }

  const pct = roadmap.progress ?? 0;
  const modules = roadmap.modules || [];

  return (
    <main className="flex-1 overflow-y-auto bg-background-light">
      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Back */}
        <button
          onClick={() => navigate('/student/roadmaps')}
          className="flex items-center gap-1 text-slate-500 hover:text-secondary text-sm transition-colors w-fit"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Roadmaps
        </button>

        {/* Header card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-md">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-secondary font-playfair leading-tight">{roadmap.title}</h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">work</span>
                {roadmap.targetRole}
              </p>
              {roadmap.description && (
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">{roadmap.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {roadmap.status !== 'archived' && (
                <button
                  onClick={handleArchive}
                  disabled={archiving}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 hover:text-secondary transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">archive</span>
                  {archiving ? 'Archiving…' : 'Archive'}
                </button>
              )}
            </div>
          </div>

          {/* Overall progress */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Overall Progress</span>
              <span className="font-bold text-primary">{pct}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{modules.filter((m) => m.status === 'completed').length} / {modules.length} modules completed</span>
              <span className={`font-semibold capitalize ${
                roadmap.status === 'completed' ? 'text-emerald-500' :
                roadmap.status === 'archived' ? 'text-slate-400' : 'text-blue-500'
              }`}>{roadmap.status}</span>
            </div>
          </div>
        </div>

        {/* Modules stepper */}
        <div>
          <h2 className="text-base font-semibold text-secondary mb-5">Learning Modules</h2>
          <div className="flex flex-col">
            {modules.map((mod, idx) => (
              <ModuleCard
                key={idx}
                mod={mod}
                index={idx}
                total={modules.length}
                onStatusChange={handleStatusChange}
                onTakeTest={(moduleIndex, moduleTitle) => setQuiz({ moduleIndex, moduleTitle })}
              />
            ))}
          </div>
        </div>
      </div>

      {quiz && (
        <QuizModal
          roadmapId={id}
          moduleIndex={quiz.moduleIndex}
          moduleTitle={quiz.moduleTitle}
          onClose={() => setQuiz(null)}
          onPassed={handleTestPassed}
        />
      )}
    </main>
  );
}
