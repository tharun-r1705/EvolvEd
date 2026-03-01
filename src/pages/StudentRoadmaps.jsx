import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar.jsx';
import { roadmapService } from '../services/api.js';

// ─────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active:    { label: 'Active',    cls: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' },
    completed: { label: 'Completed', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
    archived:  { label: 'Archived',  cls: 'bg-slate-500/15 text-slate-400 border border-slate-500/30' },
  };
  const { label, cls } = map[status] || map.active;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Generate Roadmap Modal
// ─────────────────────────────────────────────────────────────────
function GenerateModal({ onClose, onGenerated }) {
  const [targetRole, setTargetRole] = useState('');
  const [timeline, setTimeline] = useState('3 months');
  const [focusAreas, setFocusAreas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!targetRole.trim()) { setError('Please enter a target role.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await roadmapService.generate({ targetRole: targetRole.trim(), timeline, focusAreas: focusAreas.trim() || undefined });
      onGenerated(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0f2135] border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Generate Roadmap</h2>
            <p className="text-xs text-slate-400 mt-0.5">AI will create a personalised learning plan</p>
          </div>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-primary text-xl">auto_awesome</span>
            </div>
            <p className="text-sm text-slate-300 text-center">Generating your personalised roadmap…<br /><span className="text-xs text-slate-500">This may take 15–20 seconds</span></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-sm">
                <span className="material-symbols-outlined text-base">error</span>{error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Target Role *</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, Data Scientist"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Timeline</label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
              >
                <option value="1 month">1 Month (Intensive — 4 modules)</option>
                <option value="3 months">3 Months (Balanced — 8 modules)</option>
                <option value="6 months">6 Months (Comprehensive — 12 modules)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Focus Areas <span className="text-slate-500 normal-case font-normal">(optional)</span></label>
              <input
                type="text"
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                placeholder="e.g. React, Node.js, System Design"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-secondary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                Generate
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Roadmap Card
// ─────────────────────────────────────────────────────────────────
function RoadmapCard({ roadmap, onClick }) {
  const pct = roadmap.progress ?? 0;
  const date = new Date(roadmap.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <button
      onClick={onClick}
      className="group text-left w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/40 rounded-2xl p-5 transition-all duration-200 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm leading-snug truncate group-hover:text-primary transition-colors">{roadmap.title}</h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">work</span>
            {roadmap.targetRole}
          </p>
        </div>
        <StatusBadge status={roadmap.status} />
      </div>

      {roadmap.description && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{roadmap.description}</p>
      )}

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">{roadmap.completedModules} / {roadmap.moduleCount} modules</span>
          <span className="font-semibold text-primary">{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{date}</span>
        <span className="flex items-center gap-1 text-slate-400 group-hover:text-primary transition-colors">
          Open <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function StudentRoadmaps() {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [showModal, setShowModal] = useState(false);

  const fetchRoadmaps = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await roadmapService.list();
      setRoadmaps(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load roadmaps.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoadmaps(); }, [fetchRoadmaps]);

  function handleGenerated(roadmap) {
    setShowModal(false);
    navigate(`/student/roadmaps/${roadmap.id}`);
  }

  const tabs = ['active', 'completed', 'archived'];
  const filtered = roadmaps.filter((r) => r.status === activeTab);

  return (
    <div className="flex h-screen bg-secondary overflow-hidden font-inter">
      <StudentSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-white font-playfair">My Roadmaps</h1>
              <p className="text-sm text-slate-400 mt-1">AI-generated learning paths tailored to your target role</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-secondary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              Generate New Roadmap
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit border border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  activeTab === tab ? 'bg-primary text-secondary shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
                <span className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? 'bg-secondary/30 text-secondary' : 'bg-white/10 text-slate-400'
                }`}>
                  {roadmaps.filter((r) => r.status === tab).length}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <p className="text-sm text-slate-400">Loading roadmaps…</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 text-sm">
              <span className="material-symbols-outlined">error</span>{error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-slate-500">map</span>
              </div>
              <div>
                <p className="text-white font-semibold">No {activeTab} roadmaps</p>
                <p className="text-sm text-slate-400 mt-1 max-w-xs">
                  {activeTab === 'active' ? 'Generate your first roadmap to get started on your learning journey.' : `You have no ${activeTab} roadmaps yet.`}
                </p>
              </div>
              {activeTab === 'active' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-secondary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                  Generate Your First Roadmap
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <RoadmapCard key={r.id} roadmap={r} onClick={() => navigate(`/student/roadmaps/${r.id}`)} />
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && <GenerateModal onClose={() => setShowModal(false)} onGenerated={handleGenerated} />}
    </div>
  );
}
