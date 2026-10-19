import React, { useEffect, useState } from 'react';
import { FaBook, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { coursesApi } from '../../api/endpoints';
import './Admin.css';

const EMPTY = { name: '', description: '', duration: '', eligibility: '', is_published: false };

export default function AdminCourses() {
  const [data, setData]       = useState({ items: [], pages: 1 });
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = () => {
    setLoading(true);
    coursesApi.adminList(page).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { document.title = 'Courses – Admin'; load(); }, [page]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '', duration: c.duration || '', eligibility: c.eligibility || '', is_published: c.is_published });
    setError(''); setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Course name is required'); return; }
    setSaving(true); setError('');
    try {
      if (editing) await coursesApi.update(editing.id, form);
      else         await coursesApi.create(form);
      setShowModal(false); load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await coursesApi.delete(deleteId); setDeleteId(null); load(); } catch {}
  };

  const field = (key) => ({ value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) });

  return (
    <div>
      <div className="admin-page-header">
        <div className="flex-between">
          <div>
            <h1 className="admin-page-title"><FaBook style={{ color: 'var(--saffron)' }} /> Courses</h1>
            <p className="admin-page-sub">Manage course listings</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate} id="add-course-btn"><FaPlus /> Add Course</button>
        </div>
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Duration</th><th>Eligibility</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>No courses yet.</td></tr>
                ) : data.items.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong><br /><small style={{ color: 'var(--gray-400)' }}>{c.description?.slice(0,60)}</small></td>
                    <td>{c.duration || '—'}</td>
                    <td>{c.eligibility?.slice(0,50) || '—'}</td>
                    <td><span className={`badge pub-badge ${c.is_published ? 'badge-green' : 'badge-red'}`}>{c.is_published ? 'Published' : 'Draft'}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-sm btn-navy" onClick={() => openEdit(c)}><FaEdit /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(c.id)}><FaTrash /></button>
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
              <span className="modal-title">{editing ? 'Edit Course' : 'New Course'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Course Name *</label>
                <input className="form-control" {...field('name')} placeholder="e.g. JEE Advanced" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} {...field('description')} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input className="form-control" {...field('duration')} placeholder="e.g. 12 months" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                    <label className="toggle">
                      <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
                      <span className="toggle-slider" />
                    </label>
                    <span>{form.is_published ? 'Published' : 'Draft'}</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Eligibility</label>
                <textarea className="form-control" rows={2} {...field('eligibility')} placeholder="e.g. Class 11 & 12 students" />
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
            <p>Delete this course permanently?</p>
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
