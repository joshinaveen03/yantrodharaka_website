import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Boolean, DateTime, Integer,
    ForeignKey, BigInteger
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    publication_date = Column(DateTime, nullable=True)
    is_published = Column(Boolean, default=False, index=True)
    attachment_filename = Column(String(500), nullable=True)
    attachment_original_name = Column(String(500), nullable=True)
    attachment_size = Column(BigInteger, nullable=True)
    attachment_mime = Column(String(200), nullable=True)
    dates = Column(String(200), default="15 & 16 August 2026")
    dates_sub = Column(String(200), default="Saturday & Sunday")
    timing = Column(String(200), default="5:00 PM – 7:00 PM IST")
    timing_sub = Column(String(200), default="Live Interactive Sessions")
    platform = Column(String(200), default="Microsoft Teams")
    platform_sub = Column(String(200), default="Online Hands-on Classroom")
    fee = Column(String(100), default="₹49 Only")
    perks = Column(String(200), default="Certificate & Code Files")
    payment_url = Column(String(300), default="/payment?course=python-crash")
    form_url = Column(String(500), default="https://forms.gle/TAYVJrSX7DAbpuFN8")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Course(Base):
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(String(200), nullable=True)
    eligibility = Column(Text, nullable=True)
    is_published = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class StudyMaterial(Base):
    __tablename__ = "study_materials"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(300), nullable=True)
    course = Column(String(300), nullable=True)
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500), nullable=False)
    file_size = Column(BigInteger, nullable=True)
    mime_type = Column(String(200), nullable=True)
    is_published = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(DateTime, nullable=True)
    venue = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=False, index=True)
    image_filename = Column(String(500), nullable=True)
    document_filename = Column(String(500), nullable=True)
    document_original_name = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ContactEnquiry(Base):
    __tablename__ = "contact_enquiries"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(300), nullable=False)
    email = Column(String(300), nullable=False)
    phone = Column(String(50), nullable=True)
    subject = Column(String(500), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    receipt_no = Column(String(100), unique=True, nullable=False, index=True)
    student_name = Column(String(300), nullable=False)
    email = Column(String(300), nullable=False)
    phone = Column(String(50), nullable=False)
    course_name = Column(String(500), nullable=False)
    amount = Column(Integer, nullable=False)  # In INR
    payment_method = Column(String(100), default="UPI")  # UPI, GPay, PhonePe, Paytm, Card, NetBanking
    transaction_ref = Column(String(200), nullable=True)  # UTR / Transaction ID
    status = Column(String(50), default="SUCCESS")  # SUCCESS, PENDING, FAILED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(300), nullable=False)
    caption = Column(Text, nullable=True)
    category = Column(String(100), default="workshops")
    date_label = Column(String(150), nullable=True)
    badge = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)
    image_filename = Column(String(300), nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class PaymentPackage(Base):
    __tablename__ = "payment_packages"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    pkg_key = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(500), nullable=False)
    amount = Column(Integer, nullable=False, default=49)
    badge = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    is_custom = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PaymentSetting(Base):
    __tablename__ = "payment_settings"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    upi_id = Column(String(200), default="9483208991@upi")
    payee_name = Column(String(300), default="Yantrodharaka Coaching Centre")
    enable_upi = Column(Boolean, default=True)
    enable_bank = Column(Boolean, default=True)
    enable_card = Column(Boolean, default=True)
    bank_name = Column(String(200), default="State Bank of India")
    account_name = Column(String(300), default="Yantrodharaka Coaching Centre")
    account_number = Column(String(100), default="9483208991001")
    ifsc_code = Column(String(100), default="SBIN0001234")
    branch = Column(String(200), default="Main Branch")
    contact_phone = Column(String(100), default="+91 94832 08991")
    contact_email = Column(String(200), default="robo.yantrodharaka2026@gmail.com")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ContactSetting(Base):
    __tablename__ = "contact_settings"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    primary_phone = Column(String(50), default="+91 94832 08991")
    secondary_phone = Column(String(50), nullable=True)
    whatsapp_number = Column(String(50), default="+91 94832 08991")
    email = Column(String(200), default="robo.yantrodharaka2026@gmail.com")
    secondary_email = Column(String(200), nullable=True)
    address = Column(Text, default="Yantrodharaka Online Coaching Center & STEM Labs, Bengaluru, Karnataka, India")
    city = Column(String(100), default="Bengaluru")
    state = Column(String(100), default="Karnataka")
    pincode = Column(String(20), default="560001")
    working_hours = Column(String(200), default="Mon – Sat: 9:00 AM – 7:00 PM | Sun: 10:00 AM – 4:00 PM")
    instagram_url = Column(String(500), default="https://www.instagram.com/robo.yantrodharaka2026?rpxt=cWlqeTU0b3ZwcHky")
    youtube_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    map_embed_url = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)




