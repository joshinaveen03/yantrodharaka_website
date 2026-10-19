import React, { useEffect, useState } from 'react';
import { FaBook, FaDownload, FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileAlt,
         FaChevronLeft, FaChevronRight, FaSearch } from 'react-icons/fa';
import { materialsApi } from '../api/endpoints';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function FileIcon({ mime }) {
  if (mime?.includes('pdf'))  return <FaFilePdf style={{ color: '#dc2626' }} />;
  if (mime?.includes('word')) return <FaFileWord style={{ color: '#1d4ed8' }} />;
  if (mime?.includes('ppt'))  return <FaFilePowerpoint style={{ color: '#ea580c' }} />;
  return <FaFileAlt style={{ color: '#6b7280' }} />;
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Materials() {
  const [data, setData]     = useState({ items: [], pages: 1 });
  const [page, setPage]     = useState(1);
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Study Materials – Yantrodharaka Coaching Center';
  }, []);

  useEffect(() => {
    setLoading(true);
    materialsApi.list(page, subject, '').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [page, subject]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); };

  return (
    <div className="page-wrapper">
      <div className="page-hero page-hero-navy">
        <div className="container">
          <FaBook className="page-hero-icon" />
          <h1>Study Materials</h1>
          <p>Download resources to support your learning journey</p>
        </div>
      </div>

      <div className="container section-sm">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            className="form-control"
            placeholder="Filter by subject..."
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
          <button type="submit" className="btn btn-primary"><FaSearch /> Search</button>
        </form>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : data.items.length === 0 ? (
          <div className="empty-state"><FaBook /><h3>No materials found</h3></div>
        ) : (
          <>
            <div className="materials-grid">
              {data.items.map(m => (
                <div key={m.id} className="material-card card">
                  <div className="material-icon">
                    <FileIcon mime={m.mime_type} />
                  </div>
                  <div className="material-info">
                    <h4>{m.title}</h4>
                    {m.description && <p>{m.description}</p>}
                    <div className="material-meta">
                      {m.subject && <span className="badge badge-navy">{m.subject}</span>}
                      {m.course  && <span className="badge badge-saffron">{m.course}</span>}
                    </div>
                    <div className="material-footer">
                      <span className="file-size">{formatSize(m.file_size)} · {new Date(m.created_at).toLocaleDateString('en-IN')}</span>
                      <a
                        href={m.download_url || `${BASE}/api/files/${m.filename}`}
                        target="_blank" rel="noreferrer"
                        className="btn btn-primary btn-sm"
                        id={`download-mat-${m.id}`}
                      >
                        <FaDownload /> Download
                      </a>
                    </div>
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
