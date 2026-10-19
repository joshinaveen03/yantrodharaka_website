import React, { useEffect, useState, useRef } from 'react';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import { eventsApi } from '../../api/endpoints';
import './Admin.css';

const EMPTY = { title: '', description: '', event_date: '', venue: '', is_published: false };

export default function AdminEvents() {
  const [data, setData]       = useState({ items: [], pages: 1 });
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [image, setImage]     = useState(null);
  const [doc, setDoc]         = useState(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const imgRef = useRef();
  const docRef = useRef();

  const load = () => {
    setLoading(true);
    eventsApi.adminList(page).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { document.title = 'Events – Admin'; load(); }, [page]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setImage(null); setDoc(null); setError(''); setShowModal(true); };
  const openEdit = (e) => {
    setEditing(e);
    setForm({ title: e.title, description: e.description || '', event_date: e.event_date?.slice(0,16) || '', venue: e.venue || '', is_published: e.is_published });
    setImage(null); setDoc(null); setError(''); setShowModal(true);
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);
    if (doc)   fd.append('document', doc);
    try {
      if (editing) await eventsApi.update(editing.id, fd);
      else         await eventsApi.create(fd);
      setShowModal(false); load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await eventsApi.delete(deleteId); setDeleteId(null); load(); } catch {}
  };

  const field = (key) => ({ value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) });

  return (
    <div>
      <div className="admin-page-header">
        <div className="flex-between">
          <div>
            <h1 className="admin-page-title"><FaCalendarAlt style={{ color: 'var(--saffron)' }} /> Events</h1>
            <p className="admin-page-sub">Manage events and announcements</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate} id="add-event-btn"><FaPlus /> Add Event</button>
        </div>
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Title</th><th>Date</th><th>Venue</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>No events yet.</td></tr>
                ) : data.items.map(e => (
                  <tr key={e.id}>
                    <td><strong>{e.title}</strong></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{e.event_date ? new Date(e.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td>{e.venue || '—'}</td>
                    <td><span className={`badge pub-badge ${e.is_published ? 'badge-green' : 'badge-red'}`}>{e.is_published ? 'Published' : 'Draft'}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-sm btn-navy" onClick={() => openEdit(e)}><FaEdit /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(e.id)}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Event' : 'New Event'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input className="form-control" {...field('title')} placeholder="e.g. Annual Science Fair 2025" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} {...field('description')} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Event Date & Time</label>
                  <input type="datetime-local" className="form-control" {...field('event_date')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input className="form-control" {...field('venue')} placeholder="e.g. Main Auditorium" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label className="toggle">
                    <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
                    <span className="toggle-slider" />
                  </label>
                  <span>{form.is_published ? 'Published' : 'Draft'}</span>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Event Image</label>
                  <div className="file-input-wrap" onClick={() => imgRef.current?.click()}>
                    <FaUpload style={{ color: 'var(--gray-400)' }} />
                    <p className="file-name">{image ? image.name : (editing?.image_filename ? 'Image uploaded' : 'Choose image')}</p>
                    <input type="file" ref={imgRef} accept=".jpg,.jpeg,.png" onChange={e => setImage(e.target.files[0])} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Document</label>
                  <div className="file-input-wrap" onClick={() => docRef.current?.click()}>
                    <FaUpload style={{ color: 'var(--gray-400)' }} />
                    <p className="file-name">{doc ? doc.name : (editing?.document_original_name || 'Choose document')}</p>
                    <input type="file" ref={docRef} accept=".pdf,.docx,.doc" onChange={e => setDoc(e.target.files[0])} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <span className="modal-title">Confirm Delete</span>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <p>Delete this event permanently?</p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
