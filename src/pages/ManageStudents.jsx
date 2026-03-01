import React from 'react';
export default function ManageStudents() {
  return (
    <main className="flex-1 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Admin Portal</p>
              <h1 className="text-3xl font-bold text-secondary tracking-tight">Manage Students</h1>
              <p className="text-slate-500 text-sm mt-1 max-w-2xl">
                Comprehensive view of student placement readiness. Search, filter, and update records.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-secondary hover:border-slate-300 font-medium text-sm transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">file_upload</span>
                Import CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-secondary rounded-lg hover:bg-primary/90 font-semibold text-sm transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Student
              </button>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Students', value: '1,240', icon: 'groups',          color: 'text-blue-600',    bg: 'bg-blue-50'    },
              { label: 'Ready to Place', value: '847',   icon: 'check_circle',    color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'In Review',      value: '293',   icon: 'pending_actions', color: 'text-amber-600',   bg: 'bg-amber-50'   },
              { label: 'Needs Prep',     value: '100',   icon: 'warning',         color: 'text-red-600',     bg: 'bg-red-50'     },
            ].map(({ label, value, icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 px-5 py-4 flex items-center gap-4 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
                <div className={`size-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`material-symbols-outlined text-[22px] ${color}`}>{icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filters Toolbar */}
          <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Search */}
              <div className="lg:col-span-4 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 text-sm transition-all"
                  placeholder="Search by name, ID, or department..."
                  type="text"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="lg:col-span-8 flex flex-wrap gap-2.5 items-center lg:justify-end">
                {FILTER_GROUPS.map((opts) => (
                  <div key={opts[0]} className="relative inline-block">
                    <select className="appearance-none bg-white border border-slate-200 text-slate-600 py-2.5 pl-3 pr-8 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/40 hover:border-slate-300 transition-colors">
                      {opts.map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-semibold bg-slate-50/60">
                    <th className="px-6 py-4 min-w-[200px]">Student Name</th>
                    <th className="px-6 py-4 hidden sm:table-cell">ID</th>
                    <th className="px-6 py-4 hidden md:table-cell">Department</th>
                    <th className="px-6 py-4 hidden lg:table-cell text-center">GPA</th>
                    <th className="px-6 py-4">Readiness Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {STUDENTS.map(({ initials, initColor, name, cls, id, dept, gpa, score, barColor, scoreLabel, scoreColor, badge, badgeCls }) => (
                    <tr key={id} className="group hover:bg-slate-50 transition-colors">
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${initColor}`}>
                            {initials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-secondary">{name}</div>
                            <div className="text-xs text-slate-400">Class of {cls}</div>
                          </div>
                        </div>
                      </td>
                      {/* ID */}
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono hidden sm:table-cell">{id}</td>
                      {/* Dept */}
                      <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">{dept}</td>
                      {/* GPA */}
                      <td className="px-6 py-4 text-sm text-secondary text-center font-semibold hidden lg:table-cell">{gpa}</td>
                      {/* Score bar */}
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                            <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${score}%` }} />
                          </div>
                          <span className={`text-xs font-semibold ${scoreColor}`}>{scoreLabel}</span>
                        </div>
                      </td>
                      {/* Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeCls}`}>
                          {badge}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Profile">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit Records">
                            <span className="material-symbols-outlined text-[18px]">edit_note</span>
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="More Actions">
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-secondary">5</span> of{' '}
                <span className="font-semibold text-secondary">1,240</span> students
              </p>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed"
                  disabled
                >
                  Previous
                </button>
                <button className="px-3 py-1.5 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-primary/50 hover:text-primary transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
  );
}
