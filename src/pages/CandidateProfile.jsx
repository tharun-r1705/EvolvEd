import React from 'react';
import { Link } from 'react-router-dom';
import RecruiterSidebar from '../components/RecruiterSidebar.jsx';

export default function CandidateProfile() {
  return (
    <div className="bg-background-light font-sans text-secondary h-screen flex flex-row overflow-hidden">
      <RecruiterSidebar />

      <main className="flex-1 h-full w-full overflow-y-auto scrollbar-hide pb-16 lg:pb-0">
        {/* Back nav */}
        <div className="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-2">
          <Link to="/recruiter/candidates" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors font-medium">
            <span className="material-symbols-outlined !text-[18px]">arrow_back</span>
            Back to Candidates
          </Link>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">

            {/* Left Column */}
            <div className="lg:col-span-4 flex flex-col gap-5">

              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative mb-4 mt-2">
                    <div
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-cover bg-center border-4 border-primary/30 shadow-md"
                      style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCoW58IdsinvMXNpkzH6YtVVqWc-eXNS3HGqHFslU-gMTqp-kXgm4pVvQ8LHiNGgJISm9e8GbBbe053RSUcrybSQ9sey0Q8C2dw0Yj6VDcMHPUtJEjletOOSHzvrOvonRJk6MFq3foXw03rTWyG-E8k0L1gerqaNcSTDKUVe9QTK1c7fGnYYreaAcTPx7ljQGBrrYmO0vTfa0b-wSwgVAZzMMGFAKMWFPvfcc3_XzElT36OnV-cCa8t1hh7WJLhGn4zBwykeS4-I2Wk')" }}
                    />
                    <div className="absolute bottom-1 right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm" title="Active" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-secondary mb-1">Alex Chen</h1>
                  <p className="text-sm text-slate-500 mb-3">CS Senior · Stanford University</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-5">
                    <span className="material-symbols-outlined !text-[14px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                    Seeking Software Engineering Roles
                  </div>
                  <div className="flex gap-3 w-full">
                    <button className="flex-1 h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-secondary font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm">
                      <span className="material-symbols-outlined !text-[16px]">mail</span>
                      Contact
                    </button>
                    <button className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary-dark text-secondary font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm">
                      <span className="material-symbols-outlined !text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                      Shortlist
                    </button>
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 gap-3">
                  {[['Location', 'San Francisco, CA'], ['GPA', '3.8 / 4.0'], ['Experience', '2 Internships'], ['Graduation', 'May 2024']].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">{k}</span>
                      <span className="text-secondary text-sm font-medium">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-secondary mb-3">Contact</h4>
                  {[
                    { icon: 'call',     text: '+1 (555) 123-4567' },
                    { icon: 'link',     text: 'linkedin.com/in/alexc', href: '#' },
                    { icon: 'language', text: 'alexchen.dev',           href: '#' },
                  ].map(({ icon, text, href }) => (
                    <div key={icon} className="flex items-center gap-3 mb-2.5 text-sm text-slate-500 hover:text-secondary transition-colors">
                      <span className="material-symbols-outlined text-primary !text-[18px]">{icon}</span>
                      {href ? <a href={href} className="hover:text-primary transition-colors">{text}</a> : <span>{text}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Report */}
              <div className="bg-secondary rounded-2xl p-5 sm:p-6 flex flex-col items-start gap-4 relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined !text-[20px] text-primary">assessment</span>
                    <h3 className="font-bold text-base text-white">Full Candidate Report</h3>
                  </div>
                  <p className="text-sm text-slate-400">Comprehensive PDF with full data analysis.</p>
                </div>
                <button className="w-full h-10 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all">
                  <span className="material-symbols-outlined !text-[18px]">download</span>
                  Download PDF Report
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Readiness Score */}
              <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
                <div className="flex-1 z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary !text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <span className="text-xs font-bold text-primary tracking-widest uppercase">EvolvEd Readiness Score</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-secondary mb-2">Excellent Match</h2>
                  <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                    Alex ranks in the top 5% of candidates for Full-stack roles based on assessment history and project complexity.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Placement Ready</span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary ring-1 ring-inset ring-primary/30">Top 5%</span>
                  </div>
                </div>
                <div className="relative flex-shrink-0 z-10">
                  <svg className="size-28 sm:size-36 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="transparent" r="42" stroke="#e2e8f0" strokeWidth="8" />
                    <circle cx="50" cy="50" fill="transparent" r="42" stroke="#c6a43f" strokeDasharray="264" strokeDashoffset="40" strokeLinecap="round" strokeWidth="8" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-secondary">85</span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Score</span>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary !text-[20px]">code_blocks</span>
                  <h3 className="text-lg font-bold text-secondary">Skills Proficiency</h3>
                </div>
                <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                    {[['React / Next.js', 95, 'Expert'], ['TypeScript', 85, 'Advanced'], ['Python / Django', 80, 'Advanced'], ['PostgreSQL', 65, 'Intermediate']].map(([skill, pct, level]) => (
                      <div key={skill}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-semibold text-secondary">{skill}</span>
                          <span className="text-xs text-primary font-bold">{level}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Soft Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {['Leadership', 'Communication', 'Problem Solving', 'Agile Methodology'].map((s) => (
                        <span key={s} className="px-3 py-1 bg-slate-100 rounded-lg text-sm text-slate-600 border border-slate-200">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Projects Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary !text-[20px]">folder_open</span>
                  <h3 className="text-lg font-bold text-secondary">Featured Projects</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    {
                      title: 'E-commerce Analytics Dashboard',
                      desc: 'Real-time analytics for e-commerce vendors using React, D3.js, and Node.js. Handled 10k+ daily transactions.',
                      tags: ['React', 'Node.js', 'D3.js'],
                      img: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_7lEV0aiYmlRrWwfuETDYgAdzeuTr9ta-Tbs1tuLXgpflgddJ308Gen57xGmopcOtJ9INrMT1fjsks_rf6socwvpnrnTqb9P3qwO0nF6bvYKsb585NKgZ0dLGCvISqKin_gpiALY5rgn1d5t5L4PNrMNMyb1OqdcaU0Fbf8ems9rdrZoBU-_MNoJJKxD0DgDnHkoj6epb_N8MT62I9QnDAjqVhDiU4vnf6K1gS8gHvrNJ8afMkIR5sz2mrK1UsJTuUFNQxVo-KRKc')",
                    },
                    {
                      title: 'HealthTrack Mobile App',
                      desc: 'Cross-platform fitness tracking app built with React Native. Integrated Apple HealthKit and Google Fit APIs.',
                      tags: ['React Native', 'Firebase'],
                      img: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCJQM9wwQ3vVDMLIBa8IzWx7zttth8DI_SL0lInNcJpNhavqkwZ3-vswOUD_QiLqNZFoeBtNm1q4HIhrJX4ENvMyoARURYW2Quq6SL-P1P-DH_Fue1CwEP5qcrTgZ0nmhFXpkq8983hDobhZPfnwthl6FbUx97tr2QA7Psz7bu_f8gn-0AumqAZhG7J0d-rz6WL368KUtWBTAUolifKNyKxHtyUVFO5bVUdW_RJG0CVUA4NbHmXA75F_vMeOWeLI1Qioqo7o3ssiBLm')",
                    },
                  ].map(({ title, desc, tags, img }) => (
                    <div key={title} className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 overflow-hidden flex flex-col group hover:ring-primary/40 transition-all duration-300">
                      <div className="h-36 bg-slate-100 bg-cover bg-center group-hover:scale-[1.02] transition-transform duration-500 origin-center" style={{ backgroundImage: img }} />
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="text-sm sm:text-base font-bold text-secondary mb-2">{title}</h4>
                        <p className="text-xs sm:text-sm text-slate-500 mb-3 line-clamp-2 flex-1">{desc}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {tags.map((t) => (
                            <span key={t} className="text-[10px] font-bold uppercase px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded">{t}</span>
                          ))}
                        </div>
                        <a className="text-sm font-semibold text-slate-400 hover:text-primary transition-colors flex items-center gap-1" href="#">
                          View Project <span className="material-symbols-outlined !text-[14px]">arrow_forward</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Assessment History */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary !text-[20px]">history_edu</span>
                    <h3 className="text-lg font-bold text-secondary">Assessment History</h3>
                  </div>
                  <a className="text-sm font-medium text-primary hover:underline transition-colors" href="#">View All</a>
                </div>
                <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[420px]">
                      <thead className="border-b border-slate-100 bg-slate-50/50">
                        <tr>
                          {['Assessment', 'Date', 'Score', 'Status'].map((h) => (
                            <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { name: 'Advanced Algorithms', type: 'Coding Challenge', icon: 'terminal',  iconBg: 'bg-blue-100 text-blue-600',   date: 'Oct 24, 2023', score: '92%', badge: 'Passed',  badgeCls: 'bg-green-50 text-green-700 ring-green-600/20' },
                          { name: 'Cognitive Aptitude',  type: 'Psychometric',    icon: 'psychology', iconBg: 'bg-purple-100 text-purple-600',date: 'Oct 10, 2023', score: '88%', badge: 'Passed',  badgeCls: 'bg-green-50 text-green-700 ring-green-600/20' },
                          { name: 'System Design Basics',type: 'Technical',       icon: 'database',   iconBg: 'bg-amber-100 text-amber-600', date: 'Sep 28, 2023', score: '76%', badge: 'Average', badgeCls: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' },
                        ].map(({ name, type, icon, iconBg, date, score, badge, badgeCls }) => (
                          <tr key={name} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-4 font-medium text-secondary">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${iconBg}`}>
                                  <span className="material-symbols-outlined !text-[18px]">{icon}</span>
                                </div>
                                <div>
                                  <div className="font-semibold text-sm text-secondary">{name}</div>
                                  <div className="text-xs text-slate-400">{type}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-500 text-sm">{date}</td>
                            <td className="px-5 py-4 font-bold text-secondary">{score}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${badgeCls}`}>{badge}</span>
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
        </div>
      </main>
    </div>
  );
}
