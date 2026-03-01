import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * FloatingChatButton — shown on all student pages except /student/chat itself.
 * Fixed bottom-right, navigates to the AI chat page.
 */
export default function FloatingChatButton() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  // Only show for students, not on the chat page itself
  if (!user || user.role !== 'student') return null;
  if (pathname === '/student/chat') return null;

  return (
    <Link
      to="/student/chat"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-white shadow-lg hover:bg-secondary/90 transition-all hover:scale-105 active:scale-95"
      title="Open AI Assistant"
    >
      <span className="material-symbols-outlined text-[22px]">smart_toy</span>
      <span className="text-sm font-semibold hidden sm:block">AI Assistant</span>
      {/* Pulse dot */}
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
      </span>
    </Link>
  );
}
