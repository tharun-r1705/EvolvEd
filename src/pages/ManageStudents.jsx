import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ManageStudents() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const students = [
    { initials: 'PS', initBg: 'bg-slate-200 text-slate-600', name: 'Priya Sharma', cls: '2024', id: '2021001', dept: 'Computer Science', gpa: 3.9, score: 92, barW: '92%', barColor: 'bg-emerald-500', scoreLabel: '92/100 (Excellent)', scoreColor: 'text-emerald-600', badge: 'Ready', badgeCls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { initials: 'RV', initBg: 'bg-indigo-100 text-indigo-600', name: 'Rahul Verma', cls: '2024', id: '2021045', dept: 'Electronics', gpa: 3.6, score: 78, barW: '78%', barColor: 'bg-primary', scoreLabel: '78/100 (Good)', scoreColor: 'text-primary', badge: 'In Review', badgeCls: 'bg-amber-100 text-amber-800 border-amber-200' },
    { initials: 'AG', initBg: 'bg-rose-100 text-rose-600', name: 'Anjali Gupta', cls: '2024', id: '2021012', dept: 'Mechanical', gpa: 3.8, score: 85, barW: '85%', barColor: 'bg-emerald-500', scoreLabel: '85/100 (Very Good)', scoreColor: 'text-emerald-600', badge: 'Ready', badgeCls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { initials: 'VS', initBg: 'bg-blue-100 text-blue-600', name: 'Vikram Singh', cls: '2024', id: '2021089', dept: 'Computer Science', gpa: 3.5, score: 65, barW: '65%', barColor: 'bg-red-400', scoreLabel: '65/100 (Low)', scoreColor: 'text-red-600', badge: 'Needs Prep', badgeCls: 'bg-red-100 text-red-800 border-red-200' },
    { initials: 'NP', initBg: 'bg-teal-100 text-teal-600', name: 'Neha Patel', cls: '2024', id: '2021033', dept: 'Civil Eng.', gpa: 3.7, score: 81, barW: '81%', barColor: 'bg-primary', scoreLabel: '81/100 (Good)', scoreColor: 'text-primary', badge: 'Ready', badgeCls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  ];

  return (
    <div className="bg-background-light font-sans text-slate-900 antialiased min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-midnight border-b border-slate-700/30 px-6 py-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="size-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">school</span>
            </div>
            <h2 className="text-white text-xl font-bold tracking-tight">EvolvEd</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/admin" className="text-slate-300 hover:text-primary transition-colors text-sm font-medium">Dashboard</Link>
            <Link to="/admin/students" className="text-white border-b-2 border-primary pb-0.5 text-sm font-medium">Students</Link>
            <a href="#" className="text-slate-300 hover:text-primary transition-colors text-sm font-medium">Recruiters</a>
            <a href="#" className="text-slate-300 hover:text-primary transition-colors text-sm font-medium">Placements</a>
            <a href="#" className="text-slate-300 hover:text-primary transition-colors text-sm font-medium">Settings</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-300 hover:text-white transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-primary rounded-full" />
            </button>
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-9 ring-2 ring-primary/30"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD6R-ejN2l4yFQ7V_Y7N4Yw-Kvz8pKhtYtlgfUSWQ0h0XcN-07ET00kbAa-22dWym4jbzDmLK9Edo7ZQPc18asH-vYFHYIhdsj2m51OLYFSaXG8sULPG3fDDMAq8-GhkKmwTjIhRr50zklRsSq23NUqyeX3fPr8gdbjMn6RNa4yK2S_36229C86Bj2VfDcltS9CrDfN_afN7EI36-L_-_eIWnvd7RHkKN_VYrLz7pj5mE18BzLVKSUA5g8aUSmBmDbVgJCgRnjxh9QU')" }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Page Title */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-slate-900 text-3xl font-bold tracking-tight">Manage Student Records</h1>
              <p className="text-slate-500 text-base max-w-2xl">
                Comprehensive view of student placement readiness. Search, filter, and update readiness scores securely.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[20px]">file_upload</span>
                Import CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-yellow-600 font-medium text-sm transition-colors shadow-sm shadow-primary/20">
                <span className="material-symbols-outlined text-[20px]">add</span>
                Add Student
              </button>
            </div>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            {/* Search */}
            <div className="lg:col-span-4 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all shadow-inner"
                placeholder="Search by name, ID, or department..."
                type="text"
              />
            </div>
            {/* Filters */}
            <div className="lg:col-span-8 flex flex-wrap gap-3 items-center lg:justify-end">
              {[
                { opts: ['Department: All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil Eng.'] },
                { opts: ['Year: 2024', 'Year: 2023', 'Year: 2025'] },
                { opts: ['Readiness: All', 'Readiness: High', 'Readiness: Medium', 'Readiness: Low'] },
                { opts: ['Status: Active', 'Status: Inactive', 'Status: Graduated'] },
              ].map(({ opts }) => (
                <div key={opts[0]} className="relative inline-block text-left">
                  <select className="appearance-none w-full bg-slate-50 border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-primary text-sm font-medium cursor-pointer transition-shadow hover:border-slate-300">
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="px-6 py-4 w-64 min-w-[200px]">Student Name</th>
                    <th className="px-6 py-4 w-32">ID</th>
                    <th className="px-6 py-4 w-48">Department</th>
                    <th className="px-6 py-4 w-24 text-center">GPA</th>
                    <th className="px-6 py-4 w-40">Readiness Score</th>
                    <th className="px-6 py-4 w-32">Status</th>
                    <th className="px-6 py-4 w-48 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(({ initials, initBg, name, cls, id, dept, gpa, barW, barColor, scoreLabel, scoreColor, badge, badgeCls }) => (
                    <tr key={id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${initBg}`}>{initials}</div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{name}</div>
                            <div className="text-xs text-slate-500">Class of {cls}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">{id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{dept}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center font-medium">{gpa}</td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1 overflow-hidden">
                          <div className={`${barColor} h-2.5 rounded-full`} style={{ width: barW }} />
                        </div>
                        <span className={`text-xs font-medium ${scoreColor}`}>{scoreLabel}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeCls}`}>
                          {badge}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="View Profile">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Edit Records">
                            <span className="material-symbols-outlined text-[20px]">edit_note</span>
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="More Actions">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-900">5</span> of <span className="font-medium text-slate-900">1,240</span> students
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 hover:border-primary hover:text-primary transition-colors">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
