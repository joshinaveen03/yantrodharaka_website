import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBell, FaBook, FaCalendarAlt, FaArrowRight, FaGraduationCap,
  FaTrophy, FaUsers, FaChalkboardTeacher, FaFilePdf,
  FaRobot, FaRocket, FaBrain, FaMicrochip, FaQuoteLeft,
  FaChevronLeft, FaChevronRight, FaCheckCircle, FaAtom,
  FaClock, FaLaptopCode, FaPhone, FaTimes, FaCreditCard
} from 'react-icons/fa';
import { notificationsApi, coursesApi, eventsApi } from '../api/endpoints';
import logoImg from '../assets/logo.png';
import posterImg from '../assets/python-crash-course-poster.jpg';
import trainerImg from '../assets/trainer-naveen-joshi.jpg';
import backdropStem from '../assets/backdrop-stem.jpg';
import backdropStemBanner from '../assets/backdrop-stem-banner.jpg';
import backdropInnovation from '../assets/backdrop-innovation.jpg';
import backdropInnovationBanner from '../assets/backdrop-innovation-banner.jpg';
import backdropGenai from '../assets/backdrop-genai.jpg';
import backdropGenaiBanner from '../assets/backdrop-genai-banner.jpg';
import './Home.css';

const HERO_SLIDES = [
  {
    id: 'stem',
    badge: 'AI & STEM Education',
    badgeIcon: FaRobot,
    quote: 'Igniting curiosity through hands-on robotics, computational logic, and experiential discovery.',
    title: 'Empowering Young Minds for a Smarter Future',
    subtitle: 'Nurturing curiosity, computational thinking, and hands-on scientific discovery through next-generation robotics, coding, and experiential learning.',
    image: backdropStem,
    banner: backdropStemBanner,
    colorAccent: '#00d8ff',
    pill: 'AI & STEM Education',
    tags: ['Hands-on Robotics', 'STEM Experiential Labs', 'Computational Logic'],
    primaryCta: { label: 'Explore AI & STEM', to: '/courses' },
    secondaryCta: { label: 'Book a Free Demo', to: '/contact' }
  },
  {
    id: 'innovation',
    badge: 'Future Tech & Innovation',
    badgeIcon: FaRocket,
    quote: 'Transforming creative curiosity into tangible technology with Arduino, IoT, and embedded systems.',
    title: 'Innovation Unlocks the Future of Technology',
    subtitle: 'Empowering students to solve real-world challenges through embedded circuits, Arduino programming, IoT, and modern engineering thinking.',
    image: backdropInnovation,
    banner: backdropInnovationBanner,
    colorAccent: '#f59e0b',
    pill: 'Global Innovation',
    tags: ['Arduino & Hardware', 'IoT Prototyping', 'Real-World Engineering'],
    primaryCta: { label: 'Hardware & IoT Labs', to: '/courses' },
    secondaryCta: { label: 'Join Next Cohort', to: '/contact' }
  },
  {
    id: 'genai',
    badge: 'Generative AI Academy',
    badgeIcon: FaBrain,
    quote: 'Step into tomorrow with Neural Networks, Generative AI models, and Intelligent Agentic systems.',
    title: 'Leading the Generative AI Revolution',
    subtitle: 'Step into tomorrow with state-of-the-art training in machine learning concepts, generative models, creative prompt engineering, and futuristic AI tools.',
    image: backdropGenai,
    banner: backdropGenaiBanner,
    colorAccent: '#a855f7',
    pill: 'Generative AI',
    tags: ['Neural Networks', 'Prompt Engineering', 'Creative Computing'],
    primaryCta: { label: 'Generative AI Program', to: '/courses' },
    secondaryCta: { label: 'Get Syllabus', to: '/materials' }
  }
];

