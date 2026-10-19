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

