import React from 'react';
import { Link } from 'react-router-dom';

export default function AssessmentBreakdown() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col overflow-x-hidden">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded bg-primary/20 text-primary">
                <span className="material-symbols-outlined">school</span>
              </div>
              <Link to="/student">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EvolvEd</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/student"
                className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-sm font-medium text-primary">Assessments</span>
              <a className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors" href="#">
                Jobs
              </a>
              <a className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors" href="#">
                Resources
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input
                className="h-10 w-64 rounded-lg border-none bg-slate-200/50 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-primary dark:bg-white/5 dark:text-white dark:placeholder-slate-400"
                placeholder="Search assessments..."
                type="text"
              />
            </div>
            <button className="relative size-10 overflow-hidden rounded-full ring-2 ring-primary/20 transition-all hover:ring-primary">
              <div
                className="bg-center bg-no-repeat bg-cover h-full w-full"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBZo-_m9ynWiC5GvZkcMWzingt6hD-aQixssqSRdwc49WtJpQVOieLV48vCgAXRSju0AlU3XS1wbgLsCj1v_ImU1SpbHKiVCsx6IVriZMeZ3ECjOzF5c-Vwn3sB7Df3Mt-okcDL-uLmGM0YakSHRcVvT27IXBGQc2VOFJqmdd3TgWNV_rNTTFGt7sCJLVnYPx2r4rYtSkdh_X0UAXjRnWS1_SFXW-SZu6bKVpeB3v8g29rzkMxMRG-IWaM1wQVcggRNafaMmwf1AXua")',
                }}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                <Link to="/student/assessments" className="hover:text-primary transition-colors">
                  Assessments
                </Link>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">Results Breakdown</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Full Stack Developer Assessment
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Detailed performance analysis and readiness scoring for your latest evaluation.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download Report
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90">
                <span className="material-symbols-outlined text-[18px]">share</span>
                Share Results
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overall Score</p>
                <span className="material-symbols-outlined text-primary">school</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">850</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">/ 1000</p>
              </div>
              <div className="mt-2 w-full rounded-full bg-slate-100 dark:bg-white/10 h-2">
                <div className="h-2 rounded-full bg-primary" style={{ width: '85%' }} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Percentile Rank</p>
                <span className="material-symbols-outlined text-primary">leaderboard</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">92nd</p>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Top 8%
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Higher than 92% of peers</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Time Taken</p>
                <span className="material-symbols-outlined text-primary">schedule</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">48m</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">/ 60m</p>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Completed on Oct 24, 2023</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</p>
                <span className="material-symbols-outlined text-primary">verified</span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-primary">Passed</p>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Qualified for next round</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Chart Section */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Category Performance</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Breakdown of scores across key evaluation metrics.</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1 dark:bg-white/5">
                  <button className="rounded px-3 py-1 text-xs font-medium bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white">
                    Score
                  </button>
                  <button className="rounded px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Percentile
                  </button>
                </div>
              </div>
              <div className="relative h-64 w-full">
                <div className="flex h-full items-end justify-between gap-4 px-2 pb-6">
                  {[
                    { label: 'Technical', pct: 85 },
                    { label: 'Soft Skills', pct: 65 },
                    { label: 'Logic', pct: 92 },
                    { label: 'Aptitude', pct: 78 },
                    { label: 'Verbal', pct: 88 },
                  ].map(({ label, pct }) => (
                    <div key={label} className="group relative flex h-full w-full flex-col justify-end gap-2">
                      <div className="relative flex w-full flex-col justify-end rounded-t-lg bg-slate-100 dark:bg-white/5 overflow-hidden h-full">
                        <div
                          className="absolute bottom-0 w-full bg-[#006064] transition-all duration-500 group-hover:bg-[#004d40] dark:bg-[#4dd0e1]"
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{pct}%</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Y-Axis Grid Lines */}
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-12 pt-0 text-xs text-slate-300 dark:text-slate-600">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full border-b border-dashed border-slate-200 dark:border-white/10" />
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendation Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 flex flex-col">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Improvement Focus</h2>
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">chat</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Communication Skills</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Your Soft Skills score (65%) is below average. Focus on clear articulation in interviews.
                    </p>
                    <a className="inline-flex items-center gap-1 text-primary text-xs font-medium mt-2 hover:underline" href="#">
                      View resources <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </a>
                  </div>
                </div>
                <div className="flex gap-4 items-start border-t border-slate-100 dark:border-white/5 pt-4">
                  <div className="flex-shrink-0 size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">calculate</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Numerical Aptitude</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      While solid, improving your speed in numerical sections can boost your rank to 98th percentile.
                    </p>
                    <a className="inline-flex items-center gap-1 text-primary text-xs font-medium mt-2 hover:underline" href="#">
                      Practice sets <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="rounded-lg bg-background-light dark:bg-black/20 p-4">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    Recruiter Insight
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    "Strong technical foundation. Candidates with this profile are highly sought after for backend roles."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 overflow-hidden">
            <div className="border-b border-slate-200 dark:border-white/10 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assessment History</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Previous performance records and trends.</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  </span>
                  <select className="h-9 w-full sm:w-40 appearance-none rounded-lg border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 focus:border-primary focus:ring-primary dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <option>All Categories</option>
                    <option>Technical</option>
                    <option>Aptitude</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">arrow_drop_down</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Assessment Name</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Score</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {[
                    { name: 'Full Stack Developer', sub: 'Level 2 Assessment', date: 'Oct 24, 2023', cat: 'Technical', score: 850, status: 'Passed' },
                    { name: 'Data Structures Basics', sub: 'Foundation Series', date: 'Sep 12, 2023', cat: 'Technical', score: 720, status: 'Passed' },
                    { name: 'Communication Skills', sub: 'Soft Skills Series', date: 'Aug 30, 2023', cat: 'Soft Skills', score: 640, status: 'Passed' },
                    { name: 'Aptitude Test', sub: 'Placement Series', date: 'Aug 5, 2023', cat: 'Aptitude', score: 780, status: 'Passed' },
                  ].map((row) => (
                    <tr key={row.name} className="group hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{row.name}</div>
                        <div className="text-xs text-slate-500">{row.sub}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{row.date}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20">
                          {row.cat}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">{row.score}</span>
                          <span className="text-xs text-slate-400">/ 1000</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <span className="size-1.5 rounded-full bg-current" />
                          {row.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
