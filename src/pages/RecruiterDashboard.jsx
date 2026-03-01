import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RecruiterSidebar from '../components/RecruiterSidebar.jsx';

export default function RecruiterDashboard() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-full bg-background-light overflow-hidden">
      {/* ── Sidebar ── */}
      <RecruiterSidebar />

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <div className="p-8 max-w-[1400px] mx-auto w-full flex flex-col gap-8">
          {/* Welcome */}
          <div>
            <h3 className="text-3xl font-bold text-midnight tracking-tight mb-1">
              Welcome back, {user?.name?.split(' ')[0] || 'Alex'}
            </h3>
            <p className="text-slate-500">Here's what's happening with your recruitment pipeline today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Active Jobs', value: '12', badge: '+2 this week', badgeColor: 'text-emerald-600 bg-emerald-50', icon: 'briefcase_meal', highlight: true },
              { title: 'Shortlisted Candidates', value: '45', badge: '+5 today', badgeColor: 'text-emerald-600 bg-emerald-50', icon: 'person_check', highlight: true },
              { title: 'Total Applications', value: '1,230', badge: '+12% vs last month', badgeColor: 'text-emerald-600 bg-emerald-50', icon: 'folder_open', highlight: false },
              { title: 'Interviews Scheduled', value: '28', badge: '8 pending', badgeColor: 'text-orange-600 bg-orange-50', icon: 'event', highlight: false },
            ].map(({ title, value, badge, badgeColor, icon, highlight }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1 h-full ${highlight ? 'bg-primary' : 'bg-slate-300'}`} />
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${highlight ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${badgeColor}`}>{badge}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <h4 className="text-3xl font-bold text-midnight mt-1">{value}</h4>
              </div>
            ))}
          </div>

          {/* Main Content: Charts & Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Application Trends Chart */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-midnight">Application Trends</h4>
                    <p className="text-sm text-slate-500">Overview of incoming applications over the last 30 days</p>
                  </div>
                  <select className="text-sm border-slate-200 rounded-lg text-slate-600 focus:ring-primary focus:border-primary">
                    <option>Last 30 Days</option>
                    <option>Last Quarter</option>
                    <option>This Year</option>
                  </select>
                </div>
                <div className="h-64 w-full relative">
                  <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between gap-2 px-2">
                    {[40, 55, 35, 70, 60, 85, 75].map((h, i) => (
                      <div
                        key={i}
                        className={`w-full rounded-t-sm transition-all ${i === 6 ? 'bg-teal-deep' : 'bg-teal-deep/10 hover:bg-teal-deep/20'} relative group`}
                        style={{ height: `${h}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-midnight text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity">
                          {h}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between text-xs text-slate-400">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="border-b border-slate-100 w-full h-0" />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-xs text-slate-400 px-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                  <span className="font-bold text-teal-deep">Sun</span>
                </div>
              </div>

              {/* Recent Applicants Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h4 className="text-lg font-bold text-midnight">Recent Applicants</h4>
                  <Link to="/recruiter/candidates" className="text-primary text-sm font-medium hover:text-yellow-600">
                    View All
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Candidate</th>
                        <th className="px-6 py-4">Role Applied</th>
                        <th className="px-6 py-4">Readiness Score</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { name: 'Sarah Jenkins', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbpnywUkv2ZdRKgkDrkiDF-G7pBnQxcMsCBhAH1anEk23Qsp7612ABLrqE6GKKvat8ar71BMyeTbcOghgmmv2C4dSVvJYh2Rdsv0UtXNwhxbx1owJImSKhZxxOJEJuQSLbPXK_8JDEuKY_hbGkDompe2Uytfrg3cts5d6XKlq9ScGqHnoNkd0Rbx-vA9m5cJUpPwWBa75VjsrlhdNPCUQlmac6UxHol7Qp-wvaiES3bXxtWHgCPmIl5bn494GmdM9IKScNoVr1vLyJ', role: 'UX Designer', score: 92, barColor: 'bg-emerald-500', scoreColor: 'text-emerald-600', badge: 'New', badgeStyle: 'bg-blue-50 text-blue-700' },
                        { name: 'Michael Chen', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXfmRaDXSH9uj0xjKfAco9mUKpD71bJh6lPXdC_aqlaldbBn70OtqMfuMEZA7YL-0dqWUC3oAUNhzQTzyokRyjKEU1w1tEzar9WOq1Dnk2cNPXGksiaJ_xr8fXUvckYeavwv_9G4uRwKhcHbPFL4uG6d-ciw7ziQKZA4nqIGzHL7kD-favVDEkwE-klsSSYIJ4RXf-BTyy_kQ9KenjmU5hHixfnt_oeH70TTYWlve0veFF1_gSugchaGPDtIm0mt95LcAXYeOwp-rL', role: 'Frontend Dev', score: 85, barColor: 'bg-primary', scoreColor: 'text-primary', badge: 'Reviewing', badgeStyle: 'bg-yellow-50 text-yellow-700' },
                        { name: 'Emma Wilson', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiXmk6KT9XSE_AxTBkXm5vAgv95dNKV0Ob0TJYRDKmOMC1YHAYeycHpwOrV3poMY2ii1U1Ng1Zdcb7N7KQ-D_s5LKRcWee2yyZwX4Npy1QFmY-kq5dYur8tqLT6WrOM98dIoSW_yKSxrM4x8XCTHTJ49u8w7V8F81s1wlWLLg7RrkURkjtf2QOu540G_bgXEeUDsnKFZX6W0zMxwcKA3pjMMeHtVocOC8y1RaqXpbfU81wP7wKi_Cw9pSu4KDKakS1BQwtkSiv9jmM', role: 'Product Manager', score: 68, barColor: 'bg-primary/60', scoreColor: 'text-slate-600', badge: 'Screening', badgeStyle: 'bg-slate-100 text-slate-700' },
                      ].map(({ name, avatar, role, score, barColor, scoreColor, badge, badgeStyle }) => (
                        <tr key={name} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="size-8 rounded-full bg-slate-200 bg-cover bg-center"
                                style={{ backgroundImage: `url('${avatar}')` }}
                              />
                              <span className="font-medium text-midnight">{name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{role}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-16 bg-slate-200 rounded-full overflow-hidden">
                                <div className={`h-full ${barColor}`} style={{ width: `${score}%` }} />
                              </div>
                              <span className={`text-xs font-bold ${scoreColor}`}>{score}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeStyle}`}>
                              {badge}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link to={`/recruiter/candidates/1`}>
                              <button className="text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
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

            {/* Right Column: Pipeline & Actions */}
            <div className="flex flex-col gap-8">
              {/* Hiring Pipeline */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h4 className="text-lg font-bold text-midnight mb-6">Hiring Pipeline</h4>
                <div className="flex flex-col gap-4">
                  {[
                    { stage: 'Screening', count: 120, w: '100%', opacity: 'opacity-30' },
                    { stage: 'Interview', count: 45, w: '60%', opacity: 'opacity-60' },
                    { stage: 'Offer Sent', count: 12, w: '25%', opacity: 'opacity-80' },
                    { stage: 'Hired', count: 5, w: '10%', opacity: '', emerald: true },
                  ].map(({ stage, count, w, opacity, emerald }) => (
                    <div key={stage} className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${emerald ? 'text-emerald-700 bg-emerald-100' : 'text-slate-600 bg-slate-100'}`}>
                          {stage}
                        </span>
                        <span className={`text-xs font-semibold inline-block ${emerald ? 'text-emerald-700' : 'text-midnight'}`}>
                          {count}
                        </span>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100">
                        <div
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${emerald ? 'bg-emerald-500' : `bg-teal-deep ${opacity}`}`}
                          style={{ width: w }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Sources */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h4 className="text-lg font-bold text-midnight mb-4">Top Sources</h4>
                <div className="flex flex-col gap-4">
                  {[
                    { icon: 'school', label: 'University Drive', pct: '45% of hires', count: 240, color: 'bg-blue-50 text-blue-600' },
                    { icon: 'share', label: 'Referrals', pct: '30% of hires', count: 156, color: 'bg-indigo-50 text-indigo-600' },
                    { icon: 'public', label: 'Job Portal', pct: '15% of hires', count: 89, color: 'bg-pink-50 text-pink-600' },
                  ].map(({ icon, label, pct, count, color }) => (
                    <div key={label} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                        <span className="material-symbols-outlined">{icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-midnight">{label}</p>
                        <p className="text-xs text-slate-400">{pct}</p>
                      </div>
                      <span className="text-sm font-bold text-midnight">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-midnight rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10">
                  <span className="material-symbols-outlined text-[120px]">rocket_launch</span>
                </div>
                <h4 className="text-lg font-bold mb-4 relative z-10">Pro Actions</h4>
                <div className="flex flex-col gap-3 relative z-10">
                  <button className="w-full text-left px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-between group">
                    <span className="text-sm font-medium">Schedule Bulk Interviews</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-between group">
                    <span className="text-sm font-medium">Export Candidate Data</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
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
