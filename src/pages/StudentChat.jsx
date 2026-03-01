import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { chatService, goalsService } from '../services/api.js';

// ─── Simple Markdown Renderer ─────────────────────────────────────────────────

function renderMarkdown(text) {
  // Strip goal JSON blocks from rendered display
  const cleaned = text.replace(/```json[\s\S]*?```/g, '').trim();

  const lines = cleaned.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Bold + inline code
    const parsedLine = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-700 px-1 rounded text-xs font-mono">$1</code>');

    if (/^#{1,3}\s/.test(line)) {
      const content = line.replace(/^#+\s/, '');
      elements.push(
        <p key={i} className="font-bold text-secondary text-sm mt-2 mb-1"
          dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
      );
    } else if (/^[-*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        const item = lines[i].replace(/^[-*]\s/, '');
        items.push(
          <li key={i} dangerouslySetInnerHTML={{
            __html: item
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-700 px-1 rounded text-xs font-mono">$1</code>')
          }} />
        );
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="list-disc pl-4 space-y-0.5 my-1">{items}</ul>);
      continue;
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
    } else {
      elements.push(
        <p key={i} className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parsedLine }}
        />
      );
    }
    i++;
  }

  return elements;
}

// ─── Goal Card (inline) ───────────────────────────────────────────────────────

function InlineGoalCard({ goal }) {
  const catColor = {
    technical: 'bg-blue-50 text-blue-700',
    career: 'bg-purple-50 text-purple-700',
    academic: 'bg-green-50 text-green-700',
    personal: 'bg-orange-50 text-orange-700',
  };
  return (
    <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-primary text-[16px]">flag</span>
        <span className="text-xs font-bold text-primary uppercase tracking-wider">Goal Created</span>
      </div>
      <p className="text-sm font-semibold text-secondary">{goal.title}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${catColor[goal.category] ?? 'bg-slate-100 text-slate-600'}`}>
          {goal.category}
        </span>
        <span className="text-[10px] text-slate-500">{goal.progress}% complete</span>
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold
        ${isUser ? 'bg-primary' : 'bg-secondary'}`}>
        {isUser
          ? <span className="material-symbols-outlined text-[16px]">person</span>
          : <span className="material-symbols-outlined text-[16px]">smart_toy</span>
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? 'bg-primary text-white rounded-tr-sm'
          : 'bg-white text-slate-700 rounded-tl-sm shadow-md ring-1 ring-slate-200'
        }`}>
        {isUser
          ? <p>{msg.content}</p>
          : <div className="space-y-1">{renderMarkdown(msg.content)}</div>
        }
        {msg.goalCreated && <InlineGoalCard goal={msg.goalCreated} />}
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-white/60 text-right' : 'text-slate-400'}`}>
          {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
        <span className="material-symbols-outlined text-white text-[16px]">smart_toy</span>
      </div>
      <div className="bg-white rounded-2xl rounded-tl-sm shadow-md ring-1 ring-slate-200 px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Quick Action Buttons ─────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Analyze My Profile', icon: 'analytics', message: 'Can you analyze my profile and tell me where I stand?' },
  { label: 'Weak Areas', icon: 'warning', message: 'What are my weakest areas and how can I improve them?' },
  { label: 'Create a Goal', icon: 'flag', message: 'Help me create a career goal to improve my placement readiness.' },
  { label: 'Interview Tips', icon: 'record_voice_over', message: 'Give me some practical interview preparation tips for my profile.' },
];

// ─── Sidebar Conversation Item ────────────────────────────────────────────────

