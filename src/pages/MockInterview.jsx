import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar.jsx';
import { interviewService, studentService } from '../services/api.js';

// ─────────────────────────────────────────────────────────────────
// Type / difficulty config
// ─────────────────────────────────────────────────────────────────
const INTERVIEW_TYPES = [
  { value: 'technical',  label: 'Technical',  icon: 'terminal',     desc: 'Coding concepts, architecture & problem-solving based on your skills and projects' },
  { value: 'hr',         label: 'HR',          icon: 'handshake',    desc: 'Salary discussions, career goals, company fit and motivational questions' },
  { value: 'behavioral', label: 'Behavioral',  icon: 'psychology',   desc: 'STAR-method questions based on your past experiences, teamwork and achievements' },
  { value: 'mixed',      label: 'Mixed',       icon: 'shuffle',      desc: 'A balanced combination of technical, behavioral and HR questions' },
];

const DIFFICULTIES = [
  { value: 'easy',   label: 'Easy',   color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10', desc: 'Fresher / entry-level' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',       desc: 'Mid-level / 1-2 yrs exp' },
  { value: 'hard',   label: 'Hard',   color: 'text-red-400 border-red-500/40 bg-red-500/10',             desc: 'Senior / competitive' },
];

// ─────────────────────────────────────────────────────────────────
// Score badge
// ─────────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  if (score == null) return <span className="text-xs text-slate-500">—</span>;
  const color = score >= 8 ? 'text-emerald-400' : score >= 6 ? 'text-amber-400' : score >= 4 ? 'text-orange-400' : 'text-red-400';
  return <span className={`font-bold text-sm ${color}`}>{score.toFixed(1)}<span className="text-slate-500 font-normal">/10</span></span>;
}

function TypeBadge({ type }) {
  const colors = { technical: 'bg-blue-500/15 text-blue-400', hr: 'bg-purple-500/15 text-purple-400', behavioral: 'bg-teal-500/15 text-teal-400', mixed: 'bg-amber-500/15 text-amber-400' };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${colors[type] || colors.mixed}`}>{type}</span>;
}

function DiffBadge({ difficulty }) {
  const colors = { easy: 'bg-emerald-500/15 text-emerald-400', medium: 'bg-amber-500/15 text-amber-400', hard: 'bg-red-500/15 text-red-400' };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${colors[difficulty] || colors.medium}`}>{difficulty}</span>;
}

