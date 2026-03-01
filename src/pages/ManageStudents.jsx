import React from 'react';
import AdminSidebar from '../components/AdminSidebar.jsx';

const STUDENTS = [
  { initials: 'PS', initBg: 'bg-slate-600/40 text-slate-300',    name: 'Priya Sharma',   cls: '2024', id: '2021001', dept: 'Computer Science', gpa: 3.9, score: 92, barColor: 'bg-emerald-400', scoreLabel: '92/100 (Excellent)',  scoreColor: 'text-emerald-400', badge: 'Ready',       badgeCls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { initials: 'RV', initBg: 'bg-indigo-500/20 text-indigo-400',  name: 'Rahul Verma',    cls: '2024', id: '2021045', dept: 'Electronics',      gpa: 3.6, score: 78, barColor: 'bg-[#c6a43f]',    scoreLabel: '78/100 (Good)',       scoreColor: 'text-[#c6a43f]',   badge: 'In Review',   badgeCls: 'bg-[#c6a43f]/10 text-[#c6a43f] border-[#c6a43f]/20' },
  { initials: 'AG', initBg: 'bg-rose-500/20 text-rose-400',      name: 'Anjali Gupta',   cls: '2024', id: '2021012', dept: 'Mechanical',        gpa: 3.8, score: 85, barColor: 'bg-emerald-400', scoreLabel: '85/100 (Very Good)', scoreColor: 'text-emerald-400', badge: 'Ready',       badgeCls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { initials: 'VS', initBg: 'bg-blue-500/20 text-blue-400',      name: 'Vikram Singh',   cls: '2024', id: '2021089', dept: 'Computer Science', gpa: 3.5, score: 65, barColor: 'bg-red-400',      scoreLabel: '65/100 (Low)',        scoreColor: 'text-red-400',     badge: 'Needs Prep',  badgeCls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { initials: 'NP', initBg: 'bg-teal-500/20 text-teal-400',      name: 'Neha Patel',     cls: '2024', id: '2021033', dept: 'Civil Eng.',        gpa: 3.7, score: 81, barColor: 'bg-[#c6a43f]',    scoreLabel: '81/100 (Good)',       scoreColor: 'text-[#c6a43f]',   badge: 'Ready',       badgeCls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
];

const FILTER_GROUPS = [
  ['Department: All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil Eng.'],
  ['Year: 2024', 'Year: 2023', 'Year: 2025'],
  ['Readiness: All', 'Readiness: High', 'Readiness: Medium', 'Readiness: Low'],
  ['Status: Active', 'Status: Inactive', 'Status: Graduated'],
];

export default function ManageStudents() {
  return (
    <div className="bg-[#0d1b2e] text-white font-sans antialiased h-screen flex flex-row overflow-hidden">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto pb-16 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Manage Students</h1>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                Comprehensive view of student placement readiness. Search, filter, and update records.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-600 font-medium text-sm transition-colors">
                <span className="material-symbols-outlined text-[18px]">file_upload</span>
                Import CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-[#c6a43f] text-[#0d1b2e] rounded-lg hover:bg-[#d4b44f] font-semibold text-sm transition-colors">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Student
              </button>
            </div>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="bg-[#111d30] border border-slate-800/60 rounded-xl p-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Search */}
              <div className="lg:col-span-4 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#c6a43f] transition-colors">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#c6a43f] focus:border-[#c6a43f] text-sm transition-all"
                  placeholder="Search by name, ID, or department..."
                  type="text"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="lg:col-span-8 flex flex-wrap gap-2.5 items-center lg:justify-end">
                {FILTER_GROUPS.map((opts) => (
                  <div key={opts[0]} className="relative inline-block">
                    <select className="appearance-none bg-slate-800/60 border border-slate-700 text-slate-300 py-2.5 pl-3 pr-8 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:border-[#c6a43f] focus:ring-1 focus:ring-[#c6a43f] hover:border-slate-600 transition-colors">
                      {opts.map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-[#111d30] border border-slate-800/60 rounded-xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/30 border-b border-slate-800/60 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="px-6 py-4 min-w-[200px]">Student Name</th>
                    <th className="px-6 py-4 hidden sm:table-cell">ID</th>
                    <th className="px-6 py-4 hidden md:table-cell">Department</th>
                    <th className="px-6 py-4 hidden lg:table-cell text-center">GPA</th>
                    <th className="px-6 py-4">Readiness Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {STUDENTS.map(({ initials, initBg, name, cls, id, dept, gpa, score, barColor, scoreLabel, scoreColor, badge, badgeCls }) => (
                    <tr key={id} className="group hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${initBg}`}>{initials}</div>
                          <div>
                            <div className="text-sm font-medium text-white">{name}</div>
                            <div className="text-xs text-slate-500">Class of {cls}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 font-mono hidden sm:table-cell">{id}</td>
                      <td className="px-6 py-4 text-sm text-slate-400 hidden md:table-cell">{dept}</td>
                      <td className="px-6 py-4 text-sm text-slate-300 text-center font-medium hidden lg:table-cell">{gpa}</td>
                      <td className="px-6 py-4">
                        <div className="w-28">
                          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1 overflow-hidden">
                            <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${score}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${scoreColor}`}>{scoreLabel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeCls}`}>
                          {badge}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-500 hover:text-[#c6a43f] hover:bg-slate-800 rounded-lg transition-colors" title="View Profile">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button className="p-1.5 text-slate-500 hover:text-[#c6a43f] hover:bg-slate-800 rounded-lg transition-colors" title="Edit Records">
                            <span className="material-symbols-outlined text-[18px]">edit_note</span>
                          </button>
                          <button className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors" title="More Actions">
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
            <div className="px-6 py-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-slate-400">
                Showing <span className="font-medium text-white">5</span> of <span className="font-medium text-white">1,240</span> students
              </p>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.5 text-sm font-medium bg-slate-800 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                  disabled
                >
                  Previous
                </button>
                <button className="px-3 py-1.5 text-sm font-medium bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:border-[#c6a43f] hover:text-[#c6a43f] transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
