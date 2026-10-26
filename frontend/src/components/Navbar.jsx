import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import logoImg from '../assets/logo.png';
import './Navbar.css';

const links = [
  { to: '/',             label: 'Home' },
  { to: '/notifications',label: 'Notifications' },
  { to: '/courses',      label: 'Courses' },
  { to: '/materials',    label: 'Materials' },
  { to: '/events',       label: 'Events' },
  { to: '/gallery',      label: 'Gallery' },
  { to: '/about',        label: 'About Us' },
  { to: '/contact',      label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-wrap">
            <img src={logoImg} alt="Yantrodharaka Logo" className="brand-logo-img" />
            <div className="brand-logo-glow" />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-main">YANTRODHARAKA</span>
              <span className="brand-badge">Online Coaching Center</span>
            </div>
            <span className="brand-tagline">Build Skills | Create Innovation | Shape The Future</span>
          </div>
        </Link>

        <div className={`navbar-right ${open ? 'open' : ''}`}>
          <nav className="navbar-nav-links">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="navbar-actions-row">
            <Link
              to="/payment"
              className="btn btn-primary btn-sm nav-pay-btn"
              onClick={() => setOpen(false)}
            >
              Pay Online
            </Link>
            <Link
              to="/admin"
              className="btn btn-outline-saffron btn-sm nav-admin-btn"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          </div>
        </div>

        <button
          className="nav-toggle"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          id="nav-toggle-btn"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </header>
  );
}
