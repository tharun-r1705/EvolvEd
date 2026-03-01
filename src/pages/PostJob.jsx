import React, { useState } from 'react';
import { Link } from 'react-router-dom';
export default function PostJob() {
  const [skills, setSkills] = useState(['Python', 'React Native', 'UI/UX Design']);
  const [newSkill, setNewSkill] = useState('');
  const [scoreValue, setScoreValue] = useState(65);

  function addSkill() {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  }

  function removeSkill(s) {
    setSkills(skills.filter((sk) => sk !== s));
  }

  const inputClass = "w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-secondary placeholder:text-slate-400 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all text-sm hover:border-slate-300";
  const selectClass = "w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-secondary focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none appearance-none cursor-pointer text-sm hover:border-slate-300";
  const labelClass = "text-sm font-semibold text-secondary";
  const sectionClass = "bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6";

  return (
    <main className="flex-1 h-full overflow-y-auto scrollbar-hide">
      <div className="flex flex-col max-w-[1000px] mx-auto w-full gap-6 p-4 sm:p-6 lg:p-8">

          {/* Page Title */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-1">
              <Link to="/recruiter" className="hover:text-primary transition-colors">Dashboard</Link>
              <span className="material-symbols-outlined !text-[14px]">chevron_right</span>
              <span className="text-slate-600">Post New Job</span>
            </div>
            <p className="text-primary text-xs font-semibold uppercase tracking-widest">Job Management</p>
            <h1 className="text-secondary text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Post New Job Opportunity</h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
              Create a listing to find the best talent based on readiness scores. The more details you provide, the better the candidate matching.
            </p>
          </div>

          {/* Form Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Form Fields */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Basic Information */}
              <div className={sectionClass}>
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                  <div className="size-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined !text-[16px]">info</span>
                  </div>
                  <h3 className="text-base font-bold text-secondary">Basic Information</h3>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <label className="flex flex-col gap-2">
                      <span className={labelClass}>Job Title <span className="text-primary">*</span></span>
                      <input className={inputClass} placeholder="e.g. Senior Software Engineer" type="text" />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className={labelClass}>Department <span className="text-primary">*</span></span>
                      <div className="relative">
                        <select className={selectClass}>
                          <option disabled value="">Select Department</option>
                          <option>Engineering</option>
                          <option>Product</option>
                          <option>Design</option>
                          <option>Marketing</option>
                          <option>Sales</option>
                          <option>Data Science</option>
                          <option>Operations</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none !text-[20px]">expand_more</span>
                      </div>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <label className="flex flex-col gap-2">
                      <span className={labelClass}>Employment Type <span className="text-primary">*</span></span>
                      <div className="relative">
                        <select className={selectClass}>
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Contract</option>
                          <option>Internship</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none !text-[20px]">expand_more</span>
                      </div>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className={labelClass}>Work Mode <span className="text-primary">*</span></span>
                      <div className="relative">
                        <select className={selectClass}>
                          <option>On-site</option>
                          <option>Remote</option>
                          <option>Hybrid</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none !text-[20px]">expand_more</span>
                      </div>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <label className="flex flex-col gap-2">
                      <span className={labelClass}>Location</span>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-[18px]">location_on</span>
                        <input className={`${inputClass} pl-10`} placeholder="e.g. Bangalore, India" type="text" />
                      </div>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className={labelClass}>Application Deadline <span className="text-primary">*</span></span>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-[18px]">calendar_today</span>
                        <input className={`${inputClass} pl-10`} type="date" />
                      </div>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <label className="flex flex-col gap-2">
                      <span className={labelClass}>Min Salary (LPA)</span>
                      <input className={inputClass} placeholder="e.g. 8" type="number" min="0" />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className={labelClass}>Max Salary (LPA)</span>
                      <input className={inputClass} placeholder="e.g. 18" type="number" min="0" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className={sectionClass}>
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                  <div className="size-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined !text-[16px]">description</span>
                  </div>
                  <h3 className="text-base font-bold text-secondary">Job Description</h3>
                </div>
                <div className="flex flex-col gap-5">
                  <label className="flex flex-col gap-2">
                    <span className={labelClass}>Overview <span className="text-primary">*</span></span>
                    <textarea
                      className={`${inputClass} min-h-28 resize-y`}
                      placeholder="Describe the role, team, and what the candidate will be working on..."
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className={labelClass}>Key Responsibilities</span>
                    <textarea
                      className={`${inputClass} min-h-24 resize-y`}
                      placeholder="List the main responsibilities (one per line)..."
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className={labelClass}>Qualifications & Education</span>
                    <textarea
                      className={`${inputClass} min-h-20 resize-y`}
                      placeholder="e.g. B.Tech in CS or related field, 2+ years experience..."
                    />
                  </label>
                </div>
              </div>

              {/* Requirements */}
              <div className={sectionClass}>
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                  <div className="size-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined !text-[16px]">checklist</span>
                  </div>
                  <h3 className="text-base font-bold text-secondary">Requirements & Readiness</h3>
                </div>
                <div className="flex flex-col gap-6">
                  {/* Readiness Slider */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className={labelClass}>Minimum Readiness Score</span>
                      <span className="text-primary font-bold text-sm bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">Score: {scoreValue}+</span>
                    </div>
                    <input
                      className="w-full cursor-pointer"
                      max="100" min="0" type="range"
                      value={scoreValue}
                      onChange={(e) => setScoreValue(e.target.value)}
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>0 — Beginner</span>
                      <span>50 — Intermediate</span>
                      <span>100 — Expert</span>
                    </div>
                    <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                      Candidates below this threshold will be flagged as "Needs Review" in your rankings.
                    </p>
                  </div>

                  {/* Required Skills */}
                  <div className="flex flex-col gap-3">
                    <span className={labelClass}>Required Skills <span className="text-primary">*</span></span>
                    <div className="flex gap-2 items-center">
                      <input
                        className={`flex-1 ${inputClass}`}
                        placeholder="Add a skill (e.g. Python, React)"
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <button
                        onClick={addSkill}
                        className="bg-primary hover:bg-primary-dark text-secondary p-3 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 font-bold"
                      >
                        <span className="material-symbols-outlined !text-[20px]">add</span>
                      </button>
                    </div>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {skills.map((s) => (
                          <div key={s} className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 pl-3 pr-2 py-1 hover:border-primary/40 transition-colors">
                            <span className="text-primary text-sm font-medium">{s}</span>
                            <button
                              onClick={() => removeSkill(s)}
                              className="text-primary/50 hover:text-red-500 transition-colors rounded-full p-0.5"
                            >
                              <span className="material-symbols-outlined !text-[14px]">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <label className="flex flex-col gap-2">
                      <span className={labelClass}>Min. Experience</span>
                      <div className="relative">
                        <select className={selectClass}>
                          <option>Fresher (0 years)</option>
                          <option>1+ years</option>
                          <option>2+ years</option>
                          <option>3+ years</option>
                          <option>5+ years</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none !text-[20px]">expand_more</span>
                      </div>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className={labelClass}>Max Applications</span>
                      <input className={inputClass} placeholder="Leave empty for unlimited" type="number" min="1" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-5">
              {/* Publishing Actions */}
              <div className={`${sectionClass} sticky top-6`}>
                <h3 className="text-base font-bold text-secondary mb-1">Publishing</h3>
                <p className="text-xs text-slate-400 mb-4">Review settings before going live.</p>
                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm font-medium text-secondary">Visibility</span>
                    <div className="relative">
                      <select className="bg-primary/10 border border-primary/20 rounded-md text-xs text-primary font-semibold px-2 py-1 outline-none focus:border-primary cursor-pointer">
                        <option>Public</option>
                        <option>Private</option>
                        <option>Invite Only</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium text-secondary">Notify eligible candidates</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input defaultChecked className="sr-only peer" type="checkbox" />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-primary hover:bg-primary-dark text-secondary text-sm font-bold transition-all shadow-sm hover:shadow-md">
                    <span className="material-symbols-outlined !text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>publish</span>
                    Post Job
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-secondary text-sm font-semibold transition-colors shadow-sm">
                    <span className="material-symbols-outlined !text-[18px]">save</span>
                    Save as Draft
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-2xl border border-primary/20 p-5 bg-gradient-to-br from-primary/5 to-primary/[0.02] shadow-sm">
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-3">
                  <span className="material-symbols-outlined !text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                  Recruiter Tip
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Job postings with detailed skill requirements and salary ranges attract candidates with{' '}
                  <strong className="text-primary">20% higher readiness scores</strong> on average.
                </p>
              </div>

              {/* Preview Card */}
              <div className={sectionClass}>
                <h4 className="text-sm font-bold text-secondary mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined !text-[18px] text-primary">preview</span>
                  Matching Preview
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  After posting, EvolvEd's AI will automatically match your requirements against student profiles and rank candidates by job fit score.
                </p>
                <div className="mt-3 flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="material-symbols-outlined !text-[16px] text-emerald-600">check_circle</span>
                  <span className="text-xs text-emerald-700 font-medium">AI matching will activate on publish</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
