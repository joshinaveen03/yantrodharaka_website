import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBullseye, FaEye, FaHeart, FaChalkboardTeacher,
  FaRobot, FaBrain, FaGraduationCap, FaAward,
  FaLaptopCode, FaCogs, FaProjectDiagram, FaLinkedin,
  FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaArrowRight
} from 'react-icons/fa';
import logoImg from '../assets/logo.png';
import trainerImg from '../assets/trainer-naveen-joshi.jpg';
import './About.css';

const CORE_SUBJECTS = [
  'Python Programming',
  'Artificial Intelligence (AI)',
  'Generative AI',
  'Large Language Models (LLMs)',
  'RAG Systems',
  'AI Agents',
  'Agentic AI Workflows',
  'Model Context Protocol (MCP)',
  'LangChain',
  'LangGraph',
];

const TRAINING_FOCUS = [
  {
    icon: FaLaptopCode,
    title: 'Practical Coding',
    desc: 'Hands-on programming with modern frameworks and robust debugging practices.',
  },
  {
    icon: FaBrain,
    title: 'AI App Development',
    desc: 'End-to-end building with LLMs, RAG pipelines, and interactive interfaces.',
  },
  {
    icon: FaProjectDiagram,
    title: 'Agentic Workflows',
    desc: 'Autonomous multi-agent architectures, stateful reasoning, and LangGraph graphs.',
  },
  {
    icon: FaCogs,
    title: 'Tool & MCP Integration',
    desc: 'Connecting AI agents with local & cloud tools using Model Context Protocol.',
  },
];

