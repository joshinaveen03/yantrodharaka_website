import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaYoutube, FaLinkedinIn } from 'react-icons/fa';
import { contactApi } from '../api/endpoints';
import logoImg from '../assets/logo.png';
import './Footer.css';

export default function Footer() {
  const [contact, setContact] = useState({
    primary_phone: '+91 94832 08991',
    email: 'robo.yantrodharaka2026@gmail.com',
    address: 'Yantrodharaka Online Coaching Center & STEM Labs',
    instagram_url: 'https://www.instagram.com/robo.yantrodharaka2026?rpxt=cWlqeTU0b3ZwcHky',
    youtube_url: 'https://www.youtube.com/@robo.yantrodharaka2026',
    linkedin_url: 'https://www.linkedin.com/in/robo-yantrodharaka-8166a33ab/',
  });

  useEffect(() => {
    contactApi.getSettings()
      .then(res => {
        if (res.data) setContact(prev => ({ ...prev, ...res.data }));
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="footer">
      <div className="footer-wave" />
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <div className="footer-logo-wrap">
                <img src={logoImg} alt="Yantrodharaka" className="footer-logo-img" />
              </div>
              <div className="footer-logo-text">
                <span className="footer-logo-title">YANTRODHARAKA Online Coaching Center</span>
                <small className="footer-logo-sub">Build Skills | Create Innovation | Shape The Future</small>
              </div>
            </div>
            <p className="footer-tagline">
              Build Skills | Create Innovation | Shape The Future. Empowering young minds with AI, STEM, Robotics, and foundational academic excellence.
            </p>
            <div className="footer-socials">
              {contact.instagram_url && (
                <a
                  href={contact.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  id="footer-ig"
                  title="Follow us on Instagram"
                >
                  <FaInstagram />
                </a>
              )}
              {contact.youtube_url && (
                <a
                  href={contact.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  id="footer-yt"
                  title="Subscribe on YouTube"
                >
                  <FaYoutube />
                </a>
              )}
              {contact.linkedin_url && (
                <a
                  href={contact.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  id="footer-li"
                  title="Connect on LinkedIn"
                >
                  <FaLinkedinIn />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              {[['/', 'Home'], ['/courses', 'Courses'], ['/notifications', 'Notifications'],
                ['/materials', 'Study Materials'], ['/events', 'Events'], ['/gallery', 'Gallery'],
                ['/payment', 'Online Payment'], ['/about', 'About Us'], ['/contact', 'Contact']
              ].map(([to, label]) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <FaPhone className="contact-icon" />
                <a href={`tel:${(contact.primary_phone || '+91 94832 08991').replace(/\s+/g, '')}`} style={{ color: 'inherit' }}>
                  {contact.primary_phone || '+91 94832 08991'}
                </a>
              </li>
              <li>
                <FaEnvelope className="contact-icon" />
                <a href={`mailto:${contact.email || 'robo.yantrodharaka2026@gmail.com'}`} style={{ color: 'inherit', wordBreak: 'break-all' }}>
                  {contact.email || 'robo.yantrodharaka2026@gmail.com'}
                </a>
              </li>
              <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>
                  {contact.address || 'Yantrodharaka AI & STEM Coaching'}
                  {contact.city ? `, ${contact.city}` : ''}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Yantrodharaka Coaching Center. All rights reserved.</p>
          <p>Designed with ❤️ for academic excellence</p>
        </div>
      </div>
    </footer>
  );
}
