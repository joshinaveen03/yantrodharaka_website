import React, { useEffect, useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { contactApi } from '../../api/endpoints';
import './Admin.css';

export default function AdminEnquiries() {
  const [data, setData]       = useState({ items: [], pages: 1 });
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    contactApi.adminList(page).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { document.title = 'Enquiries – Admin'; load(); }, [page]);

  const markRead = async (id) => {
    try { await contactApi.markRead(id); load(); } catch {}
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title"><FaEnvelope style={{ color: 'var(--saffron)' }} /> Contact Enquiries</h1>
        <p className="admin-page-sub">Messages submitted through the contact form</p>
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Subject</th><th>Message</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>No enquiries yet.</td></tr>
                ) : data.items.map(e => (
                  <tr key={e.id} style={{ background: e.is_read ? 'transparent' : 'rgba(244,129,10,.04)' }}>
                    <td><strong>{e.name}</strong></td>
                    <td><a href={`mailto:${e.email}`} style={{ color: 'var(--navy)' }}>{e.email}</a></td>
                    <td>{e.phone || '—'}</td>
                    <td>{e.subject || '—'}</td>
                    <td style={{ maxWidth: '220px' }}><span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.message}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(e.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      {e.is_read
                        ? <span className="badge badge-green">Read</span>
                        : <button className="btn btn-sm btn-outline-saffron" onClick={() => markRead(e.id)}>Mark Read</button>
                      }
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
    </div>
  );
}
