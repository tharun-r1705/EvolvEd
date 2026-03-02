import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recruiterService } from '../services/api';

// ─── Toast ────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  const colours = type === 'success'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : 'bg-red-50 border-red-200 text-red-800';
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${colours}`}>
      <span className="material-symbols-outlined !text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose}><span className="material-symbols-outlined !text-[18px] opacity-60 hover:opacity-100">close</span></button>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────
function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-6 max-w-sm w-full">
        <h3 className="text-base font-bold text-secondary mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-secondary text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-10 rounded-xl text-white text-sm font-bold transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-dark text-secondary'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────
function fmtType(t) {
  return { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', internship: 'Internship' }[t] || t;
}
function fmtMode(m) {
  return { on_site: 'On-site', remote: 'Remote', hybrid: 'Hybrid' }[m] || m;
}
function fmtSalary(min, max) {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${min}–${max} LPA`;
  if (min != null) return `${min}+ LPA`;
  return `Up to ${max} LPA`;
}
function isDeadlinePast(deadline) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}
function fmtDeadline(deadline) {
  if (!deadline) return null;
  return new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Skeleton ─────────────────────────────────────────────────────
function JobSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex gap-3 items-start">
        <div className="size-10 rounded-xl bg-slate-200 flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-slate-100 rounded-full" />
        <div className="h-5 w-20 bg-slate-100 rounded-full" />
      </div>
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-4/5" />
    </div>
  );
}

