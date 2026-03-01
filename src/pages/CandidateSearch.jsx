import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RecruiterSidebar from '../components/RecruiterSidebar.jsx';

export default function CandidateSearch() {
  const [scoreValue, setScoreValue] = useState(85);
  const [filterOpen, setFilterOpen] = useState(false);

  const candidates = [
    { rank: 1, name: 'Aarav Patel',   cls: '2024', dept: 'Computer Science',  skills: ['Python', 'React', 'AWS'],         score: 98, gold: true,  initials: 'AP', initBg: 'bg-blue-100 text-blue-700' },
    { rank: 2, name: 'Priya Sharma',  cls: '2024', dept: 'Data Science',       skills: ['SQL', 'Python', 'ML'],            score: 96, gold: true,  initials: 'PS', initBg: 'bg-purple-100 text-purple-700' },
    { rank: 3, name: 'Rohan Gupta',   cls: '2025', dept: 'Electrical Eng.',    skills: ['C++', 'IoT', 'Embedded'],         score: 94, gold: true,  initials: 'RG', initBg: 'bg-teal-100 text-teal-700' },
    { rank: 4, name: 'Sneha Reddy',   cls: '2024', dept: 'Computer Science',   skills: ['Java', 'Spring', 'Docker'],       score: 92, gold: true,  initials: 'SR', initBg: 'bg-rose-100 text-rose-700' },
    { rank: 5, name: 'Vikram Singh',  cls: '2024', dept: 'Mechanical Eng.',    skills: ['AutoCAD', 'SolidWorks'],          score: 90, gold: true,  initials: 'VS', initBg: 'bg-orange-100 text-orange-700' },
    { rank: 6, name: 'Ananya Das',    cls: '2025', dept: 'Information Tech',   skills: ['Figma', 'UI/UX', 'CSS'],          score: 89, gold: false, initials: 'AD', initBg: 'bg-indigo-100 text-indigo-700' },
    { rank: 7, name: 'Karthik Iyer',  cls: '2024', dept: 'Computer Science',   skills: ['Node.js', 'MongoDB'],             score: 88, gold: false, initials: 'KI', initBg: 'bg-amber-100 text-amber-700' },
  ];

  const FilterPanel = () => (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-base text-secondary">Filters</h3>
        <button className="text-xs font-medium text-slate-400 hover:text-primary flex items-center gap-1 transition-colors">
          <span className="material-symbols-outlined !text-[14px]">restart_alt</span>
          Reset
        </button>
      </div>
      <div className="p-5 flex flex-col gap-7">
        {/* Readiness Score Slider */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-secondary">Readiness Score</label>
            <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{scoreValue}–100</span>
          </div>
          <input
            className="w-full cursor-pointer"
            max="100" min="0" type="range"
            value={scoreValue}
            onChange={(e) => setScoreValue(e.target.value)}
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>0</span><span>50</span><span>100</span>
          </div>
        </div>
        {/* Skills Filter */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-secondary">Skills</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 !text-[18px]">search</span>
            <input
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/40 outline-none transition-all"
              placeholder="Find skill..."
              type="text"
            />
          </div>
          <div className="flex flex-col gap-2 mt-1">
            {[['Python', 124, true], ['React', 86, true], ['Java', 54, false], ['Machine Learning', 42, false]].map(([skill, count, checked]) => (
              <label key={skill} className="flex items-center gap-2 cursor-pointer group">
                <input defaultChecked={checked} className="rounded border-slate-300 text-primary focus:ring-primary/40" type="checkbox" />
                <span className="text-sm text-slate-600 group-hover:text-secondary transition-colors flex-1">{skill}</span>
                <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{count}</span>
              </label>
            ))}
            <button className="text-xs text-primary font-medium text-left mt-1 hover:underline">+ Show more</button>
          </div>
        </div>
        {/* Department Filter */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-secondary">Department</label>
          <div className="flex flex-col gap-2">
            {['All Departments', 'Computer Science', 'Data Science', 'Electrical Eng.', 'Business Admin'].map((dept, i) => (
              <label key={dept} className="flex items-center gap-2 cursor-pointer group">
                <input defaultChecked={i === 0} className="border-slate-300 text-primary focus:ring-primary/40" name="dept" type="radio" />
                <span className="text-sm text-slate-600 group-hover:text-secondary transition-colors">{dept}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Availability Toggle */}
        <div className="flex flex-col gap-3 pb-4">
          <label className="text-sm font-semibold text-secondary">Availability</label>
          <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
            <span className="text-sm text-slate-600">Ready for hire</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-background-light text-secondary font-sans h-screen flex flex-row overflow-hidden">
      <RecruiterSidebar />

      {/* Mobile Filter Drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white border-l border-slate-200 shadow-2xl overflow-hidden">
            <FilterPanel />
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Filter Sidebar */}
        <aside className="w-[272px] bg-white border-r border-slate-200 flex-col overflow-hidden hidden lg:flex shrink-0 shadow-sm">
          <FilterPanel />
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full bg-background-light overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-5 pb-0 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-1">Talent Discovery</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary tracking-tight">Candidate Search</h1>
                <p className="text-slate-500 mt-1 text-sm">Showing <span className="font-semibold text-secondary">412</span> candidates matching your criteria</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined !text-[18px]">filter_list</span>
                  Filters
                </button>
                <button className="flex items-center gap-2 h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors shadow-sm">
                  <span className="material-symbols-outlined !text-[18px]">file_download</span>
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button className="flex items-center gap-2 h-9 px-3 bg-primary hover:bg-primary-dark text-secondary rounded-lg text-sm font-bold transition-all shadow-sm">
                  <span className="material-symbols-outlined !text-[18px]">bookmark</span>
                  <span className="hidden sm:inline">Save Search</span>
                </button>
              </div>
            </div>
            {/* Active Filter Tags */}
            <div className="flex flex-wrap gap-2 items-center pb-4">
              <span className="text-xs font-semibold uppercase text-slate-400 mr-1">Active:</span>
              {['Score: 85+', 'Python', 'React'].map((tag) => (
                <div key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium">
                  <span>{tag}</span>
                  <button className="hover:text-secondary transition-colors flex items-center ml-0.5">
                    <span className="material-symbols-outlined !text-[14px]">close</span>
                  </button>
                </div>
              ))}
              <button className="text-xs text-slate-400 font-medium hover:text-primary transition-colors ml-1">Clear all</button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 overflow-hidden flex flex-col">
            <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 flex flex-col h-full overflow-hidden">
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-5 sm:px-6 py-4 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider items-center flex-shrink-0 bg-slate-50/50">
                <div className="col-span-1">Rank</div>
                <div className="col-span-3">Candidate</div>
                <div className="col-span-2 hidden md:block">Department</div>
                <div className="col-span-3">Top Skills</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-1 text-right">Action</div>
              </div>
              {/* Table Body */}
              <div className="overflow-y-auto flex-1 scrollbar-hide divide-y divide-slate-100">
                {candidates.map(({ rank, name, cls, dept, skills, score, gold, initials, initBg }) => (
                  <div
                    key={rank}
                    className="sm:grid sm:grid-cols-12 gap-4 px-5 sm:px-6 py-4 hover:bg-slate-50 transition-colors group flex items-center"
                  >
                    {/* Mobile layout */}
                    <div className="sm:hidden flex items-center gap-3 w-full">
                      <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${initBg}`}>{initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-secondary text-sm truncate">{name}</h4>
                          {gold && <span className="material-symbols-outlined text-primary !text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>}
                        </div>
                        <p className="text-xs text-slate-400">{dept} · Class of {cls}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`font-bold text-sm ${gold ? 'text-primary' : 'text-slate-400'}`}>{score}</span>
                        <Link to={`/recruiter/candidates/${rank}`}>
                          <button className="text-primary hover:text-secondary hover:bg-primary border border-primary/40 rounded-lg p-1.5 transition-all ml-2">
                            <span className="material-symbols-outlined !text-[18px]">visibility</span>
                          </button>
                        </Link>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:contents">
                      <div className="col-span-1 font-medium text-slate-400 text-sm">#{rank}</div>
                      <div className="col-span-3 flex items-center gap-3">
                        <div className={`size-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${initBg}`}>{initials}</div>
                        <div>
                          <h4 className="font-semibold text-secondary text-sm">{name}</h4>
                          <p className="text-xs text-slate-400">Class of {cls}</p>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-slate-500 hidden md:flex items-center">{dept}</div>
                      <div className="col-span-3 flex flex-wrap gap-1 items-center">
                        {skills.map((s) => (
                          <span key={s} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">{s}</span>
                        ))}
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${gold ? 'bg-primary/10 border border-primary/20' : 'bg-slate-100 border border-slate-200'}`}>
                          {gold && <span className="material-symbols-outlined text-primary !text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>}
                          <span className={`font-bold text-sm ${gold ? 'text-primary' : 'text-slate-500'}`}>{score}/100</span>
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Link to={`/recruiter/candidates/${rank}`}>
                          <button className="text-primary hover:text-secondary hover:bg-primary border border-primary/40 hover:border-primary rounded-lg p-1.5 transition-all" title="View Profile">
                            <span className="material-symbols-outlined !text-[18px]">visibility</span>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              <div className="border-t border-slate-100 p-4 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
                <div className="text-sm text-slate-500">
                  Showing <span className="font-medium text-secondary">1–7</span> of <span className="font-medium text-secondary">412</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded-lg border border-slate-200 text-sm text-slate-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-40" disabled>Previous</button>
                  <button className="px-3 py-1 rounded-lg border border-slate-200 text-sm text-slate-500 hover:border-primary hover:text-primary transition-colors">Next</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
