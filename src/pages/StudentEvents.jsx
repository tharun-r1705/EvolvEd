import React, { useState, useEffect, useCallback } from 'react';
import { studentService } from '../services/api.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  { value: 'hackathon',    label: 'Hackathon',    icon: 'terminal',         color: 'bg-violet-100 text-violet-700' },
  { value: 'workshop',     label: 'Workshop',     icon: 'build',            color: 'bg-amber-100 text-amber-700' },
  { value: 'conference',   label: 'Conference',   icon: 'groups',           color: 'bg-blue-100 text-blue-700' },
  { value: 'competition',  label: 'Competition',  icon: 'emoji_events',     color: 'bg-orange-100 text-orange-700' },
  { value: 'seminar',      label: 'Seminar',      icon: 'school',           color: 'bg-teal-100 text-teal-700' },
  { value: 'other',        label: 'Other',        icon: 'calendar_month',   color: 'bg-slate-100 text-slate-600' },
];

const EVENT_ACHIEVEMENTS = [
  { value: 'winner',      label: 'Winner',       icon: 'emoji_events',  color: 'bg-amber-100 text-amber-700' },
  { value: 'runner_up',   label: 'Runner-Up',    icon: 'military_tech', color: 'bg-slate-100 text-slate-600' },
  { value: 'finalist',    label: 'Finalist',     icon: 'star',          color: 'bg-blue-100 text-blue-700' },
  { value: 'speaker',     label: 'Speaker',      icon: 'mic',           color: 'bg-purple-100 text-purple-700' },
  { value: 'organizer',   label: 'Organizer',    icon: 'manage_accounts', color: 'bg-green-100 text-green-700' },
  { value: 'participant', label: 'Participant',  icon: 'person',        color: 'bg-slate-100 text-slate-500' },
];

function getEventType(value) {
  return EVENT_TYPES.find((t) => t.value === value) || EVENT_TYPES[EVENT_TYPES.length - 1];
}

function getAchievement(value) {
  return EVENT_ACHIEVEMENTS.find((a) => a.value === value) || EVENT_ACHIEVEMENTS[EVENT_ACHIEVEMENTS.length - 1];
}

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

function groupByYear(events) {
  const map = {};
  for (const ev of events) {
    const year = ev.date ? new Date(ev.date).getFullYear() : 'Unknown';
    if (!map[year]) map[year] = [];
    map[year].push(ev);
  }
  return Object.entries(map).sort(([a], [b]) => Number(b) - Number(a));
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

// ─── Event Modal ──────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: '', organizer: '', type: 'hackathon', date: '',
  description: '', achievement: 'participant', certificateUrl: '',
};

