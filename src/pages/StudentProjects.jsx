import React, { useState, useEffect, useRef, useCallback } from 'react';
import { studentService } from '../services/api.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const PROJECT_STATUSES = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
];

const TECH_SUGGESTIONS = [
  'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'FastAPI',
  'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'C#',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Tailwind CSS', 'Prisma',
  'GraphQL', 'REST API', 'WebSockets', 'TensorFlow', 'PyTorch', 'Flutter', 'Swift',
];

// ─── Utility ──────────────────────────────────────────────────────────────────

function getApiError(err) {
  return (
    err?.response?.data?.errors?.[0]?.message ||
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    'Something went wrong.'
  );
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const icon = type === 'success' ? 'check_circle' : 'error';

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 ${bg} text-white px-5 py-3 rounded-xl shadow-xl max-w-sm animate-fadeIn`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
}

// ─── Tech Stack Tag Input ──────────────────────────────────────────────────────

function TechTagInput({ tags, onChange }) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapRef = useRef(null);

  const filtered = TECH_SUGGESTIONS.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  ).slice(0, 6);

  function addTag(tag) {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 20) {
      onChange([...tags, trimmed]);
    }
    setInput('');
    setShowSuggestions(false);
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  }

  useEffect(() => {
    function clickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSuggestions(false);
    }
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <div className="min-h-[42px] flex flex-wrap gap-1.5 items-center px-3 py-2 border border-slate-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full"
          >
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>close</span>
            </button>
          </span>
        ))}
        <input
          type="text"
          className="flex-1 min-w-[120px] outline-none text-sm text-slate-700 bg-transparent"
          placeholder={tags.length === 0 ? 'Type tech and press Enter...' : ''}
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {showSuggestions && input && filtered.length > 0 && (
        <ul className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {filtered.map((s) => (
            <li
              key={s}
              className="px-4 py-2 text-sm text-slate-700 hover:bg-primary/5 cursor-pointer"
              onMouseDown={() => addTag(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Project Modal ─────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: '', description: '', techStack: [], url: '', githubUrl: '',
  status: 'in_progress', startDate: '', endDate: '',
};

function ProjectModal({ project, onClose, onSave }) {
  const isEdit = !!project?.id;
  const [form, setForm] = useState(
    project
      ? {
          title: project.title || '',
          description: project.description || '',
          techStack: project.techStack || [],
          url: project.url || '',
          githubUrl: project.githubUrl || '',
          status: project.status || 'in_progress',
          startDate: project.startDate ? project.startDate.slice(0, 10) : '',
          endDate: project.endDate ? project.endDate.slice(0, 10) : '',
        }
      : { ...EMPTY_FORM }
  );
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(project?.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        techStack: form.techStack,
        url: form.url.trim() || null,
        githubUrl: form.githubUrl.trim() || null,
        status: form.status,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      };

      let savedProject;
      if (isEdit) {
        const res = await studentService.updateProject(project.id, payload);
        savedProject = res.data.project;
      } else {
        const res = await studentService.addProject(payload);
        savedProject = res.data.project;
      }

      // Upload image if selected
      if (imageFile && savedProject?.id) {
        const fd = new FormData();
        fd.append('projectImage', imageFile);
        const imgRes = await studentService.uploadProjectImage(savedProject.id, fd);
        savedProject = imgRes.data.project || savedProject;
      }

      onSave(savedProject, isEdit ? 'update' : 'add');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-secondary">
            {isEdit ? 'Edit Project' : 'Add Project'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="e.g. AI-Powered Resume Builder"
              value={form.title}
              onChange={(e) => handleField('title', e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              rows={4}
              placeholder="Describe what this project does, your role, and impact..."
              value={form.description}
              onChange={(e) => handleField('description', e.target.value)}
              maxLength={2000}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{form.description.length}/2000</p>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tech Stack</label>
            <TechTagInput tags={form.techStack} onChange={(v) => handleField('techStack', v)} />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Live URL</label>
              <input
                type="url"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="https://myproject.com"
                value={form.url}
                onChange={(e) => handleField('url', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">GitHub URL</label>
              <input
                type="url"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="https://github.com/user/repo"
                value={form.githubUrl}
                onChange={(e) => handleField('githubUrl', e.target.value)}
              />
            </div>
          </div>

          {/* Status + Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                value={form.status}
                onChange={(e) => handleField('status', e.target.value)}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={form.startDate}
                onChange={(e) => handleField('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={form.endDate}
                onChange={(e) => handleField('endDate', e.target.value)}
                min={form.startDate || undefined}
              />
            </div>
          </div>

          {/* Screenshot */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Screenshot</label>
            {imagePreview ? (
              <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-36">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-3xl text-slate-400">add_photo_alternate</span>
                <span className="text-xs text-slate-500">Click to upload image (JPG, PNG, WebP, max 5MB)</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold bg-primary text-secondary rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
            {isEdit ? 'Save Changes' : 'Add Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ projectTitle, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-red-600">delete</span>
          </div>
          <div>
            <p className="font-bold text-slate-800">Delete Project</p>
            <p className="text-sm text-slate-500">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-700">
          Are you sure you want to delete <span className="font-semibold">"{projectTitle}"</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, onEdit, onDelete }) {
  const statusLabel = project.status === 'completed' ? 'Completed' : 'In Progress';
  const statusColor = project.status === 'completed'
    ? 'bg-green-100 text-green-700'
    : 'bg-amber-100 text-amber-700';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0 overflow-hidden">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="material-symbols-outlined text-5xl text-slate-300">code</span>
          </div>
        )}
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800 text-base leading-tight mb-1.5 line-clamp-2">{project.title}</h3>

        {project.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">{project.description}</p>
        )}

        {/* Tech Stack */}
        {project.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.techStack.slice(0, 5).map((t) => (
              <span key={t} className="text-xs font-medium bg-secondary/5 text-secondary border border-secondary/10 px-2 py-0.5 rounded-full">
                {t}
              </span>
            ))}
            {project.techStack.length > 5 && (
              <span className="text-xs text-slate-400">+{project.techStack.length - 5} more</span>
            )}
          </div>
        )}

        {/* Dates */}
        {(project.startDate || project.endDate) && (
          <p className="text-xs text-slate-400 mb-3">
            {formatDate(project.startDate)} {project.endDate ? `→ ${formatDate(project.endDate)}` : '→ Present'}
          </p>
        )}

        <div className="flex-1" />

        {/* Links + Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-2">
          <div className="flex gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-secondary transition-colors"
              >
                <span className="material-symbols-outlined text-base">code</span>
                GitHub
              </a>
            )}
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-base">open_in_new</span>
                Live
              </a>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-secondary hover:bg-slate-100 transition-colors"
              title="Edit"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button
              onClick={() => onDelete(project)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function StudentProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalProject, setModalProject] = useState(null); // null=closed, false=new, obj=edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  async function loadProjects() {
    try {
      const res = await studentService.getProjects();
      setProjects(res.data || []);
    } catch (err) {
      showToast(getApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProjects(); }, []);

  function handleSave(savedProject, action) {
    if (action === 'add') {
      setProjects((prev) => [savedProject, ...prev]);
      showToast('Project added successfully.');
    } else {
      setProjects((prev) => prev.map((p) => (p.id === savedProject.id ? savedProject : p)));
      showToast('Project updated successfully.');
    }
    setModalProject(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await studentService.deleteProject(deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast('Project deleted.');
      setDeleteTarget(null);
    } catch (err) {
      showToast(getApiError(err), 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  const filtered = filterStatus === 'all'
    ? projects
    : projects.filter((p) => p.status === filterStatus);

  return (
    <>
      <main className="flex-1 overflow-y-auto bg-background-light">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background-light/95 backdrop-blur-sm border-b border-slate-200 px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-secondary font-playfair">My Projects</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {projects.length} project{projects.length !== 1 ? 's' : ''} — each project adds 20 pts to your readiness score
              </p>
            </div>
            <button
              onClick={() => setModalProject(false)}
              className="flex items-center gap-2 bg-primary text-secondary px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Project
            </button>
          </div>

          {/* Filter */}
          {projects.length > 0 && (
            <div className="flex gap-2 mt-3">
              {[
                { value: 'all', label: 'All' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterStatus(f.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    filterStatus === f.value
                      ? 'bg-secondary text-white'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {f.label}
                  {f.value === 'all' && ` (${projects.length})`}
                  {f.value !== 'all' && ` (${projects.filter((p) => p.status === f.value).length})`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 lg:px-8 py-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse">
                  <div className="h-40 bg-slate-100 rounded-t-2xl" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-primary">code</span>
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">
                {filterStatus !== 'all' ? 'No projects match this filter' : 'No projects yet'}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                {filterStatus !== 'all'
                  ? 'Try a different filter or add a new project.'
                  : 'Showcase your work! Add your first project to boost your readiness score.'}
              </p>
              {filterStatus === 'all' && (
                <button
                  onClick={() => setModalProject(false)}
                  className="flex items-center gap-2 bg-primary text-secondary px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Add Your First Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onEdit={(proj) => setModalProject(proj)}
                  onDelete={(proj) => setDeleteTarget(proj)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {modalProject !== null && (
        <ProjectModal
          project={modalProject || null}
          onClose={() => setModalProject(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          projectTitle={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