function StatusBadge({ status }) {
  const map = { in_progress: { label: 'In Progress', cls: 'bg-blue-500/15 text-blue-400' }, completed: { label: 'Completed', cls: 'bg-emerald-500/15 text-emerald-400' }, abandoned: { label: 'Abandoned', cls: 'bg-slate-500/15 text-slate-400' } };
  const { label, cls } = map[status] || map.in_progress;
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

// ─────────────────────────────────────────────────────────────────
// Start Interview Modal
// ─────────────────────────────────────────────────────────────────
function StartModal({ resumes, onClose, onStarted }) {
  const [type, setType] = useState('technical');
  const [difficulty, setDifficulty] = useState('medium');
  const [resumeId, setResumeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleStart() {
    setError('');
    setLoading(true);
    try {
      const res = await interviewService.start({ type, difficulty, resumeId: resumeId || undefined });
      onStarted(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0f2135] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white">Start Mock Interview</h2>
            <p className="text-xs text-slate-400 mt-0.5">AI will generate {8} tailored questions</p>
          </div>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-14 px-6">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-primary text-xl">mic</span>
            </div>
            <div className="text-center">
              <p className="text-sm text-white font-medium">Generating your interview…</p>
              <p className="text-xs text-slate-400 mt-1">AI is crafting personalised questions for you</p>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 flex flex-col gap-6">
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-sm">
                <span className="material-symbols-outlined text-base">error</span>{error}
              </div>
            )}

            {/* Interview type */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Interview Type</p>
              <div className="grid grid-cols-2 gap-2">
                {INTERVIEW_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`flex flex-col gap-1.5 p-3 rounded-xl border text-left transition-all ${
                      type === t.value ? 'bg-primary/15 border-primary/50 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-lg ${type === t.value ? 'text-primary' : ''}`}>{t.icon}</span>
                    <span className="text-sm font-semibold">{t.label}</span>
                    <span className="text-[11px] leading-snug opacity-70">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Difficulty</p>
              <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                      difficulty === d.value ? d.color : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {d.label}
                    <span className="block text-[10px] font-normal mt-0.5 opacity-70">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resume (optional) */}
            {resumes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Resume <span className="normal-case font-normal text-slate-500">(optional — for tailored technical questions)</span></p>
                <select
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60 transition-all"
                >
                  <option value="">Use profile data only</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                Cancel
              </button>
              <button onClick={handleStart} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-secondary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">play_arrow</span>
                Start Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Interview history card
// ─────────────────────────────────────────────────────────────────
function InterviewCard({ interview, onClick }) {
  const date = new Date(interview.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const pct = interview.totalQuestions ? Math.round((interview.answeredCount / interview.totalQuestions) * 100) : 0;
  const mins = interview.duration ? Math.round(interview.duration / 60) : null;

  return (
    <button
      onClick={onClick}
      className="group text-left w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-2xl p-5 transition-all flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeBadge type={interview.type} />
          <DiffBadge difficulty={interview.difficulty} />
          <StatusBadge status={interview.status} />
        </div>
        <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors text-sm flex-shrink-0">arrow_forward</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">quiz</span>
            {interview.answeredCount}/{interview.totalQuestions} answered
          </span>
          {mins != null && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">timer</span>
              {mins}m
            </span>
          )}
          <span>{date}</span>
        </div>
        {interview.status === 'completed' && <ScoreBadge score={interview.overallScore} />}
      </div>

      {interview.status === 'in_progress' && (
        <div className="flex flex-col gap-1">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-primary font-medium">{pct}% complete — Resume interview</p>
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────
export default function MockInterview() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ivRes, resumeRes] = await Promise.all([
        interviewService.list(),
        studentService.getResumes().catch(() => ({ data: { data: [] } })),
      ]);
      setInterviews(ivRes.data.data || []);
      setResumes(resumeRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load interviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function handleStarted(interview) {
    setShowModal(false);
    navigate(`/student/interviews/${interview.id}`);
  }

  const tabs = [
    { value: 'all',         label: 'All' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed',   label: 'Completed' },
  ];

  const filtered = activeTab === 'all' ? interviews : interviews.filter((i) => i.status === activeTab);

  // Stats
  const completed = interviews.filter((i) => i.status === 'completed');
  const avgScore = completed.length ? (completed.reduce((s, i) => s + (i.overallScore || 0), 0) / completed.length).toFixed(1) : null;
  const bestScore = completed.length ? Math.max(...completed.map((i) => i.overallScore || 0)).toFixed(1) : null;

  return (
    <div className="flex h-screen bg-secondary overflow-hidden font-inter">
      <StudentSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-white font-playfair">Mock Interviews</h1>
              <p className="text-sm text-slate-400 mt-1">AI-powered practice interviews with voice & real-time feedback</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-secondary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-base">add</span>
              New Interview
            </button>
          </div>

          {/* Stats */}
          {completed.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Completed', value: completed.length, icon: 'check_circle', color: 'text-emerald-400' },
                { label: 'Avg Score', value: avgScore ? `${avgScore}/10` : '—', icon: 'analytics', color: 'text-primary' },
                { label: 'Best Score', value: bestScore ? `${bestScore}/10` : '—', icon: 'emoji_events', color: 'text-amber-400' },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                  <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
                  <div>
                    <p className="text-white font-bold text-base">{s.value}</p>
                    <p className="text-xs text-slate-400">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit border border-white/10">
            {tabs.map((tab) => {
              const count = tab.value === 'all' ? interviews.length : interviews.filter((i) => i.status === tab.value).length;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.value ? 'bg-primary text-secondary shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  {tab.label}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.value ? 'bg-secondary/30 text-secondary' : 'bg-white/10 text-slate-400'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <p className="text-sm text-slate-400">Loading…</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 text-sm">
              <span className="material-symbols-outlined">error</span>{error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-slate-500">mic</span>
              </div>
              <div>
                <p className="text-white font-semibold">No interviews yet</p>
                <p className="text-sm text-slate-400 mt-1 max-w-xs">Start your first mock interview to practice and get AI feedback on your answers.</p>
              </div>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-secondary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-base">add</span>
                Start Your First Interview
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((iv) => (
                <InterviewCard
                  key={iv.id}
                  interview={iv}
                  onClick={() => navigate(`/student/interviews/${iv.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && <StartModal resumes={resumes} onClose={() => setShowModal(false)} onStarted={handleStarted} />}
    </div>
  );
}
