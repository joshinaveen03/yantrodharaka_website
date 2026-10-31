import React, { useEffect, useState } from 'react';
import {
  FaFolder, FaFolderOpen, FaLock, FaUnlock, FaDownload,
  FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileAlt, FaFileArchive, FaFileCode,
  FaChevronRight, FaArrowLeft, FaSearch, FaEye, FaEyeSlash,
  FaWhatsapp, FaPaperPlane, FaShieldAlt, FaKey, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import { materialsApi } from '../api/endpoints';
import './Pages.css';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const STORAGE_KEY = 'yantro_unlocked_folders';

function FileIcon({ mime, filename }) {
  const ext = filename ? filename.split('.').pop().toLowerCase() : '';
  if (mime?.includes('pdf') || ext === 'pdf')  return <FaFilePdf style={{ color: '#dc2626' }} />;
  if (mime?.includes('word') || ['doc', 'docx'].includes(ext)) return <FaFileWord style={{ color: '#2563eb' }} />;
  if (mime?.includes('powerpoint') || ['ppt', 'pptx'].includes(ext)) return <FaFilePowerpoint style={{ color: '#ea580c' }} />;
  if (['zip', 'rar', '7z', 'tar'].includes(ext)) return <FaFileArchive style={{ color: '#d97706' }} />;
  if (['py', 'js', 'html', 'css', 'cpp', 'c', 'json'].includes(ext)) return <FaFileCode style={{ color: '#059669' }} />;
  return <FaFileAlt style={{ color: '#4b5563' }} />;
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Materials() {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderItems, setFolderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');

  // Unlocked tokens map { folderId: token }
  const [unlockedMap, setUnlockedMap] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal states
  const [modalFolder, setModalFolder] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  // Request access sub-view in modal
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    student_name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    document.title = 'Study Materials – Yantrodharaka Coaching Center';
    loadFolders();
  }, []);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const res = await materialsApi.listFolders();
      setFolders(res.data || []);
    } catch (err) {
      console.error('Failed to load material folders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFolder = async (folder) => {
    // If not protected, open directly
    if (!folder.is_protected) {
      await loadFolderItems(folder, '');
      return;
    }

    // If protected, check if we already have an unlock token
    const token = unlockedMap[folder.id];
    if (token) {
      await loadFolderItems(folder, token);
    } else {
      // Prompt modal
      setModalFolder(folder);
      setPasswordInput('');
      setUnlockError('');
      setShowRequestForm(false);
      setRequestSuccess('');
      setRequestError('');
    }
  };

  const loadFolderItems = async (folder, token = '') => {
    setItemsLoading(true);
    try {
      const res = await materialsApi.getFolderItems(folder.id, token);
      setSelectedFolder(res.data.folder || folder);
      setFolderItems(res.data.items || []);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        // Token was invalid or expired, prompt for password again
        setModalFolder(folder);
        setPasswordInput('');
        setUnlockError('Your session has expired. Please re-enter the password.');
        // Remove bad token
        setUnlockedMap(prev => {
          const next = { ...prev };
          delete next[folder.id];
          try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
          return next;
        });
      } else {
        alert(err.response?.data?.detail || 'Failed to load materials in this folder.');
      }
    } finally {
      setItemsLoading(false);
    }
  };

  const handleUnlockSubmit = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setUnlockError('Please enter the access password.');
      return;
    }

    setUnlocking(true);
    setUnlockError('');

    try {
      const res = await materialsApi.unlockFolder(modalFolder.id, passwordInput.trim());
      const token = res.data.token;

      // Update tokens in state and session
      const nextMap = { ...unlockedMap, [modalFolder.id]: token };
      setUnlockedMap(nextMap);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextMap));
      } catch {}

      // Close modal and load folder items
      const targetFolder = modalFolder;
      setModalFolder(null);
      await loadFolderItems(targetFolder, token);
    } catch (err) {
      setUnlockError(err.response?.data?.detail || 'Incorrect password. Please contact the administrator.');
    } finally {
      setUnlocking(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.student_name.trim() || !requestForm.email.trim() || !requestForm.phone.trim()) {
      setRequestError('Please fill in Name, Email, and Phone number.');
      return;
    }

    setRequestSubmitting(true);
    setRequestError('');
    setRequestSuccess('');

    try {
      await materialsApi.requestAccess({
        folder_id: modalFolder.id,
        student_name: requestForm.student_name,
        email: requestForm.email,
        phone: requestForm.phone,
        message: requestForm.message,
      });
      setRequestSuccess('Request submitted successfully! The admin will review and send you the password via WhatsApp / Email.');
      setRequestForm({ student_name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setRequestError(err.response?.data?.detail || 'Failed to submit request. Please try again or use WhatsApp.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleLockFolder = (folderId) => {
    const nextMap = { ...unlockedMap };
    delete nextMap[folderId];
    setUnlockedMap(nextMap);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextMap));
    } catch {}
    setSelectedFolder(null);
    setFolderItems([]);
  };

  // Filter folders by search query
  const filteredFolders = folders.filter(f => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      f.name?.toLowerCase().includes(q) ||
      f.subject?.toLowerCase().includes(q) ||
      f.course?.toLowerCase().includes(q) ||
      f.description?.toLowerCase().includes(q)
    );
  });

  // Filter items inside opened folder
  const filteredItems = folderItems.filter(m => {
    if (!fileSearch.trim()) return true;
    const q = fileSearch.toLowerCase();
    return (
      m.title?.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q)
    );
  });

  const getWhatsAppLink = (folderName) => {
    const text = encodeURIComponent(
      `Hello Yantrodharaka Admin,\nI would like to request permission and access password for the study material folder:\n*${folderName}*.\n\nMy Details:\nName: ${requestForm.student_name || ''}\nPhone: ${requestForm.phone || ''}`
    );
    return `https://wa.me/919483208991?text=${text}`;
  };

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <div className="page-hero page-hero-navy">
        <div className="container">
          <FaFolderOpen className="page-hero-icon" />
          <h1>Study Materials & Learning Vault</h1>
          <p>Folder-wise structured learning resources, lecture slides, code files, and STEM manuals</p>
        </div>
      </div>

      <div className="container section-sm">
        {/* Navigation Breadcrumb */}
        <div className="folder-nav-bar">
          <div className="folder-breadcrumb">
            <button
              className="folder-breadcrumb-btn"
              onClick={() => { setSelectedFolder(null); setFolderItems([]); }}
            >
              <FaFolder /> Study Materials
            </button>
            {selectedFolder && (
              <>
                <FaChevronRight style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }} />
                <span className="folder-breadcrumb-current">
                  {selectedFolder.name}
                  {selectedFolder.is_protected ? (
                    <span className="folder-lock-badge unlocked" style={{ marginLeft: '0.5rem' }}>
                      <FaUnlock /> Unlocked
                    </span>
                  ) : (
                    <span className="folder-lock-badge open" style={{ marginLeft: '0.5rem' }}>
                      Open
                    </span>
                  )}
                </span>
              </>
            )}
          </div>

          {selectedFolder ? (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => { setSelectedFolder(null); setFolderItems([]); }}
              >
                <FaArrowLeft /> Back to All Folders
              </button>
              {selectedFolder.is_protected && (
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => handleLockFolder(selectedFolder.id)}
                  title="Lock this folder"
                >
                  <FaLock /> Lock
                </button>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.88rem', color: 'var(--gray-500)', fontWeight: 500 }}>
              {folders.length} Material Folders Available
            </div>
          )}
        </div>

        {/* ── View 1: Inside an Open Folder ─────────────────────────────── */}
        {selectedFolder ? (
          <div>
            <div className="folder-detail-banner">
              <div className="folder-detail-header">
                <div className="folder-detail-title-group">
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedFolder.subject && (
                      <span className="badge badge-saffron">{selectedFolder.subject}</span>
                    )}
                    {selectedFolder.course && (
                      <span className="badge badge-navy" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                        {selectedFolder.course}
                      </span>
                    )}
                  </div>
                  <h2>{selectedFolder.name}</h2>
                  {selectedFolder.description && <p>{selectedFolder.description}</p>}
                </div>

                <div className="folder-detail-actions">
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0.5rem 1rem' }}>
                    {folderItems.length} {folderItems.length === 1 ? 'Resource' : 'Resources'}
                  </span>
                </div>
              </div>
            </div>

            {/* In-folder Search */}
            <div className="search-bar">
              <input
                type="text"
                className="form-control"
                placeholder="Search resources in this folder..."
                value={fileSearch}
                onChange={e => setFileSearch(e.target.value)}
              />
              <button type="button" className="btn btn-primary"><FaSearch /> Filter</button>
            </div>

            {itemsLoading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : filteredItems.length === 0 ? (
              <div className="empty-state">
                <FaFolderOpen />
                <h3>No files found</h3>
                <p style={{ color: 'var(--gray-400)', marginTop: '0.5rem' }}>
                  {fileSearch ? 'No files match your search filter.' : 'This folder is currently empty.'}
                </p>
              </div>
            ) : (
              <div className="materials-grid">
                {filteredItems.map(m => {
                  const token = unlockedMap[selectedFolder.id] || '';
                  const downloadUrl = m.download_url
                    ? (m.download_url.includes('?') ? `${m.download_url}&token=${encodeURIComponent(token)}` : `${m.download_url}?token=${encodeURIComponent(token)}`)
                    : `${BASE}/api/materials/${m.id}/download?token=${encodeURIComponent(token)}`;

                  return (
                    <div key={m.id} className="material-card">
                      <div className="material-icon">
                        <FileIcon mime={m.mime_type} filename={m.original_filename} />
                      </div>
                      <div className="material-info">
                        <h4>{m.title}</h4>
                        {m.description && <p>{m.description}</p>}
                        <div className="material-meta">
                          {m.subject && <span className="badge badge-navy">{m.subject}</span>}
                          {m.course  && <span className="badge badge-saffron">{m.course}</span>}
                          {m.original_filename && (
                            <span className="file-size" style={{ alignSelf: 'center' }}>
                              📄 {m.original_filename}
                            </span>
                          )}
                        </div>
                        <div className="material-footer">
                          <span className="file-size">
                            {formatSize(m.file_size)} · {new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary btn-sm"
                            id={`download-mat-${m.id}`}
                            download={m.original_filename || m.title}
                          >
                            <FaDownload /> Download File
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ── View 2: All Material Folders ───────────────────────────── */
          <div>
            {/* Search Folders */}
            <div className="search-bar">
              <input
                type="text"
                className="form-control"
                placeholder="Search study folders by subject, topic, or course..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="button" className="btn btn-primary"><FaSearch /> Search</button>
            </div>

            {loading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : filteredFolders.length === 0 ? (
              <div className="empty-state">
                <FaFolder />
                <h3>No material folders found</h3>
                <p style={{ color: 'var(--gray-400)', marginTop: '0.5rem' }}>
                  {search ? 'Try adjusting your search terms.' : 'Material folders will be published here soon.'}
                </p>
              </div>
            ) : (
              <div className="folder-grid">
                {filteredFolders.map(folder => {
                  const isUnlocked = !folder.is_protected || !!unlockedMap[folder.id];

                  return (
                    <div
                      key={folder.id}
                      className={`folder-card ${isUnlocked ? 'unlocked' : ''}`}
                      onClick={() => handleOpenFolder(folder)}
                    >
                      <div>
                        <div className="folder-card-header">
                          <div className="folder-icon-wrap">
                            {isUnlocked ? <FaFolderOpen /> : <FaFolder />}
                          </div>
                          <div>
                            {folder.is_protected ? (
                              isUnlocked ? (
                                <span className="folder-lock-badge unlocked">
                                  <FaUnlock /> Unlocked
                                </span>
                              ) : (
                                <span className="folder-lock-badge locked">
                                  <FaLock /> Password Access
                                </span>
                              )
                            ) : (
                              <span className="folder-lock-badge open">
                                Free Access
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="folder-card-body">
                          <h3>{folder.name}</h3>
                          {folder.description && <p>{folder.description}</p>}

                          <div className="folder-meta-tags">
                            {folder.subject && <span className="badge badge-navy">{folder.subject}</span>}
                            {folder.course && <span className="badge badge-saffron">{folder.course}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="folder-card-footer">
                        <span className="folder-file-count">
                          <FaFileAlt style={{ color: 'var(--gray-400)' }} />
                          {folder.items_count || 0} {folder.items_count === 1 ? 'file' : 'files'}
                        </span>

                        <span className="folder-action-btn btn btn-sm btn-primary">
                          {isUnlocked ? (
                            <>Browse Files <FaChevronRight style={{ fontSize: '0.75rem' }} /></>
                          ) : (
                            <><FaKey style={{ fontSize: '0.8rem' }} /> Enter Password</>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Password Unlock & Permission Request Modal ─────────────────── */}
      {modalFolder && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setModalFolder(null); }}>
          <div className="modal unlock-modal">
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <span className="modal-title" style={{ fontSize: '1rem', color: 'var(--gray-500)' }}>
                Folder Protection
              </span>
              <button className="modal-close" onClick={() => setModalFolder(null)}>×</button>
            </div>

            <div className="unlock-modal-header">
              <div className="unlock-icon-circle">
                <FaLock />
              </div>
              <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--navy)', marginBottom: '0.4rem' }}>
                {modalFolder.name}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--gray-500)', maxWidth: '380px', margin: '0 auto' }}>
                This study material folder is protected. Please enter the access password provided by your teacher / admin to open.
              </p>
            </div>

            {unlockError && (
              <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FaExclamationCircle />
                <span>{unlockError}</span>
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handleUnlockSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Access Password</label>
                <div className="unlock-password-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter folder access password..."
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="unlock-pwd-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setModalFolder(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  disabled={unlocking}
                >
                  {unlocking ? 'Verifying…' : <><FaKey /> Unlock Folder</>}
                </button>
              </div>
            </form>

            <div className="unlock-divider">or don't have the password?</div>

            {/* Request Permission from Admin Box */}
            <div className="request-permission-card">
              <h5>Need Access Permission?</h5>
              <p>Registered students or enrolled participants can request the folder password directly from the administrator.</p>

              {!showRequestForm ? (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-navy"
                    onClick={() => setShowRequestForm(true)}
                  >
                    <FaPaperPlane /> Request Permission Form
                  </button>
                  <a
                    href={getWhatsAppLink(modalFolder.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-whatsapp"
                  >
                    <FaWhatsapp /> WhatsApp Admin
                  </a>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} style={{ textAlign: 'left', marginTop: '1rem' }}>
                  {requestSuccess && (
                    <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <FaCheckCircle /> <span>{requestSuccess}</span>
                    </div>
                  )}
                  {requestError && (
                    <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>
                      {requestError}
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Student Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '0.88rem', padding: '0.45rem 0.75rem' }}
                      placeholder="Your full name"
                      value={requestForm.student_name}
                      onChange={e => setRequestForm(f => ({ ...f, student_name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-row" style={{ gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        className="form-control"
                        style={{ fontSize: '0.88rem', padding: '0.45rem 0.75rem' }}
                        placeholder="+91 94832 08991"
                        value={requestForm.phone}
                        onChange={e => setRequestForm(f => ({ ...f, phone: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        style={{ fontSize: '0.88rem', padding: '0.45rem 0.75rem' }}
                        placeholder="you@email.com"
                        value={requestForm.email}
                        onChange={e => setRequestForm(f => ({ ...f, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Note / Course Details (Optional)</label>
                    <textarea
                      rows={2}
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                      placeholder="e.g. Enrolled in Python Weekend Workshop, need class materials"
                      value={requestForm.message}
                      onChange={e => setRequestForm(f => ({ ...f, message: e.target.value }))}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => setShowRequestForm(false)}
                    >
                      Hide Form
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary"
                      disabled={requestSubmitting}
                    >
                      {requestSubmitting ? 'Sending…' : 'Submit Request to Admin'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
