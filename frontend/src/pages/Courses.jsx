import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaClock, FaCheckCircle, FaArrowRight, FaChevronLeft, FaChevronRight, FaChalkboardTeacher } from 'react-icons/fa';
import { coursesApi } from '../api/endpoints';

export default function Courses() {
  const [data, setData] = useState({ items: [], pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Courses – Yantrodharaka Coaching Center';
    setLoading(true);
    coursesApi.list(page).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="page-wrapper">
      <div className="page-hero page-hero-saffron">
        <div className="container">
          <FaBook className="page-hero-icon" />
          <h1>Our Courses</h1>
          <p>Comprehensive programs tailored for your academic success</p>
        </div>
      </div>

      <div className="container section-sm">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : data.items.length === 0 ? (
          <div className="empty-state"><FaBook /><h3>No courses available yet</h3></div>
        ) : (
          <>
            <div className="grid-3">
              {data.items.map(c => (
                <div key={c.id} className="course-detail-card card">
                  <div className="course-detail-icon"><FaBook /></div>
                  <h3>{c.name}</h3>
                  {c.description && <p className="course-desc">{c.description}</p>}
                  <div className="course-meta">
                    <div className="course-meta-item" style={{ color: 'var(--saffron-dk)', fontWeight: 600 }}>
                      <FaChalkboardTeacher /> <span>Mentor: Naveen Joshi (FITT IIT Delhi)</span>
                    </div>
                    {c.duration && (
                      <div className="course-meta-item">
                        <FaClock /> <span>{c.duration}</span>
                      </div>
                    )}
                    {c.eligibility && (
                      <div className="course-meta-item">
                        <FaCheckCircle /> <span>{c.eligibility}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {c.name.toLowerCase().includes('python') ? (
                      <a
                        href="https://forms.gle/TAYVJrSX7DAbpuFN8"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        Register for ₹49 <FaArrowRight />
                      </a>
                    ) : (
                      <Link to="/contact" className="btn btn-primary btn-sm">
                        Enquire Now <FaArrowRight />
                      </Link>
                    )}
                    <Link to="/contact" className="btn btn-outline btn-sm">
                      Details
                    </Link>
                  </div>
                </div>
              ))}
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
