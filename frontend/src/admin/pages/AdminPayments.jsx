import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaSearch, FaCheckCircle, FaRupeeSign, FaPrint, FaDownload, FaSyncAlt } from 'react-icons/fa';
import { paymentsApi } from '../../api/endpoints';

export default function AdminPayments() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1, total_revenue: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    paymentsApi
      .adminList(page, search)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Payments & Fee Registrations – Admin';
    load();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Fee Payments &amp; Registrations</h2>
          <p>Track all student fee transactions, UPI UTR numbers, and receipts</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}>
          <FaSyncAlt /> Refresh
        </button>
      </div>

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
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 700 }}>Payment Mode</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--saffron-dk)', marginTop: '8px' }}>
            Instant UPI &amp; QR Scan
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
