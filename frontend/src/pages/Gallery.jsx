import React, { useState, useEffect } from 'react';
import {
  FaImages, FaTimes, FaChevronLeft, FaChevronRight,
  FaFilter, FaSearchPlus, FaCalendarAlt, FaTag
} from 'react-icons/fa';
import './Gallery.css';

const GALLERY_ITEMS = [
  {
    id: 'py-crash-course',
    title: 'Python Basic Crash Course 2026',
    category: 'workshops',
    categoryLabel: 'Workshops & Events',
    date: 'August 15 & 16, 2026',
    description: 'Official launch of our weekend crash course for school & college students on Microsoft Teams (Fee: ₹49 Only).',
    src: '/gallery/python-crash-course.jpg',
    badge: 'Live Workshop'
  },
  {
    id: 'stem-ai-lab',
    title: 'AI & STEM Experiential Lab',
    category: 'stem',
    categoryLabel: 'AI & STEM Labs',
    date: 'Academic Year 2026',
    description: 'Empowering young minds with AI and hands-on scientific discovery, logic puzzles, and experiential learning tools.',
    src: '/gallery/stem-ai-lab.jpg',
    badge: 'AI & STEM'
  },
  {
    id: 'arduino-innovation',
    title: 'Arduino & Embedded IoT Lab',
    category: 'robotics',
    categoryLabel: 'Robotics & Circuits',
    date: 'Ongoing Weekend Batches',
    description: 'Students working with microcontrollers, Arduino Uno boards, sensor interfacing, and building automated gadgets.',
    src: '/gallery/arduino-innovation.jpg',
    badge: 'Hardware & IoT'
  },
  {
    id: 'generative-ai',
    title: 'Generative AI & Modern Computing',
    category: 'stem',
    categoryLabel: 'AI & STEM Labs',
    date: 'Special Cohort 2026',
    description: 'Advanced workshops on prompt engineering, neural network foundations, and creative computing for innovators.',
    src: '/gallery/generative-ai.jpg',
    badge: 'Generative AI'
  },
  {
    id: 'stem-robotics',
    title: 'Robotics Engineering & Automation',
    category: 'robotics',
    categoryLabel: 'Robotics & Circuits',
    date: 'Weekend Masterclass',
    description: 'Designing autonomous mobile robots, gear mechanisms, and motor driver circuits in the STEM tinkering lab.',
    src: '/gallery/stem-robotics.jpg',
    badge: 'Robotics'
  },
  {
    id: 'circuit-lab',
    title: 'Electronics Circuit Design & Soldering',
    category: 'robotics',
    categoryLabel: 'Robotics & Circuits',
    date: 'Practical Lab Sessions',
    description: 'Hands-on breadboard prototyping, circuit testing, and component fundamentals for future engineers.',
    src: '/gallery/circuit-lab.jpg',
    badge: 'Circuit Prototyping'
  },
  {
    id: 'coding-session',
    title: 'Python & Algorithm Hackathon',
    category: 'workshops',
    categoryLabel: 'Workshops & Events',
    date: 'Summer 2026',
    description: 'Live coding challenges and peer collaborations solving real-world mathematical and logical problems.',
    src: '/gallery/coding-session.jpg',
    badge: 'Coding Hackathon'
  },
  {
    id: 'yantrodharaka-emblem',
    title: 'Yantrodharaka Academy Sacred Emblem',
    category: 'academy',
    categoryLabel: 'Academy & Heritage',
    date: 'Inaugural Identity',
    description: 'The iconic emblem symbolizing sacred geometry and timeless focus harmonized with high-tech microelectronics and AI.',
    src: '/gallery/yantrodharaka-emblem.png',
    badge: 'Center Emblem'
  },
  {
    id: 'lead-trainer-naveen-joshi',
    title: 'Lead Trainer & Mentor – Naveen Joshi',
    category: 'academy',
    categoryLabel: 'Faculty & Mentors',
    date: 'Founding Faculty',
    description: 'Naveen Joshi – AI Software Development & Agentic AI Trainer (Learning Links Foundation, FITT IIT Delhi Immersion Trained, 9+ Years Experience).',
    src: '/gallery/trainer-naveen-joshi.jpg',
    badge: 'Lead Trainer'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Photos' },
  { id: 'workshops', label: 'Workshops & Crash Courses' },
  { id: 'stem', label: 'AI & STEM Labs' },
  { id: 'robotics', label: 'Robotics & Hardware' },
  { id: 'academy', label: 'Academy & Heritage' },
];

export default function Gallery() {
  const [filter, setFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    document.title = 'Photo Gallery – Yantrodharaka AI & STEM Academy';
  }, []);

  const filteredItems = filter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === filter);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const activeItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="page-wrapper gallery-page">
      {/* Hero */}
      <div className="page-hero page-hero-navy">
        <div className="container">
          <FaImages className="page-hero-icon" />
          <h1>Academy Gallery</h1>
          <p>Moments of innovation, robotics labs, student workshops, and STEM excellence</p>
        </div>
      </div>

      <div className="container section-sm">
        {/* Category Filters */}
        <div className="gallery-filter-wrap">
          <div className="gallery-filter-label">
            <FaFilter /> <span>Filter by:</span>
          </div>
          <div className="gallery-filter-buttons">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`gallery-filter-btn ${filter === cat.id ? 'active' : ''}`}
                onClick={() => setFilter(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className="gallery-card"
              onClick={() => openLightbox(idx)}
            >
              <div className="gallery-img-container">
                <img
                  src={item.src}
                  alt={item.title}
                  className="gallery-img"
                  loading="lazy"
                />
                <div className="gallery-img-overlay">
                  <span className="gallery-zoom-badge">
                    <FaSearchPlus /> View Photo
                  </span>
                </div>
                <span className="gallery-card-badge">{item.badge}</span>
              </div>

              <div className="gallery-card-body">
                <div className="gallery-card-meta">
                  <span><FaTag /> {item.categoryLabel}</span>
                  <span><FaCalendarAlt /> {item.date}</span>
                </div>
                <h3 className="gallery-card-title">{item.title}</h3>
                <p className="gallery-card-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="empty-state">
            <FaImages />
            <h3>No photos found in this category</h3>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div className="gallery-lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
            <FaTimes />
          </button>

          <button className="lightbox-arrow lightbox-prev" onClick={prevImage} aria-label="Previous image">
            <FaChevronLeft />
          </button>

          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <div className="lightbox-img-wrap">
              <img src={activeItem.src} alt={activeItem.title} className="lightbox-img" />
            </div>
            <div className="lightbox-caption">
              <div className="lightbox-badge">{activeItem.badge}</div>
              <h3>{activeItem.title}</h3>
              <p>{activeItem.description}</p>
              <div className="lightbox-meta">
                <span><strong>Category:</strong> {activeItem.categoryLabel}</span>
                <span><strong>Date / Cohort:</strong> {activeItem.date}</span>
                <span>Image {lightboxIndex + 1} of {filteredItems.length}</span>
              </div>
            </div>
          </div>

          <button className="lightbox-arrow lightbox-next" onClick={nextImage} aria-label="Next image">
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
