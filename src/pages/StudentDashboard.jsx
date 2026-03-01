import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import StudentSidebar from '../components/StudentSidebar.jsx';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-full flex-row overflow-hidden bg-background-light font-display">
      {/* ── Sidebar ── */}
      <StudentSidebar />

      {/* ── Main Content ── */}
      <main className="flex h-full flex-1 flex-col overflow-y-auto bg-background-light p-4 md:p-8">
        <div className="mx-auto w-full max-w-6xl">
          {/* Top Header */}
          <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-secondary md:text-4xl">
                Readiness Dashboard
              </h1>
              <p className="mt-2 text-slate-500">Track your placement preparedness and identify skill gaps.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
                <span className="material-symbols-outlined text-[20px]">download</span>
                Export Report
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-secondary shadow-md hover:bg-primary/90 transition-all">
                <span className="material-symbols-outlined text-[20px]">edit</span>
                Edit Profile
              </button>
            </div>
          </header>

          {/* Hero Section: Readiness Score */}
          <div className="grid gap-6 lg:grid-cols-12 mb-8">
            {/* Main Score Card */}
            <div className="lg:col-span-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
              <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-secondary">Overall Readiness Score</h2>
                    <p className="text-sm text-slate-500">Calculated based on GPA, Projects, and Assessments</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-secondary">
                        82<span className="text-xl text-slate-400">/100</span>
                      </span>
                      <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">trending_up</span> +5% from last month
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Top 10% of Class
                    </span>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      Placement Ready
                    </span>
                  </div>
                </div>
                {/* Circular Progress */}
                <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner">
                  <svg className="absolute h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="transparent" r="40" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" fill="transparent" r="40"
                      stroke="#c6a43f"
                      strokeDasharray="251.2"
                      strokeDashoffset="45"
                      strokeLinecap="round"
                      strokeWidth="8"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-secondary">High</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Potential</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Completion Card */}
            <div className="lg:col-span-4 rounded-2xl bg-secondary p-6 text-white shadow-lg relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(#c6a43f 1px, transparent 1px)', backgroundSize: '20px 20px' }}
              />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-primary">person_check</span>
                  </div>
                  <h3 className="text-lg font-bold">Profile Completion</h3>
                  <p className="mt-1 text-sm text-slate-300">Complete your profile to unlock premium job listings.</p>
                </div>
                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm font-medium">
                    <span>Progress</span>
                    <span className="text-primary">75%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-3/4 rounded-full bg-primary shadow-[0_0_10px_rgba(198,164,63,0.5)]" />
                  </div>
                  <button className="mt-6 w-full rounded-lg bg-white py-2 text-sm font-bold text-secondary hover:bg-slate-100 transition-colors">
                    Complete Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
            {[
              { icon: 'assignment', label: 'Assessments', value: '14' },
              { icon: 'work_history', label: 'Applications', value: '8' },
              { icon: 'pending_actions', label: 'Pending Actions', value: '3' },
              { icon: 'groups', label: 'Profile Views', value: '126' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="mb-2 text-slate-400">
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-secondary">{value}</p>
              </div>
            ))}
          </div>

          {/* Charts & Skill Breakdown */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Chart + Recent Assessments */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Readiness Trend */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-secondary">Readiness Trend</h3>
                    <p className="text-sm text-slate-500">Performance over the last 6 months</p>
                  </div>
                  <select className="rounded-lg border-0 bg-slate-50 py-1.5 pl-3 pr-8 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-primary/50">
                    <option>Last 6 Months</option>
                    <option>Year to Date</option>
                  </select>
                </div>
                {/* Custom Bar Chart */}
                <div className="relative h-64 w-full pt-4">
                  <div className="absolute inset-0 flex items-end justify-between px-2 pb-6">
                    {[
                      { month: 'Sept', h: '40%', opacity: 'bg-accent/20 hover:bg-accent/40' },
                      { month: 'Oct', h: '55%', opacity: 'bg-accent/30 hover:bg-accent/50' },
                      { month: 'Nov', h: '48%', opacity: 'bg-accent/40 hover:bg-accent/60' },
                      { month: 'Dec', h: '70%', opacity: 'bg-accent/60 hover:bg-accent/80' },
                      { month: 'Jan', h: '85%', opacity: 'bg-accent/80 hover:bg-accent' },
                      { month: 'Feb', h: '92%', opacity: 'bg-accent shadow-[0_0_15px_rgba(13,148,136,0.3)]', bold: true },
                    ].map(({ month, h, opacity, bold }) => (
                      <div key={month} className="group relative flex h-full w-full flex-col justify-end gap-1 items-center">
                        <div
                          className={`w-8 rounded-t-sm ${opacity} transition-all duration-500`}
                          style={{ height: h }}
                        />
                        <span className={`text-xs ${bold ? 'font-bold text-secondary' : 'text-slate-400 font-medium'}`}>
                          {month}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Grid lines */}
                  <div className="absolute inset-0 z-[-1] flex flex-col justify-between border-b border-slate-100 pb-6">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-px w-full border-t border-dashed border-slate-200" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Assessments */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <h3 className="text-lg font-bold text-secondary mb-4">Recent Assessments</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-lg border border-slate-50 p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <span className="material-symbols-outlined">code</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-secondary">Advanced Python</p>
                        <p className="text-xs text-slate-500">Tech Assessment • Feb 12</p>
                      </div>
                    </div>
                    <Link to="/student/assessments/1">
                      <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors cursor-pointer">
                        Passed (92%)
                      </span>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-50 p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                        <span className="material-symbols-outlined">architecture</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-secondary">System Design</p>
                        <p className="text-xs text-slate-500">Mock Interview • Feb 10</p>
                      </div>
                    </div>
                    <Link to="/student/assessments/2">
                      <span className="rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-100 transition-colors cursor-pointer">
                        Review (75%)
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Proficiency Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 h-full">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-secondary">Skill Proficiency</h3>
                  <p className="text-sm text-slate-500">Breakdown by category</p>
                </div>
                <div className="space-y-6">
                  {[
                    { icon: 'database', label: 'Data Structures', pct: '90%', level: 'Expert Level', opacity: '' },
                    { icon: 'cloud', label: 'Cloud Computing', pct: '65%', level: 'Intermediate', opacity: '/70' },
                    { icon: 'psychology', label: 'Problem Solving', pct: '85%', level: 'Advanced', opacity: '/90' },
                    { icon: 'record_voice_over', label: 'Communication', pct: '60%', level: 'Intermediate', opacity: '/60' },
                  ].map(({ icon, label, pct, level, opacity }) => (
                    <div key={label}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-sm">{icon}</span>
                          <span className="text-sm font-bold text-secondary">{label}</span>
                        </div>
                        <span className="text-sm font-bold text-accent">{pct}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full bg-accent${opacity}`}
                          style={{ width: pct }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{level}</p>
                    </div>
                  ))}
                </div>

                {/* Recommended Course */}
                <div className="mt-8 rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <h4 className="text-sm font-bold text-secondary mb-2">Recommended Course</h4>
                  <div className="flex gap-3">
                    <div
                      className="h-12 w-12 shrink-0 rounded-lg bg-cover bg-center"
                      style={{
                        backgroundImage:
                          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCsvBOee_LPSLCt44du9H5GQIQLnXnKihbj-Ehw5fp8Af7klG8sbzG9xCFWb7nHks_c6XNV7bMG1fJ1v3gIV8qLGMKfsi519Ymv6rGNp1thMiTsNeuEKSBydI4BNokPv4LaWTCwsO_QssO30GZ8a6en4K3dL4JOanFLdevVc6jEqOclARzarHTNZfuIVLHYQYt3ahIFOaFOKNv-c2QoXAp_-VgUZwYCbq2pgnG9RRq7r8xWLTrlFFLzCz5LTnx5zeyxg0OuaqtFaNnj')",
                      }}
                    />
                    <div>
                      <p className="text-xs font-semibold text-secondary line-clamp-2">
                        Effective Communication for Engineers
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">2h 45m • 12 Lessons</p>
                    </div>
                  </div>
                  <button className="mt-3 w-full rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                    Start Learning
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
