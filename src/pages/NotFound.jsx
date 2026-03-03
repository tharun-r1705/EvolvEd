import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-midnight flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        className="flex items-center justify-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-center rounded-xl bg-primary/20 size-16 shadow-lg shadow-primary/10 mr-4">
          <span className="material-symbols-outlined text-primary text-4xl">school</span>
        </div>
        <h1 className="text-white text-3xl font-bold tracking-tight">EvolvEd</h1>
      </motion.div>

      <motion.h2
        className="text-primary text-8xl font-black mb-4 leading-none"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
      >
        404
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.2 }}
      >
        <h3 className="text-white text-2xl font-bold mb-3">Page Not Found</h3>
        <p className="text-slate-400 text-base max-w-md mb-10">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        <Link to="/">
          <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors shadow-md shadow-primary/30">
            <span className="material-symbols-outlined">home</span>
            Back to Home
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
