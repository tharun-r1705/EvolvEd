import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { studentService } from '../services/api.js';

// ─── Constants (mirrors backend validators) ────────────────────────────────

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Machine Learning',
  'Data Science',
  'Biotechnology',
  'Chemical Engineering',
  'Other',
];

const YEARS_OF_STUDY = [
  '1st Year', '2nd Year', '3rd Year', '4th Year',
  'PG - 1st Year', 'PG - 2nd Year',
];

const RESUME_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'ai_ml', label: 'AI / ML' },
  { value: 'full_stack', label: 'Full Stack' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'devops', label: 'DevOps' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'embedded', label: 'Embedded' },
  { value: 'custom', label: 'Custom' },
];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: 'person' },
  { id: 'academic', label: 'Academic', icon: 'school' },
  { id: 'integrations', label: 'Links & Integrations', icon: 'hub' },
  { id: 'resumes', label: 'Resumes', icon: 'description' },
];

// ─── Utility ───────────────────────────────────────────────────────────────

function getApiError(err) {
  return (
    err?.response?.data?.errors?.[0]?.message ||
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    'Something went wrong.'
  );
}

function ProfileCompletion({ value }) {
  const color =
    value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-primary' : 'bg-orange-400';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-secondary w-10 text-right">{value}%</span>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-xl text-sm font-medium text-white transition-all animate-fade-in
        ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
    >
      <span className="material-symbols-outlined text-[20px]">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}

// ─── Tab: Personal Info ────────────────────────────────────────────────────

