import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

/**
 * Layout wrapper for public-facing pages (Home).
 * Renders the shared Navbar above the page and Footer below.
 */
export default function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
