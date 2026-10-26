import React, { useEffect, useState, useRef } from 'react';
import { FaBell, FaPlus, FaEdit, FaTrash, FaDownload, FaUpload } from 'react-icons/fa';
import { notificationsApi } from '../../api/endpoints';
import './Admin.css';

const EMPTY = {
  title: 'Welcome to the Python Basic Crash Course!',
  description: 'Kickstart your programming journey with our Python Basic Crash Course, specially designed for school students, college students, and beginners who want to learn Python programming from scratch.',
  publication_date: '',
  is_published: true,
  dates: '15 & 16 August 2026',
  dates_sub: 'Saturday & Sunday',
  timing: '5:00 PM – 7:00 PM IST',
  timing_sub: 'Live Interactive Sessions',
  platform: 'Microsoft Teams',
  platform_sub: 'Online Hands-on Classroom',
  fee: '₹49 Only',
  perks: 'Certificate & Code Files',
  payment_url: '/payment?course=python-crash',
  form_url: 'https://forms.gle/TAYVJrSX7DAbpuFN8',
};
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function AdminNotifications() {
  const [data, setData]       = useState({ items: [], pages: 1 });
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [file, setFile]       = useState(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const fileRef = useRef();

  const load = () => {
    setLoading(true);
    notificationsApi.adminList(page)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { document.title = 'Notifications – Admin'; load(); }, [page]);

  const openCreate = () => {
    setEditing(null); setForm(EMPTY); setFile(null); setError('');
    setShowModal(true);
  };
  const openEdit = (n) => {
    setEditing(n);
    setForm({
      title: n.title || '',
      description: n.description || '',
      publication_date: n.publication_date?.slice(0,16) || '',
      is_published: n.is_published,
      dates: n.dates || '15 & 16 August 2026',
      dates_sub: n.dates_sub || 'Saturday & Sunday',
      timing: n.timing || '5:00 PM – 7:00 PM IST',
      timing_sub: n.timing_sub || 'Live Interactive Sessions',
      platform: n.platform || 'Microsoft Teams',
      platform_sub: n.platform_sub || 'Online Hands-on Classroom',
      fee: n.fee || '₹49 Only',
      perks: n.perks || 'Certificate & Code Files',
      payment_url: n.payment_url || '/payment?course=python-crash',
      form_url: n.form_url || 'https://forms.gle/TAYVJrSX7DAbpuFN8',
    });
    setFile(null); setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        fd.append(key, val);
      }
    });
    if (file) fd.append('attachment', file);
    try {
      if (editing) await notificationsApi.update(editing.id, fd);
      else         await notificationsApi.create(fd);
      setShowModal(false); load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await notificationsApi.delete(deleteId);
      setDeleteId(null); load();
    } catch {}
  };

  return (
    <div>
      <div className="admin-page-header">
        <div className="flex-between">
          <div>
            <h1 className="admin-page-title"><FaBell style={{ color: 'var(--saffron)' }} /> Notifications</h1>
            <p className="admin-page-sub">Manage notifications and attachments</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate} id="add-notification-btn">
            <FaPlus /> Add Notification
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Attachment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>No notifications yet.</td></tr>
                ) : data.items.map(n => (
                  <tr key={n.id}>
                    <td><strong>{n.title}</strong><br /><small style={{ color: 'var(--gray-400)' }}>{n.description?.slice(0,60)}</small></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {n.publication_date ? new Date(n.publication_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <span className={`badge pub-badge ${n.is_published ? 'badge-green' : 'badge-red'}`}>
                        {n.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      {n.attachment_filename ? (
                        <a href={n.download_url || `${BASE}/api/files/${n.attachment_filename}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">
                          <FaDownload /> PDF
                        </a>
                      ) : '—'}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-sm btn-navy" onClick={() => openEdit(n)} id={`edit-notif-${n.id}`}><FaEdit /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(n.id)} id={`del-notif-${n.id}`}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Notification' : 'New Notification'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className={`form-control ${error && !form.title ? 'error' : ''}`}
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description / Lead *</label>
                <textarea className="form-control" rows={3}
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* 4 Highlight Cards Fields */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', margin: '1rem 0' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.92rem', color: 'var(--navy)' }}>
                  📌 Spotlight 4-Card Highlights
                </h4>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Dates Label</label>
                    <input className="form-control" value={form.dates} onChange={e => setForm(f => ({ ...f, dates: e.target.value }))} placeholder="e.g. 15 & 16 August 2026" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Dates Subtitle</label>
                    <input className="form-control" value={form.dates_sub} onChange={e => setForm(f => ({ ...f, dates_sub: e.target.value }))} placeholder="e.g. Saturday & Sunday" />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Timing Label</label>
                    <input className="form-control" value={form.timing} onChange={e => setForm(f => ({ ...f, timing: e.target.value }))} placeholder="e.g. 5:00 PM – 7:00 PM IST" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Timing Subtitle</label>
                    <input className="form-control" value={form.timing_sub} onChange={e => setForm(f => ({ ...f, timing_sub: e.target.value }))} placeholder="e.g. Live Interactive Sessions" />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Platform</label>
                    <input className="form-control" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} placeholder="e.g. Microsoft Teams" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Platform Subtitle</label>
                    <input className="form-control" value={form.platform_sub} onChange={e => setForm(f => ({ ...f, platform_sub: e.target.value }))} placeholder="e.g. Online Hands-on Classroom" />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Fee</label>
                    <input className="form-control" value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} placeholder="e.g. ₹49 Only" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Perks</label>
                    <input className="form-control" value={form.perks} onChange={e => setForm(f => ({ ...f, perks: e.target.value }))} placeholder="e.g. Certificate & Code Files" />
                  </div>
                </div>
              </div>

              {/* Action Buttons Links */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', margin: '1rem 0' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.92rem', color: 'var(--navy)' }}>
                  🔗 Action Buttons &amp; Registration Links
                </h4>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Payment Link</label>
                    <input className="form-control" value={form.payment_url} onChange={e => setForm(f => ({ ...f, payment_url: e.target.value }))} placeholder="/payment?course=python-crash" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Google Form URL</label>
                    <input className="form-control" value={form.form_url} onChange={e => setForm(f => ({ ...f, form_url: e.target.value }))} placeholder="https://forms.gle/..." />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Publication Date</label>
                  <input type="datetime-local" className="form-control"
                    value={form.publication_date} onChange={e => setForm(f => ({ ...f, publication_date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                    <label className="toggle">
                      <input type="checkbox" checked={form.is_published}
                        onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
                      <span className="toggle-slider" />
                    </label>
                    <span>{form.is_published ? 'Published' : 'Draft'}</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">PDF Attachment</label>
                <div className="file-input-wrap" onClick={() => fileRef.current?.click()}>
                  <FaUpload style={{ color: 'var(--gray-400)', fontSize: '1.5rem' }} />
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', marginTop: '0.4rem' }}>
                    Click to choose a file (PDF, DOCX, max 20MB)
                  </p>
                  <p className="file-name">{file ? file.name : (editing?.attachment_original_name || 'No file chosen')}</p>
                  <input type="file" ref={fileRef} accept=".pdf,.docx,.doc" onChange={e => setFile(e.target.files[0])} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <span className="modal-title">Confirm Delete</span>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <p>Are you sure you want to delete this notification? This action cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} id="confirm-delete-btn">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
