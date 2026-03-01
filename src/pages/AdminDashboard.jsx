import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AdminSidebar from '../components/AdminSidebar.jsx';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="bg-background-light text-text-main font-sans antialiased h-screen flex flex-row overflow-hidden">
      {/* ── Sidebar ── */}
      <AdminSidebar />

      {/* ── Main Content ── */}
      <main className="flex-1 h-full p-8 overflow-y-auto">
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-secondary mb-2">System Overview</h2>
            <p className="text-text-muted">Welcome back, here's what's happening across the campus today.</p>
          </header>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Total Students', value: '1,240', badge: '+5%', note: 'vs last semester', icon: 'groups', iconBg: 'bg-blue-50 text-blue-600' },
              { label: 'Active Recruiters', value: '85', badge: '+12%', note: 'new partners', icon: 'business_center', iconBg: 'bg-purple-50 text-purple-600' },
              { label: 'Avg Readiness Score', value: '78%', badge: '+3.5%', note: 'improvement', icon: 'speed', iconBg: 'bg-amber-50 text-amber-600' },
            ].map(({ label, value, badge, note, icon, iconBg }) => (
              <div key={label} className="bg-surface-light p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-40 group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-text-muted font-medium mb-1">{label}</p>
                    <h3 className="text-4xl font-bold text-secondary">{value}</h3>
                  </div>
                  <div className={`p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-content transition-colors ${iconBg}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="flex items-center text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-0.5 rounded">
                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                    {badge}
                  </span>
                  <span className="text-text-muted text-sm">{note}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Department Performance Chart */}
            <div className="lg:col-span-2 bg-surface-light rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-secondary">Department Performance</h3>
                  <p className="text-text-muted text-sm">Average readiness score by department</p>
                </div>
                <select className="bg-background-light border-none text-sm rounded-lg py-2 pl-3 pr-8 focus:ring-primary focus:ring-2">
                  <option>Current Semester</option>
                  <option>Last Semester</option>
                  <option>Year to Date</option>
                </select>
              </div>
              <div className="relative h-64 w-full flex items-end justify-between gap-2 sm:gap-6 px-4 pb-2 border-b border-gray-200">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2 text-xs text-text-muted">
                  {['100%', '75%', '50%', '25%', '0%'].map((l) => (
                    <div key={l} className="w-full border-t border-gray-100 flex items-center">
                      <span className="-ml-8">{l}</span>
                    </div>
                  ))}
                </div>
                {[['CS', 85, 'opacity-100'], ['IT', 72, 'opacity-80'], ['ECE', 65, 'opacity-60'], ['ME', 58, 'opacity-40'], ['CE', 62, 'opacity-30']].map(([dept, h, op]) => (
                  <div key={dept} className="relative z-10 flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                    <div
                      className={`w-full max-w-[60px] bg-accent ${op} rounded-t-sm transition-all duration-500 hover:opacity-80 relative group-hover:shadow-lg`}
                      style={{ height: `${h}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity">
                        {h}% Score
                      </div>
                    </div>
                    <span className="mt-3 text-xs font-semibold text-text-muted group-hover:text-secondary">{dept}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column Widgets */}
            <div className="flex flex-col gap-6">
              {/* Upcoming Drives */}
              <div className="bg-surface-light rounded-xl border border-gray-100 shadow-sm p-6 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-secondary">Upcoming Drives</h3>
                  <a className="text-sm text-primary font-medium hover:underline" href="#">View All</a>
                </div>
                <div className="space-y-4">
                  {[
                    { company: 'TechCorp Inc.', role: 'Software Engineer Role', icon: 'domain', badge: 'Tomorrow', badgeCls: 'bg-blue-100 text-blue-700', time: '10:00 AM' },
                    { company: 'BuildWell Const.', role: 'Civil Engineer Trainee', icon: 'apartment', badge: 'Oct 24', badgeCls: 'bg-amber-100 text-amber-700', time: '09:00 AM' },
                    { company: 'AutoMotive Ltd', role: 'Mechanical Design', icon: 'factory', badge: 'Oct 28', badgeCls: 'bg-gray-100 text-gray-600', time: '11:00 AM' },
                  ].map(({ company, role, icon, badge, badgeCls, time }) => (
                    <div key={company} className="flex gap-4 items-start p-3 rounded-lg hover:bg-background-light transition-colors cursor-pointer">
                      <div className="size-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-gray-500">{icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-secondary truncate">{company}</p>
                        <p className="text-xs text-text-muted">{role}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badgeCls}`}>{badge}</span>
                          <span className="text-[10px] text-text-muted">{time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-secondary rounded-xl shadow-md p-6 text-white relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <span className="material-symbols-outlined text-[120px]">bolt</span>
                </div>
                <h3 className="text-lg font-bold mb-4 relative z-10">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {[['add_circle', 'Add Student'], ['post_add', 'New Drive'], ['analytics', 'Generate Report'], ['mail', 'Bulk Email']].map(([icon, label]) => (
                    <button key={label} className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-left transition-colors flex flex-col gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Placements Table */}
          <div className="mt-8 bg-surface-light rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-secondary">Recent Placements</h3>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-background-light rounded transition-colors text-text-muted">
                  <span className="material-symbols-outlined text-xl">filter_list</span>
                </button>
                <button className="p-1 hover:bg-background-light rounded transition-colors text-text-muted">
                  <span className="material-symbols-outlined text-xl">download</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background-light text-text-muted font-medium">
                  <tr>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Package (LPA)</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { name: 'Sarah Johnson', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkUqZOd55-x3idVvBf42LVvCKuJbFu8f5kk2gEz2NVhbTR0CEbZSc6CrhQ0EVzhK27mYont_Je9bvZaolvXpQ_GI0XmZ0xcTSnI08cYaQ2ZRCHvxXkcrOv10DILEjVsip5N-opovzcwkNi0NZvOUZq0sMrFppAKBJquN6RVPRJBDMseDYxK8tjDDZu8AgZFeE7QO7DROFjNAMiFrQOGWbiLqMC5MITbcyo9Km1wKgQpfRJnngQlhNdEXMlATBUtEuHecOgENvTiorY', dept: 'Computer Science', company: 'Google', pkg: '24.0', badge: 'Placed', badgeCls: 'bg-green-50 text-green-700', dot: 'bg-green-600' },
                    { name: 'Michael Chen', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDoiVb0aYdyYy3qPyxiKzm9E-NWebgBk9odK-VPrW4RRRyduGiv2iwBe2Jo9E4M1M73t4MBk-2iW3156YxiJfzECqJ1G21U5QtejuPXxjZZ3hIArStQNnVSkxnW5z8gSK-0Dcb8VhL66qVRFdiuxBIcZDmdmi1ij7azxMG6RPJIiXi_LL0M_kBYbiur8aXrM4F0q5sZ1UOEIRpAOV7NQRDud1f6PInVCxzUF-Hz6Lp9_y5ivvezxrhEde_COIgUsj97B1ouAjTGnvV', dept: 'Information Tech', company: 'Microsoft', pkg: '22.5', badge: 'Placed', badgeCls: 'bg-green-50 text-green-700', dot: 'bg-green-600' },
                    { name: 'Jessica Williams', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV4gynwhTDN-99ix4JsV_hge-zMatouahCVYARZPVNFEtCjal97nswQyhtOt9kCIT83YLgQ8YJ225clC0ZB7rfDhFaNNBldeKTDRJI0VLMkoDqoQjhsd2WvnO2pQPHX3MPXCTPW-JkalVKwrHU41BFd9fjOC84zjF73NwNV-H3gWzRfkPUUHRYUW6PGJhZJ94lk_N2OXxjTVkAhiSjnolIctXQ2nZioaCbubyVNxVisNY3FfuddyA064qNoBHxL6DxDbi5yNfRTgkY', dept: 'Mechanical Eng', company: 'Tesla', pkg: '18.0', badge: 'Offer Pending', badgeCls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-600' },
                    { name: 'David Kim', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHknwsZHWo4zpIP5tyIpwkKf2RzJJ0jeqSsZOdHgdm3uyygkEsnQ8cc1izzZCSATR3_iH4tzyycF3-3cog7eEugem2p0nZ1hQaITdeX3EIomoLGPErP18xLSCzkdKeEAqZFQF2h0BIu835cMKPz7G8K7zmh0qPCXLqSpJq2o4d1RS3HDSfueT97Te7bKteu_d89LwLImfV0r1XO0N0P4aq_0QXfGo3fPHaOZ6MzbV6ZPSP7nMlETCMQVxCOoZTFCqdOPLjlh0fEZT0', dept: 'Electrical Eng', company: 'Samsung', pkg: '16.5', badge: 'Placed', badgeCls: 'bg-green-50 text-green-700', dot: 'bg-green-600' },
                  ].map(({ name, img, dept, company, pkg, badge, badgeCls, dot }) => (
                    <tr key={name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-secondary">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url('${img}')` }} />
                          {name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-muted">{dept}</td>
                      <td className="px-6 py-4 text-text-muted">{company}</td>
                      <td className="px-6 py-4 text-secondary font-semibold">{pkg}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${badgeCls}`}>
                          <span className={`size-1.5 rounded-full ${dot}`} />
                          {badge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-center">
              <button className="text-sm text-primary font-medium hover:underline">View All Placements</button>
            </div>
          </div>
      </main>
    </div>
  );
}
