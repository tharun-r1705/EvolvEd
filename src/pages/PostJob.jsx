import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { recruiterService } from '../services/api';

// ─── Toast ───────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colours = type === 'success'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : 'bg-red-50 border-red-200 text-red-800';
  const icon = type === 'success' ? 'check_circle' : 'error';

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm animate-in slide-in-from-right ${colours}`}>
      <span className="material-symbols-outlined !text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined !text-[18px]">close</span>
      </button>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────
const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Data Science', 'Operations', 'Finance', 'HR', 'Legal'];
const EMPLOYMENT_TYPES = [
  { value: 'full_time',  label: 'Full-time' },
  { value: 'part_time',  label: 'Part-time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];
const WORK_MODES = [
  { value: 'on_site', label: 'On-site' },
  { value: 'remote',  label: 'Remote' },
  { value: 'hybrid',  label: 'Hybrid' },
];
const VISIBILITY_OPTS = [
  { value: 'public',  label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'draft',   label: 'Draft' },
];

const EMPTY_FORM = {
  title: '',
  department: '',
  employmentType: 'full_time',
  workMode: 'on_site',
  location: '',
  deadline: '',
  salaryMin: '',
  salaryMax: '',
  description: '',
  responsibilities: '',
  qualifications: '',
  minimumReadinessScore: 0,
  requiredSkills: [],
  visibility: 'public',
  notifyEligible: true,
};

// ─── Shared input styles ──────────────────────────────────────────
const inputClass =
  'w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-secondary placeholder:text-slate-400 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all text-sm hover:border-slate-300';
const selectClass =
  'w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-secondary focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none appearance-none cursor-pointer text-sm hover:border-slate-300';
const labelClass = 'text-sm font-semibold text-secondary';
const sectionClass = 'bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6';

// ─── Main Component ───────────────────────────────────────────────
export default function PostJob() {
  const { jobId } = useParams();
  const navigate  = useNavigate();
  const isEdit    = Boolean(jobId);

  const [form,       setForm]       = useState(EMPTY_FORM);
  const [newSkill,   setNewSkill]   = useState('');
  const [errors,     setErrors]     = useState({});
  const [toast,      setToast]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [fetching,   setFetching]   = useState(isEdit);
  const [submitMode, setSubmitMode] = useState(null); // 'publish' | 'draft'

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  // Load job for edit mode
  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    recruiterService.getJobById(jobId)
      .then(({ data }) => {
        setForm({
          title:                data.title || '',
          department:           data.department || '',
          employmentType:       data.employmentType || 'full_time',
          workMode:             data.workMode || 'on_site',
          location:             data.location || '',
          deadline:             data.deadline ? data.deadline.slice(0, 10) : '',
          salaryMin:            data.salaryMin != null ? String(data.salaryMin) : '',
          salaryMax:            data.salaryMax != null ? String(data.salaryMax) : '',
          description:          data.description || '',
          responsibilities:     data.responsibilities || '',
          qualifications:       data.qualifications || '',
          minimumReadinessScore: data.minimumReadinessScore ?? 0,
          requiredSkills:       data.skills || [],
          visibility:           data.visibility || 'public',
          notifyEligible:       data.notifyEligible ?? true,
        });
      })
      .catch(() => showToast('Failed to load job details.', 'error'))
      .finally(() => setFetching(false));
  }, [isEdit, jobId, showToast]);

  // Field helpers
  function field(name) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    };
  }

  // Skills
  function addSkill() {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (form.requiredSkills.includes(trimmed)) { setNewSkill(''); return; }
    setForm((prev) => ({ ...prev, requiredSkills: [...prev.requiredSkills, trimmed] }));
    setNewSkill('');
    if (errors.requiredSkills) setErrors((prev) => { const n = { ...prev }; delete n.requiredSkills; return n; });
  }

  function removeSkill(s) {
    setForm((prev) => ({ ...prev, requiredSkills: prev.requiredSkills.filter((x) => x !== s) }));
  }

  // Client-side validation
  function validate(isDraft) {
    const errs = {};
    if (!form.title.trim() || form.title.trim().length < 3)
      errs.title = 'Job title must be at least 3 characters.';
    if (!form.department)
      errs.department = 'Department is required.';
    if (!isDraft) {
      if (!form.description.trim() || form.description.trim().length < 20)
        errs.description = 'Description must be at least 20 characters.';
      if (form.requiredSkills.length === 0)
        errs.requiredSkills = 'Add at least one required skill.';
    }
    if (form.salaryMin && form.salaryMax && Number(form.salaryMax) < Number(form.salaryMin))
      errs.salaryMax = 'Max salary must be >= min salary.';
    if (form.deadline) {
      const d = new Date(form.deadline);
      if (d <= new Date())
        errs.deadline = 'Deadline must be a future date.';
    }
    return errs;
  }

  // Build payload
  function buildPayload(isDraft) {
    return {
      title:                form.title.trim(),
      department:           form.department,
      employmentType:       form.employmentType,
      workMode:             form.workMode || null,
      location:             form.location.trim(),
      description:          form.description.trim(),
      responsibilities:     form.responsibilities.trim() || null,
      qualifications:       form.qualifications.trim() || null,
      minimumReadinessScore: Number(form.minimumReadinessScore),
      requiredSkills:       form.requiredSkills,
      salaryMin:            form.salaryMin !== '' ? Number(form.salaryMin) : null,
      salaryMax:            form.salaryMax !== '' ? Number(form.salaryMax) : null,
      deadline:             form.deadline ? new Date(form.deadline).toISOString() : null,
      visibility:           isDraft ? 'draft' : form.visibility,
      notifyEligible:       form.notifyEligible,
    };
  }

  async function handleSubmit(isDraft) {
    const errs = validate(isDraft);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload = buildPayload(isDraft);
    setSubmitMode(isDraft ? 'draft' : 'publish');
    setLoading(true);
    try {
      if (isEdit) {
        await recruiterService.updateJob(jobId, payload);
        showToast(isDraft ? 'Job saved as draft.' : 'Job updated successfully.');
      } else {
        await recruiterService.createJob(payload);
        showToast(isDraft ? 'Job saved as draft.' : 'Job posted successfully.');
      }
      setTimeout(() => navigate('/recruiter/jobs'), 1200);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Something went wrong.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
      setSubmitMode(null);
    }
  }

  if (fetching) {
    return (
      <main className="flex-1 h-full overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined animate-spin !text-[40px] text-primary">progress_activity</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 h-full overflow-y-auto scrollbar-hide">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col max-w-[1000px] mx-auto w-full gap-6 p-4 sm:p-6 lg:p-8">

        {/* Page Title */}
        <motion.div 
          initial={{ opacity: 0, y: -16 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-1">
            <Link to="/recruiter" className="hover:text-primary transition-colors">Dashboard</Link>
            <span className="material-symbols-outlined !text-[14px]">chevron_right</span>
            <Link to="/recruiter/jobs" className="hover:text-primary transition-colors">Jobs</Link>
            <span className="material-symbols-outlined !text-[14px]">chevron_right</span>
            <span className="text-slate-600">{isEdit ? 'Edit Job' : 'Post New Job'}</span>
          </div>
          <p className="text-primary text-xs font-semibold uppercase tracking-widest">Job Management</p>
          <h1 className="text-secondary text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
            {isEdit ? 'Edit Job Opportunity' : 'Post New Job Opportunity'}
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
            {isEdit
              ? 'Update the job details below. Changes to skills will re-trigger AI candidate matching.'
              : 'Create a listing to find the best talent based on readiness scores. The more details you provide, the better the candidate matching.'}
          </p>
        </motion.div>

        {/* Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Form Fields */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Basic Information */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: 0.1 }}
              className={sectionClass}
            >
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                <div className="size-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined !text-[16px]">info</span>
                </div>
                <h3 className="text-base font-bold text-secondary">Basic Information</h3>
              </div>
              <div className="flex flex-col gap-5">

                {/* Title + Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Job Title <span className="text-primary">*</span></label>
                    <input
                      className={`${inputClass} ${errors.title ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                      placeholder="e.g. Senior Software Engineer"
                      type="text"
                      value={form.title}
                      onChange={field('title')}
                    />
                    {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Department <span className="text-primary">*</span></label>
                    <div className="relative">
                      <select
                        className={`${selectClass} ${errors.department ? 'border-red-400' : ''}`}
                        value={form.department}
                        onChange={field('department')}
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none !text-[20px]">expand_more</span>
                    </div>
                    {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
                  </div>
                </div>

                {/* Employment Type + Work Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Employment Type <span className="text-primary">*</span></label>
                    <div className="relative">
                      <select className={selectClass} value={form.employmentType} onChange={field('employmentType')}>
                        {EMPLOYMENT_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none !text-[20px]">expand_more</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Work Mode</label>
                    <div className="relative">
                      <select className={selectClass} value={form.workMode} onChange={field('workMode')}>
                        {WORK_MODES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none !text-[20px]">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Location + Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Location</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-[18px]">location_on</span>
                      <input
                        className={`${inputClass} pl-10`}
                        placeholder="e.g. Bangalore, India"
                        type="text"
                        value={form.location}
                        onChange={field('location')}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Application Deadline</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-[18px]">calendar_today</span>
                      <input
                        className={`${inputClass} pl-10 ${errors.deadline ? 'border-red-400' : ''}`}
                        type="date"
                        value={form.deadline}
                        onChange={field('deadline')}
                      />
                    </div>
                    {errors.deadline && <p className="text-xs text-red-500">{errors.deadline}</p>}
                  </div>
                </div>

                {/* Salary */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Min Salary (LPA)</label>
                    <input
                      className={inputClass}
                      placeholder="e.g. 8"
                      type="number"
                      min="0"
                      value={form.salaryMin}
                      onChange={field('salaryMin')}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Max Salary (LPA)</label>
                    <input
                      className={`${inputClass} ${errors.salaryMax ? 'border-red-400' : ''}`}
                      placeholder="e.g. 18"
                      type="number"
                      min="0"
                      value={form.salaryMax}
                      onChange={field('salaryMax')}
                    />
                    {errors.salaryMax && <p className="text-xs text-red-500">{errors.salaryMax}</p>}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Job Description */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: 0.17 }}
              className={sectionClass}
            >
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                <div className="size-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined !text-[16px]">description</span>
                </div>
                <h3 className="text-base font-bold text-secondary">Job Description</h3>
              </div>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Overview <span className="text-primary">*</span></label>
                  <textarea
                    className={`${inputClass} min-h-28 resize-y ${errors.description ? 'border-red-400' : ''}`}
                    placeholder="Describe the role, team, and what the candidate will be working on..."
                    value={form.description}
                    onChange={field('description')}
                  />
                  {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Key Responsibilities</label>
                  <textarea
                    className={`${inputClass} min-h-24 resize-y`}
                    placeholder="List the main responsibilities (one per line)..."
                    value={form.responsibilities}
                    onChange={field('responsibilities')}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Qualifications &amp; Education</label>
                  <textarea
                    className={`${inputClass} min-h-20 resize-y`}
                    placeholder="e.g. B.Tech in CS or related field, 2+ years experience..."
                    value={form.qualifications}
                    onChange={field('qualifications')}
                  />
                </div>
              </div>
            </motion.div>

            {/* Requirements */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                <div className="size-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined !text-[16px]">checklist</span>
                </div>
                <h3 className="text-base font-bold text-secondary">Requirements &amp; Readiness</h3>
              </div>
              <div className="flex flex-col gap-6">

                {/* Readiness Slider */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className={labelClass}>Minimum Readiness Score</span>
                    <span className="text-primary font-bold text-sm bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                      Score: {form.minimumReadinessScore}+
                    </span>
                  </div>
                  <input
                    className="w-full cursor-pointer"
                    max="100" min="0" type="range"
                    value={form.minimumReadinessScore}
                    onChange={(e) => setForm((prev) => ({ ...prev, minimumReadinessScore: Number(e.target.value) }))}
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
                      className={`flex-1 ${inputClass} ${errors.requiredSkills ? 'border-red-400' : ''}`}
                      placeholder="Add a skill (e.g. Python, React)"
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="bg-primary hover:bg-primary-dark text-secondary p-3 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 font-bold"
                    >
                      <span className="material-symbols-outlined !text-[20px]">add</span>
                    </button>
                  </div>
                  {errors.requiredSkills && <p className="text-xs text-red-500">{errors.requiredSkills}</p>}
                  {form.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {form.requiredSkills.map((s) => (
                        <div key={s} className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 pl-3 pr-2 py-1 hover:border-primary/40 transition-colors">
                          <span className="text-primary text-sm font-medium">{s}</span>
                          <button
                            type="button"
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
              </div>
            </div>
          </div>

            {/* Matching Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: 0.24 }}
              className={sectionClass}
            >
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
            </motion.div>
        </div>
      </div>
    </main>
  );
}
