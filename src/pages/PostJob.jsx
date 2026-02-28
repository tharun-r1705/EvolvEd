import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RecruiterSidebar from '../components/RecruiterSidebar.jsx';

export default function PostJob() {
  const [skills, setSkills] = useState(['Python', 'React Native', 'UI/UX Design']);
  const [newSkill, setNewSkill] = useState('');
  const [scoreValue, setScoreValue] = useState(85);

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

  return (
    <div className="font-sans bg-background-light min-h-screen flex flex-row">
      <RecruiterSidebar />

      {/* Main Content */}
      <main className="flex-1 flex justify-center py-10 px-6 sm:px-10 lg:px-16 overflow-y-auto">
          <div className="flex flex-col max-w-[960px] w-full gap-8">
            {/* Page Title */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-2">
                <Link to="/recruiter/jobs/new" className="hover:text-primary">Jobs</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-text-main">Post New Job</span>
              </div>
              <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em]">Post New Job Opportunity</h1>
              <p className="text-text-secondary text-lg font-normal leading-normal max-w-2xl">
                Create a new listing to find the best talent based on readiness scores. All fields are required unless marked optional.
              </p>
            </div>

            {/* Form Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-2 flex flex-col gap-6 bg-white p-8 rounded-xl border border-[#e4e2dd] shadow-sm">
                {/* Basic Info Section */}
                <div className="flex flex-col gap-6">
                  <h3 className="text-lg font-bold text-text-main border-b border-[#f4f3f1] pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                      <span className="text-text-main text-sm font-semibold">Job Title</span>
                      <input
                        className="form-input w-full rounded-lg border border-[#e4e2dd] bg-background-light px-4 py-3 text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                        placeholder="e.g. Senior Software Engineer"
                        type="text"
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-text-main text-sm font-semibold">Department</span>
                      <div className="relative">
                        <select className="form-select w-full rounded-lg border border-[#e4e2dd] bg-background-light px-4 py-3 text-text-main focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer">
                          <option disabled value="">Select Department</option>
                          <option>Engineering</option>
                          <option>Product</option>
                          <option>Design</option>
                          <option>Marketing</option>
                          <option>Sales</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                      </div>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                      <span className="text-text-main text-sm font-semibold">Employment Type</span>
                      <div className="relative">
                        <select className="form-select w-full rounded-lg border border-[#e4e2dd] bg-background-light px-4 py-3 text-text-main focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer">
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Contract</option>
                          <option>Internship</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                      </div>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-text-main text-sm font-semibold">Location</span>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">location_on</span>
                        <input
                          className="form-input w-full rounded-lg border border-[#e4e2dd] bg-background-light pl-10 pr-4 py-3 text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                          placeholder="e.g. San Francisco, CA (Remote)"
                          type="text"
                        />
                      </div>
                    </label>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className="text-text-main text-sm font-semibold">Job Description</span>
                    <textarea
                      className="form-textarea w-full rounded-lg border border-[#e4e2dd] bg-background-light px-4 py-3 text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none min-h-32 resize-y"
                      placeholder="Enter the detailed job description, responsibilities, and requirements here..."
                    />
                  </label>
                </div>

                {/* Requirements Section */}
                <div className="flex flex-col gap-6 mt-4">
                  <h3 className="text-lg font-bold text-text-main border-b border-[#f4f3f1] pb-2">Requirements &amp; Readiness</h3>
                  <label className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-text-main text-sm font-semibold">Minimum Readiness Score</span>
                      <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-1 rounded">Score: {scoreValue}+</span>
                    </div>
                    <input
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      max="100" min="0" type="range"
                      value={scoreValue}
                      onChange={(e) => setScoreValue(e.target.value)}
                    />
                    <div className="flex justify-between text-xs text-text-secondary">
                      <span>0 (Beginner)</span>
                      <span>50 (Intermediate)</span>
                      <span>100 (Expert)</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Candidates with a readiness score below this threshold will be flagged as "Needs Review".
                    </p>
                  </label>
                  <div className="flex flex-col gap-3">
                    <span className="text-text-main text-sm font-semibold">Required Skills</span>
                    <div className="flex gap-2 items-center">
                      <input
                        className="flex-1 rounded-lg border border-[#e4e2dd] bg-background-light px-4 py-3 text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                        placeholder="Add a skill (e.g. Python)"
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <button
                        onClick={addSkill}
                        className="bg-primary hover:bg-[#b09035] text-white p-3 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((s) => (
                        <div key={s} className="flex items-center gap-1 rounded-full bg-[#f4f3f1] pl-3 pr-2 py-1 border border-transparent hover:border-gray-300 transition-colors cursor-default">
                          <span className="text-text-main text-sm font-medium">{s}</span>
                          <button
                            onClick={() => removeSkill(s)}
                            className="text-gray-400 hover:text-red-500 transition-colors rounded-full p-0.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6">
                {/* Publishing Actions Card */}
                <div className="bg-white p-6 rounded-xl border border-[#e4e2dd] shadow-sm flex flex-col gap-4 sticky top-6">
                  <h3 className="text-lg font-bold text-text-main">Publishing Actions</h3>
                  <p className="text-sm text-text-secondary">Review your job posting settings before going live.</p>
                  <div className="flex items-center justify-between py-2 border-b border-[#f4f3f1]">
                    <span className="text-sm font-medium text-text-main">Visibility</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary font-bold uppercase">Public</span>
                      <span className="material-symbols-outlined text-primary text-sm">public</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input defaultChecked className="sr-only peer" type="checkbox" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                      <span className="ml-3 text-sm font-medium text-text-main">Notify eligible candidates</span>
                    </label>
                  </div>
                  <div className="flex flex-col gap-3 mt-2">
                    <button className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary hover:bg-[#b09035] text-white text-base font-bold leading-normal tracking-[0.015em] transition-all shadow-md hover:shadow-lg">
                      Submit Opportunity
                    </button>
                    <button className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#f4f3f1] hover:bg-gray-200 text-text-main text-base font-bold leading-normal tracking-[0.015em] transition-colors">
                      Save Draft
                    </button>
                  </div>
                </div>

                {/* Tips Card */}
                <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <span className="material-symbols-outlined text-xl">lightbulb</span>
                    <span>Recruiter Tip</span>
                  </div>
                  <p className="text-sm text-text-main leading-relaxed">
                    Detailed job descriptions with specific skill tags attract candidates with <strong>20% higher readiness scores</strong> on average.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