function EventModal({ event, onClose, onSave }) {
  const isEdit = !!event?.id;
  const [form, setForm] = useState(
    event
      ? {
          title: event.title || '',
          organizer: event.organizer || '',
          type: event.type || 'hackathon',
          date: event.date ? event.date.slice(0, 10) : '',
          description: event.description || '',
          achievement: event.achievement || 'participant',
          certificateUrl: event.certificateUrl || '',
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
        title: form.title.trim(),
        organizer: form.organizer.trim(),
        type: form.type,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        description: form.description.trim() || null,
        achievement: form.achievement,
        certificateUrl: form.certificateUrl.trim() || null,
      };

      let savedEvent;
      if (isEdit) {
        const res = await studentService.updateEvent(event.id, payload);
        savedEvent = res.data.event;
      } else {
        const res = await studentService.addEvent(payload);
        savedEvent = res.data.event;
      }

      onSave(savedEvent, isEdit ? 'update' : 'add');
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
            {isEdit ? 'Edit Event' : 'Add Event'}
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
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="e.g. Smart India Hackathon 2024"
              value={form.title}
              onChange={(e) => handleField('title', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Organizer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="e.g. Government of India"
              value={form.organizer}
              onChange={(e) => handleField('organizer', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Type</label>
              <select
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                value={form.type}
                onChange={(e) => handleField('type', e.target.value)}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Event Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={form.date}
                onChange={(e) => handleField('date', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Achievement</label>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_ACHIEVEMENTS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => handleField('achievement', a.value)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                    form.achievement === a.value
                      ? 'border-primary bg-primary/5 text-secondary'
                      : 'border-slate-200 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              rows={3}
              placeholder="What did you build or learn? What was the outcome?"
              value={form.description}
              onChange={(e) => handleField('description', e.target.value)}
              maxLength={1000}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{form.description.length}/1000</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Certificate URL</label>
            <input
              type="url"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="https://certificate.example.com/..."
              value={form.certificateUrl}
              onChange={(e) => handleField('certificateUrl', e.target.value)}
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
            {isEdit ? 'Save Changes' : 'Add Event'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ eventTitle, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-red-600">delete</span>
          </div>
          <div>
            <p className="font-bold text-slate-800">Delete Event</p>
            <p className="text-sm text-slate-500">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-700">
          Are you sure you want to delete <span className="font-semibold">"{eventTitle}"</span>?
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

// ─── Timeline Event Card ───────────────────────────────────────────────────────

function EventTimelineCard({ event, onEdit, onDelete }) {
  const typeInfo = getEventType(event.type);
  const achievementInfo = getAchievement(event.achievement);

  return (
    <div className="flex gap-4">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div className={`h-9 w-9 rounded-full ${typeInfo.color} flex items-center justify-center flex-shrink-0`}>
          <span className="material-symbols-outlined text-base">{typeInfo.icon}</span>
        </div>
        <div className="flex-1 w-0.5 bg-slate-100 mt-2" />
      </div>

      {/* Card */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-md transition-all p-5 mb-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${achievementInfo.color}`}>
                <span className="material-symbols-outlined text-xs">{achievementInfo.icon}</span>
                {achievementInfo.label}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-base leading-snug">{event.title}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{event.organizer}</p>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <p className="text-xs font-semibold text-slate-400">{formatDate(event.date)}</p>
            <div className="flex gap-1 mt-1">
              <button
                onClick={() => onEdit(event)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-secondary hover:bg-slate-100 transition-colors"
                title="Edit"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
              </button>
              <button
                onClick={() => onDelete(event)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        </div>

        {event.description && (
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">{event.description}</p>
        )}

        {event.certificateUrl && (
          <div className="mt-3">
            <a
              href={event.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              View Certificate
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ events }) {
  const winCount = events.filter((e) => e.achievement === 'winner').length;
  const topCount = events.filter((e) => ['winner', 'runner_up', 'finalist'].includes(e.achievement)).length;
  const typeBreakdown = EVENT_TYPES.map((t) => ({
    ...t,
    count: events.filter((e) => e.type === t.value).length,
  })).filter((t) => t.count > 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-md p-4 text-center">
        <p className="text-2xl font-bold text-secondary">{events.length}</p>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Total Events</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-md p-4 text-center">
        <p className="text-2xl font-bold text-amber-600">{winCount}</p>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Wins</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-md p-4 text-center">
        <p className="text-2xl font-bold text-blue-600">{topCount}</p>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Top 3 Finishes</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-md p-4 text-center">
        <p className="text-2xl font-bold text-teal-600">{typeBreakdown.length}</p>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Event Types</p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function StudentEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalEvent, setModalEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  async function loadEvents() {
    try {
      const res = await studentService.getEvents();
      setEvents(res.data || []);
    } catch (err) {
      showToast(getApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEvents(); }, []);

  function handleSave(saved, action) {
    if (action === 'add') {
      setEvents((prev) => [saved, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
      showToast('Event added successfully.');
    } else {
      setEvents((prev) =>
        prev.map((e) => (e.id === saved.id ? saved : e)).sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      showToast('Event updated successfully.');
    }
    setModalEvent(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await studentService.deleteEvent(deleteTarget.id);
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      showToast('Event deleted.');
      setDeleteTarget(null);
    } catch (err) {
      showToast(getApiError(err), 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  const grouped = groupByYear(events);

  return (
    <>
    <main className="flex-1 overflow-y-auto bg-background-light">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background-light/95 backdrop-blur-sm border-b border-slate-200 px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-secondary font-playfair">Events & Activities</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {events.length} event{events.length !== 1 ? 's' : ''} — hackathons, workshops, conferences & more
              </p>
            </div>
            <button
              onClick={() => setModalEvent(false)}
              className="flex items-center gap-2 bg-primary text-secondary px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Event
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-8 py-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-9 w-9 bg-slate-100 rounded-full animate-pulse flex-shrink-0" />
                  <div className="flex-1 bg-white rounded-2xl border border-slate-200 h-24 animate-pulse" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-primary">event</span>
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No events recorded</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Log your hackathons, workshops, competitions, and conferences to demonstrate extracurricular engagement.
              </p>
              <button
                onClick={() => setModalEvent(false)}
                className="flex items-center gap-2 bg-primary text-secondary px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Add Your First Event
              </button>
            </div>
          ) : (
            <>
              <StatsBar events={events} />

              {/* Timeline grouped by year */}
              {grouped.map(([year, yearEvents]) => (
                <div key={year} className="mb-4">
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">{year}</h2>
                  {yearEvents.map((ev) => (
                    <EventTimelineCard
                      key={ev.id}
                      event={ev}
                      onEdit={(e) => setModalEvent(e)}
                      onDelete={(e) => setDeleteTarget(e)}
                    />
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {modalEvent !== null && (
        <EventModal
          event={modalEvent || null}
          onClose={() => setModalEvent(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          eventTitle={deleteTarget.title}
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