function ConvoItem({ convo, active, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className={`group flex items-start justify-between gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-colors
        ${active ? 'bg-primary/10 text-secondary' : 'hover:bg-slate-50 text-slate-600'}`}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${active ? 'text-secondary' : 'text-slate-700'}`}>
          {convo.title}
        </p>
        {convo.lastMessage && (
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {convo.lastMessage.content}
          </p>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(convo.id); }}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all mt-0.5"
      >
        <span className="material-symbols-outlined text-[16px]">delete</span>
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentChat() {
  const [conversations, setConversations] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    try {
      setLoadingConvos(true);
      const res = await chatService.listConversations();
      setConversations(res.data.data || []);
    } catch {
      // silently fail
    } finally {
      setLoadingConvos(false);
    }
  }

  async function openConversation(id) {
    if (id === activeConvoId) return;
    setActiveConvoId(id);
    setMessages([]);
    setLoadingMessages(true);
    try {
      const res = await chatService.getMessages(id);
      setMessages(res.data.data || []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
    inputRef.current?.focus();
  }

  async function startNewConversation() {
    try {
      const res = await chatService.createConversation();
      const newConvo = res.data.data;
      setConversations((prev) => [newConvo, ...prev]);
      setActiveConvoId(newConvo.id);
      setMessages([]);
      inputRef.current?.focus();
    } catch {
      // ignore
    }
  }

  async function handleDeleteConversation(id) {
    try {
      await chatService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvoId === id) {
        setActiveConvoId(null);
        setMessages([]);
      }
    } catch {
      // ignore
    }
  }

  async function sendMessage(text) {
    const content = (text || input).trim();
    if (!content || sending) return;

    // If no active conversation, create one first
    let convoId = activeConvoId;
    if (!convoId) {
      try {
        const res = await chatService.createConversation();
        convoId = res.data.data.id;
        setConversations((prev) => [res.data.data, ...prev]);
        setActiveConvoId(convoId);
      } catch {
        return;
      }
    }

    const userMsg = { id: `tmp-${Date.now()}`, role: 'user', content, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await chatService.sendMessage(convoId, content);
      const { message, goalCreated } = res.data.data;

      // Attach goalCreated to the message for inline display
      const assistantMsg = { ...message, goalCreated };
      setMessages((prev) => [...prev, assistantMsg]);

      // Refresh conversation list (title may have updated)
      chatService.listConversations().then((r) => setConversations(r.data.data || [])).catch(() => {});
    } catch (err) {
      const errMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const isEmpty = messages.length === 0 && !loadingMessages;

  return (
    <main className="flex flex-1 overflow-hidden bg-background-light">

      {/* ── Conversation Sidebar ── */}
        <div className={`flex flex-col bg-white border-r border-slate-200 flex-shrink-0 transition-all duration-200
          ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-secondary">Conversations</h2>
            <button
              onClick={startNewConversation}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {loadingConvos ? (
              <div className="space-y-2 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">chat</span>
                <p className="text-xs text-slate-400">No conversations yet</p>
                <button
                  onClick={startNewConversation}
                  className="mt-3 text-xs font-semibold text-primary hover:underline"
                >
                  Start your first chat
                </button>
              </div>
            ) : (
              conversations.map((c) => (
                <ConvoItem
                  key={c.id}
                  convo={c}
                  active={activeConvoId === c.id}
                  onClick={() => openConversation(c.id)}
                  onDelete={handleDeleteConversation}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-200">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                <span className="material-symbols-outlined text-white text-[18px]">smart_toy</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-secondary leading-tight">AI Placement Assistant</h1>
                <p className="text-xs text-slate-400">Context-aware career coach</p>
              </div>
            </div>
            <Link to="/student/goals" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              <span className="material-symbols-outlined text-[15px]">flag</span>
              My Goals
            </Link>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="h-5 w-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm">Loading messages...</span>
                </div>
              </div>
            ) : isEmpty ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
                <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-white text-3xl">smart_toy</span>
                </div>
                <h2 className="text-xl font-bold text-secondary mb-2">Hey there! I'm your AI assistant</h2>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  I know your profile, skills, projects, and scores. Ask me anything about your placement journey.
                </p>
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.message)}
                      disabled={sending}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left text-sm font-medium text-slate-700 hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-primary text-[18px]">{action.icon}</span>
                      <span className="text-xs leading-tight">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {sending && <TypingIndicator />}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions strip (shown when conversation active) */}
          {!isEmpty && !loadingMessages && (
            <div className="px-6 py-2 flex gap-2 overflow-x-auto border-t border-slate-200 bg-white">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.message)}
                  disabled={sending}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[14px] text-primary">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="px-6 py-4 bg-white border-t border-slate-200">
            {!activeConvoId && messages.length === 0 && (
              <p className="text-xs text-slate-400 mb-2 text-center">Type a message to start a new conversation</p>
            )}
            <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-primary/40 focus-within:bg-white transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your placement journey..."
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none leading-relaxed"
                style={{ maxHeight: '120px', overflowY: 'auto' }}
                disabled={sending}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || sending}
                className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending
                  ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <span className="material-symbols-outlined text-[18px]">send</span>
                }
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </main>
  );
}
