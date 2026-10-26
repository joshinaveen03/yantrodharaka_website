import React, { useEffect, useState, useRef } from 'react';
import {
  FaImages, FaPlus, FaEdit, FaTrash, FaUpload,
  FaSearch, FaSyncAlt, FaTag, FaCalendarAlt
} from 'react-icons/fa';
import { galleryApi } from '../../api/endpoints';
import './Admin.css';

const CATEGORIES = [
  { id: 'workshops', label: 'Workshops & Events' },
  { id: 'stem', label: 'AI & STEM Labs' },
  { id: 'robotics', label: 'Robotics & Hardware' },
  { id: 'academy', label: 'Academy & Heritage' },
];

const EMPTY_FORM = {
  title: '',
  caption: '',
  category: 'workshops',
  date_label: '',
  badge: '',
  image_url: '',
};

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef();

  const load = () => {
    setLoading(true);
    galleryApi
      .adminList()
      .then(r => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Academy Gallery – Admin';
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setError('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      caption: item.caption || '',
      category: item.category || 'workshops',
      date_label: item.date_label || '',
      badge: item.badge || '',
      image_url: item.image_url || '',
    });
    setImageFile(null);
    setImagePreview(item.image_src || '');
    setError('');
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!editing && !imageFile && !form.image_url.trim()) {
      setError('Please upload an image or provide an image URL');
      return;
    }

    setSaving(true);
    setError('');

    const fd = new FormData();
    fd.append('title', form.title.trim());
    fd.append('caption', form.caption.trim());
    fd.append('category', form.category);
    if (form.date_label) fd.append('date_label', form.date_label.trim());
    if (form.badge) fd.append('badge', form.badge.trim());
    if (form.image_url) fd.append('image_url', form.image_url.trim());
    if (imageFile) fd.append('image', imageFile);

    try {
      if (editing) {
        await galleryApi.update(editing.id, fd);
      } else {
        await galleryApi.create(fd);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save gallery picture');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await galleryApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete picture');
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCat = filterCat === 'all' || item.category === filterCat;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      item.title?.toLowerCase().includes(term) ||
      item.caption?.toLowerCase().includes(term) ||
      item.badge?.toLowerCase().includes(term);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="flex-between">
          <div>
            <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FaImages style={{ color: 'var(--saffron)' }} /> Academy Gallery
            </h1>
            <p className="admin-page-sub">
              Manage website gallery photos, customize captions, categories, and badges
            </p>
          </div>
          <button className="btn btn-primary" onClick={openCreate} id="add-gallery-pic-btn">
            <FaPlus /> Add Gallery Picture
          </button>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="admin-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '450px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, caption, or badge..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-control"
            style={{ minWidth: '180px' }}
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          <button className="btn btn-outline btn-sm" onClick={load} title="Refresh">
            <FaSyncAlt /> Refresh
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="card">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <FaImages />
            <h3>No gallery pictures found</h3>
            <p>Upload a new photo or add pictures with captions to display in the gallery.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Preview</th>
                  <th style={{ width: '220px' }}>Title &amp; Badge</th>
                  <th>Caption / Description</th>
                  <th style={{ width: '140px' }}>Category</th>
                  <th style={{ width: '130px' }}>Date</th>
                  <th style={{ textAlign: 'right', width: '140px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ width: '75px', height: '52px', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid var(--border)' }}>
                        <img
                          src={item.image_src}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/gallery/python-crash-course.jpg'; }}
                        />
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--navy)', display: 'block', fontSize: '0.92rem' }}>
                        {item.title}
                      </strong>
                      {item.badge && (
                        <span className="badge badge-navy" style={{ marginTop: '4px', display: 'inline-block', fontSize: '0.72rem' }}>
                          <FaTag style={{ marginRight: '3px' }} /> {item.badge}
                        </span>
                      )}
                    </td>
                    <td>
                      <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--gray-700)', lineHeight: '1.45', whiteSpace: 'pre-wrap' }}>
                        {item.caption || <em style={{ color: 'var(--gray-400)' }}>No caption provided</em>}
                      </p>
                    </td>
                    <td>
                      <span className="badge badge-saffron" style={{ textTransform: 'capitalize' }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                      {item.date_label || '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => openEdit(item)}
                          title="Edit Caption & Details"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setDeleteTarget(item)}
                          title="Delete Picture"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <span className="modal-title">
                {editing ? 'Edit Gallery Picture & Caption' : 'Add New Gallery Picture'}
              </span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Picture Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. AI & STEM Experiential Lab"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <strong>Caption / Description</strong>
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Enter detailed caption explaining what students or visitors see in this picture..."
                  value={form.caption}
                  onChange={e => setForm({ ...form, caption: e.target.value })}
                />
                <small style={{ color: 'var(--gray-500)', display: 'block', marginTop: '4px' }}>
                  This caption will be displayed on the website gallery card and full-screen lightbox view.
                </small>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Badge Tag</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Live Workshop, AI & STEM"
                    value={form.badge}
                    onChange={e => setForm({ ...form, badge: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date or Batch Label</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. August 2026 or Summer Batch"
                  value={form.date_label}
                  onChange={e => setForm({ ...form, date_label: e.target.value })}
                />
              </div>

              {/* Image Input */}
              <div className="form-group" style={{ border: '1px dashed var(--border)', padding: '1rem', borderRadius: '8px', background: '#fafbfc' }}>
                <label className="form-label" style={{ marginBottom: '8px' }}>
                  <FaUpload style={{ marginRight: '6px' }} />
                  {editing ? 'Change Image (optional)' : 'Upload Picture *'}
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="form-control"
                  style={{ marginBottom: '8px' }}
                />

                <div style={{ margin: '8px 0', fontSize: '0.8rem', color: 'var(--gray-500)', textAlign: 'center' }}>
                  — OR specify existing image path / URL —
                </div>

                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. /gallery/python-crash-course.jpg or https://..."
                  value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                />

                {imagePreview && (
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '4px' }}>Preview:</div>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '6px', border: '1px solid var(--border)' }}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Add Picture')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <span className="modal-title">Confirm Delete</span>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <p style={{ margin: '1rem 0' }}>
              Are you sure you want to delete <strong>"{deleteTarget.title}"</strong> from the gallery?
            </p>
            {deleteTarget.caption && (
              <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', background: '#f8fafc', padding: '0.6rem', borderRadius: '4px' }}>
                "{deleteTarget.caption.length > 90 ? deleteTarget.caption.slice(0, 90) + '…' : deleteTarget.caption}"
              </p>
            )}
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete Picture'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
