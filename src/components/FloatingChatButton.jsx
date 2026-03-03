import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Link to="/student/chat" title="Open AI Assistant">
        <motion.div
          whileHover={{ scale: 1.07, boxShadow: '0 8px 30px rgba(0,0,0,0.25)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-white shadow-lg cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">smart_toy</span>
          <span className="text-sm font-semibold hidden sm:block">AI Assistant</span>
          {/* Pulse dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
        </motion.div>
      </Link>
    </motion.div>
  );
}
