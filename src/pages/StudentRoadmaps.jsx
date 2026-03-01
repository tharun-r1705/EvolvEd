import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { roadmapService } from '../services/api.js';

// ─────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active:    { label: 'Active',    cls: 'bg-blue-50 text-blue-600 border border-blue-200' },
    completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
    archived:  { label: 'Archived',  cls: 'bg-slate-100 text-slate-500 border border-slate-200' },
  };
  const { label, cls } = map[status] || map.active;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Chat bubble
// ─────────────────────────────────────────────────────────────────
function ChatBubble({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${
        isUser ? 'bg-primary text-secondary' : 'bg-secondary text-white'
      }`}>
        {isUser
          ? <span className="material-symbols-outlined text-[16px]">person</span>
          : <span className="material-symbols-outlined text-[16px]">smart_toy</span>
        }
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
        isUser
          ? 'bg-primary text-secondary font-medium rounded-tr-sm'
          : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
      }`}>
        {content}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Typing indicator
// ─────────────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center shadow-sm">
        <span className="material-symbols-outlined text-white text-[16px]">smart_toy</span>
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Generating overlay
// ─────────────────────────────────────────────────────────────────
function GeneratingOverlay({ summary }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl gap-5">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-primary text-2xl">auto_awesome</span>
      </div>
      <div className="text-center px-6">
        <p className="font-bold text-secondary text-base">{summary}</p>
        <p className="text-sm text-slate-500 mt-1">Building your personalised learning plan…<br /><span className="text-xs text-slate-400">This takes about 15–20 seconds</span></p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Roadmap Chat Panel
// ─────────────────────────────────────────────────────────────────
function RoadmapChatPanel({ onGenerated, onCancel }) {
  const WELCOME = {
    role: 'assistant',
    content: "Hi! I'm your AI career mentor. Tell me what role you're aiming for — like Full Stack Developer, Data Scientist, or DevOps Engineer — and I'll build you a personalised roadmap based on your profile.",
  };

  const [messages, setMessages]               = useState([WELCOME]);
  const [input, setInput]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(null);
  const messagesBoxRef                        = useRef(null);
  const inputRef                              = useRef(null);

  // Scroll only the messages container — never the page
  useEffect(() => {
    const el = messagesBoxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleSend(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading || generatingSummary) return;

    const userMsg    = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = newMessages.filter(m => m.role === 'user' || m.role === 'assistant');
      const res     = await roadmapService.chat(history);
      const result  = res.data?.data;

      if (result?.type === 'generated') {
        setLoading(false);
        setGeneratingSummary(result.summary || 'Creating your roadmap…');
        setTimeout(() => onGenerated(result.roadmap), 1400);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: result?.content || 'Sorry, something went wrong.' }]);
        setLoading(false);
        inputRef.current?.focus();
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.response?.data?.message || 'Something went wrong. Please try again.',
      }]);
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="relative flex flex-col bg-slate-50 rounded-2xl border border-slate-200 shadow-lg overflow-hidden" style={{ minHeight: 'min(520px, 70vh)', maxHeight: 'min(640px, 85vh)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
          </div>
          <div>
            <p className="text-sm font-bold text-secondary">AI Roadmap Mentor</p>
            <p className="text-xs text-slate-400">Personalised to your profile</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-secondary hover:bg-slate-100 transition-colors"
          title="Close"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Messages */}
      <div ref={messagesBoxRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} content={m.content} />
        ))}
        {loading && <TypingIndicator />}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-4 py-4 bg-white border-t border-slate-100 flex-shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your goal… (Enter to send)"
            disabled={loading || !!generatingSummary}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-secondary placeholder:text-slate-400 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-60 overflow-hidden"
            style={{ minHeight: '48px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || !!generatingSummary}
            className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary text-secondary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400 text-center">
          Shift+Enter for new line · I analyse your skills, projects &amp; scores to build the best plan
        </p>
      </form>

      {/* Generating overlay */}
      {generatingSummary && <GeneratingOverlay summary={generatingSummary} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Roadmap Card
// ─────────────────────────────────────────────────────────────────
function RoadmapCard({ roadmap, onClick, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const pct  = roadmap.progress ?? 0;
  const date = new Date(roadmap.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  async function handleDelete(e) {
    e.stopPropagation();
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await roadmapService.delete(roadmap.id);
      onDelete(roadmap.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div
      onClick={onClick}
      className="group relative bg-white hover:bg-slate-50 border border-slate-200 hover:border-primary/40 rounded-2xl p-5 transition-all duration-200 flex flex-col gap-4 shadow-md cursor-pointer"
    >
      {/* Header row: title + [badge | delete] */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-secondary text-sm leading-snug truncate group-hover:text-primary transition-colors">{roadmap.title}</h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">work</span>
            {roadmap.targetRole}
          </p>
        </div>
        {/* Badge + delete — kept in one flex group so they never overlap */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusBadge status={roadmap.status} />
          <button
            onClick={handleDelete}
            onBlur={() => setConfirmDelete(false)}
            disabled={deleting}
            title={confirmDelete ? 'Click again to confirm' : 'Delete roadmap'}
            className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 ${
              confirmDelete
                ? 'bg-red-500 text-white shadow-md !opacity-100'
                : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500'
            } disabled:opacity-40`}
          >
            {deleting
              ? <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
              : <span className="material-symbols-outlined text-[14px]">{confirmDelete ? 'warning' : 'delete'}</span>
            }
          </button>
        </div>
      </div>

      {roadmap.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{roadmap.description}</p>
      )}

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">{roadmap.completedModules} / {roadmap.moduleCount} modules</span>
          <span className="font-semibold text-primary">{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{date}</span>
        <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
          Open <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </span>
      </div>

      {/* Confirm banner */}
      {confirmDelete && !deleting && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-0 bottom-0 bg-red-50 border-t border-red-200 rounded-b-2xl px-4 py-2 flex items-center justify-between text-xs"
        >
          <span className="text-red-600 font-medium">Delete permanently?</span>
          <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={handleDelete} className="px-2.5 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">Delete</button>
          </div>
        </div>
      )}
    </div>
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
  const [showChat, setShowChat]   = useState(false);

  function handleDelete(id) {
    setRoadmaps(prev => prev.filter(r => r.id !== id));
  }

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
    navigate(`/student/roadmaps/${roadmap.id}`);
  }

  const tabs = ['active', 'completed', 'archived'];
  const filtered = roadmaps.filter((r) => r.status === activeTab);

  return (
    <main className="flex-1 overflow-y-auto bg-background-light">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-secondary md:text-4xl">My Roadmaps</h1>
            <p className="text-slate-500 mt-1">AI-generated learning paths tailored to your target role</p>
          </div>
          {!showChat && (
            <button
              onClick={() => setShowChat(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-secondary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              Create New Roadmap
            </button>
          )}
        </div>

        {/* Chat panel */}
        {showChat && (
          <RoadmapChatPanel
            onGenerated={handleGenerated}
            onCancel={() => setShowChat(false)}
          />
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-secondary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-secondary'
              }`}
            >
              {tab}
              <span className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
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
            <p className="text-sm text-slate-500">Loading roadmaps…</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
            <span className="material-symbols-outlined">error</span>{error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-slate-400">map</span>
            </div>
            <div>
              <p className="text-secondary font-semibold">No {activeTab} roadmaps</p>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">
                {activeTab === 'active' ? 'Generate your first roadmap to get started on your learning journey.' : `You have no ${activeTab} roadmaps yet.`}
              </p>
            </div>
            {activeTab === 'active' && !showChat && (
              <button
                onClick={() => setShowChat(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-secondary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                Create Your First Roadmap
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <RoadmapCard key={r.id} roadmap={r} onClick={() => navigate(`/student/roadmaps/${r.id}`)} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>


    </main>
  );
}