function StatCard({ icon: Icon, value, label, accent }) {
  return (
    <div className="stat-card" style={{ '--card-accent': accent || 'var(--saffron)' }}>
      <div className="stat-icon-wrap" style={{ color: accent, borderColor: `${accent}44`, background: `radial-gradient(circle, ${accent}22 0%, rgba(10,31,68,0.5) 100%)` }}>
        <Icon />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function NotifItem({ n }) {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return (
    <div className="home-notif-item">
      <div className="home-notif-left">
        <span className="notif-badge-pill">OFFICIAL</span>
        <span className="home-notif-date">
          <FaCalendarAlt style={{ marginRight: '4px', color: 'var(--saffron)' }} />
          {new Date(n.publication_date || n.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
        </span>
      </div>
      <div className="home-notif-content">
        <h4>{n.title}</h4>
        {n.description && <p>{n.description.length > 140 ? n.description.slice(0, 140) + '…' : n.description}</p>}
      </div>
      <div className="home-notif-action">
        <Link to="/notifications" className="btn btn-outline btn-sm">
          View &amp; Register &rarr;
        </Link>
      </div>
    </div>
  );
}

function CourseCard({ c }) {
  return (
    <div className="home-course-card">
      <div className="course-card-top">
        <div className="course-card-icon"><FaGraduationCap /></div>
        {c.duration && <span className="badge badge-saffron">⏱ {c.duration}</span>}
      </div>
      <h3>{c.name}</h3>
      <p>{c.description}</p>
      <div className="course-card-footer">
        <Link to="/contact" className="btn btn-outline-saffron btn-sm">Enquire Now</Link>
        <Link to="/courses" className="btn btn-primary btn-sm">Details &rarr;</Link>
      </div>
    </div>
  );
}

function EventCard({ e }) {
  return (
    <div className="home-event-card">
      <div className="event-date-box">
        <span className="event-day">{e.event_date ? new Date(e.event_date).getDate() : '—'}</span>
        <span className="event-month">{e.event_date ? new Date(e.event_date).toLocaleString('en-IN', { month: 'short' }) : ''}</span>
      </div>
      <div className="event-content">
        <h4>{e.title}</h4>
        {e.venue && <p className="event-venue">📍 {e.venue}</p>}
        <p className="event-desc">{e.description}</p>
      </div>
      <div className="event-action">
        <Link to="/events" className="btn btn-outline btn-sm">Event Info &rarr;</Link>
      </div>
    </div>
  );
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPosterModal, setShowPosterModal] = useState(false);

  // Auto-advance hero slides every 6.5s
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    document.title = 'YANTRODHARAKA Online Coaching Center – Build Skills | Create Innovation | Shape The Future';
    Promise.all([
      notificationsApi.list(1, 4),
      coursesApi.list(1),
      eventsApi.list(1),
    ]).then(([n, c, e]) => {
      setNotifs(n.data.items || []);
      setCourses((c.data.items || []).slice(0, 3));
      setEvents((e.data.items || []).slice(0, 3));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="home-page">
      {/* ══ DYNAMIC HERO WITH BACKDROP SLIDER ══════════════════════ */}
      <section
        className="hero"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Backdrop Backgrounds with cross-fade */}
        {HERO_SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`hero-backdrop-layer ${idx === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${s.image})` }}
          />
        ))}

        {/* Ambient Dark Navy & Cyber Grid Overlays */}
        <div className="hero-gradient-overlay" />
        <div className="hero-grid-pattern" />

        <div className="container hero-content">
          {/* Left Text / Info */}
          <div className="hero-text">
            <div className="hero-announcement-pill">
              <span className="hero-brand-pulse-dot" />
              <span className="pill-strong">Admissions Open 2026–2027</span>
              <span className="hero-brand-divider">•</span>
              <span className="pill-tag">Hands-on AI, Robotics &amp; STEM Coaching</span>
            </div>

            <div className="hero-badge" style={{ borderColor: `${slide.colorAccent}55` }}>
              <slide.badgeIcon style={{ color: slide.colorAccent }} />
              <span>{slide.badge}</span>
            </div>

            <h1 className="hero-title">
              {slide.title.split(' ').slice(0, 3).join(' ')}{' '}
              <span className="hero-accent" style={{ color: slide.colorAccent }}>
                {slide.title.split(' ').slice(3).join(' ')}
              </span>
            </h1>

            {/* Featured Quote Highlight */}
            <div className="hero-quote-box">
              <FaQuoteLeft className="hero-quote-icon" style={{ color: slide.colorAccent }} />
              <p className="hero-quote-text">“{slide.quote}”</p>
            </div>

            <p className="hero-subtitle">{slide.subtitle}</p>

            {/* Tags */}
            <div className="hero-tags">
              {slide.tags.map(t => (
                <span key={t} className="hero-tag">
                  <FaCheckCircle className="hero-tag-icon" style={{ color: slide.colorAccent }} /> {t}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="hero-actions">
              <Link to={slide.primaryCta.to} className="btn btn-primary btn-lg hero-btn-glow">
                {slide.primaryCta.label} <FaArrowRight />
              </Link>
              <Link to={slide.secondaryCta.to} className="btn btn-outline-saffron btn-lg">
                {slide.secondaryCta.label}
              </Link>
            </div>

            {/* Slide Navigation Controls */}
            <div className="hero-controls">
              <button
                className="hero-arrow-btn"
                onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                aria-label="Previous slide"
              >
                <FaChevronLeft />
              </button>
              
              <div className="hero-pills">
                {HERO_SLIDES.map((s, i) => (
                  <button
                    key={s.id}
                    className={`hero-pill-btn ${i === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(i)}
                  >
                    <span className="pill-dot" />
                    {s.pill}
                  </button>
                ))}
              </div>

              <button
                className="hero-arrow-btn"
                onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)}
                aria-label="Next slide"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          {/* Right Visual: Centerpiece Yantrodharaka Emblem with Cyber Circuits */}
          <div className="hero-visual">
            <div className="emblem-container">
              {/* Rotating Outer Tech Ring */}
              <div className="tech-ring ring-outer" />
              {/* Counter-rotating Inner Tech Ring */}
              <div className="tech-ring ring-inner" />
              {/* Ambient Glow */}
              <div className="emblem-glow" style={{ background: `radial-gradient(circle, ${slide.colorAccent}40 0%, rgba(244,129,10,0.3) 50%, transparent 70%)` }} />

              {/* The Genuine Yantrodharaka Logo */}
              <div className="emblem-image-wrap">
                <img
                  src={logoImg}
                  alt="Yantrodharaka Emblem"
                  className="emblem-image"
                />
              </div>

              {/* Orbiting Badges */}
              <div className="floating-badge badge-top-right">
                <FaMicrochip className="badge-ico" />
                <span>Embedded Circuits &amp; IoT</span>
              </div>

              <div className="floating-badge badge-mid-left">
                <FaRobot className="badge-ico" />
                <span>AI &amp; Robotics Labs</span>
              </div>

              <div className="floating-badge badge-bottom-right">
                <FaTrophy className="badge-ico" />
                <span>Excellence &amp; Innovation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS SECTION ═════════════════════════════════════════ */}
      <section className="stats-section">
        <div className="container stats-grid">
          <StatCard icon={FaUsers}             value="500+"  label="Young Innovators" accent="#00d8ff" />
          <StatCard icon={FaMicrochip}         value="100+"  label="Robotics & IoT Kits" accent="#f59e0b" />
          <StatCard icon={FaChalkboardTeacher} value="25+"   label="Expert Mentors" accent="#10b981" />
          <StatCard icon={FaTrophy}            value="98%"   label="Success & Mastery" accent="#a855f7" />
        </div>
      </section>

      {/* ══ LIVE SPOTLIGHT: PYTHON BASIC CRASH COURSE ══════════════ */}
      <section className="section spotlight-section">
        <div className="container">
          <div className="spotlight-card">
            {/* Poster Preview with Zoom */}
            <div className="spotlight-poster-col">
              <div
                className="spotlight-poster-wrap"
                onClick={() => setShowPosterModal(true)}
                title="Click to view full poster"
              >
                <img
                  src={posterImg}
                  alt="Python Basic Crash Course - Yantrodharaka"
                  className="spotlight-poster-img"
                />
                <div className="spotlight-poster-overlay">
                  <span>🔍 Click to View Full Poster</span>
                </div>
                <div className="spotlight-fee-badge">
                  <span className="fee-lbl">FEE</span>
                  <span className="fee-num">₹49</span>
                  <span className="fee-sub">ONLY</span>
                </div>
              </div>
            </div>

            {/* Content & Direct Registration */}
            <div className="spotlight-content-col">
              <div className="spotlight-live-pill">
                <span className="live-pulse-dot" />
                <span>Featured Live Workshop • August 15 &amp; 16, 2026</span>
              </div>

              <h2 className="spotlight-title">
                Welcome to the <span className="spotlight-title-highlight">Python Basic Crash Course!</span>
              </h2>

              <p className="spotlight-lead">
                Kickstart your programming journey with our Python Basic Crash Course, specially designed for
                <strong> school students, college students, and beginners</strong> who want to learn Python programming from scratch.
              </p>

              {/* Meta Highlights */}
              <div className="spotlight-meta-grid">
                <div className="spotlight-meta-card">
                  <FaCalendarAlt className="meta-icon icon-saffron" />
                  <div>
                    <span className="meta-card-label">Dates</span>
                    <strong>15 &amp; 16 August 2026</strong>
                    <small>Saturday &amp; Sunday</small>
                  </div>
                </div>

                <div className="spotlight-meta-card">
                  <FaClock className="meta-icon icon-cyan" />
                  <div>
                    <span className="meta-card-label">Timing</span>
                    <strong>5:00 PM – 7:00 PM IST</strong>
                    <small>Live Interactive Sessions</small>
                  </div>
                </div>

                <div className="spotlight-meta-card">
                  <FaLaptopCode className="meta-icon icon-purple" />
                  <div>
                    <span className="meta-card-label">Platform</span>
                    <strong>Microsoft Teams</strong>
                    <small>Online Hands-on Classroom</small>
                  </div>
                </div>

                <div className="spotlight-meta-card">
                  <FaCheckCircle className="meta-icon icon-green" />
                  <div>
                    <span className="meta-card-label">Fee &amp; Perks</span>
                    <strong style={{ color: 'var(--saffron-dk)' }}>₹49 Only</strong>
                    <small>Certificate &amp; Code Files</small>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="spotlight-actions">
                <Link
                  to="/payment?course=python-crash"
                  className="btn btn-primary btn-lg spotlight-register-btn"
                  id="python-course-pay-btn"
                >
                  <FaCreditCard /> Pay &amp; Register Online (₹49)
                </Link>
                <a
                  href="https://forms.gle/TAYVJrSX7DAbpuFN8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-saffron btn-lg"
                  id="python-course-register-btn"
                >
                  Google Form <FaArrowRight />
                </a>
                <a
                  href="tel:+919483208991"
                  className="btn btn-outline btn-lg"
                  id="python-course-call-btn"
                >
                  <FaPhone /> 94832 08991
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Poster Lightbox Modal */}
      {showPosterModal && (
        <div className="poster-modal-overlay" onClick={() => setShowPosterModal(false)}>
          <div className="poster-modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="poster-modal-close"
              onClick={() => setShowPosterModal(false)}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
            <img
              src={posterImg}
              alt="Python Basic Crash Course Poster"
              className="poster-modal-img"
            />
            <div className="poster-modal-actions">
              <a
                href="https://forms.gle/TAYVJrSX7DAbpuFN8"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Register Now for ₹49 <FaArrowRight />
              </a>
              <a href="tel:+919483208991" className="btn btn-outline-saffron">
                <FaPhone /> 94832 08991
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ══ LEAD TRAINER SPOTLIGHT: NAVEEN JOSHI ══════════════════ */}
      <section className="section home-trainer-section">
        <div className="container">
          <div className="home-trainer-banner">
            <div className="home-trainer-visual">
              <div className="home-trainer-avatar-wrap">
                <img
                  src={trainerImg}
                  alt="Naveen Joshi – Lead AI & STEM Trainer"
                  className="home-trainer-avatar"
                />
                <span className="home-trainer-badge">9+ Yrs Exp</span>
              </div>
              <div className="home-trainer-cred-pill">
                <FaGraduationCap /> <span><strong>IIT Delhi (FITT)</strong> Trained</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                Learning Links Foundation
              </div>
            </div>

            <div className="home-trainer-body">
              <span className="badge badge-saffron" style={{ width: 'fit-content', marginBottom: '0.5rem' }}>
                <FaChalkboardTeacher /> Lead Trainer &amp; Mentor
              </span>
              <h2 className="home-trainer-name">Naveen Joshi</h2>
              <div className="home-trainer-title">
                AI Software Development &amp; Agentic AI Trainer
              </div>
              <p className="home-trainer-bio">
                Experienced educator with <strong>over 9 years in STEM education</strong>, AI software development, and modern agentic architectures. Completed immersion training in AI Software Development through <strong>FITT, IIT Delhi</strong>. Specializes in building practical, industry-relevant skills through hands-on project implementations.
              </p>

              <div className="home-trainer-tags">
                <span className="home-trainer-tag saffron">Python Programming</span>
                <span className="home-trainer-tag saffron">Artificial Intelligence (AI)</span>
                <span className="home-trainer-tag">Generative AI &amp; LLMs</span>
                <span className="home-trainer-tag">RAG Systems</span>
                <span className="home-trainer-tag">AI Agents &amp; Agentic Workflows</span>
                <span className="home-trainer-tag">Model Context Protocol (MCP)</span>
                <span className="home-trainer-tag">LangChain &amp; LangGraph</span>
              </div>

              <div className="home-trainer-actions">
                <Link to="/about#trainer" className="btn btn-primary">
                  Read Full Trainer Profile <FaArrowRight />
                </Link>
                <Link to="/payment?course=python-crash" className="btn btn-outline-saffron">
                  Learn with Naveen (Crash Course ₹49)
                </Link>
                <a href="tel:+919483208991" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                  <FaPhone /> 94832 08991
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ THREE PILLARS SHOWCASE (MATCHING USER IMAGES) ════════ */}
      <section className="section pillars-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-saffron">
              <FaAtom /> Our Educational Vision
            </span>
            <h2 className="section-title">Bridging Ancient Wisdom with Future Technologies</h2>
            <p className="section-subtitle">
              At Yantrodharaka, our curriculum harmonizes disciplined foundational learning with cutting-edge artificial intelligence, robotics, and hands-on STEM education.
            </p>
          </div>

          <div className="pillars-grid">
            {HERO_SLIDES.map((p, idx) => (
              <div key={p.id} className="pillar-card">
                <div className="pillar-banner-wrap">
                  <img src={p.banner} alt={p.title} className="pillar-banner-img" />
                  <div className="pillar-banner-overlay" />
                  <span className="pillar-badge" style={{ backgroundColor: p.colorAccent }}>
                    <p.badgeIcon /> {p.badge}
                  </span>
                </div>
                <div className="pillar-card-body">
                  <h3 className="pillar-title">{p.title}</h3>
                  <blockquote className="pillar-quote">
                    “{p.quote}”
                  </blockquote>
                  <p className="pillar-desc">{p.subtitle}</p>
                  <div className="pillar-tags">
                    {p.tags.map(t => (
                      <span key={t} className="pillar-tag">{t}</span>
                    ))}
                  </div>
                  <div className="pillar-footer">
                    <button
                      className="btn btn-outline-saffron btn-sm"
                      onClick={() => {
                        setCurrentSlide(idx);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      View in Hero Backdrop &uarr;
                    </button>
                    <Link to="/courses" className="btn btn-primary btn-sm">
                      Enroll <FaArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LATEST NOTIFICATIONS ══════════════════════════════════ */}
      <section className="section bg-white">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-saffron"><FaBell /> Latest Notifications</span>
            <h2 className="section-title">Stay Updated</h2>
            <p className="section-subtitle">Important announcements, batch schedules, and center updates</p>
          </div>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : notifs.length === 0 ? (
            <p className="text-center text-muted">No notifications yet.</p>
          ) : (
            <div className="notif-list">
              {notifs.map(n => <NotifItem key={n.id} n={n} />)}
            </div>
          )}
          <div className="text-center mt-2">
            <Link to="/notifications" className="btn btn-outline">
              View All Notifications <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FEATURED COURSES ══════════════════════════════════════ */}
      <section className="section courses-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-navy"><FaBook /> Flagship Programs</span>
            <h2 className="section-title">Curated For Future Leaders</h2>
            <p className="section-subtitle">From academic foundations to AI &amp; Robotics masterclasses</p>
          </div>
          {courses.length === 0 && !loading ? (
            <p className="text-center text-muted">Courses coming soon.</p>
          ) : (
            <div className="grid-3">
              {courses.map(c => <CourseCard key={c.id} c={c} />)}
            </div>
          )}
          <div className="text-center mt-2">
            <Link to="/courses" className="btn btn-primary">
              View All Programs <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ UPCOMING EVENTS ═══════════════════════════════════════ */}
      <section className="section bg-white">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-saffron"><FaCalendarAlt /> Live &amp; Upcoming</span>
            <h2 className="section-title">Workshops &amp; Exhibitions</h2>
            <p className="section-subtitle">Don't miss our upcoming STEM competitions, demo days, and guest lectures</p>
          </div>
          {events.length === 0 && !loading ? (
            <p className="text-center text-muted">No upcoming events.</p>
          ) : (
            <div className="events-list">
              {events.map(e => <EventCard key={e.id} e={e} />)}
            </div>
          )}
          <div className="text-center mt-2">
            <Link to="/events" className="btn btn-outline">
              All Events &amp; Workshops <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ CALL TO ACTION ════════════════════════════════════════ */}
      <section className="cta-section">
        <div className="container cta-content">
          <div className="cta-emblem-small">
            <img src={logoImg} alt="Yantrodharaka" />
          </div>
          <h2>Ready to Shape the Future with AI &amp; STEM?</h2>
          <p>Join hundreds of ambitious students discovering the joy of technology, robotics, and academic brilliance.</p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link to="/contact" className="btn btn-primary btn-lg">Get in Touch</Link>
            <Link to="/about" className="btn btn-outline-saffron btn-lg">Learn Our Story</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
