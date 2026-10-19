import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaYoutube, FaLinkedinIn } from 'react-icons/fa';
import logoImg from '../assets/logo.png';
import './Footer.css';

export default function Footer() {
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
                <span className="footer-logo-title">Yantrodharaka</span>
                <small className="footer-logo-sub">AI &bull; STEM &bull; Innovation</small>
              </div>
            </div>
            <p className="footer-tagline">
              Empowering young minds with AI, STEM, Robotics, and academic excellence for a smarter, technology-driven future.
            </p>
            <div className="footer-socials">
              <a
                href="https://www.instagram.com/robo.yantrodharaka2026?rpxt=cWlqeTU0b3ZwcHky"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                id="footer-ig"
                title="Follow us on Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.youtube.com/@robo.yantrodharaka2026"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                id="footer-yt"
                title="Subscribe on YouTube"
              >
                <FaYoutube />
              </a>
              <a
                href="https://www.linkedin.com/in/robo-yantrodharaka-8166a33ab/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                id="footer-li"
                title="Connect on LinkedIn"
              >
                <FaLinkedinIn />
              </a>
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
                <a href="tel:+919483208991" style={{ color: 'inherit' }}>+91 94832 08991</a>
              </li>
              <li>
                <FaEnvelope className="contact-icon" />
                <a href="mailto:robo.yantrodharaka2026@gmail.com" style={{ color: 'inherit' }}>
                  robo.yantrodharaka2026@gmail.com
                </a>
              </li>
              <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>Yantrodharaka AI &amp; STEM Coaching</span>
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
