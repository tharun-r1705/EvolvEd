import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { recruiterService } from '../services/api.js';

// ── Tiny toast ─────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors =
    type === 'success'
      ? 'bg-green-50 text-green-800 ring-green-600/20'
      : 'bg-red-50 text-red-800 ring-red-600/20';
  const icon = type === 'success' ? 'check_circle' : 'error';

  return (
    <div className={`fixed bottom-24 lg:bottom-6 right-4 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ring-1 ring-inset ${colors} max-w-sm animate-in slide-in-from-bottom-4 duration-300`}>
      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
}

// ── Avatar / Logo upload circle ─────────────────────────────────────────────────
function UploadableImage({ src, fallbackIcon, alt, uploading, onFileSelect, size = 'lg' }) {
  const inputRef = useRef(null);
  const dim = size === 'lg' ? 'size-24' : 'size-16';

  return (
    <div className="relative inline-block flex-shrink-0">
      <div
        className={`${dim} rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center`}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-slate-400" style={{ fontSize: size === 'lg' ? '2.5rem' : '1.75rem' }}>
            {fallbackIcon}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-secondary shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        title="Upload image"
      >
        {uploading ? (
          <span className="w-3 h-3 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="material-symbols-outlined text-sm">photo_camera</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
      />
    </div>
  );
}

// ── Field component for view/edit ───────────────────────────────────────────────
function Field({ label, value, placeholder = '—', icon }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
        {label}
      </div>
      <p className={`text-sm ${value ? 'text-secondary' : 'text-slate-400 italic'}`}>
        {value || placeholder}
      </p>
    </div>
  );
}

function InputField({ label, name, value, onChange, onBlur, error, type = 'text', placeholder, icon, rows, maxLength, hint }) {
  const shared = 'w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-secondary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors';

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
        {label}
      </label>
      {rows ? (
        <textarea
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          className={`${shared} py-2 resize-none ${error ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400' : ''}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          maxLength={maxLength}
          placeholder={placeholder}
          className={`${shared} py-2 h-10 ${error ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400' : ''}`}
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// ── Skeleton loader ─────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <main className="flex-1 h-full overflow-y-auto bg-background-light">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 p-6 animate-pulse">
            <div className="h-5 w-32 bg-slate-200 rounded mb-6" />
            <div className="flex gap-5 mb-6">
              <div className="size-24 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-36 bg-slate-200 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-4 w-full bg-slate-200 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

// ── Validation helpers ──────────────────────────────────────────────────────────
function validateRecruiterFields(form) {
  const errs = {};
  if (form.fullName !== undefined && form.fullName !== null && form.fullName.trim().length < 2) {
    errs.fullName = 'Name must be at least 2 characters.';
  }
  if (form.linkedin && form.linkedin.trim()) {
    try { new URL(form.linkedin.trim()); } catch { errs.linkedin = 'Enter a valid URL.'; }
  }
  if (form.bio && form.bio.length > 500) {
    errs.bio = 'Bio must be 500 characters or less.';
  }
  if (form.phone && form.phone.trim() && !/^[+\d\s\-()\\.]{7,20}$/.test(form.phone.trim())) {
    errs.phone = 'Invalid phone number format.';
  }
  return errs;
}

function validateCompanyFields(form) {
  const errs = {};
  if (form.website && form.website.trim()) {
    try { new URL(form.website.trim()); } catch { errs.website = 'Enter a valid URL.'; }
  }
  if (form.careersUrl && form.careersUrl.trim()) {
    try { new URL(form.careersUrl.trim()); } catch { errs.careersUrl = 'Enter a valid URL.'; }
  }
  if (form.description && form.description.length > 1000) {
    errs.description = 'Description must be 1000 characters or less.';
  }
  return errs;
}

// ── Main page ───────────────────────────────────────────────────────────────────
export default function RecruiterProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [toast, setToast] = useState(null);

  // edit form state
  const [form, setForm] = useState({});
  const [companyForm, setCompanyForm] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [companyErrors, setCompanyErrors] = useState({});

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    recruiterService.getProfile()
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        showToast(err.response?.data?.message || 'Failed to load profile.', 'error');
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  function enterEdit() {
    setForm({
      fullName:    profile?.fullName    || '',
      designation: profile?.designation || '',
      phone:       profile?.phone       || '',
      bio:         profile?.bio         || '',
      linkedin:    profile?.linkedin    || '',
    });
    setCompanyForm({
      name:        profile?.company?.name        || '',
      industry:    profile?.company?.industry    || '',
      website:     profile?.company?.website     || '',
      location:    profile?.company?.location    || '',
      size:        profile?.company?.size        || '',
      description: profile?.company?.description || '',
      careersUrl:  profile?.company?.careersUrl  || '',
    });
    setFieldErrors({});
    setCompanyErrors({});
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setFieldErrors({});
    setCompanyErrors({});
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCompanyChange(e) {
    const { name, value } = e.target;
    setCompanyForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    const errs = validateRecruiterFields({ ...form, [name]: value });
    setFieldErrors((prev) => ({ ...prev, [name]: errs[name] || undefined }));
  }

  function handleCompanyBlur(e) {
    const { name, value } = e.target;
    const errs = validateCompanyFields({ ...companyForm, [name]: value });
    setCompanyErrors((prev) => ({ ...prev, [name]: errs[name] || undefined }));
  }

  async function handleSave() {
    const errs = validateRecruiterFields(form);
    const cErrs = validateCompanyFields(companyForm);
    setFieldErrors(errs);
    setCompanyErrors(cErrs);
    if (Object.keys(errs).length || Object.keys(cErrs).length) return;

    setSaving(true);
    try {
      const payload = {
        fullName:    form.fullName    || undefined,
        designation: form.designation || null,
        phone:       form.phone       || null,
        bio:         form.bio         || null,
        linkedin:    form.linkedin    || null,
        company: {
          name:        companyForm.name        || undefined,
          industry:    companyForm.industry    || null,
          website:     companyForm.website     || null,
          location:    companyForm.location    || null,
          size:        companyForm.size        || null,
          description: companyForm.description || null,
          careersUrl:  companyForm.careersUrl  || null,
        },
      };
      const res = await recruiterService.updateProfile(payload);
      setProfile(res.data);
      setEditing(false);
      showToast('Profile saved successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file) {
    const fd = new FormData();
    fd.append('avatar', file);
    setAvatarUploading(true);
    try {
      const res = await recruiterService.uploadAvatar(fd);
      setProfile((prev) => ({ ...prev, avatarUrl: res.data.avatarUrl }));
      showToast('Avatar updated.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Avatar upload failed.', 'error');
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleLogoUpload(file) {
    const fd = new FormData();
    fd.append('logo', file);
    setLogoUploading(true);
    try {
      const res = await recruiterService.uploadCompanyLogo(fd);
      setProfile((prev) => ({
        ...prev,
        company: { ...prev.company, logoUrl: res.data.logoUrl },
      }));
      showToast('Company logo updated.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Logo upload failed.', 'error');
    } finally {
      setLogoUploading(false);
    }
  }

  if (loading) return <Skeleton />;

  return (
    <main className="flex-1 h-full overflow-y-auto bg-background-light">
      {/* Header strip */}
      <motion.div 
        initial={{ opacity: 0, y: -16 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="sticky top-0 z-10 flex items-center justify-between bg-background-light/80 backdrop-blur border-b border-slate-200 px-6 lg:px-8 py-4"
      >
        <div>
          <h1 className="text-xl font-bold text-secondary">My Profile</h1>
          <p className="text-sm text-slate-500">Manage your personal and company information</p>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="h-9 px-4 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-9 px-5 rounded-lg text-sm font-semibold bg-primary text-secondary hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <span className="w-3.5 h-3.5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={enterEdit}
              className="h-9 px-5 rounded-lg text-sm font-semibold bg-primary text-secondary hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit Profile
            </button>
          )}
        </div>
      </motion.div>

      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">

        {/* ── Personal Info Card ───────────────────────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md ring-1 ring-slate-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              manage_accounts
            </span>
            <h2 className="text-base font-bold text-secondary">Personal Information</h2>
          </div>

          <div className="p-6">
            {/* Avatar + role badge */}
            <div className="flex items-start gap-5 mb-6">
              <UploadableImage
                src={profile?.avatarUrl}
                fallbackIcon="person"
                alt="Profile photo"
                uploading={avatarUploading}
                onFileSelect={handleAvatarUpload}
                size="lg"
              />
              <div className="flex flex-col gap-1 pt-1">
                <p className="text-xl font-bold text-secondary leading-tight">
                  {profile?.fullName || user?.name || 'Recruiter'}
                </p>
                <p className="text-sm text-slate-500">{profile?.designation || 'Recruiter'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                    <span className="material-symbols-outlined text-xs">work</span>
                    Recruiter
                  </span>
                  {profile?.company?.name && (
                    <span className="text-xs text-slate-500">{profile.company.name}</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Quick Actions (dark card) ──────────────────────────────────────── */}
        {!editing && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.24 }}
            className="bg-secondary rounded-2xl shadow-md p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">Ready to find top talent?</h3>
              <p className="text-sm text-slate-400 mt-0.5">Search our candidate pool or post a new job opening.</p>
            </div>
            <div className="flex gap-2">
              <a
                href="/recruiter/candidates"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined text-base">group</span>
                Candidates
              </a>
              <a
                href="/recruiter/jobs/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-secondary hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Post Job
              </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </main>
  );
}
