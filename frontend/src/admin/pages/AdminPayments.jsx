import React, { useState, useEffect } from 'react';
import {
  FaCreditCard, FaSearch, FaCheckCircle, FaRupeeSign, FaPrint,
  FaDownload, FaSyncAlt, FaTrash, FaEdit, FaPlus, FaCog, FaQrcode,
  FaUniversity, FaShieldAlt, FaSave, FaCheck
} from 'react-icons/fa';
import { paymentsApi } from '../../api/endpoints';

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'packages' | 'settings'

  // Transactions State
  const [data, setData] = useState({ items: [], total: 0, pages: 1, total_revenue: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Packages State
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null); // null = closed, {} = new, pkg = edit
  const [savingPkg, setSavingPkg] = useState(false);
  const [deletePkgTarget, setDeletePkgTarget] = useState(null);

  // Settings State
  const [settings, setSettings] = useState({
    upi_id: '9483208991@upi',
    payee_name: 'Yantrodharaka Coaching Centre',
    enable_upi: true,
    enable_bank: true,
    enable_card: true,
    bank_name: 'State Bank of India',
    account_name: 'Yantrodharaka Coaching Centre',
    account_number: '9483208991001',
    ifsc_code: 'SBIN0001234',
    branch: 'Main Branch',
    contact_phone: '+91 94832 08991',
    contact_email: 'robo.yantrodharaka2026@gmail.com',
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Load Transactions
  const loadTransactions = () => {
    setLoading(true);
    paymentsApi
      .adminList(page, search)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Load Packages
  const loadPackages = () => {
    setLoadingPackages(true);
    paymentsApi
      .adminListPackages()
      .then(r => setPackages(r.data))
      .catch(() => {})
      .finally(() => setLoadingPackages(false));
  };

  // Load Settings
  const loadSettings = () => {
    setLoadingSettings(true);
    paymentsApi
      .getSettings()
      .then(r => setSettings(r.data))
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
  };

  useEffect(() => {
    document.title = 'Payments & Fee Settings – Admin';
    loadTransactions();
    loadPackages();
    loadSettings();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadTransactions();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await paymentsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadTransactions();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete payment');
    } finally {
      setDeleting(false);
    }
  };

  // Package Save (Create or Update)
  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (!editingPkg.name.trim() || !editingPkg.pkg_key.trim()) {
      alert('Package key and name are required');
      return;
    }
    setSavingPkg(true);
    try {
      if (editingPkg.id) {
        await paymentsApi.updatePackage(editingPkg.id, editingPkg);
      } else {
        await paymentsApi.createPackage(editingPkg);
      }
      setEditingPkg(null);
      loadPackages();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save course package');
    } finally {
      setSavingPkg(false);
    }
  };

  // Package Delete
  const handleDeletePackage = async () => {
    if (!deletePkgTarget) return;
    try {
      await paymentsApi.deletePackage(deletePkgTarget.id);
      setDeletePkgTarget(null);
      loadPackages();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete course package');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      const res = await paymentsApi.updateSettings(settings);
      setSettings(res.data);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save payment settings');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Fee Payments &amp; Portal Settings</h2>
          <p>Manage payment transactions, fee programs, UPI QR codes, and bank accounts</p>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            loadTransactions();
            loadPackages();
            loadSettings();
          }}
        >
          <FaSyncAlt /> Refresh All
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid var(--gray-200)', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'transactions' ? '3px solid var(--saffron)' : '3px solid transparent',
            color: activeTab === 'transactions' ? 'var(--navy)' : 'var(--gray-500)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaCreditCard /> Fee Transactions ({data.total})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('packages')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'packages' ? '3px solid var(--saffron)' : '3px solid transparent',
            color: activeTab === 'packages' ? 'var(--navy)' : 'var(--gray-500)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaRupeeSign /> Course Fee Packages ({packages.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'settings' ? '3px solid var(--saffron)' : '3px solid transparent',
            color: activeTab === 'settings' ? 'var(--navy)' : 'var(--gray-500)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaCog /> UPI &amp; Bank Settings
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TAB 1: TRANSACTIONS & RECEIPTS
         ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'transactions' && (
        <div>
          {/* Revenue & Total Counters */}
          <div className="admin-stats-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="stat-card" style={{ background: 'var(--white)', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 700 }}>Total Payments</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy)', marginTop: '4px' }}>{data.total}</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--white)', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 700 }}>Total Revenue Collected</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
                ₹{(data.total_revenue || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="stat-card" style={{ background: 'var(--white)', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 700 }}>Active UPI ID</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--saffron-dk)', marginTop: '8px', fontFamily: 'monospace' }}>
                {settings.upi_id}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="admin-toolbar" style={{ marginBottom: '1.5rem' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '500px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search by student name, phone, email, UTR, or receipt no..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <FaSearch /> Search
              </button>
            </form>
          </div>

          {/* Payments Table */}
          <div className="card">
            {loading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : data.items.length === 0 ? (
              <div className="empty-state">
                <FaCreditCard />
                <h3>No payments found</h3>
                <p>Payments made via the online portal will appear here.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Receipt No</th>
                      <th>Student Details</th>
                      <th>Course</th>
                      <th>Amount</th>
                      <th>Mode / UTR Ref</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map(p => (
                      <tr key={p.id}>
                        <td>
                          <strong style={{ fontFamily: 'monospace', fontSize: '0.88rem', color: 'var(--navy)' }}>
                            {p.receipt_no}
                          </strong>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{p.student_name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                            📞 {p.phone} | ✉️ {p.email}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.88rem' }}>{p.course_name}</td>
                        <td>
                          <strong style={{ color: 'var(--success)', fontSize: '1rem' }}>
                            ₹{p.amount.toLocaleString('en-IN')}
                          </strong>
                        </td>
                        <td>
                          <span className="badge badge-navy" style={{ display: 'inline-block', marginBottom: '2px' }}>
                            {p.payment_method}
                          </span>
                          <div style={{ fontFamily: 'monospace', fontSize: '0.76rem', color: 'var(--gray-500)' }}>
                            {p.transaction_ref || '—'}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                          {new Date(p.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td>
                          <span className="badge badge-success">
                            <FaCheckCircle /> {p.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-sm btn-danger"
                            title="Delete payment"
                            onClick={() => setDeleteTarget(p)}
                            style={{ padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <FaTrash /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 2: COURSE FEE PACKAGES
         ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'packages' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <p style={{ color: 'var(--gray-600)', margin: 0 }}>
              Configure the courses and fee options displayed on the public <strong>/payment</strong> page.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setEditingPkg({
                pkg_key: `course-${Date.now().toString().slice(-4)}`,
                name: '',
                amount: 499,
                badge: 'New',
                description: '',
                is_custom: false,
                is_active: true,
                display_order: packages.length + 1,
              })}
            >
              <FaPlus /> Add Course Package
            </button>
          </div>

          <div className="card">
            {loadingPackages ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : packages.length === 0 ? (
              <div className="empty-state">
                <FaRupeeSign />
                <h3>No course packages found</h3>
                <p>Click "Add Course Package" to create your first fee option.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Course / Program Name</th>
                      <th>Fee Amount</th>
                      <th>Badge</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map(pkg => (
                      <tr key={pkg.id}>
                        <td style={{ fontWeight: 700, color: 'var(--gray-400)' }}>#{pkg.display_order}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{pkg.name}</div>
                          <small style={{ color: 'var(--gray-400)', fontFamily: 'monospace' }}>Key: {pkg.pkg_key}</small>
                        </td>
                        <td>
                          {pkg.is_custom ? (
                            <span className="badge badge-navy">Custom Input</span>
                          ) : (
                            <strong style={{ color: 'var(--saffron-dk)', fontSize: '1.1rem' }}>₹{pkg.amount}</strong>
                          )}
                        </td>
                        <td>
                          {pkg.badge ? <span className="badge badge-saffron">{pkg.badge}</span> : '—'}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--gray-600)', maxWidth: '300px' }}>
                          {pkg.description || '—'}
                        </td>
                        <td>
                          <span className={`badge ${pkg.is_active ? 'badge-success' : 'badge-navy'}`}>
                            {pkg.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setEditingPkg({ ...pkg })}
                            style={{ marginRight: '0.5rem', padding: '0.35rem 0.65rem' }}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeletePkgTarget(pkg)}
                            style={{ padding: '0.35rem 0.65rem' }}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 3: PAYMENT MODES & UPI SETTINGS
         ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: '850px' }}>
          <form onSubmit={handleSaveSettings}>
            {/* UPI Settings Card */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaQrcode style={{ color: 'var(--saffron)' }} /> UPI &amp; Instant QR Code Settings
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Active UPI ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.upi_id}
                    onChange={e => setSettings({ ...settings, upi_id: e.target.value })}
                    required
                  />
                  <small style={{ color: 'var(--gray-500)', fontSize: '0.78rem' }}>
                    Payments from Google Pay, PhonePe, Paytm, and BHIM will route to this UPI ID.
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Payee Name (Shown in UPI Apps)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.payee_name}
                    onChange={e => setSettings({ ...settings, payee_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--navy)' }}>
                  <input
                    type="checkbox"
                    checked={settings.enable_upi}
                    onChange={e => setSettings({ ...settings, enable_upi: e.target.checked })}
                  />
                  Enable UPI &amp; QR Code Payment Mode on Public Page
                </label>
              </div>
            </div>

            {/* Bank Transfer Details Card */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaUniversity style={{ color: '#00d8ff' }} /> Bank Transfer Details (NEFT / IMPS / RTGS)
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.bank_name || ''}
                    onChange={e => setSettings({ ...settings, bank_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Holder Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.account_name || ''}
                    onChange={e => setSettings({ ...settings, account_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Bank Account Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.account_number || ''}
                    onChange={e => setSettings({ ...settings, account_number: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">IFSC Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.ifsc_code || ''}
                    onChange={e => setSettings({ ...settings, ifsc_code: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Branch &amp; City</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.branch || ''}
                  onChange={e => setSettings({ ...settings, branch: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={settings.enable_bank}
                    onChange={e => setSettings({ ...settings, enable_bank: e.target.checked })}
                  />
                  Enable Bank Transfer Mode
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={settings.enable_card}
                    onChange={e => setSettings({ ...settings, enable_card: e.target.checked })}
                  />
                  Enable Debit / Credit Card Option
                </label>
              </div>
            </div>

            {/* Support Contact Information */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--navy)', marginBottom: '1.25rem' }}>
                Payment Support Contact Information
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Support Phone / WhatsApp</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.contact_phone || ''}
                    onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Support Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={settings.contact_email || ''}
                    onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={savingSettings}>
                <FaSave /> {savingSettings ? 'Saving Settings…' : 'Save Payment Settings'}
              </button>
              {settingsSuccess && (
                <span style={{ color: 'var(--success)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaCheck /> Settings saved successfully!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODALS
         ══════════════════════════════════════════════════════════════ */}

      {/* Add / Edit Package Modal */}
      {editingPkg && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <span className="modal-title">{editingPkg.id ? 'Edit Course Package' : 'Add New Course Package'}</span>
              <button className="modal-close" onClick={() => setEditingPkg(null)}>×</button>
            </div>
            <form onSubmit={handleSavePackage}>
              <div className="form-group">
                <label className="form-label">Course / Program Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Python Basic Crash Course (Aug 15 & 16, 2026)"
                  value={editingPkg.name}
                  onChange={e => setEditingPkg({ ...editingPkg, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fee Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="e.g. 49"
                    value={editingPkg.amount}
                    onChange={e => setEditingPkg({ ...editingPkg, amount: Number(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Badge Label</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Popular, Next-Gen, Comprehensive"
                    value={editingPkg.badge || ''}
                    onChange={e => setEditingPkg({ ...editingPkg, badge: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Unique Package Key *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. python-crash"
                    value={editingPkg.pkg_key}
                    onChange={e => setEditingPkg({ ...editingPkg, pkg_key: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={editingPkg.display_order || 1}
                    onChange={e => setEditingPkg({ ...editingPkg, display_order: Number(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="e.g. Live 2-day weekend crash course on Microsoft Teams."
                  value={editingPkg.description || ''}
                  onChange={e => setEditingPkg({ ...editingPkg, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={editingPkg.is_custom}
                    onChange={e => setEditingPkg({ ...editingPkg, is_custom: e.target.checked })}
                  />
                  Custom Fee (Student types amount)
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={editingPkg.is_active}
                    onChange={e => setEditingPkg({ ...editingPkg, is_active: e.target.checked })}
                  />
                  Active (Show on Payment Page)
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingPkg(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingPkg}>
                  {savingPkg ? 'Saving…' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Package Confirmation */}
      {deletePkgTarget && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <span className="modal-title">Delete Course Package</span>
              <button className="modal-close" onClick={() => setDeletePkgTarget(null)}>×</button>
            </div>
            <p style={{ margin: '1rem 0' }}>
              Are you sure you want to delete course package <strong>{deletePkgTarget.name}</strong>?
            </p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeletePkgTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeletePackage}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <span className="modal-title">Confirm Delete</span>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <p style={{ margin: '1rem 0' }}>
              Are you sure you want to delete payment receipt <strong>{deleteTarget.receipt_no}</strong> for <strong>{deleteTarget.student_name}</strong>?
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '1.25rem' }}>
              This will permanently delete the transaction and recalculate total revenue.
            </p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
