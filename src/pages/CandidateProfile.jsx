import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { recruiterService } from '../services/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function proficiencyLabel(p) {
  if (p >= 85) return 'Expert';
  if (p >= 70) return 'Advanced';
  if (p >= 50) return 'Intermediate';
  return 'Beginner';
}

function assessmentBadge(status) {
  const map = {
    completed: 'bg-green-50 text-green-700 ring-green-600/20',
    passed:    'bg-green-50 text-green-700 ring-green-600/20',
    failed:    'bg-red-50 text-red-700 ring-red-600/20',
    pending:   'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    average:   'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  };
  return map[(status || '').toLowerCase()] || 'bg-slate-100 text-slate-600 ring-slate-300/40';
}

function statusBadge(status) {
  const map = {
    active:   'bg-green-50 text-green-700 ring-green-600/20',
    inactive: 'bg-slate-100 text-slate-500 ring-slate-300/40',
    alumni:   'bg-blue-50 text-blue-700 ring-blue-600/20',
  };
  return map[(status || '').toLowerCase()] || 'bg-slate-100 text-slate-600 ring-slate-300/40';
}

function projectStatusBadge(status) {
  const map = {
    completed: 'bg-green-50 text-green-700 ring-green-600/20',
    ongoing:   'bg-blue-50 text-blue-700 ring-blue-600/20',
    in_progress: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    archived:  'bg-slate-100 text-slate-500 ring-slate-300/40',
  };
  return map[(status || '').toLowerCase()] || 'bg-slate-100 text-slate-600 ring-slate-300/40';
}

function tagLabel(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    if (typeof value.name === 'string' || typeof value.name === 'number') return String(value.name);
    if (typeof value.label === 'string' || typeof value.label === 'number') return String(value.label);
    if (typeof value.value === 'string' || typeof value.value === 'number') return String(value.value);
  }
  return '';
}

