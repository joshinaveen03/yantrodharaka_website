"""
Database initialization:
- Creates all tables (if they don't exist)
- Seeds the initial admin user from environment variables
"""
from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.core.security import hash_password
from app.core.config import get_settings
from app.models.models import Base, AdminUser, GalleryItem, Notification, PaymentPackage, PaymentSetting, ContactSetting
from datetime import datetime

settings = get_settings()

DEFAULT_GALLERY = [
    {
        "title": "Python Basic Crash Course 2026",
        "category": "workshops",
        "date_label": "August 15 & 16, 2026",
        "caption": "Official launch of our weekend crash course for school & college students on Microsoft Teams (Fee: ₹49 Only).",
        "image_url": "/gallery/python-crash-course.jpg",
        "badge": "Live Workshop",
        "order": 1,
    },
    {
        "title": "AI & STEM Experiential Lab",
        "category": "stem",
        "date_label": "Academic Year 2026",
        "caption": "Empowering young minds with AI and hands-on scientific discovery, logic puzzles, and experiential learning tools.",
        "image_url": "/gallery/stem-ai-lab.jpg",
        "badge": "AI & STEM",
        "order": 2,
    },
    {
        "title": "Arduino & Embedded IoT Lab",
        "category": "robotics",
        "date_label": "Ongoing Weekend Batches",
        "caption": "Students working with microcontrollers, Arduino Uno boards, sensor interfacing, and building automated gadgets.",
        "image_url": "/gallery/arduino-innovation.jpg",
        "badge": "Hardware & IoT",
        "order": 3,
    },
    {
        "title": "Generative AI & Modern Computing",
        "category": "stem",
        "date_label": "Special Cohort 2026",
        "caption": "Advanced workshops on prompt engineering, neural network foundations, and creative computing for innovators.",
        "image_url": "/gallery/generative-ai.jpg",
        "badge": "Generative AI",
        "order": 4,
    },
    {
        "title": "Robotics Engineering & Automation",
        "category": "robotics",
        "date_label": "Weekend Masterclass",
        "caption": "Designing autonomous mobile robots, gear mechanisms, and motor driver circuits in the STEM tinkering lab.",
        "image_url": "/gallery/stem-robotics.jpg",
        "badge": "Robotics",
        "order": 5,
    },
    {
        "title": "Electronics Circuit Design & Soldering",
        "category": "robotics",
        "date_label": "Practical Lab Sessions",
        "caption": "Hands-on breadboard prototyping, circuit testing, and component fundamentals for future engineers.",
        "image_url": "/gallery/circuit-lab.jpg",
        "badge": "Circuit Prototyping",
        "order": 6,
    },
    {
        "title": "Python & Algorithm Hackathon",
        "category": "workshops",
        "date_label": "Summer 2026",
        "caption": "Live coding challenges and peer collaborations solving real-world mathematical and logical problems.",
        "image_url": "/gallery/coding-session.jpg",
        "badge": "Coding Hackathon",
        "order": 7,
    },
    {
        "title": "Yantrodharaka Academy Sacred Emblem",
        "category": "academy",
        "date_label": "Inaugural Identity",
        "caption": "The iconic emblem symbolizing sacred geometry and timeless focus harmonized with high-tech microelectronics and AI.",
        "image_url": "/gallery/yantrodharaka-emblem.png",
        "badge": "Center Emblem",
        "order": 8,
    },
    {
        "title": "Lead Trainer & Mentor – Naveen Joshi",
        "category": "academy",
        "date_label": "Founding Faculty",
        "caption": "Naveen Joshi – AI Software Development & Agentic AI Trainer (Learning Links Foundation, FITT IIT Delhi Immersion Trained, 9+ Years Experience).",
        "image_url": "/gallery/trainer-naveen-joshi.jpg",
        "badge": "Lead Trainer",
        "order": 9,
    },
]


