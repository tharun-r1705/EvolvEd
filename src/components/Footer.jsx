import React from 'react';

/**
 * Global footer used on public-facing pages.
 * Exact replica of the footer from evolved_landing_page/code.html.
 */
export default function Footer() {
  return (
    <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-40">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 text-midnight-navy dark:text-white mb-6">
              <div className="size-6 flex items-center justify-center rounded bg-primary/20 text-primary">
                <span className="material-symbols-outlined !text-[18px]">school</span>
              </div>
              <h2 className="text-xl font-bold">EvolvEd</h2>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-sans">
              The premium placement readiness intelligence platform for modern institutions.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-midnight-navy dark:text-white font-bold mb-6">Platform</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-500 font-sans">
              <li><a className="hover:text-primary transition-colors" href="#">Students</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Recruiters</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Universities</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Analytics</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-midnight-navy dark:text-white font-bold mb-6">Company</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-500 font-sans">
              <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Blog</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-midnight-navy dark:text-white font-bold mb-6">Legal</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-500 font-sans">
              <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm font-sans">© 2023 EvolvEd Inc. All rights reserved.</p>
          <div className="flex gap-4 text-slate-400">
            <a className="hover:text-primary transition-colors" href="#">
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
