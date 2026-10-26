import React, { useState, useEffect } from 'react';
import {
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaInstagram,
  FaYoutube, FaLinkedinIn, FaWhatsapp, FaSave, FaCheck, FaSyncAlt
} from 'react-icons/fa';
import { contactApi } from '../../api/endpoints';

export default function AdminContactSettings() {
  const [settings, setSettings] = useState({
    primary_phone: '+91 94832 08991',
    secondary_phone: '',
    whatsapp_number: '+91 94832 08991',
    email: 'robo.yantrodharaka2026@gmail.com',
    secondary_email: '',
    address: 'Yantrodharaka Online Coaching Center & STEM Labs',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    working_hours: 'Mon – Sat: 9:00 AM – 7:00 PM | Sun: 10:00 AM – 4:00 PM',
    instagram_url: 'https://www.instagram.com/robo.yantrodharaka2026?rpxt=cWlqeTU0b3ZwcHky',
    youtube_url: '',
    linkedin_url: '',
    map_embed_url: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const load = () => {
    setLoading(true);
    contactApi
      .getSettings()
      .then(res => {
        if (res.data) setSettings(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Contact Details & Settings – Admin';
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await contactApi.updateSettings(settings);
      setSettings(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update contact settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Center Contact Details &amp; Settings</h2>
          <p>Update phone numbers, WhatsApp, email, address, working hours, and social media channels</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
          <FaSyncAlt /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Settings Form */}
          <form onSubmit={handleSubmit}>
            {/* Phone & WhatsApp Card */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaPhone style={{ color: 'var(--saffron)' }} /> Phone &amp; WhatsApp Communication
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Primary Phone Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. +91 94832 08991"
                    value={settings.primary_phone}
                    onChange={e => setSettings({ ...settings, primary_phone: e.target.value })}
                    required
                  />
                  <small style={{ color: 'var(--gray-500)', fontSize: '0.78rem' }}>Displayed in hero, navbar, contact page &amp; footer</small>
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. +91 94832 08991"
                    value={settings.whatsapp_number || ''}
                    onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  />
                  <small style={{ color: 'var(--gray-500)', fontSize: '0.78rem' }}>Used for direct WhatsApp chat &amp; admissions</small>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Secondary / Alternate Helpline (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 080-12345678"
                  value={settings.secondary_phone || ''}
                  onChange={e => setSettings({ ...settings, secondary_phone: e.target.value })}
                />
              </div>
            </div>

            {/* Email Addresses Card */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaEnvelope style={{ color: '#00d8ff' }} /> Official Email Addresses
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Primary Center Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. robo.yantrodharaka2026@gmail.com"
                    value={settings.email}
                    onChange={e => setSettings({ ...settings, email: e.target.value })}
                    required
                  />
                  <small style={{ color: 'var(--gray-500)', fontSize: '0.78rem' }}>Main email shown on contact page &amp; receipt seal</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Admissions / Alternate Email (Optional)</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. admissions@yantrodharaka.in"
                    value={settings.secondary_email || ''}
                    onChange={e => setSettings({ ...settings, secondary_email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Address & Working Hours Card */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaMapMarkerAlt style={{ color: '#ef4444' }} /> Center Location &amp; Hours
              </h3>

              <div className="form-group">
                <label className="form-label">Center Address / Campus Details *</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={settings.address || ''}
                  onChange={e => setSettings({ ...settings, address: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.city || ''}
                    onChange={e => setSettings({ ...settings, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State &amp; PIN Code</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Karnataka"
                      value={settings.state || ''}
                      onChange={e => setSettings({ ...settings, state: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="560001"
                      value={settings.pincode || ''}
                      onChange={e => setSettings({ ...settings, pincode: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Office &amp; Laboratory Hours</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Mon – Sat: 9:00 AM – 7:00 PM | Sun: 10:00 AM – 4:00 PM"
                  value={settings.working_hours || ''}
                  onChange={e => setSettings({ ...settings, working_hours: e.target.value })}
                />
              </div>
            </div>

            {/* Social Media Channels */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaInstagram style={{ color: '#e1306c' }} /> Social Media &amp; Profiles
              </h3>

              <div className="form-group">
                <label className="form-label">Instagram Profile URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://www.instagram.com/robo.yantrodharaka2026..."
                  value={settings.instagram_url || ''}
                  onChange={e => setSettings({ ...settings, instagram_url: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">YouTube Channel URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://youtube.com/@yantrodharaka"
                    value={settings.youtube_url || ''}
                    onChange={e => setSettings({ ...settings, youtube_url: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn Page URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://linkedin.com/company/yantrodharaka"
                    value={settings.linkedin_url || ''}
                    onChange={e => setSettings({ ...settings, linkedin_url: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <FaSave /> {saving ? 'Saving Details…' : 'Save Contact Details'}
              </button>
              {success && (
                <span style={{ color: 'var(--success)', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem' }}>
                  <FaCheck /> Contact details updated across website!
                </span>
              )}
            </div>
          </form>

          {/* Live Preview Column */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--saffron-lt)' }}>
              <span className="badge badge-saffron" style={{ marginBottom: '1rem' }}>
                Live Website Preview
              </span>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>
                How it appears to students:
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(244,129,10,0.12)', color: 'var(--saffron-dk)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaPhone />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 700 }}>Phone</span>
                    <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{settings.primary_phone || '—'}</div>
                    {settings.secondary_phone && <small style={{ color: 'var(--gray-500)' }}>Alt: {settings.secondary_phone}</small>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaWhatsapp />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 700 }}>WhatsApp</span>
                    <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{settings.whatsapp_number || '—'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(0,216,255,0.12)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaEnvelope />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 700 }}>Email</span>
                    <div style={{ fontWeight: 700, color: 'var(--navy)', wordBreak: 'break-all' }}>{settings.email || '—'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 700 }}>Address</span>
                    <div style={{ color: 'var(--gray-700)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                      {settings.address || '—'}
                      {settings.city ? `, ${settings.city}` : ''}
                      {settings.state ? `, ${settings.state}` : ''}
                      {settings.pincode ? ` – ${settings.pincode}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(10,31,68,0.08)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaClock />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 700 }}>Hours</span>
                    <div style={{ color: 'var(--gray-700)', fontSize: '0.85rem', lineHeight: 1.4 }}>{settings.working_hours || '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
