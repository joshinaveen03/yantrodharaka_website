import React, { useEffect, useState } from 'react';
import {
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle,
  FaInstagram, FaYoutube, FaLinkedinIn
} from 'react-icons/fa';
import { contactApi } from '../api/endpoints';

const INITIAL = { name: '', email: '', phone: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm]       = useState(INITIAL);
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    document.title = 'Contact Us – Yantrodharaka AI & STEM Coaching';
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setApiError('');
    try {
      await contactApi.submit(form);
      setSuccess(true);
      setForm(INITIAL);
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-hero page-hero-saffron">
        <div className="container">
          <FaEnvelope className="page-hero-icon" />
          <h1>Contact Us</h1>
          <p>We'd love to hear from you</p>
        </div>
      </div>

      <div className="container section-sm">
        <div className="contact-layout">
          {/* Info */}
          <div className="contact-info">
            <h2 className="section-title">Get In Touch</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
              Have questions about our courses, admissions, or anything else? Fill out the form
              and we'll get back to you as soon as possible.
            </p>

            <div className="contact-info-items">
              {[
                {
                  icon: FaPhone,
                  label: 'Phone',
                  value: '+91 94832 08991',
                  href: 'tel:+919483208991'
                },
                {
                  icon: FaEnvelope,
                  label: 'Email',
                  value: 'robo.yantrodharaka2026@gmail.com',
                  href: 'mailto:robo.yantrodharaka2026@gmail.com'
                },
                {
                  icon: FaMapMarkerAlt,
                  label: 'Address',
                  value: 'Yantrodharaka AI & STEM Coaching'
                },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="contact-info-item">
                  <div className="contact-info-icon"><Icon /></div>
                  <div>
                    <span className="contact-info-label">{label}</span>
                    {href ? (
                      <a href={href} className="contact-info-value" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {value}
                      </a>
                    ) : (
                      <span className="contact-info-value">{value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Channels */}
            <div className="contact-social-section" style={{ marginTop: '2.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--navy)', marginBottom: '1rem' }}>
                Follow &amp; Connect With Us
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a
                  href="https://www.instagram.com/robo.yantrodharaka2026?rpxt=cWlqeTU0b3ZwcHky"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-pill"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--white)',
                    border: '1px solid var(--gray-200)',
                    color: 'var(--gray-700)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.88rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <FaInstagram style={{ color: '#E1306C', fontSize: '1.25rem' }} />
                  <span>@robo.yantrodharaka2026</span>
                </a>

                <a
                  href="https://www.youtube.com/@robo.yantrodharaka2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-pill"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--white)',
                    border: '1px solid var(--gray-200)',
                    color: 'var(--gray-700)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.88rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <FaYoutube style={{ color: '#FF0000', fontSize: '1.25rem' }} />
                  <span>YouTube: @robo.yantrodharaka2026</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/robo-yantrodharaka-8166a33ab/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-pill"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--white)',
                    border: '1px solid var(--gray-200)',
                    color: 'var(--gray-700)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.88rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <FaLinkedinIn style={{ color: '#0A66C2', fontSize: '1.25rem' }} />
                  <span>LinkedIn: Robo Yantrodharaka</span>
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="contact-form-wrap card">
            {success ? (
              <div className="contact-success">
                <FaCheckCircle className="success-icon" />
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We will contact you shortly.</p>
                <button className="btn btn-primary" onClick={() => setSuccess(false)}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate id="contact-form">
                <h3 className="modal-title" style={{ marginBottom: '1.5rem' }}>Send Enquiry</h3>

                {apiError && <div className="alert alert-error">{apiError}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="cnt-name">Full Name *</label>
                    <input id="cnt-name" name="name" className={`form-control ${errors.name ? 'error' : ''}`}
                      value={form.name} onChange={handleChange} placeholder="Your name" />
                    {errors.name && <p className="form-error">{errors.name}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cnt-email">Email *</label>
                    <input id="cnt-email" name="email" type="email" className={`form-control ${errors.email ? 'error' : ''}`}
                      value={form.email} onChange={handleChange} placeholder="you@example.com" />
                    {errors.email && <p className="form-error">{errors.email}</p>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="cnt-phone">Phone</label>
                    <input id="cnt-phone" name="phone" className="form-control"
                      value={form.phone} onChange={handleChange} placeholder="Optional" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cnt-subject">Subject</label>
                    <input id="cnt-subject" name="subject" className="form-control"
                      value={form.subject} onChange={handleChange} placeholder="Enquiry subject" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cnt-message">Message *</label>
                  <textarea id="cnt-message" name="message" className={`form-control ${errors.message ? 'error' : ''}`}
                    value={form.message} onChange={handleChange} placeholder="Write your message here..." rows={5} />
                  {errors.message && <p className="form-error">{errors.message}</p>}
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} id="contact-submit-btn" style={{ width: '100%' }}>
                  {submitting ? 'Sending...' : <><FaPaperPlane /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
