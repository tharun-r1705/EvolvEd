import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar.jsx';
import { studentService } from '../services/api.js';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'general',      label: 'General',       color: 'bg-slate-100 text-slate-700' },
  { value: 'ai_ml',        label: 'AI / ML',       color: 'bg-purple-100 text-purple-700' },
  { value: 'full_stack',   label: 'Full Stack',    color: 'bg-blue-100 text-blue-700' },
  { value: 'frontend',     label: 'Frontend',      color: 'bg-cyan-100 text-cyan-700' },
  { value: 'backend',      label: 'Backend',       color: 'bg-green-100 text-green-700' },
  { value: 'data_science', label: 'Data Science',  color: 'bg-orange-100 text-orange-700' },
  { value: 'devops',       label: 'DevOps',        color: 'bg-red-100 text-red-700' },
  { value: 'mobile',       label: 'Mobile',        color: 'bg-pink-100 text-pink-700' },
  { value: 'embedded',     label: 'Embedded',      color: 'bg-yellow-100 text-yellow-800' },
  { value: 'custom',       label: 'Custom',        color: 'bg-teal-100 text-teal-700' },
];

function getCategoryMeta(value) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[0];
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

function ResumeCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-24 rounded-full" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg ml-4" />
      </div>
      <Skeleton className="h-3 w-32" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Upload Form ──────────────────────────────────────────────────────────────

function UploadForm({ onSuccess, onCancel }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('general');
  const [isDefault, setIsDefault] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB.');
      return;
    }
    setError('');
    setFile(f);
    if (!name) setName(f.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ').trim());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { setError('Please select a PDF file.'); return; }
    if (!name.trim()) { setError('Please enter a name for this resume.'); return; }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('name', name.trim());
      formData.append('category', category);
      formData.append('isDefault', isDefault ? 'true' : 'false');
      await studentService.uploadResume(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-bold text-secondary">Upload New Resume</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/50 transition-colors p-6 text-center"
        >
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
          {file ? (
            <div className="flex items-center justify-center gap-3 text-green-700">
              <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
              <div className="text-left">
                <p className="text-sm font-semibold">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ) : (
            <>
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">upload_file</span>
              <p className="text-sm font-medium text-slate-600">Click to select a PDF</p>
              <p className="text-xs text-slate-400 mt-1">PDF only · Max 5 MB</p>
            </>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Resume Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Software Engineer Resume"
            maxLength={80}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-secondary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Set as default */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-primary accent-primary"
          />
          <span className="text-sm text-slate-600">Set as default resume</span>
        </label>

        {error && (
          <p className="text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={uploading}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-secondary hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : 'Upload Resume'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ resume, onSuccess, onClose }) {
  const [name, setName] = useState(resume.name);
  const [category, setCategory] = useState(resume.category);
  const [isDefault, setIsDefault] = useState(resume.isDefault);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await studentService.updateResume(resume.id, { name: name.trim(), category, isDefault });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-secondary">Edit Resume</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Resume Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-primary"
            />
            <span className="text-sm text-slate-600">Set as default resume</span>
          </label>
          {error && <p className="text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-secondary hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-secondary transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ resume, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
          <span className="material-symbols-outlined text-red-600">delete</span>
        </div>
        <h3 className="text-base font-bold text-secondary mb-2">Delete Resume?</h3>
        <p className="text-sm text-slate-500 mb-6">
          "<span className="font-semibold text-secondary">{resume.name}</span>" will be permanently deleted and cannot be recovered.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
          <button onClick={onCancel} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Resume Card ──────────────────────────────────────────────────────────────

function ResumeCard({ resume, onEdit, onDelete, onSetDefault, settingDefault }) {
  const catMeta = getCategoryMeta(resume.category);

  return (
    <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 transition-shadow hover:shadow-md ${resume.isDefault ? 'ring-primary/40' : 'ring-slate-100'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <span className="material-symbols-outlined text-[22px]">picture_as_pdf</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-secondary truncate max-w-[200px]">{resume.name}</h3>
              {resume.isDefault && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[12px]">star</span>Default
                </span>
              )}
            </div>
            <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 ${catMeta.color}`}>
              {catMeta.label}
            </span>
          </div>
        </div>
        <a
          href={resume.url}
          target="_blank"
          rel="noopener noreferrer"
          title="Download / View"
          className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">open_in_new</span>
        </a>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Uploaded {formatDate(resume.uploadedAt)}
        {resume.updatedAt !== resume.uploadedAt && ` · Updated ${formatDate(resume.updatedAt)}`}
      </p>

      <div className="flex flex-wrap gap-2">
        <a
          href={resume.url}
          download
          className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">download</span>Download
        </a>
        {!resume.isDefault && (
          <button
            onClick={() => onSetDefault(resume.id)}
            disabled={settingDefault}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-primary/20 transition-colors disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[14px]">star</span>Set Default
          </button>
        )}
        <button
          onClick={() => onEdit(resume)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">edit</span>Edit
        </button>
        <button
          onClick={() => onDelete(resume)}
          className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">delete</span>Delete
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentService.getResumes();
      setResumes(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resumes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await studentService.deleteResume(deleteTarget.id);
      setDeleteTarget(null);
      fetchResumes();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleSetDefault(id) {
    setSettingDefault(true);
    try {
      await studentService.updateResume(id, { isDefault: true });
      fetchResumes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update.');
    } finally {
      setSettingDefault(false);
    }
  }

  return (
    <div className="flex h-screen w-full flex-row overflow-hidden bg-background-light">
      <StudentSidebar />

      <main className="flex h-full flex-1 flex-col overflow-y-auto bg-background-light p-4 md:p-8">
        <div className="mx-auto w-full max-w-4xl">

          {/* Header */}
          <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link to="/student" className="text-slate-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </Link>
                <h1 className="text-3xl font-black tracking-tight text-secondary">Resume Manager</h1>
              </div>
              <p className="text-slate-500 ml-8">
                Store and manage your resumes — up to 10 per account.
              </p>
            </div>
            {!showUpload && resumes.length < 10 && (
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-secondary shadow-md hover:bg-primary/90 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">upload</span>
                Upload Resume
              </button>
            )}
          </header>

          {/* Upload Form */}
          {showUpload && (
            <div className="mb-6">
              <UploadForm
                onSuccess={() => { setShowUpload(false); fetchResumes(); }}
                onCancel={() => setShowUpload(false)}
              />
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => <ResumeCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error_outline</span>
              <h2 className="text-lg font-bold text-secondary mb-2">Failed to load resumes</h2>
              <p className="text-slate-500 mb-6">{error}</p>
              <button
                onClick={fetchResumes}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-secondary hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
                <span className="material-symbols-outlined text-4xl text-slate-400">description</span>
              </div>
              <h2 className="text-lg font-bold text-secondary mb-2">No resumes uploaded yet</h2>
              <p className="text-slate-500 mb-6 max-w-sm">
                Upload your first resume to share with recruiters and track different versions for different roles.
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-secondary hover:bg-primary/90 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">upload</span>
                Upload Resume
              </button>
            </div>
          ) : (
            <>
              {/* Count indicator */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  <span className="font-bold text-secondary">{resumes.length}</span> / 10 resumes
                </p>
                {resumes.length >= 10 && (
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                    Limit reached — delete one to upload more
                  </span>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {resumes.map((r) => (
                  <ResumeCard
                    key={r.id}
                    resume={r}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                    onSetDefault={handleSetDefault}
                    settingDefault={settingDefault}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          resume={editTarget}
          onSuccess={() => { setEditTarget(null); fetchResumes(); }}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <DeleteConfirm
          resume={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
