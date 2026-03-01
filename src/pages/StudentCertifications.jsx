import React, { useState, useEffect, useCallback } from 'react';
import { studentService } from '../services/api.js';

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
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
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
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 ${bg} text-white px-5 py-3 rounded-xl shadow-xl max-w-sm`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
}

// ─── Cert Modal ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: '', issuer: '', issueDate: '', expiryDate: '', credentialUrl: '', credentialId: '',
};

function CertModal({ cert, onClose, onSave }) {
  const isEdit = !!cert?.id;
  const [form, setForm] = useState(
    cert
      ? {
          name: cert.name || '',
          issuer: cert.issuer || '',
          issueDate: cert.issueDate ? cert.issueDate.slice(0, 10) : '',
          expiryDate: cert.expiryDate ? cert.expiryDate.slice(0, 10) : '',
          credentialUrl: cert.credentialUrl || '',
          credentialId: cert.credentialId || '',
        }
      : { ...EMPTY_FORM }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        issuer: form.issuer.trim(),
        issueDate: form.issueDate ? new Date(form.issueDate).toISOString() : undefined,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
        credentialUrl: form.credentialUrl.trim() || null,
        credentialId: form.credentialId.trim() || null,
      };

      let savedCert;
      if (isEdit) {
        const res = await studentService.updateCertification(cert.id, payload);
        savedCert = res.data.certification;
      } else {
        const res = await studentService.addCertification(payload);
        savedCert = res.data.certification;
      }

      onSave(savedCert, isEdit ? 'update' : 'add');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-secondary">
            {isEdit ? 'Edit Certification' : 'Add Certification'}
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

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Certification Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="e.g. AWS Certified Solutions Architect"
              value={form.name}
              onChange={(e) => handleField('name', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Issuing Organization <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="e.g. Amazon Web Services"
              value={form.issuer}
              onChange={(e) => handleField('issuer', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={form.issueDate}
                onChange={(e) => handleField('issueDate', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expiry Date</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={form.expiryDate}
                onChange={(e) => handleField('expiryDate', e.target.value)}
                min={form.issueDate || undefined}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Credential ID</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="e.g. ABC123XYZ"
              value={form.credentialId}
              onChange={(e) => handleField('credentialId', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Credential URL</label>
            <input
              type="url"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="https://credential.net/verify/..."
              value={form.credentialUrl}
              onChange={(e) => handleField('credentialUrl', e.target.value)}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold bg-primary text-secondary rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
            {isEdit ? 'Save Changes' : 'Add Certification'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ certName, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-red-600">delete</span>
          </div>
          <div>
            <p className="font-bold text-slate-800">Delete Certification</p>
            <p className="text-sm text-slate-500">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-700">
          Are you sure you want to delete <span className="font-semibold">"{certName}"</span>?
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

// ─── Cert Card ─────────────────────────────────────────────────────────────────

const ISSUER_COLORS = [
  'from-amber-500 to-orange-500',
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-purple-500 to-pink-500',
  'from-rose-500 to-red-500',
  'from-cyan-500 to-sky-500',
];

function getIssuerColor(issuer) {
  let hash = 0;
  for (let i = 0; i < issuer.length; i++) hash = (hash + issuer.charCodeAt(i)) % ISSUER_COLORS.length;
  return ISSUER_COLORS[hash];
}

function CertCard({ cert, onEdit, onDelete }) {
  const expired = isExpired(cert.expiryDate);
  const gradientClass = getIssuerColor(cert.issuer);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-md transition-all flex flex-col overflow-hidden">
      {/* Color header */}
      <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Badge + status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center flex-shrink-0`}>
            <span className="material-symbols-outlined text-2xl text-white">workspace_premium</span>
          </div>
          {cert.expiryDate && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
              expired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {expired ? 'Expired' : 'Valid'}
            </span>
          )}
        </div>

        <h3 className="font-bold text-slate-800 text-sm leading-snug mb-1 line-clamp-2">{cert.name}</h3>
        <p className="text-xs text-slate-500 font-medium mb-3">{cert.issuer}</p>

        {/* Dates */}
        <div className="flex flex-col gap-0.5 text-xs text-slate-400 mb-3">
          <span>Issued: {formatDate(cert.issueDate)}</span>
          {cert.expiryDate && <span>Expires: {formatDate(cert.expiryDate)}</span>}
        </div>

        {/* Credential ID */}
        {cert.credentialId && (
          <p className="text-xs text-slate-400 font-mono truncate mb-3">ID: {cert.credentialId}</p>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-2">
          <div>
            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
              >
                <span className="material-symbols-outlined text-base">verified</span>
                Verify
              </a>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(cert)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-secondary hover:bg-slate-100 transition-colors"
              title="Edit"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button
              onClick={() => onDelete(cert)}
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

export default function StudentCertifications() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCert, setModalCert] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  async function loadCerts() {
    try {
      const res = await studentService.getCertifications();
      setCerts(res.data || []);
    } catch (err) {
      showToast(getApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCerts(); }, []);

  function handleSave(saved, action) {
    if (action === 'add') {
      setCerts((prev) => [saved, ...prev]);
      showToast('Certification added successfully.');
    } else {
      setCerts((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      showToast('Certification updated successfully.');
    }
    setModalCert(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await studentService.deleteCertification(deleteTarget.id);
      setCerts((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      showToast('Certification deleted.');
      setDeleteTarget(null);
    } catch (err) {
      showToast(getApiError(err), 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  const validCount = certs.filter((c) => !isExpired(c.expiryDate)).length;

  return (
    <>
      <main className="flex-1 overflow-y-auto bg-background-light">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background-light/95 backdrop-blur-sm border-b border-slate-200 px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-secondary font-playfair">Certifications</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {certs.length} total · {validCount} valid — each certification adds 25 pts to your readiness score
              </p>
            </div>
            <button
              onClick={() => setModalCert(false)}
              className="flex items-center gap-2 bg-primary text-secondary px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Certification
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-8 py-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 animate-pulse h-52" />
              ))}
            </div>
          ) : certs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-primary">workspace_premium</span>
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No certifications yet</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Add your industry certifications to strengthen your profile and boost your readiness score.
              </p>
              <button
                onClick={() => setModalCert(false)}
                className="flex items-center gap-2 bg-primary text-secondary px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Add Your First Certification
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {certs.map((c) => (
                <CertCard
                  key={c.id}
                  cert={c}
                  onEdit={(cert) => setModalCert(cert)}
                  onDelete={(cert) => setDeleteTarget(cert)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {modalCert !== null && (
        <CertModal
          cert={modalCert || null}
          onClose={() => setModalCert(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          certName={deleteTarget.name}
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
