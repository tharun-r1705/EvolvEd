import React from 'react';
import { Link } from 'react-router-dom';

export default function CandidateProfile() {
  return (
    <div className="bg-background-light font-sans text-midnight-navy min-h-screen flex flex-col overflow-x-hidden">
      {/* Top Navbar */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#f4f3f1]">
        <header className="flex items-center justify-between px-6 lg:px-10 py-3 mx-auto max-w-7xl w-full">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-midnight-navy">
              <div className="size-6 text-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '1.875rem' }}>school</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">EvolvEd</h2>
            </div>
            <div className="hidden md:flex relative w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>search</span>
              </div>
              <input
                className="block w-full rounded-lg border-0 bg-[#f4f3f1] py-2 pl-10 pr-3 text-sm text-midnight-navy focus:ring-2 focus:ring-primary placeholder:text-slate-400"
                placeholder="Search candidates..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/recruiter" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
              <Link to="/recruiter/candidates" className="text-sm font-medium text-primary">Candidates</Link>
              <Link to="/recruiter/jobs/new" className="text-sm font-medium hover:text-primary transition-colors">Jobs</Link>
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Analytics</a>
            </nav>
            <div className="flex gap-3">
              <button className="flex items-center justify-center size-9 rounded-full bg-[#f4f3f1] hover:bg-slate-200 transition-colors text-midnight-navy">
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>notifications</span>
              </button>
              <button className="flex items-center justify-center size-9 rounded-full bg-[#f4f3f1] hover:bg-slate-200 transition-colors text-midnight-navy">
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>account_circle</span>
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e4e2dd]">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div
                    className="w-32 h-32 rounded-full bg-cover bg-center border-4 border-primary/20 shadow-inner"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCoW58IdsinvMXNpkzH6YtVVqWc-eXNS3HGqHFslU-gMTqp-kXgm4pVvQ8LHiNGgJISm9e8GbBbe053RSUcrybSQ9sey0Q8C2dw0Yj6VDcMHPUtJEjletOOSHzvrOvonRJk6MFq3foXw03rTWyG-E8k0L1gerqaNcSTDKUVe9QTK1c7fGnYYreaAcTPx7ljQGBrrYmO0vTfa0b-wSwgVAZzMMGFAKMWFPvfcc3_XzElT36OnV-cCa8t1hh7WJLhGn4zBwykeS4-I2Wk')" }}
                  />
                  <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" title="Active" />
                </div>
                <h1 className="text-2xl font-bold text-midnight-navy mb-1">Alex Chen</h1>
                <p className="text-sm text-slate-500 font-medium mb-3">CS Senior @ Stanford University</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
                  Looking for Software Engineering Roles
                </div>
                <div className="flex gap-3 w-full">
                  <button className="flex-1 h-10 rounded-lg bg-[#f4f3f1] text-midnight-navy font-semibold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>mail</span>
                    Contact
                  </button>
                  <button className="flex-1 h-10 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>bookmark</span>
                    Shortlist
                  </button>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-[#e4e2dd] grid grid-cols-1 gap-4">
                {[['Location', 'San Francisco, CA'], ['GPA', '3.8/4.0'], ['Experience', '2 Internships'], ['Expected Grad', 'May 2024']].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">{k}</span>
                    <span className="text-midnight-navy text-sm font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-[#e4e2dd]">
                <h4 className="text-sm font-bold text-midnight-navy mb-3">Contact Information</h4>
                <div className="flex items-center gap-3 mb-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.125rem' }}>call</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 mb-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.125rem' }}>link</span>
                  <a className="hover:underline" href="#">linkedin.com/in/alexc</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.125rem' }}>language</span>
                  <a className="hover:underline" href="#">alexchen.dev</a>
                </div>
              </div>
            </div>

            {/* Download Action */}
            <div className="bg-[#171612] rounded-xl p-6 shadow-md text-white flex flex-col items-start gap-4">
              <div>
                <h3 className="font-bold text-lg mb-1">Full Candidate Report</h3>
                <p className="text-sm text-slate-300">Get a detailed PDF analysis including psychometric evaluation.</p>
              </div>
              <button className="w-full h-11 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>download</span>
                Download PDF Report
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Readiness Score Header */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-[#e4e2dd] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
              <div className="flex-1 z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.5rem' }}>verified</span>
                  <span className="text-sm font-bold text-primary tracking-wide uppercase">EvolvEd Readiness Score</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-midnight-navy mb-2">Excellent Match</h2>
                <p className="text-slate-500 text-sm md:text-base max-w-md">
                  Alex ranks in the top 5% of candidates for Full-stack roles based on assessment history and project complexity.
                </p>
              </div>
              <div className="relative flex-shrink-0 z-10">
                <svg className="size-32 md:size-40 transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-[#f4f3f1]" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeWidth="8" />
                  <circle className="text-primary" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeDasharray="264" strokeDashoffset="40" strokeLinecap="round" strokeWidth="8" />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                  <span className="text-3xl md:text-4xl font-bold text-midnight-navy">85</span>
                  <span className="text-xs font-medium text-slate-500 uppercase">Score</span>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-midnight-navy flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">code_blocks</span>
                  Skills Proficiency
                </h3>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e4e2dd]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {[['React / Next.js', 95, 'Expert'], ['TypeScript', 85, 'Advanced'], ['Python / Django', 80, 'Advanced'], ['PostgreSQL', 65, 'Intermediate']].map(([skill, pct, level]) => (
                    <div key={skill}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-midnight-navy">{skill}</span>
                        <span className="text-sm text-primary font-bold">{level}</span>
                      </div>
                      <div className="w-full bg-[#f4f3f1] rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-[#e4e2dd]">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3">Soft Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {['Leadership', 'Communication', 'Problem Solving', 'Agile Methodology'].map((s) => (
                      <span key={s} className="px-3 py-1 bg-[#f4f3f1] rounded-md text-sm text-midnight-navy border border-[#e4e2dd]">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Projects Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-midnight-navy flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">folder_open</span>
                  Featured Projects
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'E-commerce Analytics Dashboard',
                    desc: 'Built a real-time analytics dashboard for e-commerce vendors using React, D3.js, and Node.js. Handled data visualization for over 10k daily transactions.',
                    tags: ['React', 'Node.js'],
                    img: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_7lEV0aiYmlRrWwfuETDYgAdzeuTr9ta-Tbs1tuLXgpflgddJ308Gen57xGmopcOtJ9INrMT1fjsks_rf6socwvpnrnTqb9P3qwO0nF6bvYKsb585NKgZ0dLGCvISqKin_gpiALY5rgn1d5t5L4PNrMNMyb1OqdcaU0Fbf8ems9rdrZoBU-_MNoJJKxD0DgDnHkoj6epb_N8MT62I9QnDAjqVhDiU4vnf6K1gS8gHvrNJ8afMkIR5sz2mrK1UsJTuUFNQxVo-KRKc')",
                  },
                  {
                    title: 'HealthTrack Mobile App',
                    desc: 'Developed a cross-platform mobile application for tracking fitness goals using React Native. Integrated with Apple HealthKit and Google Fit APIs.',
                    tags: ['React Native', 'Firebase'],
                    img: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCJQM9wwQ3vVDMLIBa8IzWx7zttth8DI_SL0lInNcJpNhavqkwZ3-vswOUD_QiLqNZFoeBtNm1q4HIhrJX4ENvMyoARURYW2Quq6SL-P1P-DH_Fue1CwEP5qcrTgZ0nmhFXpkq8983hDobhZPfnwthl6FbUx97tr2QA7Psz7bu_f8gn-0AumqAZhG7J0d-rz6WL368KUtWBTAUolifKNyKxHtyUVFO5bVUdW_RJG0CVUA4NbHmXA75F_vMeOWeLI1Qioqo7o3ssiBLm')",
                  },
                ].map(({ title, desc, tags, img }) => (
                  <div key={title} className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#e4e2dd] flex flex-col h-full group">
                    <div className="h-40 bg-slate-200 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: img }} />
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="text-lg font-bold text-midnight-navy mb-2">{title}</h4>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-3">{desc}</p>
                      <div className="mt-auto flex flex-wrap gap-2 mb-4">
                        {tags.map((t) => (
                          <span key={t} className="text-[10px] font-bold uppercase px-2 py-1 bg-primary/10 text-primary rounded">{t}</span>
                        ))}
                      </div>
                      <a className="text-sm font-semibold text-midnight-navy hover:text-primary transition-colors flex items-center gap-1" href="#">
                        View Project <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Assessment History */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-midnight-navy flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history_edu</span>
                  Assessment History
                </h3>
                <a className="text-sm font-medium text-primary hover:underline" href="#">View All</a>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-[#e4e2dd] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#f4f3f1] border-b border-[#e4e2dd]">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-midnight-navy" scope="col">Assessment Name</th>
                        <th className="px-6 py-3 font-semibold text-midnight-navy" scope="col">Date</th>
                        <th className="px-6 py-3 font-semibold text-midnight-navy" scope="col">Score</th>
                        <th className="px-6 py-3 font-semibold text-midnight-navy text-right" scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4e2dd]">
                      {[
                        { name: 'Advanced Algorithms', type: 'Coding Challenge', icon: 'terminal', iconBg: 'bg-blue-100 text-blue-600', date: 'Oct 24, 2023', score: '92%', badge: 'Passed', badgeCls: 'bg-green-100 text-green-800' },
                        { name: 'Cognitive Aptitude', type: 'Psychometric', icon: 'psychology', iconBg: 'bg-purple-100 text-purple-600', date: 'Oct 10, 2023', score: '88%', badge: 'Passed', badgeCls: 'bg-green-100 text-green-800' },
                        { name: 'System Design Basics', type: 'Technical Interview', icon: 'database', iconBg: 'bg-orange-100 text-orange-600', date: 'Sep 28, 2023', score: '76%', badge: 'Average', badgeCls: 'bg-yellow-100 text-yellow-800' },
                      ].map(({ name, type, icon, iconBg, date, score, badge, badgeCls }) => (
                        <tr key={name} className="hover:bg-background-light transition-colors">
                          <td className="px-6 py-4 font-medium text-midnight-navy">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${iconBg}`}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>{icon}</span>
                              </div>
                              <div>
                                <div className="font-semibold">{name}</div>
                                <div className="text-xs text-slate-500">{type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{date}</td>
                          <td className="px-6 py-4 font-bold text-midnight-navy">{score}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeCls}`}>{badge}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#e4e2dd] bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2024 EvolvEd Inc. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Help Center'].map((l) => (
              <a key={l} className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
