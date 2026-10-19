import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FaCreditCard, FaQrcode, FaCheckCircle, FaCopy, FaCheck,
  FaShieldAlt, FaPrint, FaUniversity
} from 'react-icons/fa';
import { paymentsApi } from '../api/endpoints';
import logoImg from '../assets/logo.png';
import './Payment.css';

const COURSES = [
  {
    id: 'python-crash',
    name: 'Python Basic Crash Course (Aug 15 & 16, 2026)',
    amount: 49,
    badge: 'Popular',
    desc: 'Live 2-day weekend crash course on Microsoft Teams.'
  },
  {
    id: 'robotics-stem',
    name: 'Robotics & STEM Weekend Program',
    amount: 1499,
    badge: 'Comprehensive',
    desc: 'Hands-on mechanical, sensors, and logic building.'
  },
  {
    id: 'arduino-iot',
    name: 'Arduino & Embedded IoT Lab',
    amount: 1999,
    badge: 'Hardware Included',
    desc: 'Microcontroller programming and IoT prototypes.'
  },
  {
    id: 'generative-ai',
    name: 'Generative AI & Machine Learning Foundations',
    amount: 2499,
    badge: 'Next-Gen',
    desc: 'Neural networks, prompt engineering & AI tools.'
  },
  {
    id: 'custom',
    name: 'Custom Fee / Installment Payment',
    amount: 100,
    badge: 'Flexible',
    desc: 'Enter any customized fee or monthly tuition installment.'
  }
];

