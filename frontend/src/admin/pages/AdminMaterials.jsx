import React, { useEffect, useState, useRef } from 'react';
import {
  FaFolder, FaFolderPlus, FaFile, FaPlus, FaEdit, FaTrash, FaDownload,
  FaUpload, FaKey, FaLock, FaUnlock, FaCopy, FaCheck, FaEye, FaEyeSlash,
  FaWhatsapp, FaUserCheck, FaUserTimes, FaExclamationCircle, FaShieldAlt,
  FaRandom, FaSearch
} from 'react-icons/fa';
import { materialsApi } from '../../api/endpoints';
import './Admin.css';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const EMPTY_FOLDER = {
  name: '',
  description: '',
  subject: '',
  course: '',
  is_protected: true,
  access_password: '',
  is_published: true,
};

const EMPTY_MATERIAL = {
  title: '',
  description: '',
  subject: '',
  course: '',
  folder_id: '',
  is_published: true,
};

function fmt(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generatePassword(prefix = 'YANTRO') {
  const nums = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}@${nums}`;
}

export default function AdminMaterials() {
  const [tab, setTab] = useState('folders'); // 'folders' | 'materials' | 'requests'

  // Data
  const [folders, setFolders] = useState([]);
  const [materialsData, setMaterialsData] = useState({ items: [], pages: 1 });
  const [requestsData, setRequestsData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [materialPage, setMaterialPage] = useState(1);
  const [filterFolderId, setFilterFolderId] = useState('');

  // Folder Modal
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderForm, setFolderForm] = useState(EMPTY_FOLDER);
  const [folderSaving, setFolderSaving] = useState(false);
  const [folderError, setFolderError] = useState('');

  // Material Modal
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialForm, setMaterialForm] = useState(EMPTY_MATERIAL);
  const [file, setFile] = useState(null);
  const [materialSaving, setMaterialSaving] = useState(false);
  const [materialError, setMaterialError] = useState('');
  const fileRef = useRef();

  // Delete Modals
  const [deleteFolderId, setDeleteFolderId] = useState(null);
  const [deleteMaterialId, setDeleteMaterialId] = useState(null);

  // Clipboard & Show Password states
  const [copiedKey, setCopiedKey] = useState(null);
  const [revealedPasswords, setRevealedPasswords] = useState({});

  useEffect(() => {
    document.title = 'Folders & Materials – Admin';
    loadAll();
  }, [materialPage, filterFolderId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [foldersRes, materialsRes, requestsRes] = await Promise.all([
        materialsApi.adminFolders(),
        materialsApi.adminList(materialPage, filterFolderId),
        materialsApi.adminAccessRequests(),
      ]);
      setFolders(foldersRes.data || []);
      setMaterialsData(materialsRes.data || { items: [], pages: 1 });
      setRequestsData(requestsRes.data || { items: [], total: 0 });
    } catch (err) {
      console.error('Failed to load admin materials data:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleReveal = (id) => {
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ── Folder Actions ──────────────────────────────────────────────────────────
  const openCreateFolder = () => {
    setEditingFolder(null);
    setFolderForm({
      ...EMPTY_FOLDER,
      access_password: generatePassword('PASS'),
    });
    setFolderError('');
    setShowFolderModal(true);
  };

  const openEditFolder = (f) => {
    setEditingFolder(f);
    setFolderForm({
      name: f.name || '',
      description: f.description || '',
      subject: f.subject || '',
      course: f.course || '',
      is_protected: f.is_protected !== false,
      access_password: f.access_password || '',
      is_published: f.is_published !== false,
    });
    setFolderError('');
    setShowFolderModal(true);
  };

  const handleSaveFolder = async (e) => {
    e.preventDefault();
    if (!folderForm.name.trim()) {
      setFolderError('Folder name is required');
      return;
    }
    if (folderForm.is_protected && !folderForm.access_password.trim()) {
      setFolderError('Access password is required for protected folders.');
      return;
    }

    setFolderSaving(true);
    setFolderError('');

    try {
      if (editingFolder) {
        await materialsApi.adminUpdateFolder(editingFolder.id, folderForm);
      } else {
        await materialsApi.adminCreateFolder(folderForm);
      }
      setShowFolderModal(false);
      loadAll();
    } catch (err) {
      setFolderError(err.response?.data?.detail || 'Failed to save folder');
    } finally {
      setFolderSaving(false);
    }
  };

  const handleDeleteFolder = async () => {
    try {
      await materialsApi.adminDeleteFolder(deleteFolderId);
      setDeleteFolderId(null);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete folder');
    }
  };

  // ── Material Actions ────────────────────────────────────────────────────────
  const openCreateMaterial = (defaultFolderId = '') => {
    setEditingMaterial(null);
    setMaterialForm({
      ...EMPTY_MATERIAL,
      folder_id: defaultFolderId || (folders[0]?.id || ''),
    });
    setFile(null);
    setMaterialError('');
    setShowMaterialModal(true);
  };

  const openEditMaterial = (m) => {
    setEditingMaterial(m);
    setMaterialForm({
      title: m.title || '',
      description: m.description || '',
      subject: m.subject || '',
      course: m.course || '',
      folder_id: m.folder_id || '',
      is_published: m.is_published,
    });
    setFile(null);
    setMaterialError('');
    setShowMaterialModal(true);
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.title.trim()) {
      setMaterialError('Title is required');
      return;
    }
    if (!editingMaterial && !file) {
      setMaterialError('Please select a file to upload');
      return;
    }

    setMaterialSaving(true);
    setMaterialError('');

    const fd = new FormData();
    fd.append('title', materialForm.title);
    fd.append('description', materialForm.description || '');
    fd.append('subject', materialForm.subject || '');
    fd.append('course', materialForm.course || '');
    if (materialForm.folder_id) {
      fd.append('folder_id', materialForm.folder_id);
    }
    fd.append('is_published', materialForm.is_published);
    if (file) {
      fd.append('file', file);
    }

    try {
      if (editingMaterial) {
        await materialsApi.update(editingMaterial.id, fd);
      } else {
        await materialsApi.upload(fd);
      }
      setShowMaterialModal(false);
      loadAll();
    } catch (err) {
      setMaterialError(err.response?.data?.detail || 'Failed to save material');
    } finally {
      setMaterialSaving(false);
    }
  };

  const handleDeleteMaterial = async () => {
    try {
      await materialsApi.delete(deleteMaterialId);
      setDeleteMaterialId(null);
      loadAll();
    } catch (err) {
      alert('Failed to delete material');
    }
  };

  // ── Access Request Actions ──────────────────────────────────────────────────
  const handleUpdateStatus = async (reqId, status) => {
    try {
      await materialsApi.adminUpdateAccessRequest(reqId, { status });
      loadAll();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteRequest = async (reqId) => {
    if (!window.confirm('Delete this permission request?')) return;
    try {
      await materialsApi.adminDeleteAccessRequest(reqId);
      loadAll();
    } catch (err) {
      alert('Failed to delete request');
    }
  };

  const getWhatsAppApprovalUrl = (req) => {
    const cleanPhone = req.phone.replace(/[^0-9]/g, '');
    const password = req.folder_password || '(Please contact admin)';
    const text = encodeURIComponent(
      `Hello ${req.student_name},\n\nYour access request for study material folder *"${req.folder_name}"* at Yantrodharaka Coaching Center has been APPROVED! 🎉\n\n🔑 *Folder Access Password:* ${password}\n\n👉 *Access Portal:* https://yantrodharaka.in/materials\n\nHappy Learning!\nTeam Yantrodharaka`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  const pendingRequestsCount = requestsData.items.filter(r => r.status === 'PENDING').length;

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="admin-page-title">
              <FaFolder style={{ color: 'var(--saffron)' }} /> Study Materials & Folders
            </h1>
            <p className="admin-page-sub">
              Manage folder-wise password access, study materials, and student permission requests
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={openCreateFolder} id="create-folder-btn">
              <FaFolderPlus /> + New Folder
            </button>
            <button className="btn btn-primary" onClick={() => openCreateMaterial()} id="upload-material-btn">
              <FaPlus /> + Upload File
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${tab === 'folders' ? 'active' : ''}`}
          onClick={() => setTab('folders')}
        >
          <FaFolder /> Material Folders
          <span className="admin-tab-badge">{folders.length}</span>
        </button>

        <button
          className={`admin-tab-btn ${tab === 'materials' ? 'active' : ''}`}
          onClick={() => setTab('materials')}
        >
          <FaFile /> All Files & Notes
          <span className="admin-tab-badge">{materialsData.total || materialsData.items.length}</span>
        </button>

        <button
          className={`admin-tab-btn ${tab === 'requests' ? 'active' : ''}`}
          onClick={() => setTab('requests')}
        >
          <FaShieldAlt /> Student Access Requests
          {pendingRequestsCount > 0 ? (
            <span className="admin-tab-badge badge-pending">{pendingRequestsCount} Pending</span>
          ) : (
            <span className="admin-tab-badge">{requestsData.items.length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════
              TAB 1: FOLDERS & PASSWORDS
              ═══════════════════════════════════════════════════════════ */}
          {tab === 'folders' && (
            <div className="card">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Folder Name</th>
                      <th>Subject / Course</th>
                      <th>Security & Access Password</th>
                      <th>Files</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {folders.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2.5rem' }}>
                          No folders created yet. Click "+ New Folder" to organize study materials.
                        </td>
                      </tr>
                    ) : folders.map(f => {
                      const isRevealed = revealedPasswords[f.id];
                      const isCopied = copiedKey === f.id;

                      return (
                        <tr key={f.id}>
                          <td>
                            <strong style={{ color: 'var(--navy)', fontSize: '0.98rem' }}>
                              <FaFolder style={{ color: 'var(--saffron)', marginRight: '0.4rem' }} />
                              {f.name}
                            </strong>
                            {f.description && (
                              <div style={{ color: 'var(--gray-500)', fontSize: '0.82rem', marginTop: '0.2rem', maxWidth: '350px' }}>
                                {f.description}
                              </div>
                            )}
                          </td>
                          <td>
                            {f.subject && <span className="badge badge-navy" style={{ marginRight: '0.3rem' }}>{f.subject}</span>}
                            {f.course && <span className="badge badge-saffron">{f.course}</span>}
                            {!f.subject && !f.course && '—'}
                          </td>
                          <td>
                            {f.is_protected ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <span className="pwd-badge">
                                  <FaKey style={{ color: 'var(--saffron-dk)', fontSize: '0.75rem' }} />
                                  {isRevealed ? f.access_password : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline"
                                  style={{ padding: '0.2rem 0.45rem', fontSize: '0.8rem' }}
                                  onClick={() => toggleReveal(f.id)}
                                  title={isRevealed ? 'Hide Password' : 'Show Password'}
                                >
                                  {isRevealed ? <FaEyeSlash /> : <FaEye />}
                                </button>
                                <button
                                  type="button"
                                  className={`btn btn-sm ${isCopied ? 'btn-success' : 'btn-outline'}`}
                                  style={{ padding: '0.2rem 0.55rem', fontSize: '0.78rem' }}
                                  onClick={() => copyToClipboard(f.access_password, f.id)}
                                  title="Copy password for student"
                                >
                                  {isCopied ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}
                                </button>
                              </div>
                            ) : (
                              <span className="badge badge-green">
                                <FaUnlock style={{ marginRight: '0.3rem' }} /> Open Access (No Password)
                              </span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
                              {f.items_count || 0} files
                            </span>
                          </td>
                          <td>
                            <span className={`badge pub-badge ${f.is_published ? 'badge-green' : 'badge-red'}`}>
                              {f.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => openCreateMaterial(f.id)}
                                title="Upload file into this folder"
                              >
                                <FaPlus /> Add File
                              </button>
                              <button className="btn btn-sm btn-navy" onClick={() => openEditFolder(f)} title="Edit Folder">
                                <FaEdit />
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => setDeleteFolderId(f.id)} title="Delete Folder">
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 2: MATERIAL FILES
              ═══════════════════════════════════════════════════════════ */}
          {tab === 'materials' && (
            <div>
              {/* Folder filter dropdown */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--gray-600)' }}>Filter by Folder:</label>
                  <select
                    className="form-control"
                    style={{ width: 'auto', minWidth: '220px', padding: '0.4rem 0.75rem' }}
                    value={filterFolderId}
                    onChange={e => { setFilterFolderId(e.target.value); setMaterialPage(1); }}
                  >
                    <option value="">All Folders & Files</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--gray-500)' }}>
                  Showing {materialsData.items.length} of {materialsData.total} files
                </div>
              </div>

              <div className="card">
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title & File</th>
                        <th>Folder</th>
                        <th>Subject / Course</th>
                        <th>Size</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialsData.items.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2.5rem' }}>
                            No files found in this selection.
                          </td>
                        </tr>
                      ) : materialsData.items.map(m => (
                        <tr key={m.id}>
                          <td>
                            <strong>{m.title}</strong>
                            <br />
                            <small style={{ color: 'var(--gray-400)' }}>📄 {m.original_filename}</small>
                          </td>
                          <td>
                            {m.folder_name ? (
                              <span className="badge badge-navy" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                <FaFolder style={{ color: 'var(--saffron)' }} /> {m.folder_name}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--gray-400)' }}>Unassigned</span>
                            )}
                          </td>
                          <td>
                            {m.subject && <span className="badge badge-navy" style={{ marginRight: '0.3rem' }}>{m.subject}</span>}
                            {m.course && <span className="badge badge-saffron">{m.course}</span>}
                            {!m.subject && !m.course && '—'}
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>{fmt(m.file_size)}</td>
                          <td>
                            <span className={`badge pub-badge ${m.is_published ? 'badge-green' : 'badge-red'}`}>
                              {m.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <a
                                href={m.download_url || `${BASE}/api/files/${m.filename}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-outline"
                                title="Download / Preview"
                              >
                                <FaDownload />
                              </a>
                              <button className="btn btn-sm btn-navy" onClick={() => openEditMaterial(m)} title="Edit File Details">
                                <FaEdit />
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => setDeleteMaterialId(m.id)} title="Delete File">
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 3: ACCESS PERMISSION REQUESTS
              ═══════════════════════════════════════════════════════════ */}
          {tab === 'requests' && (
            <div className="card">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student Details</th>
                      <th>Requested Folder</th>
                      <th>Folder Password</th>
                      <th>Student Note</th>
                      <th>Request Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestsData.items.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2.5rem' }}>
                          No permission requests submitted by students yet.
                        </td>
                      </tr>
                    ) : requestsData.items.map(r => {
                      const isCopied = copiedKey === `req-${r.id}`;

                      return (
                        <tr key={r.id}>
                          <td>
                            <strong style={{ color: 'var(--navy)' }}>{r.student_name}</strong>
                            <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginTop: '0.2rem' }}>
                              📱 {r.phone}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                              ✉️ {r.email}
                            </div>
                          </td>
                          <td>
                            <strong>
                              <FaFolder style={{ color: 'var(--saffron)', marginRight: '0.35rem' }} />
                              {r.folder_name}
                            </strong>
                          </td>
                          <td>
                            {r.folder_password ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span className="pwd-badge">{r.folder_password}</span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline"
                                  style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem' }}
                                  onClick={() => copyToClipboard(r.folder_password, `req-${r.id}`)}
                                  title="Copy Password"
                                >
                                  {isCopied ? <FaCheck style={{ color: 'var(--success)' }} /> : <FaCopy />}
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--gray-400)' }}>Free Access</span>
                            )}
                          </td>
                          <td style={{ maxWidth: '200px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                              {r.message || '—'}
                            </span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                            {new Date(r.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td>
                            <span className={`badge ${
                              r.status === 'APPROVED' ? 'badge-green' : r.status === 'REJECTED' ? 'badge-red' : 'badge-saffron'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                              {/* WhatsApp Direct Send Password Button */}
                              <a
                                href={getWhatsAppApprovalUrl(r)}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-whatsapp"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                                title="Approve & Send Password via WhatsApp"
                              >
                                <FaWhatsapp /> Send via WhatsApp
                              </a>

                              {r.status !== 'APPROVED' && (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                                  title="Mark Approved"
                                >
                                  <FaUserCheck />
                                </button>
                              )}

                              {r.status !== 'REJECTED' && (
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                                  title="Mark Rejected"
                                >
                                  <FaUserTimes />
                                </button>
                              )}

                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteRequest(r.id)}
                                title="Delete Record"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: CREATE / EDIT FOLDER
          ═══════════════════════════════════════════════════════════════ */}
      {showFolderModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">
                {editingFolder ? 'Edit Material Folder' : 'Create Material Folder'}
              </span>
              <button className="modal-close" onClick={() => setShowFolderModal(false)}>×</button>
            </div>

            {folderError && <div className="alert alert-error">{folderError}</div>}

            <form onSubmit={handleSaveFolder}>
              <div className="form-group">
                <label className="form-label">Folder Name *</label>
                <input
                  className="form-control"
                  placeholder="e.g. Python Crash Course 2026 Materials"
                  value={folderForm.name}
                  onChange={e => setFolderForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Folder Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Summary of resources inside this folder..."
                  value={folderForm.description}
                  onChange={e => setFolderForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Python Programming"
                    value={folderForm.subject}
                    onChange={e => setFolderForm(f => ({ ...f, subject: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Python Basic Crash Course"
                    value={folderForm.course}
                    onChange={e => setFolderForm(f => ({ ...f, course: e.target.value }))}
                  />
                </div>
              </div>

              {/* Security & Password section */}
              <div style={{ background: 'var(--gray-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: folderForm.is_protected ? '1rem' : 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                    <FaShieldAlt style={{ color: 'var(--saffron)' }} /> Folder Access Protection
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={folderForm.is_protected}
                        onChange={e => setFolderForm(f => ({ ...f, is_protected: e.target.checked }))}
                      />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ fontWeight: 600, color: folderForm.is_protected ? 'var(--navy)' : 'var(--gray-500)' }}>
                      {folderForm.is_protected ? '🔒 Password Protected (Admin Grants Permission)' : '🔓 Open to Everyone (Free Access)'}
                    </span>
                  </div>
                </div>

                {folderForm.is_protected && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Access Password *</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        style={{ padding: '0.15rem 0.5rem', fontSize: '0.78rem' }}
                        onClick={() => setFolderForm(f => ({ ...f, access_password: generatePassword('PASS') }))}
                      >
                        <FaRandom /> Generate Random
                      </button>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.5px' }}
                        placeholder="e.g. PYTHON@2026"
                        value={folderForm.access_password}
                        onChange={e => setFolderForm(f => ({ ...f, access_password: e.target.value }))}
                        required={folderForm.is_protected}
                      />
                    </div>
                    <small style={{ color: 'var(--gray-500)', marginTop: '0.3rem', display: 'block' }}>
                      Students will be prompted to enter this password before they can view and download files in this folder.
                    </small>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Publish Status</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={folderForm.is_published}
                      onChange={e => setFolderForm(f => ({ ...f, is_published: e.target.checked }))}
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span>{folderForm.is_published ? 'Published (Visible to students)' : 'Draft (Hidden)'}</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowFolderModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={folderSaving}>
                  {folderSaving ? 'Saving…' : 'Save Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: UPLOAD / EDIT MATERIAL FILE
          ═══════════════════════════════════════════════════════════════ */}
      {showMaterialModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editingMaterial ? 'Edit Material' : 'Upload Material File'}</span>
              <button className="modal-close" onClick={() => setShowMaterialModal(false)}>×</button>
            </div>

            {materialError && <div className="alert alert-error">{materialError}</div>}

            <form onSubmit={handleSaveMaterial}>
              {/* Folder Selector */}
              <div className="form-group">
                <label className="form-label">Assign to Folder</label>
                <select
                  className="form-control"
                  value={materialForm.folder_id}
                  onChange={e => setMaterialForm(f => ({ ...f, folder_id: e.target.value }))}
                >
                  <option value="">(No Folder / Root)</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.is_protected ? '🔒 ' : '🔓 '} {f.name}
                    </option>
                  ))}
                </select>
                <small style={{ color: 'var(--gray-500)', marginTop: '0.25rem', display: 'block' }}>
                  Files assigned to protected folders inherit the folder's access password requirement.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Material Title *</label>
                <input
                  className="form-control"
                  placeholder="e.g. Chapter 1 – Python Fundamentals & Code Notes"
                  value={materialForm.title}
                  onChange={e => setMaterialForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Optional brief notes or instructions..."
                  value={materialForm.description}
                  onChange={e => setMaterialForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Python"
                    value={materialForm.subject}
                    onChange={e => setMaterialForm(f => ({ ...f, subject: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Python Basic Crash Course"
                    value={materialForm.course}
                    onChange={e => setMaterialForm(f => ({ ...f, course: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Publish Status</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={materialForm.is_published}
                      onChange={e => setMaterialForm(f => ({ ...f, is_published: e.target.checked }))}
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span>{materialForm.is_published ? 'Published' : 'Draft'}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">File {!editingMaterial && '*'}</label>
                <div className="file-input-wrap" onClick={() => fileRef.current?.click()}>
                  <FaUpload style={{ color: 'var(--gray-400)', fontSize: '1.5rem' }} />
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', marginTop: '0.4rem' }}>
                    PDF, DOCX, PPTX, XLSX, TXT, PY, ZIP (max 20MB)
                  </p>
                  <p className="file-name">
                    {file ? file.name : (editingMaterial?.original_filename || 'No file chosen')}
                  </p>
                  <input
                    type="file"
                    ref={fileRef}
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.py,.zip,.rar"
                    onChange={e => setFile(e.target.files[0])}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowMaterialModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={materialSaving}>
                  {materialSaving ? 'Saving…' : 'Save File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modals */}
      {deleteFolderId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <span className="modal-title">Delete Folder</span>
              <button className="modal-close" onClick={() => setDeleteFolderId(null)}>×</button>
            </div>
            <p>
              Are you sure you want to delete this folder? All files inside this folder will also be removed.
            </p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteFolderId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteFolder}>Delete Folder</button>
            </div>
          </div>
        </div>
      )}

      {deleteMaterialId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <span className="modal-title">Delete Material</span>
              <button className="modal-close" onClick={() => setDeleteMaterialId(null)}>×</button>
            </div>
            <p>Permanently delete this material and its file from storage?</p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteMaterialId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteMaterial}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