function PersonalInfoTab({ profile, onSaved }) {
  const [form, setForm] = useState({
    fullName: profile.fullName || '',
    phone: profile.phone || '',
    location: profile.location || '',
    bio: profile.bio || '',
    linkedin: profile.linkedin || '',
    website: profile.website || '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef();

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.';
    if (form.fullName.trim().length > 100) errs.fullName = 'Max 100 characters.';
    if (form.phone && !/^(\+91[\s-]?)?[6-9]\d{9}$|^\+?[1-9]\d{6,14}$/.test(form.phone.trim()))
      errs.phone = 'Enter a valid mobile number.';
    if (form.linkedin && !/linkedin\.com/i.test(form.linkedin))
      errs.linkedin = 'Must be a LinkedIn URL.';
    if (form.website && !/^https?:\/\//i.test(form.website))
      errs.website = 'Include https:// in the URL.';
    if (form.bio && form.bio.trim().length < 20)
      errs.bio = 'Bio must be at least 20 characters.';
    if (form.bio && form.bio.trim().length > 1000)
      errs.bio = 'Bio cannot exceed 1000 characters.';
    return errs;
  }

  async function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || null,
        location: form.location.trim() || null,
        bio: form.bio.trim() || null,
        linkedin: form.linkedin.trim() || null,
        website: form.website.trim() || null,
      };
      const res = await studentService.updateProfile(payload);
      onSaved(res.data);
      setToast({ message: 'Personal info saved.', type: 'success' });
    } catch (err) {
      setToast({ message: getApiError(err), type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: 'Avatar must be under 2 MB.', type: 'error' });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleAvatarUpload() {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      const res = await studentService.uploadAvatar(fd);
      setAvatarPreview(res.data.avatarUrl);
      setAvatarFile(null);
      onSaved(res.data);
      setToast({ message: 'Avatar updated.', type: 'success' });
    } catch (err) {
      setToast({ message: getApiError(err), type: 'error' });
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <div
            className="h-24 w-24 rounded-full bg-slate-100 ring-4 ring-white shadow-md overflow-hidden bg-cover bg-center flex items-center justify-center"
            style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : {}}
          >
            {!avatarPreview && (
              <span className="material-symbols-outlined text-5xl text-slate-300">person</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-md text-secondary hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-secondary">Profile Photo</p>
          <p className="text-xs text-slate-500">JPG, PNG or WebP. Max 2 MB. Recommended: 400×400px.</p>
          {avatarFile && (
            <button
              type="button"
              onClick={handleAvatarUpload}
              disabled={uploadingAvatar}
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-secondary hover:bg-primary/90 disabled:opacity-50 transition-colors w-fit"
            >
              {uploadingAvatar ? (
                <>
                  <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                  Uploading...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[14px]">upload</span>
                  Upload Photo
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Fields */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Full Name" required error={errors.fullName}>
          <input
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            placeholder="Arjun Kumar"
            className={inputCls(errors.fullName)}
          />
        </Field>

        <Field label="Phone Number" error={errors.phone}>
          <input
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className={inputCls(errors.phone)}
          />
        </Field>

        <Field label="Location" error={errors.location}>
          <input
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Bangalore, Karnataka"
            className={inputCls(errors.location)}
          />
        </Field>

        <Field label="LinkedIn URL" error={errors.linkedin}>
          <input
            value={form.linkedin}
            onChange={(e) => set('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/arjunkumar"
            className={inputCls(errors.linkedin)}
          />
        </Field>

        <Field label="Website / Portfolio" error={errors.website} className="sm:col-span-2">
          <input
            value={form.website}
            onChange={(e) => set('website', e.target.value)}
            placeholder="https://arjunkumar.dev"
            className={inputCls(errors.website)}
          />
        </Field>

        <Field label="Bio" error={errors.bio} className="sm:col-span-2">
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            placeholder="Tell recruiters about yourself — your passion, goals, and what makes you stand out. (20–1000 characters)"
            className={`${inputCls(errors.bio)} resize-none`}
          />
          <p className="mt-1 text-right text-xs text-slate-400">{form.bio.length}/1000</p>
        </Field>
      </div>

      <div className="flex justify-end">
        <SaveButton saving={saving} />
      </div>
    </form>
  );
}

// ─── Tab: Academic ─────────────────────────────────────────────────────────

function AcademicTab({ profile, onSaved }) {
  const [form, setForm] = useState({
    department: profile.department || '',
    yearOfStudy: profile.yearOfStudy || '',
    gpa: profile.gpa != null ? String(profile.gpa) : '',
    expectedGrad: profile.expectedGrad ? profile.expectedGrad.split(' ').pop() : '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const errs = {};
    if (form.gpa !== '') {
      const g = parseFloat(form.gpa);
      if (isNaN(g) || g < 0 || g > 10) errs.gpa = 'GPA must be between 0 and 10.';
    }
    if (form.expectedGrad) {
      const y = parseInt(form.expectedGrad, 10);
      if (!/^\d{4}$/.test(form.expectedGrad) || y < 2020 || y > 2040)
        errs.expectedGrad = 'Enter a valid graduation year between 2020 and 2040.';
    }
    return errs;
  }

  async function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        department: form.department || undefined,
        yearOfStudy: form.yearOfStudy || undefined,
        gpa: form.gpa !== '' ? parseFloat(form.gpa) : null,
        expectedGrad: form.expectedGrad.trim() || null,
      };
      const res = await studentService.updateProfile(payload);
      onSaved(res.data);
      setToast({ message: 'Academic info saved.', type: 'success' });
    } catch (err) {
      setToast({ message: getApiError(err), type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Department" error={errors.department}>
          <select
            value={form.department}
            onChange={(e) => set('department', e.target.value)}
            className={inputCls(errors.department)}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>

        <Field label="Year of Study" error={errors.yearOfStudy}>
          <select
            value={form.yearOfStudy}
            onChange={(e) => set('yearOfStudy', e.target.value)}
            className={inputCls(errors.yearOfStudy)}
          >
            <option value="">Select year</option>
            {YEARS_OF_STUDY.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>

        <Field label="CGPA / GPA" error={errors.gpa}>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={form.gpa}
            onChange={(e) => set('gpa', e.target.value)}
            placeholder="8.5"
            className={inputCls(errors.gpa)}
          />
          <p className="mt-1 text-xs text-slate-400">On a scale of 0–10 (or CGPA out of 10)</p>
        </Field>

        <Field label="Expected Graduation Year" error={errors.expectedGrad}>
          <input
            type="number"
            min="2020"
            max="2040"
            value={form.expectedGrad}
            onChange={(e) => set('expectedGrad', e.target.value)}
            placeholder="2026"
            className={inputCls(errors.expectedGrad)}
          />
        </Field>
      </div>

      {/* Read-only identity info */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Read-only Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs">Student ID</p>
            <p className="font-semibold text-secondary">{profile.studentId || '—'}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Email</p>
            <p className="font-semibold text-secondary truncate">{profile.email || '—'}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Account Created</p>
            <p className="font-semibold text-secondary">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton saving={saving} />
      </div>
    </form>
  );
}

// ─── Tab: Links & Integrations ─────────────────────────────────────────────

function IntegrationsTab({ profile, onSaved }) {
  const [form, setForm] = useState({
    githubUsername: profile.githubUsername || '',
    leetcodeUsername: profile.leetcodeUsername || '',
    showOnLeaderboard: profile.showOnLeaderboard !== false,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // LinkedIn PDF
  const [linkedinFile, setLinkedinFile] = useState(null);
  const [parsingLinkedin, setParsingLinkedin] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const linkedinInputRef = useRef();

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const errs = {};
    if (form.githubUsername && !/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(form.githubUsername))
      errs.githubUsername = 'Letters, numbers, and hyphens only.';
    if (form.leetcodeUsername && !/^[a-zA-Z0-9_-]+$/.test(form.leetcodeUsername))
      errs.leetcodeUsername = 'Letters, numbers, underscores, and hyphens only.';
    return errs;
  }

  async function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        githubUsername: form.githubUsername.trim() || null,
        leetcodeUsername: form.leetcodeUsername.trim() || null,
        showOnLeaderboard: form.showOnLeaderboard,
      };
      const res = await studentService.updateProfile(payload);
      onSaved(res.data);
      setToast({ message: 'Integrations saved.', type: 'success' });
    } catch (err) {
      setToast({ message: getApiError(err), type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  function handleLinkedinChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'LinkedIn PDF must be under 5 MB.', type: 'error' });
      return;
    }
    setLinkedinFile(file);
    setParsedData(null);
  }

  async function handleParseLinkedin() {
    if (!linkedinFile) return;
    setParsingLinkedin(true);
    setParsedData(null);
    try {
      const fd = new FormData();
      fd.append('pdf', linkedinFile);
      const res = await studentService.parseLinkedinPdf(fd);
      setParsedData(res.data.extracted);
      setToast({ message: 'LinkedIn PDF parsed successfully.', type: 'success' });
    } catch (err) {
      setToast({ message: getApiError(err), type: 'error' });
    } finally {
      setParsingLinkedin(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* GitHub & LeetCode */}
      <section>
        <h3 className="text-base font-bold text-secondary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">code</span>
          Coding Profiles
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="GitHub Username" error={errors.githubUsername}>
            <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary/40">
              <span className="pl-3 pr-2 text-slate-400 text-sm select-none">github.com/</span>
              <input
                value={form.githubUsername}
                onChange={(e) => set('githubUsername', e.target.value)}
                placeholder="your-username"
                className="flex-1 py-2.5 pr-3 text-sm text-secondary bg-transparent outline-none"
              />
              {form.githubUsername && (
                <a
                  href={`https://github.com/${form.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-2 text-slate-400 hover:text-primary transition-colors"
                  title="Open GitHub profile"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </a>
              )}
            </div>
            {errors.githubUsername && <p className="mt-1 text-xs text-red-500">{errors.githubUsername}</p>}
          </Field>

          <Field label="LeetCode Username" error={errors.leetcodeUsername}>
            <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary/40">
              <span className="pl-3 pr-2 text-slate-400 text-sm select-none">leetcode.com/u/</span>
              <input
                value={form.leetcodeUsername}
                onChange={(e) => set('leetcodeUsername', e.target.value)}
                placeholder="your-handle"
                className="flex-1 py-2.5 pr-3 text-sm text-secondary bg-transparent outline-none"
              />
              {form.leetcodeUsername && (
                <a
                  href={`https://leetcode.com/u/${form.leetcodeUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-2 text-slate-400 hover:text-primary transition-colors"
                  title="Open LeetCode profile"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </a>
              )}
            </div>
            {errors.leetcodeUsername && <p className="mt-1 text-xs text-red-500">{errors.leetcodeUsername}</p>}
          </Field>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          These usernames are used to fetch your public stats. Your profiles must be public on GitHub and LeetCode.
        </p>
      </section>

      <div className="h-px bg-slate-100" />

      {/* LinkedIn PDF Import */}
      <section>
        <h3 className="text-base font-bold text-secondary mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">picture_as_pdf</span>
          LinkedIn PDF Import
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Export your LinkedIn profile as a PDF and upload it here. Our AI will extract your experience, skills, and certifications automatically.
        </p>

        <div className="rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/40 transition-colors p-6 text-center">
          <input
            ref={linkedinInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleLinkedinChange}
          />
          {linkedinFile ? (
            <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-primary">picture_as_pdf</span>
              <p className="text-sm font-semibold text-secondary">{linkedinFile.name}</p>
              <p className="text-xs text-slate-500">{(linkedinFile.size / 1024).toFixed(0)} KB</p>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleParseLinkedin}
                  disabled={parsingLinkedin}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-secondary hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {parsingLinkedin ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      Parsing with AI...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                      Parse with AI
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setLinkedinFile(null); setParsedData(null); linkedinInputRef.current.value = ''; }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-4xl text-slate-300">upload_file</span>
              <p className="text-sm text-slate-500">
                Drop your LinkedIn PDF here or{' '}
                <button
                  type="button"
                  onClick={() => linkedinInputRef.current?.click()}
                  className="text-primary font-semibold hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-slate-400">PDF only · Max 5 MB</p>
              {profile.linkedinPdfUrl && (
                <a
                  href={profile.linkedinPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">link</span>
                  View previously uploaded PDF
                </a>
              )}
            </div>
          )}
        </div>

        {/* Parsed Data Preview */}
        {parsedData && (
          <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4">
            <p className="text-sm font-bold text-green-800 flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Extracted Successfully
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {parsedData.fullName && (
                <div><span className="text-slate-500 text-xs">Name:</span><p className="font-medium text-secondary">{parsedData.fullName}</p></div>
              )}
              {parsedData.headline && (
                <div><span className="text-slate-500 text-xs">Headline:</span><p className="font-medium text-secondary">{parsedData.headline}</p></div>
              )}
              {parsedData.location && (
                <div><span className="text-slate-500 text-xs">Location:</span><p className="font-medium text-secondary">{parsedData.location}</p></div>
              )}
              {parsedData.skills?.length > 0 && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 text-xs">Skills ({parsedData.skills.length}):</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {parsedData.skills.slice(0, 15).map((s) => (
                      <span key={s} className="rounded-full bg-white border border-green-200 px-2 py-0.5 text-xs text-green-800 font-medium">{s}</span>
                    ))}
                    {parsedData.skills.length > 15 && (
                      <span className="text-xs text-slate-400">+{parsedData.skills.length - 15} more</span>
                    )}
                  </div>
                </div>
              )}
              {parsedData.experience?.length > 0 && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 text-xs">Experience ({parsedData.experience.length} roles):</span>
                  <div className="mt-1 flex flex-col gap-1">
                    {parsedData.experience.slice(0, 3).map((ex, i) => (
                      <p key={i} className="text-xs text-secondary">• {ex.role} at {ex.company}</p>
                    ))}
                  </div>
                </div>
              )}
              {parsedData.certifications?.length > 0 && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 text-xs">Certifications ({parsedData.certifications.length}):</span>
                  <div className="mt-1 flex flex-col gap-1">
                    {parsedData.certifications.slice(0, 3).map((c, i) => (
                      <p key={i} className="text-xs text-secondary">• {c.name} — {c.issuer}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-green-700">
              Data has been extracted and saved. Use the Projects and Certifications sections to add these to your profile.
            </p>
          </div>
        )}
      </section>

      <div className="h-px bg-slate-100" />

      {/* Leaderboard */}
      <section>
        <h3 className="text-base font-bold text-secondary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">leaderboard</span>
          Privacy
        </h3>
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              className="sr-only"
              checked={form.showOnLeaderboard}
              onChange={(e) => set('showOnLeaderboard', e.target.checked)}
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors ${form.showOnLeaderboard ? 'bg-primary' : 'bg-slate-200'}`}
              onClick={() => set('showOnLeaderboard', !form.showOnLeaderboard)}
            >
              <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${form.showOnLeaderboard ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-secondary">Show on Leaderboard</p>
            <p className="text-xs text-slate-500 mt-0.5">Allow your name and score to appear in the departmental and global leaderboards.</p>
          </div>
        </label>
      </section>

      <div className="flex justify-end">
        <SaveButton saving={saving} />
      </div>
    </form>
  );
}

// ─── PDF Viewer Modal ────────────────────────────────────────────────────────

function PdfViewerModal({ resume, onClose }) {
  const [loaded, setLoaded] = React.useState(false);
  const fileUrl = resume.signedUrl || resume.url;
  const viewerSrc = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  React.useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const catLabel = RESUME_CATEGORIES.find((c) => c.value === resume.category)?.label || resume.category;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-secondary px-4 py-3 gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400 shrink-0">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{resume.name}</p>
            <p className="text-[11px] text-slate-400">{catLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
            Open
          </a>
          <a
            href={fileUrl}
            download
            className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            Download
          </a>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>
      {/* PDF iframe */}
      <div className="relative flex-1 overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900">
            <span className="material-symbols-outlined text-4xl text-slate-400 animate-spin">progress_activity</span>
            <p className="text-slate-400 text-sm">Loading PDF…</p>
          </div>
        )}
        <iframe
          src={viewerSrc}
          title={resume.name}
          className="h-full w-full border-0"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}

// ─── Tab: Resumes ──────────────────────────────────────────────────────────

function ResumesTab({ profile }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [viewingResume, setViewingResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', category: 'general', isDefault: false });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadErrors, setUploadErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const resumeInputRef = useRef();

  const loadResumes = useCallback(async () => {
    try {
      const res = await studentService.getResumes();
      setResumes(res.data);
    } catch (err) {
      setToast({ message: getApiError(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadResumes(); }, [loadResumes]);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Resume PDF must be under 5 MB.', type: 'error' });
      return;
    }
    setUploadFile(file);
    // Auto-fill name from filename
    if (!uploadForm.name) {
      const nameFromFile = file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ').trim();
      setUploadForm((f) => ({ ...f, name: nameFromFile.slice(0, 100) }));
    }
  }

  function validateUpload() {
    const errs = {};
    if (!uploadFile) errs.file = 'Please select a PDF file.';
    if (!uploadForm.name.trim()) errs.name = 'Resume name is required.';
    if (uploadForm.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    return errs;
  }

  async function handleUpload(e) {
    e.preventDefault();
    const errs = validateUpload();
    if (Object.keys(errs).length) { setUploadErrors(errs); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', uploadFile);
      fd.append('name', uploadForm.name.trim());
      fd.append('category', uploadForm.category);
      fd.append('isDefault', String(uploadForm.isDefault));
      await studentService.uploadResume(fd);
      setToast({ message: 'Resume uploaded successfully.', type: 'success' });
      setUploadFile(null);
      setUploadForm({ name: '', category: 'general', isDefault: false });
      if (resumeInputRef.current) resumeInputRef.current.value = '';
      await loadResumes();
    } catch (err) {
      setToast({ message: getApiError(err), type: 'error' });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await studentService.deleteResume(id);
      setToast({ message: 'Resume deleted.', type: 'success' });
      await loadResumes();
    } catch (err) {
      setToast({ message: getApiError(err), type: 'error' });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUpdate(id) {
    try {
      await studentService.updateResume(id, editForm);
      setToast({ message: 'Resume updated.', type: 'success' });
      setEditingId(null);
      await loadResumes();
    } catch (err) {
      setToast({ message: getApiError(err), type: 'error' });
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <>
    {viewingResume && (
      <PdfViewerModal resume={viewingResume} onClose={() => setViewingResume(null)} />
    )}
    <div className="flex flex-col gap-8">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Upload Form */}
      <section>
        <h3 className="text-base font-bold text-secondary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">upload_file</span>
          Upload New Resume
        </h3>
        <form onSubmit={handleUpload} className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col gap-4">
          {/* File drop */}
          <div
            className="rounded-lg border-2 border-dashed border-slate-200 hover:border-primary/40 transition-colors p-4 text-center cursor-pointer"
            onClick={() => resumeInputRef.current?.click()}
          >
            <input
              ref={resumeInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileSelect}
            />
            {uploadFile ? (
              <div className="flex items-center justify-center gap-3">
                <span className="material-symbols-outlined text-3xl text-primary">picture_as_pdf</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-secondary">{uploadFile.name}</p>
                  <p className="text-xs text-slate-500">{(uploadFile.size / 1024).toFixed(0)} KB · Click to change</p>
                </div>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-3xl text-slate-300">upload_file</span>
                <p className="text-sm text-slate-500 mt-1">Click to select PDF (max 5 MB)</p>
              </>
            )}
          </div>
          {uploadErrors.file && <p className="text-xs text-red-500">{uploadErrors.file}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Resume Name" required error={uploadErrors.name}>
              <input
                value={uploadForm.name}
                onChange={(e) => setUploadForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. General Resume 2026"
                className={inputCls(uploadErrors.name)}
              />
            </Field>
            <Field label="Category">
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm((f) => ({ ...f, category: e.target.value }))}
                className={inputCls()}
              >
                {RESUME_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-primary"
              checked={uploadForm.isDefault}
              onChange={(e) => setUploadForm((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            Set as default resume
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-secondary hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {uploading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  Uploading...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  Upload Resume
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Resume List */}
      <section>
        <h3 className="text-base font-bold text-secondary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">folder_open</span>
          Your Resumes
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {resumes.length}/10
          </span>
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <span className="material-symbols-outlined text-3xl text-slate-300 animate-spin">progress_activity</span>
          </div>
        ) : resumes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-200">description</span>
            <p className="mt-2 text-sm text-slate-400">No resumes uploaded yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {resumes.map((r) => (
              <div
                key={r.id}
                className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-all ${r.isDefault ? 'border-primary/40 bg-primary/5' : 'border-slate-200 bg-white'}`}
              >
                {editingId === r.id ? (
                  // Edit mode
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className={inputCls()}
                      placeholder="Resume name"
                    />
                    <select
                      value={editForm.category || 'general'}
                      onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                      className={inputCls()}
                    >
                      {RESUME_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <label className="flex items-center gap-1.5 text-sm text-slate-600 whitespace-nowrap cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded accent-primary"
                        checked={editForm.isDefault || false}
                        onChange={(e) => setEditForm((f) => ({ ...f, isDefault: e.target.checked }))}
                      />
                      Default
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(r.id)}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-secondary hover:bg-primary/90 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="material-symbols-outlined text-3xl text-primary flex-shrink-0">picture_as_pdf</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-secondary truncate">{r.name}</p>
                          {r.isDefault && (
                            <span className="flex-shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {RESUME_CATEGORIES.find((c) => c.value === r.category)?.label || r.category} · Uploaded {formatDate(r.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setViewingResume(r)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingId(r.id); setEditForm({ name: r.name, category: r.category, isDefault: r.isDefault }); }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        {deletingId === r.id ? (
                          <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        )}
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
    </>  
  );
}

// ─── Shared UI Primitives ──────────────────────────────────────────────────

function inputCls(error) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm text-secondary placeholder:text-slate-400 outline-none transition-all
    focus:ring-2 focus:ring-primary/40 focus:border-primary/50
    ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'}`;
}

function Field({ label, required, error, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SaveButton({ saving }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-secondary shadow-sm hover:bg-primary/90 disabled:opacity-60 transition-all"
    >
      {saving ? (
        <>
          <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
          Saving...
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-[16px]">save</span>
          Save Changes
        </>
      )}
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function StudentProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    studentService.getProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  // Called by child tabs when a save returns updated data
  function handleSaved(updates) {
    setProfile((prev) => ({ ...prev, ...updates }));
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-background-light">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center bg-background-light">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-red-300">error</span>
          <p className="mt-3 text-slate-500">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full flex-1 flex-col overflow-y-auto bg-background-light p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl">

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-secondary md:text-4xl">
              My Profile
            </h1>
            <p className="mt-2 text-slate-500">Manage your information, integrations, and resumes.</p>
          </header>

          {/* Profile completion banner */}
          <div className="mb-6 rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-secondary">Profile Completion</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {profile.profileCompletion < 100
                    ? 'Complete your profile to improve your readiness score.'
                    : 'Your profile is fully complete!'}
                </p>
              </div>
              <div className="sm:w-64">
                <ProfileCompletion value={profile.profileCompletion || 0} />
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="mb-6 flex gap-1 rounded-xl bg-white p-1.5 shadow-md ring-1 ring-slate-200 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all flex-1 justify-center
                  ${activeTab === tab.id
                    ? 'bg-secondary text-white shadow-sm'
                    : 'text-slate-500 hover:text-secondary hover:bg-slate-50'}`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
            {activeTab === 'personal' && (
              <PersonalInfoTab profile={profile} onSaved={handleSaved} />
            )}
            {activeTab === 'academic' && (
              <AcademicTab profile={profile} onSaved={handleSaved} />
            )}
            {activeTab === 'integrations' && (
              <IntegrationsTab profile={profile} onSaved={handleSaved} />
            )}
            {activeTab === 'resumes' && (
              <ResumesTab profile={profile} />
            )}
          </div>

        </div>
      </main>
  );
}