def init_db() -> None:
    """Create tables and seed admin user and default gallery items on first run."""
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        existing = db.query(AdminUser).filter(AdminUser.email == settings.ADMIN_EMAIL).first()
        if not existing:
            admin = AdminUser(
                email=settings.ADMIN_EMAIL,
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                full_name="Administrator",
                is_active=True,
            )
            db.add(admin)
            db.commit()
            print(f"[init_db] Admin user created: {settings.ADMIN_EMAIL}")
        else:
            print(f"[init_db] Admin user already exists: {settings.ADMIN_EMAIL}")

        # Seed gallery items if none exist
        if db.query(GalleryItem).count() == 0:
            for g in DEFAULT_GALLERY:
                item = GalleryItem(**g)
                db.add(item)
            db.commit()
            print("[init_db] Seeded initial gallery items.")

        # Seed notification if none exist
        if db.query(Notification).count() == 0:
            notif = Notification(
                title="Welcome to the Python Basic Crash Course!",
                description="Kickstart your programming journey with our Python Basic Crash Course, specially designed for school students, college students, and beginners who want to learn Python programming from scratch.",
                is_published=True,
                publication_date=datetime.utcnow(),
                dates="15 & 16 August 2026",
                dates_sub="Saturday & Sunday",
                timing="5:00 PM – 7:00 PM IST",
                timing_sub="Live Interactive Sessions",
                platform="Microsoft Teams",
                platform_sub="Online Hands-on Classroom",
                fee="₹49 Only",
                perks="Certificate & Code Files",
                payment_url="/payment?course=python-crash",
                form_url="https://forms.gle/TAYVJrSX7DAbpuFN8",
            )
            db.add(notif)
            db.commit()
            print("[init_db] Seeded initial notification.")

        # Seed payment settings if none exist
        if db.query(PaymentSetting).count() == 0:
            pset = PaymentSetting(
                upi_id="9483208991@upi",
                payee_name="Yantrodharaka Coaching Centre",
                enable_upi=True,
                enable_bank=True,
                enable_card=True,
                bank_name="State Bank of India",
                account_name="Yantrodharaka Coaching Centre",
                account_number="9483208991001",
                ifsc_code="SBIN0001234",
                branch="Main Branch",
                contact_phone="+91 94832 08991",
                contact_email="robo.yantrodharaka2026@gmail.com",
            )
            db.add(pset)
            db.commit()
            print("[init_db] Seeded initial payment settings.")

        # Seed payment packages if none exist
        if db.query(PaymentPackage).count() == 0:
            default_pkgs = [
                {
                    "pkg_key": "python-crash",
                    "name": "Python Basic Crash Course (Aug 15 & 16, 2026)",
                    "amount": 49,
                    "badge": "Popular",
                    "description": "Live 2-day weekend crash course on Microsoft Teams.",
                    "is_custom": False,
                    "is_active": True,
                    "display_order": 1,
                },
                {
                    "pkg_key": "robotics-stem",
                    "name": "Robotics & STEM Weekend Program",
                    "amount": 1499,
                    "badge": "Comprehensive",
                    "description": "Hands-on mechanical, sensors, and logic building.",
                    "is_custom": False,
                    "is_active": True,
                    "display_order": 2,
                },
                {
                    "pkg_key": "arduino-iot",
                    "name": "Arduino & Embedded IoT Lab",
                    "amount": 1999,
                    "badge": "Hardware Included",
                    "description": "Microcontroller programming and IoT prototypes.",
                    "is_custom": False,
                    "is_active": True,
                    "display_order": 3,
                },
                {
                    "pkg_key": "generative-ai",
                    "name": "Generative AI & Machine Learning Foundations",
                    "amount": 2499,
                    "badge": "Next-Gen",
                    "description": "Neural networks, prompt engineering & AI tools.",
                    "is_custom": False,
                    "is_active": True,
                    "display_order": 4,
                },
                {
                    "pkg_key": "custom",
                    "name": "Custom Fee / Installment Payment",
                    "amount": 100,
                    "badge": "Flexible",
                    "description": "Enter any customized fee or monthly tuition installment.",
                    "is_custom": True,
                    "is_active": True,
                    "display_order": 5,
                },
            ]
            for p in default_pkgs:
                db.add(PaymentPackage(**p))
            db.commit()
            print("[init_db] Seeded initial payment packages.")

        # Seed contact settings if none exist
        if db.query(ContactSetting).count() == 0:
            cset = ContactSetting(
                primary_phone="+91 94832 08991",
                secondary_phone="",
                whatsapp_number="+91 94832 08991",
                email="robo.yantrodharaka2026@gmail.com",
                secondary_email="",
                address="Yantrodharaka Online Coaching Center & STEM Labs",
                city="Bengaluru",
                state="Karnataka",
                pincode="560001",
                working_hours="Mon – Sat: 9:00 AM – 7:00 PM | Sun: 10:00 AM – 4:00 PM",
                instagram_url="https://www.instagram.com/robo.yantrodharaka2026?rpxt=cWlqeTU0b3ZwcHky",
                youtube_url="",
                linkedin_url="",
                map_embed_url="",
            )
            db.add(cset)
            db.commit()
            print("[init_db] Seeded initial contact settings.")
    finally:
        db.close()

