import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, FaBell, FaBook,
  FaFile, FaCalendarAlt, FaEnvelope, FaSignOutAlt,
  FaBars, FaTimes, FaUser, FaCreditCard, FaImages, FaPhoneAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import './AdminLayout.css';

const NAV = [
  { to: '/admin/dashboard',        icon: FaTachometerAlt, label: 'Dashboard' },
  { to: '/admin/notifications',    icon: FaBell,          label: 'Notifications' },
  { to: '/admin/courses',          icon: FaBook,          label: 'Courses' },
  { to: '/admin/materials',        icon: FaFile,          label: 'Study Materials' },
  { to: '/admin/events',           icon: FaCalendarAlt,   label: 'Events' },
  { to: '/admin/gallery',          icon: FaImages,        label: 'Gallery' },
  { to: '/admin/enquiries',        icon: FaEnvelope,      label: 'Enquiries' },
  { to: '/admin/payments',         icon: FaCreditCard,    label: 'Fee Payments' },
  { to: '/admin/contact-settings', icon: FaPhoneAlt,      label: 'Contact Details' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-wrap">
            <img src={logoImg} alt="Logo" className="sidebar-logo-img" />
          </div>
          <div>
            <span className="sidebar-brand">Yantrodharaka</span>
            <span className="sidebar-sub">Admin Portal</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon /> <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar"><FaUser /></div>
            <div>
              <span className="sidebar-user-name">{admin?.full_name || 'Admin'}</span>
              <span className="sidebar-user-email">{admin?.email}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} id="admin-logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="topbar-toggle" onClick={() => setSidebarOpen(o => !o)}>
            <FaBars />
          </button>
          <div className="topbar-title">Admin Dashboard</div>
          <div className="topbar-user">
            <FaUser /> <span>{admin?.email}</span>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
