import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);
  const cls = type === 'success'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : 'bg-red-50 border-red-200 text-red-800';
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${cls}`}>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose}>
        <span className="material-symbols-outlined text-[18px] opacity-60 hover:opacity-100">close</span>
      </button>
    </div>
  );
}

// ─── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-6 max-w-sm w-full">
        <h3 className="text-base font-bold text-secondary mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-10 rounded-xl border border-slate-200 text-secondary text-sm font-semibold hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-colors ${danger ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-primary hover:bg-primary/90 text-secondary'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function initials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function fmtDateFull(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusBadgeCls(status) {
  const m = {
    active:   'bg-green-50 text-green-700 ring-green-600/20',
    inactive: 'bg-slate-100 text-slate-500 ring-slate-300/40',
    alumni:   'bg-blue-50 text-blue-700 ring-blue-600/20',
    placed:   'bg-purple-50 text-purple-700 ring-purple-600/20',
  };
  return m[(status || '').toLowerCase()] || 'bg-slate-100 text-slate-600 ring-slate-300/40';
}

function assessmentBadgeCls(status) {
  const m = {
    completed: 'bg-green-50 text-green-700 ring-green-600/20',
    passed:    'bg-green-50 text-green-700 ring-green-600/20',
    failed:    'bg-red-50 text-red-700 ring-red-600/20',
    pending:   'bg-amber-50 text-amber-700 ring-amber-600/20',
    average:   'bg-amber-50 text-amber-700 ring-amber-600/20',
  };
  return m[(status || '').toLowerCase()] || 'bg-slate-100 text-slate-600 ring-slate-300/40';
}

function proficiencyLabel(p) {
  if (p >= 85) return 'Expert';
  if (p >= 70) return 'Advanced';
  if (p >= 50) return 'Intermediate';
  return 'Beginner';
}

// ─── SVG Gauge ────────────────────────────────────────────────────────────────
function ScoreGauge({ score }) {
  const circ = 2 * Math.PI * 42;
  const offset = circ * (1 - Math.min(100, Math.max(0, score || 0)) / 100);
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
        <span className="text-3xl sm:text-4xl font-bold text-secondary">{Math.round(score || 0)}</span>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Sk({ className }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
}

function DetailSkeleton() {
  return (
    <main className="flex-1 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Sk className="h-5 w-40 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Sk className="h-[500px] rounded-2xl" />
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Sk className="h-48 rounded-2xl" />
            <Sk className="h-48 rounded-2xl" />
            <Sk className="h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children, empty, emptyText = 'No data' }) {
  return (
    <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
        <h3 className="font-bold text-secondary text-sm">{title}</h3>
      </div>
      <div className="p-6">
        {empty
          ? <p className="text-slate-400 text-sm text-center py-4">{emptyText}</p>
          : children
        }
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ open, student, onClose, onSave }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setForm({
        fullName:    student.fullName || student.name || '',
        department:  student.department || '',
        yearOfStudy: student.yearOfStudy || '',
        gpa:         student.gpa != null ? String(student.gpa) : '',
        status:      student.status || 'active',
      });
    }
  }, [student, open]);

  if (!open) return null;

  function field(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        fullName:    form.fullName,
        department:  form.department,
        yearOfStudy: form.yearOfStudy ? parseInt(form.yearOfStudy) : undefined,
        gpa:         form.gpa ? parseFloat(form.gpa) : undefined,
        status:      form.status,
      };
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all bg-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-secondary">Edit Student</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-secondary hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
            <input className={inputCls} value={form.fullName} onChange={field('fullName')} placeholder="Full name" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
            <input className={inputCls} value={form.department} onChange={field('department')} placeholder="Department" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Year of Study</label>
              <input className={inputCls} type="number" min="1" max="4" value={form.yearOfStudy} onChange={field('yearOfStudy')} placeholder="1–4" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">GPA</label>
              <input className={inputCls} type="number" step="0.01" min="0" max="10" value={form.gpa} onChange={field('gpa')} placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
            <select className={inputCls} value={form.status} onChange={field('status')}>
              {['active', 'inactive', 'placed', 'alumni'].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-secondary text-sm font-semibold hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-10 rounded-xl bg-primary text-secondary text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error,   setError]       = useState(null);
  const [toast,   setToast]       = useState(null);
  const [showEdit,     setShowEdit]     = useState(false);
  const [showDelete,   setShowDelete]   = useState(false);
  const [showToggle,   setShowToggle]   = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getStudentById(id);
      setStudent(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load student');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleSaveEdit(payload) {
    try {
      await adminService.updateStudent(id, payload);
      showToast('Student updated');
      setShowEdit(false);
      load();
    } catch (e) {
      showToast(e.response?.data?.message || 'Update failed', 'error');
    }
  }

  async function handleDelete() {
    setActionLoading(true);
    try {
      await adminService.deleteStudent(id);
      showToast('Student deleted');
      navigate('/admin/students');
    } catch (e) {
      showToast(e.response?.data?.message || 'Delete failed', 'error');
      setActionLoading(false);
      setShowDelete(false);
    }
  }

  async function handleToggleStatus() {
    if (!student) return;
    setActionLoading(true);
    const isActive = student.status !== 'inactive';
    try {
      await adminService.toggleUserStatus(student.userId, { isActive: !isActive });
      showToast(`Student ${isActive ? 'deactivated' : 'activated'}`);
      setShowToggle(false);
      load();
    } catch (e) {
      showToast(e.response?.data?.message || 'Status update failed', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <DetailSkeleton />;

  if (error || !student) {
    return (
      <main className="flex-1 h-full overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-red-400 mb-3 block">error_outline</span>
          <p className="text-secondary font-semibold mb-1">{error || 'Student not found'}</p>
          <Link to="/admin/students" className="mt-4 inline-block text-sm text-primary hover:underline">Back to Students</Link>
        </div>
      </main>
    );
  }

  const {
    fullName, studentId, email, department, yearOfStudy, gpa,
    readinessScore, status, avatarUrl, rank,
    skills = [], projects = [], internships = [],
    certifications = [], assessments = [], scoreBreakdown = {},
    leetCode, gitHub,
  } = student;

  const name = fullName || '—';
  const isActive = status !== 'inactive';
  const techSkills = skills.filter((sk) => sk.type === 'tech' || !sk.type).slice(0, 10);
  const softSkills = skills.filter((sk) => sk.type === 'soft');

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <EditModal
        open={showEdit}
        student={student}
        onClose={() => setShowEdit(false)}
        onSave={handleSaveEdit}
      />

      <ConfirmModal
        open={showDelete}
        title="Delete Student"
        message={`Permanently delete ${name}? This cannot be undone.`}
        confirmLabel={actionLoading ? 'Deleting…' : 'Delete'}
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />

      <ConfirmModal
        open={showToggle}
        title={isActive ? 'Deactivate Student' : 'Activate Student'}
        message={isActive ? `Deactivate ${name}? They won't be able to log in.` : `Reactivate ${name}?`}
        confirmLabel={actionLoading ? 'Updating…' : isActive ? 'Deactivate' : 'Activate'}
        danger={isActive}
        onConfirm={handleToggleStatus}
        onCancel={() => setShowToggle(false)}
      />

      <main className="flex-1 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link to="/admin/students" className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Students
            </Link>
            <span>/</span>
            <span className="text-secondary font-medium truncate max-w-[200px]">{name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ─── Left Column ─────────────────────────────────── */}
            <div className="flex flex-col gap-5">

              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-6 flex flex-col items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={name} className="size-24 rounded-full object-cover ring-4 ring-primary/20" />
                    : (
                      <div className="size-24 rounded-full bg-primary/10 ring-4 ring-primary/20 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary">{initials(name)}</span>
                      </div>
                    )
                  }
                  {rank && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-secondary text-xs font-bold px-2 py-0.5 rounded-full shadow">
                      #{rank}
                    </div>
                  )}
                </div>

                {/* Name + status */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-secondary">{name}</h2>
                  <p className="text-slate-500 text-sm mt-0.5">{email || '—'}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeCls(status)}`}>
                      {status || 'active'}
                    </span>
                  </div>
                </div>

                {/* Gauge */}
                <ScoreGauge score={readinessScore || 0} />

                {/* Details grid */}
                <div className="w-full grid grid-cols-2 gap-3 text-sm">
                  {[
                    { icon: 'badge',       label: 'Student ID', value: studentId || '—' },
                    { icon: 'apartment',   label: 'Department', value: department || '—' },
                    { icon: 'calendar_today', label: 'Year',    value: yearOfStudy ? `Year ${yearOfStudy}` : '—' },
                    { icon: 'school',      label: 'GPA',        value: gpa != null ? gpa.toFixed(2) : '—' },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-outlined text-slate-400 text-[14px]">{icon}</span>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                      </div>
                      <p className="text-secondary font-semibold text-xs leading-tight">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Score breakdown */}
                {Object.keys(scoreBreakdown).length > 0 && (
                  <div className="w-full">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Score Breakdown</p>
                    <div className="flex flex-col gap-2">
                      {Object.entries(scoreBreakdown).map(([key, val]) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-semibold text-secondary">{Math.round(val || 0)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="w-full flex flex-col gap-2">
                  <button
                    onClick={() => setShowEdit(true)}
                    className="w-full h-10 bg-primary text-secondary rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit Student
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowToggle(true)}
                      className="h-9 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setShowDelete(true)}
                      className="h-9 bg-white border border-red-200 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* ─── Right Column ─────────────────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Skills */}
              <SectionCard
                title="Technical Skills"
                icon="code"
                empty={techSkills.length === 0}
                emptyText="No technical skills recorded"
              >
                <div className="flex flex-wrap gap-2">
                  {techSkills.map((sk) => (
                    <div key={sk.id || sk.name} className="flex flex-col items-start bg-slate-50 rounded-xl px-3 py-2 gap-1 min-w-[100px]">
                      <span className="text-sm font-semibold text-secondary">{sk.name}</span>
                      <div className="w-full">
                        <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                          <div className="h-1 rounded-full bg-primary" style={{ width: `${sk.proficiency || 0}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{proficiencyLabel(sk.proficiency)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {softSkills.length > 0 && (
                <SectionCard title="Soft Skills" icon="psychology">
                  <div className="flex flex-wrap gap-2">
                    {softSkills.map((sk) => (
                      <span key={sk.id || sk.name} className="bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 rounded-full px-3 py-1 text-xs font-medium">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Projects */}
              <SectionCard
                title={`Projects (${projects.length})`}
                icon="rocket_launch"
                empty={projects.length === 0}
                emptyText="No projects"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((p) => (
                    <div key={p.id} className="border border-slate-200 rounded-xl p-4 hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-secondary text-sm leading-tight">{p.title}</h4>
                        <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ring-1 ring-inset ${
                          p.status === 'completed'
                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                            : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                        }`}>{p.status || 'ongoing'}</span>
                      </div>
                      {p.description && <p className="text-xs text-slate-500 line-clamp-2 mb-2">{p.description}</p>}
                      {p.techStack?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {p.techStack.slice(0, 5).map((t) => (
                            <span key={t} className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Internships */}
              {internships.length > 0 && (
                <SectionCard title={`Internships (${internships.length})`} icon="work">
                  <div className="flex flex-col gap-3">
                    {internships.map((i) => (
                      <div key={i.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="size-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">business</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-secondary">{i.role}</p>
                          <p className="text-xs text-slate-500">{i.company}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {fmtDate(i.startDate)} — {i.endDate ? fmtDate(i.endDate) : 'Present'}
                          </p>
                        </div>
                        {i.stipend && (
                          <span className="text-xs font-semibold text-emerald-600 shrink-0">₹{i.stipend}/mo</span>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Certifications */}
              {certifications.length > 0 && (
                <SectionCard title={`Certifications (${certifications.length})`} icon="workspace_premium">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {certifications.map((c) => (
                      <div key={c.id} className="border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-secondary leading-tight">{c.title}</p>
                          <p className="text-xs text-slate-500">{c.issuingOrg}</p>
                          {c.issueDate && <p className="text-xs text-slate-400 mt-0.5">{fmtDate(c.issueDate)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Assessments */}
              <SectionCard
                title={`Assessments (${assessments.length})`}
                icon="quiz"
                empty={assessments.length === 0}
                emptyText="No assessments taken"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 text-left font-semibold">Assessment</th>
                        <th className="pb-3 text-left font-semibold hidden sm:table-cell">Date</th>
                        <th className="pb-3 text-right font-semibold">Score</th>
                        <th className="pb-3 text-right font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assessments.map((a) => (
                        <tr key={a.id}>
                          <td className="py-3 text-secondary font-medium">{a.title || a.type || '—'}</td>
                          <td className="py-3 text-slate-500 hidden sm:table-cell">{fmtDateFull(a.completedAt || a.createdAt)}</td>
                          <td className="py-3 text-right font-semibold text-secondary">
                            {a.score != null ? `${Math.round(a.score)}%` : '—'}
                          </td>
                          <td className="py-3 text-right">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${assessmentBadgeCls(a.status)}`}>
                              {a.status || '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              {/* Coding Profiles */}
              {(leetCode || gitHub) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {leetCode && (
                    <SectionCard title="LeetCode" icon="code">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        {[
                          { label: 'Easy',   val: leetCode.easySolved,   cls: 'text-emerald-600' },
                          { label: 'Medium', val: leetCode.mediumSolved, cls: 'text-amber-600' },
                          { label: 'Hard',   val: leetCode.hardSolved,   cls: 'text-red-600' },
                        ].map(({ label, val, cls }) => (
                          <div key={label} className="bg-slate-50 rounded-xl p-3">
                            <p className={`text-xl font-bold ${cls}`}>{val ?? '—'}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>
                      {leetCode.totalSolved != null && (
                        <p className="text-xs text-slate-500 mt-3 text-center">
                          <span className="font-bold text-secondary">{leetCode.totalSolved}</span> total solved
                          {leetCode.ranking ? ` · Rank #${leetCode.ranking.toLocaleString()}` : ''}
                        </p>
                      )}
                    </SectionCard>
                  )}
                  {gitHub && (
                    <SectionCard title="GitHub" icon="terminal">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Repos',   val: gitHub.publicRepos },
                          { label: 'Stars',   val: gitHub.totalStars },
                          { label: 'Forks',   val: gitHub.totalForks },
                          { label: 'Commits', val: gitHub.totalCommits },
                        ].map(({ label, val }) => (
                          <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-xl font-bold text-secondary">{val ?? '—'}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>
                      {gitHub.username && (
                        <p className="text-xs text-slate-500 mt-3 text-center">
                          @{gitHub.username}
                          {gitHub.followers != null ? ` · ${gitHub.followers} followers` : ''}
                        </p>
                      )}
                    </SectionCard>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
