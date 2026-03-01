import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <main className="flex-1 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-secondary mb-1">System Overview</h2>
            <p className="text-slate-500">Welcome back — here's what's happening across campus today.</p>
          </header>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Students',    value: '1,240', badge: '+5%',   note: 'vs last semester', icon: 'groups',          iconColor: 'text-blue-600',   iconBg: 'bg-blue-50'   },
              { label: 'Active Recruiters', value: '85',    badge: '+12%',  note: 'new partners',      icon: 'business_center', iconColor: 'text-purple-600', iconBg: 'bg-purple-50' },
              { label: 'Avg Readiness',     value: '78%',   badge: '+3.5%', note: 'improvement',       icon: 'speed',           iconColor: 'text-primary',    iconBg: 'bg-primary/10'},
            ].map(({ label, value, badge, note, icon, iconColor, iconBg }) => (
              <div key={label} className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-6 flex flex-col justify-between hover:ring-primary/40 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
                    <h3 className="text-4xl font-bold text-secondary">{value}</h3>
                  </div>
                  <div className={`p-2.5 rounded-xl ${iconBg} group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-emerald-600/20">
                    <span className="material-symbols-outlined text-sm mr-0.5">trending_up</span>
                    {badge}
                  </span>
                  <span className="text-slate-400 text-xs">{note}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts + Widgets Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Department Performance Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-6">
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-secondary">Department Performance</h3>
                  <p className="text-slate-500 text-sm">Average readiness score by department</p>
                </div>
                <select className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 focus:outline-none hover:border-slate-300 transition-colors">
                  <option>Current Semester</option>
                  <option>Last Semester</option>
                  <option>Year to Date</option>
                </select>
              </div>
              {/* Bar Chart */}
              <div className="relative h-56 flex items-end justify-between gap-2 sm:gap-4 px-2 pb-2 border-b border-slate-100">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2">
                  {[100, 75, 50, 25, 0].map((l) => (
                    <div key={l} className="w-full border-t border-slate-100 flex items-center">
                      <span className="text-xs text-slate-400 -ml-7 w-6 text-right">{l}</span>
                    </div>
                  ))}
                </div>
                {DEPT_BARS.map(([dept, h]) => (
                  <div key={dept} className="relative z-10 flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                    <div
                      className="w-full max-w-[56px] rounded-t-md transition-all duration-500 relative"
                      style={{
                        height: `${h}%`,
                        background: 'linear-gradient(to top, #c6a43f, #ebdcb2)',
                        opacity: 0.9,
                      }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs py-1 px-2.5 rounded-lg whitespace-nowrap transition-opacity shadow-lg">
                        {h}% Score
                      </div>
                    </div>
                    <span className="mt-2 text-xs font-semibold text-slate-400 group-hover:text-secondary transition-colors">{dept}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-5">
              {/* Upcoming Drives */}
              <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-secondary">Upcoming Drives</h3>
                  <a className="text-xs text-primary font-medium hover:underline" href="#">View All</a>
                </div>
                <div className="space-y-3">
                  {UPCOMING_DRIVES.map(({ company, role, icon, badge, badgeCls, time }) => (
                    <div key={company} className="flex gap-3 items-start p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="size-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">{icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-secondary truncate">{company}</p>
                        <p className="text-xs text-slate-400 truncate">{role}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badgeCls}`}>{badge}</span>
                          <span className="text-[10px] text-slate-400">{time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-secondary rounded-2xl p-5 relative overflow-hidden shadow-md">
                <div className="absolute -right-3 -top-3 opacity-5">
                  <span className="material-symbols-outlined text-[100px] text-primary">bolt</span>
                </div>
                <h3 className="text-base font-bold text-white mb-4 relative z-10">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2.5 relative z-10">
                  {[
                    ['add_circle', 'Add Student'],
                    ['post_add',   'New Drive'],
                    ['analytics',  'Reports'],
                    ['mail',       'Bulk Email'],
                  ].map(([icon, label]) => (
                    <button
                      key={label}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 p-3 rounded-xl text-left transition-all flex flex-col gap-1.5 group"
                    >
                      <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">{icon}</span>
                      <span className="text-xs font-medium text-slate-300">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Placements Table */}
          <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-secondary">Recent Placements</h3>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-secondary">
                  <span className="material-symbols-outlined text-xl">filter_list</span>
                </button>
                <button className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-secondary">
                  <span className="material-symbols-outlined text-xl">download</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3 hidden sm:table-cell">Department</th>
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3 hidden md:table-cell">Package (LPA)</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RECENT_PLACEMENTS.map(({ name, initials, initBg, dept, company, pkg, badge, badgeCls, dot }) => (
                    <tr key={name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-secondary">
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${initBg}`}>
                            {initials}
                          </div>
                          {name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 hidden sm:table-cell">{dept}</td>
                      <td className="px-6 py-4 text-slate-600">{company}</td>
                      <td className="px-6 py-4 text-secondary font-semibold hidden md:table-cell">{pkg}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ring-1 ring-inset ${badgeCls}`}>
                          <span className={`size-1.5 rounded-full ${dot}`} />
                          {badge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-center">
              <button className="text-sm text-primary font-medium hover:underline">View All Placements</button>
            </div>
          </div>

        </div>
      </main>
  );
}
