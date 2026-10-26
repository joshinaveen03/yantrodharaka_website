import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaBook, FaFile, FaCalendarAlt, FaEnvelope, FaArrowRight, FaCreditCard, FaRupeeSign, FaImages } from 'react-icons/fa';
import { adminApi } from '../../api/endpoints';

function StatBlock({ icon: Icon, label, value, color, to }) {
  return (
    <Link to={to} className="admin-stat-block">
      <div className="admin-stat-icon" style={{ background: color }}>
        <Icon />
      </div>
      <div>
        <div className="admin-stat-value">{value ?? '—'}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
      <FaArrowRight className="admin-stat-arrow" />
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard – Admin';
    adminApi.stats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-sub">Welcome to the Yantrodharaka Admin Portal</p>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <div className="admin-stats-grid">
          <StatBlock icon={FaCreditCard}   label="Fee Payments"   value={stats?.payments || 0}   color="linear-gradient(135deg,#10B981,#059669)" to="/admin/payments" />
          <StatBlock icon={FaRupeeSign}    label="Revenue (₹)"    value={stats?.total_revenue?.toLocaleString('en-IN') || '0'} color="linear-gradient(135deg,#F4810A,#D96C00)" to="/admin/payments" />
          <StatBlock icon={FaImages}       label="Gallery Photos" value={stats?.gallery ?? 0}    color="linear-gradient(135deg,#6366F1,#4F46E5)" to="/admin/gallery" />
          <StatBlock icon={FaBell}         label="Notifications"  value={stats?.notifications}  color="linear-gradient(135deg,#F4810A,#FFA040)" to="/admin/notifications" />
          <StatBlock icon={FaBook}         label="Courses"        value={stats?.courses}         color="linear-gradient(135deg,#0A1F44,#1A3A7A)" to="/admin/courses" />
          <StatBlock icon={FaFile}         label="Study Materials" value={stats?.study_materials} color="linear-gradient(135deg,#10B981,#34D399)" to="/admin/materials" />
          <StatBlock icon={FaCalendarAlt}  label="Events"         value={stats?.events}          color="linear-gradient(135deg,#8B5CF6,#A78BFA)" to="/admin/events" />
          <StatBlock icon={FaEnvelope}     label="Enquiries"      value={stats?.enquiries}       color="linear-gradient(135deg,#3B82F6,#60A5FA)" to="/admin/enquiries" />
          <StatBlock icon={FaEnvelope}     label="Unread"         value={stats?.unread_enquiries} color="linear-gradient(135deg,#EF4444,#F87171)" to="/admin/enquiries" />
        </div>
      )}

      <div className="admin-quick-links">
        <h2 className="admin-section-title">Quick Actions</h2>
        <div className="quick-links-grid">
          {[
            { to: '/admin/payments',      label: 'View Fee Payments',  cls: 'btn-primary' },
            { to: '/admin/gallery',       label: 'Manage Gallery Pics', cls: 'btn-navy' },
            { to: '/admin/notifications', label: '+ New Notification', cls: 'btn-primary' },
            { to: '/admin/courses',       label: '+ New Course',       cls: 'btn-navy' },
            { to: '/admin/materials',     label: '+ Upload Material',  cls: 'btn-success' },
            { to: '/admin/events',        label: '+ New Event',        cls: 'btn-primary' },
          ].map(({ to, label, cls }) => (
            <Link key={to} to={to} className={`btn ${cls}`}>{label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
