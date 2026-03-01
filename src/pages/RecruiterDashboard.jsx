import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RecruiterSidebar from '../components/RecruiterSidebar.jsx';

export default function RecruiterDashboard() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-full bg-background-light overflow-hidden">
      {/* Sidebar stays dark */}
      <RecruiterSidebar />

      {/* Main Content — light theme like student pages */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-hide pb-16 lg:pb-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full flex flex-col gap-6 lg:gap-8">

          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-1">Recruiter Portal</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'Alex'}
              </h1>
              <p className="text-slate-500 text-sm mt-1">Here's what's happening with your recruitment pipeline today.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link to="/recruiter/jobs/new">
                <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary hover:bg-primary-dark text-secondary text-sm font-bold transition-all shadow-sm hover:shadow-md hover:scale-[1.02]">
                  <span className="material-symbols-outlined !text-[18px]">add</span>
                  <span className="hidden sm:inline">Post Job</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Active Jobs',   value: '12',    badge: '+2 this week',      badgeColor: 'text-emerald-600 bg-emerald-50',   icon: 'work',        highlight: true  },
              { title: 'Shortlisted',   value: '45',    badge: '+5 today',           badgeColor: 'text-emerald-600 bg-emerald-50',   icon: 'person_check',highlight: true  },
              { title: 'Applications',  value: '1,230', badge: '+12% vs last month', badgeColor: 'text-emerald-600 bg-emerald-50',   icon: 'folder_open', highlight: false },
              { title: 'Interviews',    value: '28',    badge: '8 pending',          badgeColor: 'text-amber-600 bg-amber-50',       icon: 'event',       highlight: false },
            ].map(({ title, value, badge, badgeColor, icon, highlight }) => (
              <div key={title} className="bg-white rounded-2xl p-4 sm:p-5 shadow-md ring-1 ring-slate-200 relative overflow-hidden group hover:ring-primary/40 transition-all duration-300">
                <div className={`absolute top-0 left-0 w-full h-[3px] ${highlight ? 'bg-gradient-to-r from-primary to-primary/30' : 'bg-slate-100'}`} />
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-lg ${highlight ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                    <span className="material-symbols-outlined !text-[20px]" style={highlight ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
                  </div>
                  <span className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
                </div>
                <p className="text-slate-500 text-xs font-medium">{title}</p>
                <h4 className="text-2xl sm:text-3xl font-bold text-secondary mt-0.5">{value}</h4>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Application Trends */}
              <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h4 className="text-base font-bold text-secondary">Application Trends</h4>
                    <p className="text-sm text-slate-500 mt-0.5">Overview of incoming applications over the last 30 days</p>
                  </div>
                  <select className="text-sm bg-white border border-slate-200 rounded-lg text-slate-600 px-3 py-1.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer self-start sm:self-auto">
                    <option>Last 30 Days</option>
                    <option>Last Quarter</option>
                    <option>This Year</option>
                  </select>
                </div>
                <div className="h-48 sm:h-56 w-full relative">
                  <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between gap-1.5 sm:gap-2 px-2">
                    {[40, 55, 35, 70, 60, 85, 75].map((h, i) => (
                      <div
                        key={i}
                        className="w-full rounded-t transition-all relative group cursor-pointer"
                        style={{
                          height: `${h}%`,
                          background: i === 6
                            ? 'linear-gradient(to top, #c6a43f, #ebdcb2)'
                            : 'rgba(198,164,63,0.15)',
                        }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs py-1 px-2 rounded-md pointer-events-none transition-opacity whitespace-nowrap shadow-lg z-10">
                          {h} apps
                        </div>
                      </div>
                    ))}
                  </div>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="absolute left-0 right-0 border-t border-slate-100" style={{ top: `${i * 25}%` }} />
                  ))}
                </div>
                <div className="flex justify-between mt-3 text-xs text-slate-400 px-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                    <span key={d} className={i === 6 ? 'font-bold text-primary' : ''}>{d}</span>
                  ))}
                </div>
              </div>

              {/* Recent Applicants Table */}
              <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-base font-bold text-secondary">Recent Applicants</h4>
                  <Link to="/recruiter/candidates" className="text-primary text-sm font-medium hover:underline transition-colors">
                    View All
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[540px]">
                    <thead className="text-xs uppercase font-semibold text-slate-400 border-b border-slate-100 bg-slate-50/50">
                      <tr>
                        <th className="px-5 sm:px-6 py-4">Candidate</th>
                        <th className="px-5 sm:px-6 py-4 hidden sm:table-cell">Role Applied</th>
                        <th className="px-5 sm:px-6 py-4">Readiness</th>
                        <th className="px-5 sm:px-6 py-4">Status</th>
                        <th className="px-5 sm:px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { name: 'Sarah Jenkins',  initials: 'SJ', initBg: 'bg-blue-100 text-blue-600',   role: 'UX Designer',      score: 92, badge: 'New',       badgeStyle: 'bg-blue-50 text-blue-700 ring-blue-700/10' },
                        { name: 'Michael Chen',   initials: 'MC', initBg: 'bg-indigo-100 text-indigo-600',role: 'Frontend Dev',     score: 85, badge: 'Reviewing', badgeStyle: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
                        { name: 'Emma Wilson',    initials: 'EW', initBg: 'bg-rose-100 text-rose-600',    role: 'Product Manager',  score: 68, badge: 'Screening', badgeStyle: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
                      ].map(({ name, initials, initBg, role, score, badge, badgeStyle }) => (
                        <tr key={name} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 sm:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${initBg}`}>{initials}</div>
                              <span className="font-medium text-secondary text-sm">{name}</span>
                            </div>
                          </td>
                          <td className="px-5 sm:px-6 py-4 text-slate-500 hidden sm:table-cell">{role}</td>
                          <td className="px-5 sm:px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-14 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${score}%`, background: score >= 80 ? '#10b981' : score >= 60 ? '#c6a43f' : '#f59e0b' }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-600">{score}%</span>
                            </div>
                          </td>
                          <td className="px-5 sm:px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${badgeStyle}`}>{badge}</span>
                          </td>
                          <td className="px-5 sm:px-6 py-4 text-right">
                            <Link to="/recruiter/candidates/1">
                              <button className="text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined !text-[20px]">visibility</span>
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">

              {/* Hiring Pipeline */}
              <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6">
                <h4 className="text-base font-bold text-secondary mb-5">Hiring Pipeline</h4>
                <div className="flex flex-col gap-4">
                  {[
                    { stage: 'Screening',  count: 120, pct: 100 },
                    { stage: 'Interview',  count: 45,  pct: 60  },
                    { stage: 'Offer Sent', count: 12,  pct: 25  },
                    { stage: 'Hired',      count: 5,   pct: 10, highlight: true },
                  ].map(({ stage, count, pct, highlight }) => (
                    <div key={stage}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-semibold ${highlight ? 'text-emerald-600' : 'text-slate-500'}`}>{stage}</span>
                        <span className={`text-xs font-bold ${highlight ? 'text-emerald-600' : 'text-slate-600'}`}>{count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${highlight ? 'bg-emerald-500' : 'bg-primary/70'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Sources */}
              <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6">
                <h4 className="text-base font-bold text-secondary mb-4">Top Sources</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: 'school',  label: 'University Drive', pct: '45% of hires', count: 240 },
                    { icon: 'share',   label: 'Referrals',        pct: '30% of hires', count: 156 },
                    { icon: 'public',  label: 'Job Portal',       pct: '15% of hires', count: 89  },
                  ].map(({ icon, label, pct, count }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined !text-[20px]">{icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary">{label}</p>
                        <p className="text-xs text-slate-400">{pct}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-secondary rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                <h4 className="text-base font-bold mb-4 relative z-10">Quick Actions</h4>
                <div className="flex flex-col gap-2 relative z-10">
                  {[
                    { icon: 'add_circle',    label: 'Schedule Bulk Interviews' },
                    { icon: 'file_download', label: 'Export Candidate Data'    },
                  ].map(({ icon, label }) => (
                    <button key={label} className="w-full text-left px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined !text-[18px] text-primary">{icon}</span>
                        <span className="text-sm font-medium text-slate-200">{label}</span>
                      </div>
                      <span className="material-symbols-outlined !text-[16px] text-slate-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all">arrow_forward</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
