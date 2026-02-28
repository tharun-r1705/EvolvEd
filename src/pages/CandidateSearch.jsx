import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RecruiterSidebar from '../components/RecruiterSidebar.jsx';

export default function CandidateSearch() {
  const [scoreValue, setScoreValue] = useState(85);

  const candidates = [
    { rank: 1, name: 'Aarav Patel', cls: '2024', dept: 'Computer Science', skills: ['Python', 'React', 'AWS'], score: 98, gold: true, avatar: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBAnI43zRATT05WelXNdxZJXWvK0s-o7xNLhGLZLaDQ61YTixv_SHr8bb2hEjAjGjZixGF2Jbw0UMGjspTWIRGMrNBhKWqFZ20XL9sEDPQwFwm-dm7FPjz6y49ySrbp6u_I1owjXZ-OnBpbwS_aiek77YQKa6qrjnHimT5GNZ6ZTTMsXbRtxJ7shOobcFgPx1B445mlGbPvJGYVFCY-yUeDXkOWQbkf1CWQ1kchq-lr-tyB2HXBir0WLnZqv9E_tbnp37dqcUpcZs5')", initials: null },
    { rank: 2, name: 'Priya Sharma', cls: '2024', dept: 'Data Science', skills: ['SQL', 'Python', 'ML'], score: 96, gold: true, avatar: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAkjG3EXtluiHNTQVZLH7UVOgilkMKOfoYhMTNB_t0tqmapCdVvNUSfgz94PbU-NUveNu-egqQCVplD_WUmG4KTpKH8xUdrt9IFJhRsZ5DycYb9LudxFow1Iqx7usxhAJ_avTUzBgQf3JiJ06RMipcRMx6KCnLRc6y8rDBVvZd6xB0gPb3nAu6BbrwutWP183FXx1EYfV7BN5UM_zyBsnptPbymGVOVKZ-5jYKJFGKVU4CkylwTwWL029IQBf3NjVABiYVCbkds4d2e')", initials: null },
    { rank: 3, name: 'Rohan Gupta', cls: '2025', dept: 'Electrical Eng.', skills: ['C++', 'IoT', 'Embedded'], score: 94, gold: true, avatar: null, initials: 'RG' },
    { rank: 4, name: 'Sneha Reddy', cls: '2024', dept: 'Computer Science', skills: ['Java', 'Spring', 'Docker'], score: 92, gold: true, avatar: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD3-T6ewtUkdjI31M88LUZM3LyZg_uN1mZlHNBGCyLd6PdSpfyDFCvb3502S5E4FkQ6phrdtNxvk80jUsiggm8qIrU840rkNNoAv2EEemIdsWutuvhSkvyLX-YiaPEAVUZJayGynr8TLSZvAA-M_3swZ9UOMc7SdK2OLH8d1pci2LL6mg3H-WDP7If47pq6VbTzFpu0xdZKSoMt-1jNRICcvsyJhWjanyWiHVkwpOMBcA2m62m9nkEymSTwC2g1x0R8r2zDGEJ5UIPn')", initials: null },
    { rank: 5, name: 'Vikram Singh', cls: '2024', dept: 'Mechanical Eng.', skills: ['AutoCAD', 'SolidWorks'], score: 90, gold: true, avatar: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBArt_-GFLMtXPyvPvZs9eoKu6cSnfKHFHN9m70-mzYtwDEUePIEwKJ8OG_u1Sh507yF35dEcm2sv_Z5-XQyzvr66H84EhTWaIPzDdzthMLoB527w-Mvv-DA_gI1oKeS5NIHnlS7MdnSGDkp_Vv18ezxnVdTZ45AgscipEKIVFkSgB8HdT9CxosCEIY696B2KvLnqnpKPoUZGsh8z-IfRCPbdO5nykXJkNaF0YZMfeubX-R0kxUAyQAibcH-km4HwaOYJ01p3fQWKrq')", initials: null },
    { rank: 6, name: 'Ananya Das', cls: '2025', dept: 'Information Tech', skills: ['Figma', 'UI/UX', 'CSS'], score: 89, gold: false, avatar: null, initials: 'AD' },
    { rank: 7, name: 'Karthik Iyer', cls: '2024', dept: 'Computer Science', skills: ['Node.js', 'MongoDB'], score: 88, gold: false, avatar: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAztE4JuVHwyZP93NnwskOHm7G6p_aepnpfXUS4QSW-5ZdMaxVypKobHyu92Gd_OxxDOgQLRv2fAg49HsyNuiShX34YZialKyxO-kgq83QrHkmu0BZr5XpOMskZ7XXsRGuRztwUWrZ_7BGBTBL642qiddP70V5GoPNhc8q1dAFFJFT1pLwB9wiZ_uEbAxZT6LeiBJ2bYRneHJhpmqlkpZGn_IkFkyc9Er-2PhEBMjp05HpRIOyzbzPYSF0LlrguaDsXd0e1ROFhNHtq')", initials: null },
  ];

  return (
    <div className="bg-background-light text-text-main font-sans min-h-screen flex flex-row overflow-hidden">
      <RecruiterSidebar />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="w-72 bg-surface-light border-r border-gray-200 flex-col overflow-y-auto hidden md:flex shrink-0">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-text-main">Filters</h3>
            <button className="text-xs font-medium text-text-muted hover:text-primary flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              Reset
            </button>
          </div>
          <div className="p-6 flex flex-col gap-8">
            {/* Readiness Score Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-text-main">Readiness Score</label>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{scoreValue} - 100</span>
              </div>
              <div className="relative pt-2">
                <input
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  max="100" min="0" type="range"
                  value={scoreValue}
                  onChange={(e) => setScoreValue(e.target.value)}
                />
                <div className="flex justify-between text-[10px] text-text-muted mt-2 font-medium">
                  <span>0</span><span>50</span><span>100</span>
                </div>
              </div>
            </div>
            {/* Skills Filter */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-text-main">Skills</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-text-muted text-[18px]">search</span>
                <input className="w-full bg-background-light border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-primary focus:ring-primary border" placeholder="Find skill..." type="text" />
              </div>
              <div className="flex flex-col gap-2 mt-1">
                {[['Python', 124, true], ['React', 86, true], ['Java', 54, false], ['Machine Learning', 42, false]].map(([skill, count, checked]) => (
                  <label key={skill} className="flex items-center gap-2 cursor-pointer group">
                    <input defaultChecked={checked} className="rounded border-gray-300 text-primary focus:ring-primary" type="checkbox" />
                    <span className="text-sm text-text-muted group-hover:text-text-main transition-colors">{skill}</span>
                    <span className="ml-auto text-xs text-text-muted bg-gray-100 px-1.5 py-0.5 rounded">{count}</span>
                  </label>
                ))}
                <button className="text-xs text-primary font-medium text-left mt-1 hover:underline">+ Show more</button>
              </div>
            </div>
            {/* Department Filter */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-text-main">Department</label>
              <div className="flex flex-col gap-2">
                {['All Departments', 'Computer Science', 'Data Science', 'Electrical Eng.', 'Business Admin'].map((dept, i) => (
                  <label key={dept} className="flex items-center gap-2 cursor-pointer group">
                    <input defaultChecked={i === 0} className="border-gray-300 text-primary focus:ring-primary" name="dept" type="radio" />
                    <span className="text-sm text-text-muted group-hover:text-text-main transition-colors">{dept}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Availability */}
            <div className="flex flex-col gap-3 pb-8">
              <label className="text-sm font-semibold text-text-main">Availability</label>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-background-light">
                <span className="text-sm text-text-main">Ready for hire</span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:translate-x-full checked:border-primary transition-transform duration-200" id="toggle" name="toggle" type="checkbox" />
                  <label className="block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer" htmlFor="toggle" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full bg-background-light overflow-hidden relative">
          {/* Content Header */}
          <div className="px-8 py-6 pb-2 shrink-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-text-main tracking-tight">Candidate Search</h1>
                <p className="text-text-muted mt-1 text-sm">Showing <span className="font-semibold text-text-main">412</span> candidates matching your criteria</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-primary hover:text-primary transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                  Export
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Search
                </button>
              </div>
            </div>
            {/* Active Filter Tags */}
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className="text-xs font-semibold uppercase text-text-muted mr-1">Active:</span>
              {['Score: 85+', 'Python', 'React'].map((tag) => (
                <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-text-main shadow-sm">
                  <span>{tag}</span>
                  <button className="hover:text-red-500 transition-colors flex items-center">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
              <button className="text-xs text-primary font-medium hover:underline ml-2">Clear all</button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 px-8 pb-8 overflow-hidden flex flex-col">
            <div className="bg-surface-light rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-text-muted uppercase tracking-wider items-center shrink-0">
                <div className="col-span-1">Rank</div>
                <div className="col-span-3">Candidate</div>
                <div className="col-span-2">Department</div>
                <div className="col-span-3">Top Skills</div>
                <div className="col-span-2 text-center">Readiness Score</div>
                <div className="col-span-1 text-right">Action</div>
              </div>
              {/* Table Body */}
              <div className="overflow-y-auto flex-1 scrollbar-hide">
                {candidates.map(({ rank, name, cls, dept, skills, score, gold, avatar, initials }) => (
                  <div key={rank} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="col-span-1 font-medium text-text-muted">#{rank}</div>
                    <div className="col-span-3 flex items-center gap-3">
                      {avatar ? (
                        <div className="size-10 rounded-full bg-gray-200 bg-cover bg-center shrink-0" style={{ backgroundImage: avatar }} />
                      ) : (
                        <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">{initials}</div>
                      )}
                      <div>
                        <h4 className="font-semibold text-text-main">{name}</h4>
                        <p className="text-xs text-text-muted">Class of {cls}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-text-main">{dept}</div>
                    <div className="col-span-3 flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <span key={s} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{s}</span>
                      ))}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${gold ? 'bg-primary/10 border border-primary/20' : 'bg-gray-100 border border-gray-200'}`}>
                        {gold && <span className="material-symbols-outlined text-primary text-[18px]">verified</span>}
                        <span className={`font-bold ${gold ? 'text-primary' : 'text-gray-600'}`}>{score}/100</span>
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Link to={`/recruiter/candidates/${rank}`}>
                        <button className="text-primary hover:text-white hover:bg-primary border border-primary rounded-lg p-2 transition-all" title="Shortlist">
                          <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              <div className="border-t border-gray-200 p-4 flex items-center justify-between shrink-0">
                <div className="text-sm text-text-muted">
                  Showing <span className="font-medium text-text-main">1-7</span> of <span className="font-medium text-text-main">412</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded border border-gray-200 text-sm text-text-muted hover:border-primary hover:text-primary disabled:opacity-50" disabled>Previous</button>
                  <button className="px-3 py-1 rounded border border-gray-200 text-sm text-text-muted hover:border-primary hover:text-primary">Next</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
