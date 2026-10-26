import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBell, FaDownload, FaChevronLeft, FaChevronRight,
  FaCalendarAlt, FaClock, FaLaptopCode, FaCheckCircle,
  FaCreditCard, FaArrowRight
} from 'react-icons/fa';
import { notificationsApi } from '../api/endpoints';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function Notifications() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Notifications & Live Announcements – Yantrodharaka';
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
          <h1>Official Notifications &amp; Batches</h1>
          <p>Upcoming workshops, live crash course schedules, and academy announcements</p>
        </div>
      </div>

      <div className="container section-sm" style={{ maxWidth: '960px' }}>
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : data.items.length === 0 ? (
          <div className="empty-state">
            <FaBell />
            <h3>No Active Notifications</h3>
            <p>New workshop and batch announcements will appear here soon.</p>
          </div>
        ) : (
          <>
            <div className="notifs-list">
              {data.items.map(n => {
                // If title has "Python", highlight it, or highlight second half
                const titleText = n.title;
                return (
                  <div key={n.id} className="notif-spotlight-box">
                    <div className="notif-spotlight-top">
                      <div className="spotlight-live-pill">
                        <span className="live-pulse-dot" />
                        <span>
                          Official Notification • {new Date(n.publication_date || n.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <h2 className="notif-spotlight-title">
                      {titleText.toLowerCase().startsWith('welcome to') ? (
                        <>
                          {titleText.match(/^welcome to (the )?/i)[0]}
                          <span className="spotlight-title-highlight">
                            {titleText.replace(/^welcome to (the )?/i, '')}
                          </span>
                        </>
                      ) : (
                        titleText
                      )}
                    </h2>

                    {n.description && (
                      <p className="notif-spotlight-lead">
                        {n.description}
                      </p>
                    )}

                    {/* 4 Highlights Grid */}
                    <div className="spotlight-meta-grid">
                      <div className="spotlight-meta-card">
                        <FaCalendarAlt className="meta-icon icon-saffron" />
                        <div>
                          <span className="meta-card-label">Dates</span>
                          <strong>{n.dates || '15 & 16 August 2026'}</strong>
                          <small>{n.dates_sub || 'Saturday & Sunday'}</small>
                        </div>
                      </div>

                      <div className="spotlight-meta-card">
                        <FaClock className="meta-icon icon-cyan" />
                        <div>
                          <span className="meta-card-label">Timing</span>
                          <strong>{n.timing || '5:00 PM – 7:00 PM IST'}</strong>
                          <small>{n.timing_sub || 'Live Interactive Sessions'}</small>
                        </div>
                      </div>

                      <div className="spotlight-meta-card">
                        <FaLaptopCode className="meta-icon icon-purple" />
                        <div>
                          <span className="meta-card-label">Platform</span>
                          <strong>{n.platform || 'Microsoft Teams'}</strong>
                          <small>{n.platform_sub || 'Online Hands-on Classroom'}</small>
                        </div>
                      </div>

                      <div className="spotlight-meta-card">
                        <FaCheckCircle className="meta-icon icon-green" />
                        <div>
                          <span className="meta-card-label">Fee &amp; Perks</span>
                          <strong style={{ color: 'var(--saffron-dk)' }}>{n.fee || '₹49 Only'}</strong>
                          <small>{n.perks || 'Certificate & Code Files'}</small>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="spotlight-actions">
                      {n.payment_url && (
                        <Link
                          to={n.payment_url}
                          className="btn btn-primary btn-lg spotlight-register-btn"
                          id={`pay-btn-${n.id}`}
                        >
                          <FaCreditCard /> Pay &amp; Register Online ({n.fee || '₹49'})
                        </Link>
                      )}

                      {n.form_url && (
                        <a
                          href={n.form_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-saffron btn-lg"
                          id={`form-btn-${n.id}`}
                        >
                          Google Form <FaArrowRight />
                        </a>
                      )}

                      {n.attachment_filename && (
                        <a
                          href={n.download_url || `${BASE}/api/files/${n.attachment_filename}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-lg"
                          id={`download-notif-${n.id}`}
                        >
                          <FaDownload /> {n.attachment_original_name || 'Download Official Brochure'}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {data.pages > 1 && (
              <div className="pagination" style={{ marginTop: '2.5rem' }}>
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
