import React, { useEffect, useState } from 'react';
import { FaBell, FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { notificationsApi } from '../api/endpoints';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function Notifications() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Notifications – Yantrodharaka Coaching Center';
    setLoading(true);
    notificationsApi.list(page, 10)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="page-wrapper">
      <div className="page-hero page-hero-navy">
        <div className="container">
          <FaBell className="page-hero-icon" />
          <h1>Notifications</h1>
          <p>Stay informed with the latest announcements</p>
        </div>
      </div>

      <div className="container section-sm">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : data.items.length === 0 ? (
          <div className="empty-state">
            <FaBell />
            <h3>No Notifications</h3>
            <p>Check back soon for updates.</p>
          </div>
        ) : (
          <>
            <div className="notifs-grid">
              {data.items.map(n => (
                <div key={n.id} className="notif-card card">
                  <div className="notif-card-header">
                    <span className="badge badge-saffron">Notification</span>
                    <span className="notif-date">
                      {new Date(n.publication_date || n.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h3 className="notif-card-title">{n.title}</h3>
                  {n.description && <p className="notif-card-desc">{n.description}</p>}
                  {n.attachment_filename && (
                    <a
                      href={n.download_url || `${BASE}/api/files/${n.attachment_filename}`}
                      target="_blank" rel="noreferrer"
                      className="btn btn-outline btn-sm"
                      id={`download-notif-${n.id}`}
                    >
                      <FaDownload /> {n.attachment_original_name || 'Download PDF'}
                    </a>
                  )}
                </div>
              ))}
            </div>

            {data.pages > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  <FaChevronLeft />
                </button>
                {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                    {p}
                  </button>
                ))}
                <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === data.pages}>
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