export default function About() {
  useEffect(() => {
    document.title = 'About Us & Lead Trainer – Yantrodharaka AI & STEM Academy';
  }, []);

  return (
    <div className="page-wrapper about-page">
      {/* ══ PAGE HERO ══════════════════════════════════════════════ */}
      <div className="page-hero page-hero-navy">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', marginBottom: '1rem', borderRadius: '50%', boxShadow: '0 0 24px rgba(244,129,10,0.4)' }}>
            <img src={logoImg} alt="Yantrodharaka" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1>About Yantrodharaka</h1>
          <p>Where Timeless Wisdom Meets Future Technologies: AI, STEM &amp; Academic Mastery</p>
        </div>
      </div>

      <div className="container section-sm">
        {/* ══ INTRODUCTION ══════════════════════════════════════════ */}
        <div className="about-intro-card">
          <div className="about-emblem-wrap">
            <img src={logoImg} alt="Yantrodharaka Emblem" />
          </div>
          <div>
            <span className="badge badge-saffron" style={{ marginBottom: '0.6rem', display: 'inline-block' }}>
              Our Heritage &amp; Vision
            </span>
            <h2 className="section-title" style={{ marginTop: '0.2rem' }}>Who We Are</h2>
            <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>
              <strong>Yantrodharaka Coaching &amp; Innovation Academy</strong> represents a visionary union of spiritual discipline and cutting-edge modern science. The sacred symbol of <em>Yantrodharaka</em> — the master of sacred machines and geometric focus — is reimagined for the 21st century with embedded microcontrollers, Arduino IoT systems, and Artificial Intelligence.
            </p>
            <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginTop: '1rem' }}>
              We are dedicated to empowering young minds with hands-on STEM education, robotics labs, generative AI literacy, and rigorous academic guidance for school and competitive exams.
            </p>
          </div>
        </div>

        {/* ══ LEAD TRAINER SPOTLIGHT: NAVEEN JOSHI ══════════════════ */}
        <section className="trainer-section" id="trainer">
          <div className="section-header text-center" style={{ marginBottom: '2rem' }}>
            <span className="badge badge-cyan" style={{ background: 'rgba(0, 216, 255, 0.12)', color: '#00d8ff', borderColor: 'rgba(0, 216, 255, 0.3)' }}>
              <FaChalkboardTeacher /> Faculty &amp; Mentorship
            </span>
            <h2 className="section-title">Brief About the Trainer</h2>
            <p className="section-subtitle">
              Learn directly from an industry-recognized AI educator and STEM leader
            </p>
          </div>

          <div className="trainer-card">
            {/* Left Column: Photo & Credentials */}
            <div className="trainer-photo-col">
              <div className="trainer-img-wrap">
                <img
                  src={trainerImg}
                  alt="Naveen Joshi – AI Software Development & Agentic AI Trainer"
                  className="trainer-img"
                />
                <span className="trainer-exp-badge">9+ Years Exp</span>
              </div>

              <div className="trainer-badge-row">
                <div className="trainer-credential-pill iit-pill">
                  <FaGraduationCap />
                  <span><strong>IIT Delhi (FITT)</strong> AI Immersion</span>
                </div>
                <div className="trainer-credential-pill">
                  <FaAward />
                  <span><strong>LLF</strong> Tech Trainer</span>
                </div>
                <div className="trainer-credential-pill">
                  <FaRobot />
                  <span><strong>Agentic AI</strong> Specialist</span>
                </div>
              </div>

              {/* Social / Connect icons */}
              <div className="trainer-social-row">
                <a
                  href="https://www.linkedin.com/in/robo-yantrodharaka-8166a33ab/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trainer-social-btn linkedin"
                  title="LinkedIn Profile"
                  aria-label="LinkedIn Profile"
                >
                  <FaLinkedin />
                </a>
                <a
                  href="https://www.instagram.com/robo.yantrodharaka2026?rpxt=cWlqeTU0b3ZwcHky"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trainer-social-btn instagram"
                  title="Instagram Handle"
                  aria-label="Instagram Handle"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://www.youtube.com/@robo.yantrodharaka2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trainer-social-btn youtube"
                  title="YouTube Channel"
                  aria-label="YouTube Channel"
                >
                  <FaYoutube />
                </a>
                <a
                  href="mailto:robo.yantrodharaka2026@gmail.com"
                  className="trainer-social-btn"
                  title="Email Naveen Joshi"
                  aria-label="Email Naveen Joshi"
                >
                  <FaEnvelope />
                </a>
                <a
                  href="tel:+919483208991"
                  className="trainer-social-btn"
                  title="Call Naveen Joshi"
                  aria-label="Call Naveen Joshi"
                >
                  <FaPhone />
                </a>
              </div>
            </div>

            {/* Right Column: Bio & Core Subjects */}
            <div className="trainer-info-col">
              <span className="trainer-tagline">Lead Trainer &amp; Mentor</span>
              <h3 className="trainer-name">Naveen Joshi</h3>
              <div className="trainer-role">
                AI Software Development &amp; Agentic AI Trainer | Learning Links Foundation
              </div>

              <p className="trainer-bio">
                <strong>Naveen Joshi</strong> is an experienced educator and technology trainer with <strong>over 9 years of experience</strong> in STEM education, technology training, and program implementation. He specializes in Python programming, Artificial Intelligence (AI), Generative AI, and modern AI application development.
              </p>

              <p className="trainer-bio">
                He has completed immersion training in <strong>AI Software Development through the Foundation for Innovation and Technology Transfer (FITT), IIT Delhi</strong>. His technical expertise includes Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), AI agents, Agentic AI workflows, Model Context Protocol (MCP), LangChain, and LangGraph.
              </p>

              <p className="trainer-bio">
                His training approach emphasizes <em>conceptual clarity, hands-on coding, project-based learning, and real-world applications</em> to help learners build practical, industry-relevant skills in emerging AI technologies.
              </p>

              {/* Core Subjects */}
              <div className="trainer-section-subhead">
                <FaBrain /> Core Subjects &amp; Technologies
              </div>
              <div className="trainer-subjects-chips">
                {CORE_SUBJECTS.map((subject, idx) => (
                  <span
                    key={subject}
                    className={`subject-chip ${idx < 4 ? 'highlight' : ''}`}
                  >
                    {subject}
                  </span>
                ))}
              </div>

              {/* Training Focus */}
              <div className="trainer-section-subhead">
                <FaCogs /> Training Focus &amp; Methodology
              </div>
              <div className="trainer-focus-grid">
                {TRAINING_FOCUS.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="focus-card">
                    <Icon className="focus-icon" />
                    <div>
                      <h5>{title}</h5>
                      <p>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Row */}
              <div className="trainer-cta-row">
                <Link to="/courses" className="btn btn-primary">
                  Explore Courses with Naveen <FaArrowRight />
                </Link>
                <Link to="/payment?course=python-crash" className="btn btn-outline-saffron">
                  Join Python Crash Course (₹49)
                </Link>
                <a href="tel:+919483208991" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff' }}>
                  <FaPhone /> Contact: 94832 08991
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ══ MISSION & VISION ══════════════════════════════════════ */}
        <div className="grid-2" style={{ marginTop: '3rem' }}>
          <div className="about-card card">
            <div className="about-card-icon mission"><FaBullseye /></div>
            <h3>Our Mission</h3>
            <p>
              To deliver transformative, student-centric education that builds confidence, critical
              thinking, and academic excellence. We strive to make quality coaching accessible and
              relevant to every student who walks through our doors.
            </p>
          </div>
          <div className="about-card card">
            <div className="about-card-icon vision"><FaEye /></div>
            <h3>Our Vision</h3>
            <p>
              To be the most trusted and impactful coaching center in the region—one where students
              achieve their highest aspirations and faculty grow alongside their learners.
            </p>
          </div>
        </div>

        {/* ══ TEACHING APPROACH ═════════════════════════════════════ */}
        <div className="about-approach card" style={{ marginTop: '2.5rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Our Teaching Philosophy</h2>
          <div className="grid-3">
            {[
              {
                icon: FaChalkboardTeacher,
                title: 'Industry-Trained Faculty',
                desc: 'Experienced tech trainers and educators bringing real-world AI, coding, and robotics practices into every session.'
              },
              {
                icon: FaHeart,
                title: 'Student-First Mentorship',
                desc: 'Personalized attention ensuring concept mastery, doubt resolution, and career guidance for every learner.'
              },
              {
                icon: FaBullseye,
                title: 'Hands-On & Project-Based',
                desc: 'Moving beyond rote theory with live coding, circuit prototyping, hardware tinkering, and portfolio creation.'
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="approach-item">
                <div className="approach-icon"><Icon /></div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
