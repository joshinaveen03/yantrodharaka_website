import React, { useEffect, useState, useRef } from 'react';
import { FaFile, FaPlus, FaEdit, FaTrash, FaDownload, FaUpload } from 'react-icons/fa';
import { materialsApi } from '../../api/endpoints';
import './Admin.css';

const EMPTY = { title: '', description: '', subject: '', course: '', is_published: false };
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function fmt(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMaterials() {
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
    materialsApi.adminList(page).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { document.title = 'Materials – Admin'; load(); }, [page]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setFile(null); setError(''); setShowModal(true); };
  const openEdit = (m) => {
    setEditing(m);
    setForm({ title: m.title, description: m.description || '', subject: m.subject || '', course: m.course || '', is_published: m.is_published });
    setFile(null); setError(''); setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!editing && !file)  { setError('Please select a file'); return; }
    setSaving(true); setError('');
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('subject', form.subject);
    fd.append('course', form.course);
    fd.append('is_published', form.is_published);
    if (file) fd.append('file', file);
    try {
      if (editing) await materialsApi.update(editing.id, fd);
      else         await materialsApi.upload(fd);
      setShowModal(false); load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await materialsApi.delete(deleteId); setDeleteId(null); load(); } catch {}
  };

  const field = (key) => ({ value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) });

  return (
    <div>
      <div className="admin-page-header">
        <div className="flex-between">
          <div>
            <h1 className="admin-page-title"><FaFile style={{ color: 'var(--saffron)' }} /> Study Materials</h1>
            <p className="admin-page-sub">Upload and manage learning resources</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate} id="add-material-btn"><FaPlus /> Upload Material</button>
        </div>
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Title</th><th>Subject</th><th>Course</th><th>Size</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>No materials yet.</td></tr>
                ) : data.items.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.title}</strong><br /><small style={{ color: 'var(--gray-400)' }}>{m.original_filename}</small></td>
                    <td>{m.subject || '—'}</td>
                    <td>{m.course  || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmt(m.file_size)}</td>
                    <td><span className={`badge pub-badge ${m.is_published ? 'badge-green' : 'badge-red'}`}>{m.is_published ? 'Published' : 'Draft'}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <a href={m.download_url || `${BASE}/api/files/${m.filename}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline"><FaDownload /></a>
                        <button className="btn btn-sm btn-navy" onClick={() => openEdit(m)}><FaEdit /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(m.id)}><FaTrash /></button>
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
              <span className="modal-title">{editing ? 'Edit Material' : 'Upload Material'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-control" {...field('title')} placeholder="e.g. Physics Chapter 3 Notes" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={2} {...field('description')} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-control" {...field('subject')} placeholder="e.g. Physics" />
                </div>
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <input className="form-control" {...field('course')} placeholder="e.g. JEE Advanced" />
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
              <div className="form-group">
                <label className="form-label">File {!editing && '*'}</label>
                <div className="file-input-wrap" onClick={() => fileRef.current?.click()}>
                  <FaUpload style={{ color: 'var(--gray-400)', fontSize: '1.5rem' }} />
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', marginTop: '0.4rem' }}>PDF, DOCX, PPTX, XLSX, TXT (max 20MB)</p>
                  <p className="file-name">{file ? file.name : (editing?.original_filename || 'No file chosen')}</p>
                  <input type="file" ref={fileRef} accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt" onChange={e => setFile(e.target.files[0])} />
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
            <p>Delete this material and its file permanently?</p>
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