// ─── Action Menu ─────────────────────────────────────────────────
function ActionMenu({ job, onEdit, onToggle, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-slate-100 transition-colors"
      >
        <span className="material-symbols-outlined !text-[20px]">more_vert</span>
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 py-1 min-w-[160px]">
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined !text-[18px] text-slate-400">edit</span>
            Edit
          </button>
          <button
            onClick={() => { setOpen(false); onToggle(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:bg-slate-50 transition-colors"
          >
            <span className={`material-symbols-outlined !text-[18px] ${job.isActive ? 'text-amber-400' : 'text-emerald-500'}`}>
              {job.isActive ? 'pause_circle' : 'play_circle'}
            </span>
            {job.isActive ? 'Close Job' : 'Reopen Job'}
          </button>
          <button
            onClick={() => { setOpen(false); onDuplicate(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined !text-[18px] text-slate-400">content_copy</span>
            Duplicate
          </button>
          <div className="h-px bg-slate-100 mx-2 my-1" />
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="material-symbols-outlined !text-[18px]">delete</span>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────
function JobCard({ job, companyLogoUrl, onEdit, onToggle, onDuplicate, onDelete }) {
  const deadlinePast = isDeadlinePast(job.deadline);
  const salary = fmtSalary(job.salaryMin, job.salaryMax);
  const visibleSkills = job.skills.slice(0, 4);
  const overflow = job.skills.length - 4;

  const statusBadge = job.visibility === 'draft'
    ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
    : job.isActive
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
      : 'bg-slate-100 text-slate-500 ring-slate-400/20';
  const statusLabel = job.visibility === 'draft' ? 'Draft' : job.isActive ? 'Active' : 'Closed';

  return (
    <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow">

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {companyLogoUrl
            ? <img src={companyLogoUrl} alt="logo" className="size-full object-cover" />
            : <span className="material-symbols-outlined !text-[22px] text-slate-400">business</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-secondary leading-tight truncate">{job.title}</h3>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="text-xs text-slate-500">{job.department}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">{fmtType(job.employmentType)}</span>
            {job.workMode && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">{fmtMode(job.workMode)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusBadge}`}>
            {statusLabel}
          </span>
          <ActionMenu job={job} onEdit={onEdit} onToggle={onToggle} onDuplicate={onDuplicate} onDelete={onDelete} />
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {job.location && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined !text-[14px]">location_on</span>
            {job.location}
          </span>
        )}
        {salary && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined !text-[14px]">payments</span>
            {salary}
          </span>
        )}
        {job.deadline && (
          <span className={`flex items-center gap-1 ${deadlinePast ? 'text-red-500 font-medium' : ''}`}>
            <span className="material-symbols-outlined !text-[14px]">calendar_today</span>
            {deadlinePast ? 'Expired ' : 'Deadline: '}
            {fmtDeadline(job.deadline)}
          </span>
        )}
      </div>

      {/* Skills */}
      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleSkills.map((s) => (
            <span key={s} className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
              {s}
            </span>
          ))}
          {overflow > 0 && (
            <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-500">
              +{overflow} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <Link
          to={`/recruiter/jobs/${job.id}/applicants`}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined !text-[16px]">group</span>
          <span className="font-semibold text-secondary">{job.applicationsCount}</span> applicant{job.applicationsCount !== 1 ? 's' : ''}
        </Link>
        <Link
          to={`/recruiter/jobs/${job.id}/edit`}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Edit &rarr;
        </Link>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
const TABS = ['All', 'Active', 'Draft', 'Closed'];

export default function RecruiterJobs() {
  const navigate = useNavigate();

  const [jobs,          setJobs]          = useState([]);
  const [companyLogo,   setCompanyLogo]   = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState(null);
  const [activeTab,     setActiveTab]     = useState('All');
  const [search,        setSearch]        = useState('');
  const [confirm,       setConfirm]       = useState(null); // { type, jobId, jobTitle }

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const fetchJobs = useCallback(async () => {
    try {
      const [jobsRes, profileRes] = await Promise.all([
        recruiterService.getJobs(),
        recruiterService.getProfile().catch(() => null),
      ]);
      setJobs(jobsRes.data.data || jobsRes.data || []);
      setCompanyLogo(profileRes?.data?.company?.logoUrl || null);
    } catch {
      showToast('Failed to load jobs.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Derived stats
  const total        = jobs.length;
  const activeCount  = jobs.filter((j) => j.isActive && j.visibility !== 'draft').length;
  const draftCount   = jobs.filter((j) => j.visibility === 'draft').length;
  const totalApps    = jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0);

  // Filtered list
  const filtered = jobs.filter((j) => {
    const matchTab = activeTab === 'All'
      ? true
      : activeTab === 'Active'
        ? j.isActive && j.visibility !== 'draft'
        : activeTab === 'Draft'
          ? j.visibility === 'draft'
          : !j.isActive && j.visibility !== 'draft';
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // Handlers
  async function handleToggle(jobId) {
    try {
      const res = await recruiterService.toggleJobStatus(jobId);
      showToast(res.data.message);
      setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, isActive: res.data.isActive } : j));
    } catch {
      showToast('Failed to update job status.', 'error');
    }
  }

  async function handleDelete(jobId) {
    try {
      await recruiterService.deleteJob(jobId);
      showToast('Job deleted successfully.');
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch {
      showToast('Failed to delete job.', 'error');
    }
    setConfirm(null);
  }

  async function handleDuplicate(job) {
    try {
      const payload = {
        title:                `${job.title} (Copy)`,
        department:           job.department,
        employmentType:       job.employmentType,
        workMode:             job.workMode,
        location:             job.location,
        description:          job.description || '',
        responsibilities:     job.responsibilities,
        qualifications:       job.qualifications,
        minimumReadinessScore: job.minimumReadinessScore,
        requiredSkills:       job.skills,
        salaryMin:            job.salaryMin,
        salaryMax:            job.salaryMax,
        deadline:             null,
        visibility:           'draft',
        notifyEligible:       false,
      };
      await recruiterService.createJob(payload);
      showToast('Job duplicated as draft.');
      fetchJobs();
    } catch {
      showToast('Failed to duplicate job.', 'error');
    }
  }

  function requestDelete(job) {
    setConfirm({ type: 'delete', jobId: job.id, jobTitle: job.title });
  }

  return (
    <main className="flex-1 h-full overflow-y-auto scrollbar-hide">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        open={confirm?.type === 'delete'}
        title="Delete Job"
        message={`Are you sure you want to delete "${confirm?.jobTitle}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => handleDelete(confirm.jobId)}
        onCancel={() => setConfirm(null)}
      />

      <div className="flex flex-col max-w-[1200px] mx-auto w-full gap-6 p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-primary text-xs font-semibold uppercase tracking-widest">Job Management</p>
            <h1 className="text-secondary text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Your Jobs</h1>
            <p className="text-slate-500 text-sm">Manage your active postings, drafts, and applications.</p>
          </div>
          <Link
            to="/recruiter/jobs/new"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary hover:bg-primary-dark text-secondary text-sm font-bold transition-all shadow-sm hover:shadow-md self-start sm:self-auto"
          >
            <span className="material-symbols-outlined !text-[18px]">add</span>
            Post New Job
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Jobs',        value: total,       icon: 'work',            colour: 'text-primary' },
            { label: 'Active',            value: activeCount, icon: 'check_circle',    colour: 'text-emerald-600' },
            { label: 'Drafts',            value: draftCount,  icon: 'edit_note',       colour: 'text-amber-600' },
            { label: 'Total Applications', value: totalApps,  icon: 'group',           colour: 'text-indigo-600' },
          ].map(({ label, value, icon, colour }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4 flex items-center gap-3">
              <span className={`material-symbols-outlined !text-[24px] ${colour}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              <div>
                <p className="text-lg font-bold text-secondary leading-none">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-1 bg-white rounded-xl p-1 ring-1 ring-slate-200 shadow-sm self-start">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-primary text-secondary shadow-sm'
                    : 'text-slate-500 hover:text-secondary hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search jobs by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-secondary placeholder:text-slate-400 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Job Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <JobSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-12 flex flex-col items-center gap-4 text-center">
            <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined !text-[32px] text-slate-400">work_off</span>
            </div>
            <div>
              <p className="text-secondary font-bold text-base mb-1">
                {search ? 'No jobs match your search' : activeTab !== 'All' ? `No ${activeTab.toLowerCase()} jobs` : 'No jobs posted yet'}
              </p>
              <p className="text-slate-500 text-sm">
                {search
                  ? 'Try a different keyword.'
                  : 'Post your first job to start finding the best candidates.'}
              </p>
            </div>
            {!search && (
              <Link
                to="/recruiter/jobs/new"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary hover:bg-primary-dark text-secondary text-sm font-bold transition-all shadow-sm mt-2"
              >
                <span className="material-symbols-outlined !text-[18px]">add</span>
                Post New Job
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                companyLogoUrl={companyLogo}
                onEdit={() => navigate(`/recruiter/jobs/${job.id}/edit`)}
                onToggle={() => handleToggle(job.id)}
                onDuplicate={() => handleDuplicate(job)}
                onDelete={() => requestDelete(job)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
