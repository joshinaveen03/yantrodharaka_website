import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { eventsApi } from '../api/endpoints';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function formatDate(str) {
  if (!str) return 'Date TBD';
  return new Date(str).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Events() {
  const [data, setData]     = useState({ items: [], pages: 1 });
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Events – Yantrodharaka Coaching Center';
    setLoading(true);
    eventsApi.list(page).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="page-wrapper">
      <div className="page-hero page-hero-saffron">
        <div className="container">
          <FaCalendarAlt className="page-hero-icon" />
          <h1>Events & Announcements</h1>
          <p>Upcoming programs, seminars and special events</p>
        </div>
      </div>

      <div className="container section-sm">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : data.items.length === 0 ? (
          <div className="empty-state"><FaCalendarAlt /><h3>No upcoming events</h3></div>
        ) : (
          <>
            <div className="events-full-list">
              {data.items.map(e => {
                const imgSource = e.image_url
                  ? (e.image_url.startsWith('http') ? e.image_url : `${BASE}${e.image_url}`)
                  : (e.title.toLowerCase().includes('python') ? '/python-crash-course-poster.jpg' : null);

                return (
                  <div key={e.id} className="event-full-card card">
                    {imgSource && (
                      <div className="event-img-wrap" style={{ maxHeight: '340px', overflow: 'hidden' }}>
                        <img src={imgSource} alt={e.title} className="event-img" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                      </div>
                    )}
                    <div className="event-full-body">
                      <div className="event-full-date">
                        <FaCalendarAlt />
                        <span>{formatDate(e.event_date)}</span>
                      </div>
                      <h3>{e.title}</h3>
                      {e.venue && (
                        <p className="event-venue-full"><FaMapMarkerAlt /> {e.venue}</p>
                      )}
                      {e.description && (
                        <p className="event-full-desc" style={{ whiteSpace: 'pre-line' }}>{e.description}</p>
                      )}
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        {e.description && e.description.includes('forms.gle') && (
                          <a
                            href="https://forms.gle/TAYVJrSX7DAbpuFN8"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                          >
                            Register via Google Form (₹49) &rarr;
                          </a>
                        )}
                        {e.document_url && (
                          <a href={e.document_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                            <FaDownload /> {e.document_original_name || 'Download Document'}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {data.pages > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}><FaChevronLeft /></button>
                {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === data.pages}><FaChevronRight /></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