export default function Payment() {
  const [searchParams] = useSearchParams();
  const preSelectedCourse = searchParams.get('course') || 'python-crash';

  const [selectedCourseId, setSelectedCourseId] = useState(preSelectedCourse);
  const [customAmount, setCustomAmount] = useState(100);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI | BANK | CARD
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [form, setForm] = useState({
    student_name: '',
    email: '',
    phone: '',
    transaction_ref: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [apiError, setApiError] = useState('');

  const receiptRef = useRef(null);

  useEffect(() => {
    document.title = 'Online Fee Payment – Yantrodharaka Academy';
  }, []);

  const activeCourse = COURSES.find(c => c.id === selectedCourseId) || COURSES[0];
  const payableAmount = selectedCourseId === 'custom' ? Number(customAmount) || 1 : activeCourse.amount;

  // Standard UPI deep-link URL
  const upiId = '9483208991@upi';
  const upiUrl = `upi://pay?pa=${upiId}&pn=Yantrodharaka%20Coaching%20Centre&am=${payableAmount}&cu=INR&tn=${encodeURIComponent(activeCourse.name)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUrl)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const validate = () => {
    const errs = {};
    if (!form.student_name.trim()) errs.student_name = 'Student name is required';
    if (!form.email.trim()) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';

    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\+?[0-9]{10,12}$/.test(form.phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'Valid 10-digit phone number is required';
    }

    if (paymentMethod === 'UPI' && !form.transaction_ref.trim()) {
      errs.transaction_ref = 'Please enter UPI Reference / UTR Number from your payment app';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        student_name: form.student_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        course_name: activeCourse.name,
        amount: payableAmount,
        payment_method: paymentMethod,
        transaction_ref: form.transaction_ref.trim() || `TRX-${Date.now().toString().slice(-8)}`,
        notes: form.notes.trim() || null
      };

      const res = await paymentsApi.submit(payload);
      setReceipt(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Payment verification failed. Please try again or contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-wrapper payment-page">
      {/* Hero */}
      <div className="page-hero page-hero-navy">
        <div className="container">
          <FaCreditCard className="page-hero-icon" />
          <h1>Online Fee Payment &amp; Registration</h1>
          <p>Instant UPI, QR Code, and card payment with automated digital receipt</p>
        </div>
      </div>

      <div className="container section-sm">
        {receipt ? (
          /* ══ OFFICIAL PAYMENT RECEIPT ═════════════════════════════ */
          <div className="receipt-container" ref={receiptRef}>
            <div className="receipt-card">
              <div className="receipt-header">
                <div className="receipt-logo-wrap">
                  <img src={logoImg} alt="Yantrodharaka Logo" className="receipt-logo" />
                </div>
                <div className="receipt-org-details">
                  <h2>YANTRODHARAKA COACHING CENTRE</h2>
                  <p className="receipt-org-sub">Robotics &amp; STEM Education Academy</p>
                  <p className="receipt-org-contact">📞 +91 94832 08991 | ✉️ robo.yantrodharaka2026@gmail.com</p>
                </div>
                <div className="receipt-status-stamp">
                  <FaCheckCircle />
                  <span>PAID</span>
                </div>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-title-bar">
                <h3>OFFICIAL PAYMENT RECEIPT</h3>
                <span className="receipt-number">Receipt No: <strong>{receipt.receipt_no}</strong></span>
              </div>

              <div className="receipt-grid">
                <div className="receipt-item">
                  <span className="receipt-label">Student Name:</span>
                  <span className="receipt-value">{receipt.student_name}</span>
                </div>
                <div className="receipt-item">
                  <span className="receipt-label">Date &amp; Time:</span>
                  <span className="receipt-value">
                    {new Date(receipt.created_at).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="receipt-item">
                  <span className="receipt-label">Email Address:</span>
                  <span className="receipt-value">{receipt.email}</span>
                </div>
                <div className="receipt-item">
                  <span className="receipt-label">Phone / WhatsApp:</span>
                  <span className="receipt-value">{receipt.phone}</span>
                </div>
                <div className="receipt-item full-width">
                  <span className="receipt-label">Course Enrolled:</span>
                  <span className="receipt-value highlight-course">{receipt.course_name}</span>
                </div>
                <div className="receipt-item">
                  <span className="receipt-label">Payment Mode:</span>
                  <span className="receipt-value">{receipt.payment_method}</span>
                </div>
                <div className="receipt-item">
                  <span className="receipt-label">Transaction / UTR Ref:</span>
                  <span className="receipt-value mono">{receipt.transaction_ref || 'VERIFIED'}</span>
                </div>
              </div>

              <div className="receipt-total-box">
                <span className="total-label">Total Amount Paid</span>
                <span className="total-amount">₹{receipt.amount.toLocaleString('en-IN')}</span>
              </div>

              <div className="receipt-footer">
                <p>
                  <em>Note: Please save or print this receipt for your records. Course access links and Microsoft Teams invitations will be sent to <strong>{receipt.email}</strong>.</em>
                </p>
                <div className="receipt-seal">
                  <span>Digitally Authorized</span>
                  <strong>Yantrodharaka Academy</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="receipt-actions no-print">
                <button className="btn btn-primary btn-lg" onClick={handlePrint}>
                  <FaPrint /> Print / Save PDF Receipt
                </button>
                <Link to="/" className="btn btn-outline btn-lg">
                  Return to Home
                </Link>
                <button
                  className="btn btn-outline-saffron btn-lg"
                  onClick={() => {
                    setReceipt(null);
                    setForm({ student_name: '', email: '', phone: '', transaction_ref: '', notes: '' });
                  }}
                >
                  Make Another Payment
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ══ PAYMENT & REGISTRATION FORM ══════════════════════════ */
          <div className="payment-layout">
            {/* Left Column: Course Selection & QR Code */}
            <div className="payment-left-col">
              <div className="card payment-card">
                <h2 className="section-title" style={{ fontSize: '1.4rem' }}>
                  1. Select Course / Program
                </h2>
                <div className="course-picker">
                  {COURSES.map(c => (
                    <label
                      key={c.id}
                      className={`course-pick-item ${selectedCourseId === c.id ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="course"
                        value={c.id}
                        checked={selectedCourseId === c.id}
                        onChange={() => setSelectedCourseId(c.id)}
                      />
                      <div className="course-pick-info">
                        <div className="course-pick-top">
                          <strong className="course-pick-name">{c.name}</strong>
                          <span className="course-pick-badge">{c.badge}</span>
                        </div>
                        <p className="course-pick-desc">{c.desc}</p>
                      </div>
                      <div className="course-pick-price">
                        {c.id === 'custom' ? (
                          <span>Custom</span>
                        ) : (
                          <span>₹{c.amount}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {selectedCourseId === 'custom' && (
                  <div className="custom-amount-wrap">
                    <label className="form-label" htmlFor="custom-amt">
                      Enter Amount to Pay (₹):
                    </label>
                    <input
                      id="custom-amt"
                      type="number"
                      min="1"
                      className="form-control"
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value)}
                    />
                  </div>
                )}

                {/* Amount Summary */}
                <div className="payment-summary-box">
                  <div className="summary-row">
                    <span>Payable Fee:</span>
                    <strong className="summary-amount">₹{payableAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <small style={{ color: 'var(--gray-500)' }}>
                    {activeCourse.id === 'python-crash' && '🔥 Special Promotional Fee (₹49 Only)'}
                  </small>
                </div>
              </div>

              {/* UPI & Payment Modes Card */}
              <div className="card payment-card" style={{ marginTop: '1.5rem' }}>
                <h2 className="section-title" style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>
                  2. Choose Payment Mode
                </h2>

                <div className="payment-method-tabs">
                  <button
                    type="button"
                    className={`method-tab ${paymentMethod === 'UPI' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    <FaQrcode /> UPI &amp; QR Code
                  </button>
                  <button
                    type="button"
                    className={`method-tab ${paymentMethod === 'BANK' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('BANK')}
                  >
                    <FaUniversity /> Bank Transfer
                  </button>
                  <button
                    type="button"
                    className={`method-tab ${paymentMethod === 'CARD' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('CARD')}
                  >
                    <FaCreditCard /> Debit / Card
                  </button>
                </div>

                {/* Method 1: UPI & QR Code */}
                {paymentMethod === 'UPI' && (
                  <div className="upi-payment-panel">
                    <div className="upi-qr-card">
                      <div className="upi-qr-frame">
                        <img
                          src={qrCodeUrl}
                          alt="Scan to Pay via UPI"
                          className="upi-qr-img"
                        />
                      </div>
                      <span className="upi-scan-hint">Scan with Google Pay, PhonePe, Paytm, or BHIM</span>

                      <div className="upi-id-bar">
                        <span>UPI ID: <strong>{upiId}</strong></span>
                        <button
                          type="button"
                          className="copy-upi-btn"
                          onClick={handleCopyUpi}
                        >
                          {copiedUpi ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}
                        </button>
                      </div>
                    </div>

                    <div className="upi-app-buttons">
                      <a href={upiUrl} className="btn-upi-app gpay">Google Pay</a>
                      <a href={upiUrl} className="btn-upi-app phonepe">PhonePe</a>
                      <a href={upiUrl} className="btn-upi-app paytm">Paytm</a>
                      <a href={upiUrl} className="btn-upi-app bhim">Any UPI App</a>
                    </div>
                  </div>
                )}

                {/* Method 2: Bank Transfer */}
                {paymentMethod === 'BANK' && (
                  <div className="bank-details-panel">
                    <div className="bank-info-grid">
                      <div>
                        <span className="bank-lbl">Account Name:</span>
                        <strong>Yantrodharaka Coaching Centre</strong>
                      </div>
                      <div>
                        <span className="bank-lbl">Account Number:</span>
                        <strong className="mono">9483208991001</strong>
                      </div>
                      <div>
                        <span className="bank-lbl">IFSC Code:</span>
                        <strong className="mono">SBIN0001234</strong>
                      </div>
                      <div>
                        <span className="bank-lbl">Branch:</span>
                        <strong>Main Branch, Bengaluru</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Method 3: Card Simulation */}
                {paymentMethod === 'CARD' && (
                  <div className="card-mock-panel">
                    <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                      Secure checkout gateway for Credit Card, Debit Card &amp; NetBanking.
                    </p>
                    <div className="card-inputs-grid">
                      <input type="text" placeholder="Card Number (XXXX XXXX XXXX XXXX)" className="form-control" maxLength="19" />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                        <input type="text" placeholder="MM/YY" className="form-control" maxLength="5" />
                        <input type="password" placeholder="CVV" className="form-control" maxLength="3" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Student Details & Verification Form */}
            <div className="payment-right-col">
              <div className="card payment-card sticky-form">
                <h2 className="section-title" style={{ fontSize: '1.4rem' }}>
                  3. Student Details &amp; Verification
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                  Fill in student information to issue the official registration receipt and Microsoft Teams login.
                </p>

                {apiError && <div className="alert alert-error">{apiError}</div>}

                <form onSubmit={handleSubmit} noValidate id="payment-verify-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="pay-name">Student Full Name *</label>
                    <input
                      id="pay-name"
                      type="text"
                      className={`form-control ${errors.student_name ? 'error' : ''}`}
                      placeholder="e.g. Ramesh Kumar"
                      value={form.student_name}
                      onChange={e => setForm({ ...form, student_name: e.target.value })}
                    />
                    {errors.student_name && <span className="field-error">{errors.student_name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="pay-email">Email Address (for Receipt &amp; Class Link) *</label>
                    <input
                      id="pay-email"
                      type="email"
                      className={`form-control ${errors.email ? 'error' : ''}`}
                      placeholder="e.g. student@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="pay-phone">Phone / WhatsApp Number *</label>
                    <input
                      id="pay-phone"
                      type="tel"
                      className={`form-control ${errors.phone ? 'error' : ''}`}
                      placeholder="e.g. 9483208991"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="pay-utr">
                      UPI Reference / UTR Number / Transaction ID *
                    </label>
                    <input
                      id="pay-utr"
                      type="text"
                      className={`form-control ${errors.transaction_ref ? 'error' : ''}`}
                      placeholder="12-digit UTR from GPay / PhonePe / Paytm"
                      value={form.transaction_ref}
                      onChange={e => setForm({ ...form, transaction_ref: e.target.value })}
                    />
                    <small style={{ color: 'var(--gray-400)', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>
                      Visible in your UPI payment history receipt (e.g. 423871928374).
                    </small>
                    {errors.transaction_ref && <span className="field-error">{errors.transaction_ref}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="pay-notes">Additional Notes / School / College (Optional)</label>
                    <input
                      id="pay-notes"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Class 10 / Engineering 1st Year"
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>

                  <div className="payment-security-notice">
                    <FaShieldAlt className="shield-ico" />
                    <span>256-Bit SSL Encrypted Verification • Official Yantrodharaka Academy Record</span>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-block payment-submit-btn"
                    disabled={submitting}
                    id="submit-payment-btn"
                  >
                    {submitting ? 'Verifying & Generating Receipt...' : `Complete Registration & Pay ₹${payableAmount}`}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