// SVG circular gauge — r=42 → circumference ≈ 264
function ScoreGauge({ score }) {
  const circ = 2 * Math.PI * 42;
  const offset = circ * (1 - Math.min(100, Math.max(0, score)) / 100);
  return (
    <div className="relative flex-shrink-0">
      <svg className="size-28 sm:size-36 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="transparent" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="42" fill="transparent"
          stroke="#c6a43f"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="8"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl sm:text-4xl font-bold text-secondary">{Math.round(score)}</span>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
}

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">
      <div className="lg:col-span-4 flex flex-col gap-5">
        <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-6 flex flex-col items-center gap-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="w-40 h-5" />
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-full h-10 rounded-xl" />
          <div className="w-full mt-2 space-y-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="w-full h-4" />)}
          </div>
        </div>
        <Skeleton className="w-full h-32 rounded-2xl" />
      </div>
      <div className="lg:col-span-8 flex flex-col gap-6">
        <Skeleton className="w-full h-36 rounded-2xl" />
        <Skeleton className="w-full h-48 rounded-2xl" />
        <Skeleton className="w-full h-64 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const colors = type === 'success'
    ? 'bg-green-50 border-green-200 text-green-800'
    : 'bg-red-50 border-red-200 text-red-800';
  const icon = type === 'success' ? 'check_circle' : 'error';
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${colors}`}>
      <span className="material-symbols-outlined !text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
        <span className="material-symbols-outlined !text-[18px]">close</span>
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CandidateProfile() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shortlisting, setShortlisting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    recruiterService.getCandidateById(id)
      .then((res) => {
        if (!cancelled) setCandidate(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load candidate profile.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  async function handleShortlist() {
    if (shortlisting) return;
    setShortlisting(true);
    try {
      const res = await recruiterService.shortlistCandidate(id);
      showToast(res.data.message || 'Shortlist updated.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update shortlist.', 'error');
    } finally {
      setShortlisting(false);
    }
  }

  function handleExportCSV() {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const stored = localStorage.getItem('evolvEd_auth');
    const token = stored ? JSON.parse(stored)?.token : null;
    const url = `${apiBase}/recruiter/candidates/${id}/export`;
    // Open in new tab — browser handles download
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate_${id}.csv`;
    a.target = '_blank';
    if (token) {
      // Fetch with auth header and trigger download
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.blob())
        .then((blob) => {
          const bUrl = URL.createObjectURL(blob);
          a.href = bUrl;
          a.click();
          URL.revokeObjectURL(bUrl);
        })
        .catch(() => showToast('Export failed.', 'error'));
    } else {
      a.click();
    }
  }

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <main className="flex-1 h-full w-full overflow-y-auto scrollbar-hide">
      {/* Breadcrumb / back nav */}
      <motion.div 
        initial={{ opacity: 0, y: -16 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-2"
      >
        <nav className="flex items-center gap-1.5 text-sm text-slate-400">
          <Link to="/recruiter/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span className="material-symbols-outlined !text-[14px]">chevron_right</span>
          <Link to="/recruiter/candidates" className="hover:text-primary transition-colors">Candidates</Link>
          {candidate && (
            <>
              <span className="material-symbols-outlined !text-[14px]">chevron_right</span>
              <span className="text-secondary font-medium truncate max-w-[160px]">{candidate.name}</span>
            </>
          )}
        </nav>
        <Link
          to="/recruiter/candidates"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors font-medium mt-2"
        >
          <span className="material-symbols-outlined !text-[18px]">arrow_back</span>
          Back to Candidates
        </Link>
      </motion.div>

      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {/* Error */}
        {error && (
          <div className="max-w-7xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3 text-red-700">
            <span className="material-symbols-outlined !text-[20px]">error</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {loading ? (
          <ProfileSkeleton />
        ) : candidate ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">

            {/* ── Left Column ────────────────────────────────────── */}
            <div className="lg:col-span-4 flex flex-col gap-5">

              {/* Profile Card */}
              <motion.div 
                initial={{ opacity: 0, y: 12 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

                <div className="relative flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="relative mb-4 mt-2">
                    {candidate.avatarUrl ? (
                      <img
                        src={candidate.avatarUrl}
                        alt={candidate.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-primary/30 shadow-md"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary/10 border-4 border-primary/30 shadow-md flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary">{initials(candidate.name)}</span>
                      </div>
                    )}
                    <div
                      className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${candidate.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}
                      title={candidate.status}
                    />
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-secondary mb-1">{candidate.name}</h1>
                  <p className="text-sm text-slate-500 mb-1">
                    {[candidate.department, candidate.yearOfStudy].filter(Boolean).join(' · ')}
                  </p>
                  {candidate.status && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset mb-4 ${statusBadge(candidate.status)}`}>
                      {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                    </span>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 w-full mt-1">
                    <a
                      href={`mailto:${candidate.email}`}
                      className="flex-1 h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-secondary font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined !text-[16px]">mail</span>
                      Send Mail
                    </a>
                    <button
                      onClick={handleShortlist}
                      disabled={shortlisting}
                      className="flex-1 h-10 rounded-xl bg-primary hover:bg-amber-500 text-secondary font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                    >
                      {shortlisting ? (
                        <span className="material-symbols-outlined !text-[16px] animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined !text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                      )}
                      Shortlist
                    </button>
                  </div>
                </div>

                {/* Meta grid */}
                <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 gap-3">
                  {[
                    ['GPA', candidate.gpa ? `${candidate.gpa} / 4.0` : null],
                    ['Location', candidate.location],
                    ['Expected Grad', candidate.expectedGrad ? fmtDate(candidate.expectedGrad) : null],
                    ['Internships', candidate.internships?.length > 0 ? `${candidate.internships.length} Internship${candidate.internships.length !== 1 ? 's' : ''}` : null],
                    ['Certifications', candidate.certifications?.length > 0 ? `${candidate.certifications.length} Certification${candidate.certifications.length !== 1 ? 's' : ''}` : null],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">{k}</span>
                      <span className="text-secondary text-sm font-medium">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Contact */}
                {(candidate.phone || candidate.email || candidate.linkedin || candidate.website) && (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-secondary mb-3">Contact</h4>
                    {candidate.phone && (
                      <div className="flex items-center gap-3 mb-2.5 text-sm text-slate-500">
                        <span className="material-symbols-outlined text-primary !text-[18px]">call</span>
                        <span>{candidate.phone}</span>
                      </div>
                    )}
                    {candidate.email && (
                      <div className="flex items-center gap-3 mb-2.5 text-sm text-slate-500">
                        <span className="material-symbols-outlined text-primary !text-[18px]">mail</span>
                        <a href={`mailto:${candidate.email}`} className="hover:text-primary transition-colors truncate">{candidate.email}</a>
                      </div>
                    )}
                    {candidate.linkedin && (
                      <div className="flex items-center gap-3 mb-2.5 text-sm text-slate-500">
                        <span className="material-symbols-outlined text-primary !text-[18px]">link</span>
                        <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors truncate">
                          {candidate.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      </div>
                    )}
                    {candidate.website && (
                      <div className="flex items-center gap-3 mb-2.5 text-sm text-slate-500">
                        <span className="material-symbols-outlined text-primary !text-[18px]">language</span>
                        <a href={candidate.website} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors truncate">
                          {candidate.website.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Bio */}
                {candidate.bio && (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-secondary mb-2">About</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{candidate.bio}</p>
                  </div>
                )}
              </motion.div>

              {/* Download Report Card */}
              <motion.div 
                initial={{ opacity: 0, y: 12 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4, delay: 0.17 }}
                className="bg-secondary rounded-2xl p-5 sm:p-6 flex flex-col items-start gap-4 relative overflow-hidden shadow-md"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined !text-[20px] text-primary">assessment</span>
                    <h3 className="font-bold text-base text-white">Full Candidate Report</h3>
                  </div>
                  <p className="text-sm text-slate-400">Download a CSV summary of this candidate's full profile.</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="w-full h-10 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined !text-[18px]">download</span>
                  Download CSV Report
                </button>
              </motion.div>
            </div>

            {/* ── Right Column ───────────────────────────────────── */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Readiness Score */}
              <motion.div 
                initial={{ opacity: 0, y: 12 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
              >
                <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
                <div className="flex-1 z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary !text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <span className="text-xs font-bold text-primary tracking-widest uppercase">EvolvEd Readiness Score</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-secondary mb-2">{candidate.matchLevel}</h2>
                  {candidate.percentile && (
                    <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                      {candidate.name.split(' ')[0]} ranks in the top <strong>{100 - candidate.percentile}%</strong> of all candidates on the platform.
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {candidate.readinessScore >= 70 && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        Placement Ready
                      </span>
                    )}
                    {candidate.percentile && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary ring-1 ring-inset ring-primary/30">
                        Top {100 - candidate.percentile}%
                      </span>
                    )}
                  </div>

                  {/* Score breakdown mini-bars */}
                  {candidate.scoreBreakdown && (
                    <div className="mt-5 space-y-2">
                      {[
                        ['Technical Skills', candidate.scoreBreakdown.technicalSkills, 40],
                        ['Readiness Score', candidate.readinessScore * 0.20, 20],
                        ['Projects', candidate.scoreBreakdown.projects, 10],
                        ['Internships', candidate.scoreBreakdown.internships, 15],
                        ['Certifications', candidate.scoreBreakdown.certifications, 5],
                        ['Assessments', candidate.scoreBreakdown.assessments, 10],
                      ].map(([label, val, weight]) => (
                        <div key={label}>
                          <div className="flex justify-between mb-0.5">
                            <span className="text-xs text-slate-400">{label}</span>
                            <span className="text-xs font-semibold text-secondary">{Math.round(val ?? 0)}<span className="text-slate-400 font-normal">/{weight}</span></span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, ((val ?? 0) / weight) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <ScoreGauge score={candidate.readinessScore} />
              </motion.div>

              {/* Skills */}
              {(candidate.technicalSkills?.length > 0 || candidate.softSkills?.length > 0) && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, delay: 0.17 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary !text-[20px]">code_blocks</span>
                    <h3 className="text-lg font-bold text-secondary">Skills Proficiency</h3>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6">
                    {candidate.technicalSkills?.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mb-5">
                        {candidate.technicalSkills.map((skill) => (
                          <div key={skill.name}>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-sm font-semibold text-secondary">{skill.name}</span>
                              <span className="text-xs text-primary font-bold">
                                {skill.level || proficiencyLabel(skill.proficiency)}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-700"
                                style={{ width: `${skill.proficiency}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {candidate.softSkills?.length > 0 && (
                      <div className={candidate.technicalSkills?.length > 0 ? 'pt-5 border-t border-slate-100' : ''}>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Soft Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.softSkills
                            .map((s) => tagLabel(s).trim())
                            .filter(Boolean)
                            .map((label, index) => (
                              <span key={`${label}-${index}`} className="px-3 py-1 bg-slate-100 rounded-lg text-sm text-slate-600 border border-slate-200">{label}</span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.section>
              )}

              {/* Projects */}
              {candidate.projects?.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, delay: 0.24 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary !text-[20px]">folder_open</span>
                    <h3 className="text-lg font-bold text-secondary">Featured Projects</h3>
                    <span className="ml-auto text-xs text-slate-400 font-medium">{candidate.projects.length} project{candidate.projects.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {candidate.projects.map((p) => (
                      <div key={p.id} className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 overflow-hidden flex flex-col group hover:ring-primary/40 transition-all duration-300">
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-sm sm:text-base font-bold text-secondary leading-tight">{p.title}</h4>
                            {p.status && (
                              <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ${projectStatusBadge(p.status)}`}>
                                {p.status.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          {p.description && (
                            <p className="text-xs sm:text-sm text-slate-500 mb-3 line-clamp-3 flex-1 leading-relaxed">{p.description}</p>
                          )}
                          {/* Tech stack */}
                          {p.techStack?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {(Array.isArray(p.techStack) ? p.techStack : p.techStack.split(','))
                                .slice(0, 5)
                                .map((t) => (
                                  <span key={t} className="text-[10px] font-bold uppercase px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded">
                                    {t.trim()}
                                  </span>
                                ))}
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-auto">
                            {p.githubUrl && (
                              <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined !text-[14px]">code</span> GitHub
                              </a>
                            )}
                            {p.liveUrl && (
                              <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined !text-[14px]">open_in_new</span> Live
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Internships */}
              {candidate.internships?.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary !text-[20px]">work</span>
                    <h3 className="text-lg font-bold text-secondary">Work Experience</h3>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6 divide-y divide-slate-100">
                    {candidate.internships.map((internship) => (
                      <div key={internship.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div>
                            <p className="text-sm font-bold text-secondary">{internship.role}</p>
                            <p className="text-sm text-primary font-medium">{internship.company}</p>
                          </div>
                          <span className="text-xs text-slate-400 whitespace-nowrap mt-0.5">
                            {fmtDate(internship.startDate)} – {internship.endDate ? fmtDate(internship.endDate) : 'Present'}
                          </span>
                        </div>
                        {internship.description && (
                          <p className="text-sm text-slate-500 leading-relaxed">{internship.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Certifications */}
              {candidate.certifications?.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, delay: 0.38 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary !text-[20px]">workspace_premium</span>
                    <h3 className="text-lg font-bold text-secondary">Certifications</h3>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {candidate.certifications.map((cert) => (
                        <div key={cert.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                            <span className="material-symbols-outlined text-primary !text-[18px]">verified</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-secondary leading-tight">{cert.name}</p>
                            {cert.issuer && <p className="text-xs text-slate-500 mt-0.5">{cert.issuer}</p>}
                            <p className="text-xs text-slate-400 mt-1">{fmtDate(cert.issueDate)}</p>
                            {cert.credentialUrl && (
                              <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline font-medium mt-1 inline-block">
                                View Credential
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Assessment History */}
              {candidate.assessmentHistory?.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, delay: 0.45 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary !text-[20px]">terminal</span>
                    <h3 className="text-lg font-bold text-secondary">LeetCode Stats</h3>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        ['Total Solved', candidate.leetcodeProfile.totalSolved ?? '—'],
                        ['Easy', candidate.leetcodeProfile.easySolved ?? '—'],
                        ['Medium', candidate.leetcodeProfile.mediumSolved ?? '—'],
                        ['Hard', candidate.leetcodeProfile.hardSolved ?? '—'],
                      ].map(([label, val]) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                          <p className="text-2xl font-bold text-secondary">{val}</p>
                          <p className="text-xs text-slate-400 mt-1">{label}</p>
                        </div>
                      ))}
                    </div>
                    {(candidate.leetcodeProfile.streak || candidate.leetcodeProfile.acceptanceRate) && (
                      <div className="mt-4 flex flex-wrap gap-4">
                        {candidate.leetcodeProfile.streak && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="material-symbols-outlined text-amber-500 !text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                            <span className="font-medium">{candidate.leetcodeProfile.streak}-day streak</span>
                          </div>
                        )}
                        {candidate.leetcodeProfile.acceptanceRate && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="material-symbols-outlined text-green-500 !text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            <span className="font-medium">{candidate.leetcodeProfile.acceptanceRate}% acceptance rate</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* GitHub Stats */}
              {candidate.githubProfile && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary !text-[20px]">code</span>
                    <h3 className="text-lg font-bold text-secondary">GitHub Activity</h3>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      {[
                        ['Repositories', candidate.githubProfile.publicRepos ?? '—'],
                        ['Total Stars', candidate.githubProfile.totalStars ?? '—'],
                        ['Contributions', candidate.githubProfile.contributions ?? '—'],
                      ].map(([label, val]) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                          <p className="text-2xl font-bold text-secondary">{val}</p>
                          <p className="text-xs text-slate-400 mt-1">{label}</p>
                        </div>
                      ))}
                    </div>
                    {candidate.githubProfile.topLanguages?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Top Languages</p>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(candidate.githubProfile.topLanguages)
                            ? candidate.githubProfile.topLanguages
                            : [candidate.githubProfile.topLanguages]
                          )
                            .map((lang) => tagLabel(lang).trim())
                            .filter(Boolean)
                            .map((label, index) => (
                              <span key={`${label}-${index}`} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20">
                                {label}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.section>
              )}

              {/* Events / Achievements */}
              {candidate.events?.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, delay: 0.55 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary !text-[20px]">emoji_events</span>
                    <h3 className="text-lg font-bold text-secondary">Events & Achievements</h3>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-5 sm:p-6 space-y-4">
                    {candidate.events.map((ev, i) => (
                      <motion.div 
                        key={ev.id} 
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, y: 8 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.3, delay: 0.55 + i * 0.05 }}
                      >
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-primary !text-[18px]">
                            {ev.type === 'hackathon' ? 'code' : ev.type === 'workshop' ? 'school' : 'emoji_events'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-secondary">{ev.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {ev.type && <span className="text-xs text-slate-400 capitalize">{ev.type.replace('_', ' ')}</span>}
                            {ev.achievement && ev.achievement !== 'participant' && (
                              <span className="text-xs font-bold text-primary capitalize">· {ev.achievement.replace('_', ' ')}</span>
                            )}
                            {ev.date && <span className="text-xs text-slate-400">· {fmtDate(ev.date)}</span>}
                          </div>
                          {ev.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ev.description}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

            </div>
          </div>
        ) : null}
      </div>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </main>
  );
}
