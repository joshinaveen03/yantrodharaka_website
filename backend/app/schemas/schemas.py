from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminUserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Notifications ─────────────────────────────────────────────────────────────
class NotificationBase(BaseModel):
    title: str
    description: Optional[str] = None
    publication_date: Optional[datetime] = None
    is_published: bool = False


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    publication_date: Optional[datetime] = None
    is_published: Optional[bool] = None


class NotificationOut(NotificationBase):
    id: str
    attachment_filename: Optional[str] = None
    attachment_original_name: Optional[str] = None
    attachment_size: Optional[int] = None
    attachment_mime: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Courses ───────────────────────────────────────────────────────────────────
class CourseBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration: Optional[str] = None
    eligibility: Optional[str] = None
    is_published: bool = False


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[str] = None
    eligibility: Optional[str] = None
    is_published: Optional[bool] = None


class CourseOut(CourseBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Study Materials ───────────────────────────────────────────────────────────
class StudyMaterialBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    course: Optional[str] = None
    is_published: bool = False


class StudyMaterialOut(StudyMaterialBase):
    id: str
    filename: str
    original_filename: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Events ────────────────────────────────────────────────────────────────────
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    venue: Optional[str] = None
    is_published: bool = False


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    venue: Optional[str] = None
    is_published: Optional[bool] = None


class EventOut(EventBase):
    id: str
    image_filename: Optional[str] = None
    document_filename: Optional[str] = None
    document_original_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Contact ───────────────────────────────────────────────────────────────────
class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str


class ContactOut(ContactCreate):
    id: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Payments ──────────────────────────────────────────────────────────────────
class PaymentCreate(BaseModel):
    student_name: str
    email: EmailStr
    phone: str
    course_name: str
    amount: int
    payment_method: str = "UPI"
    transaction_ref: Optional[str] = None
    notes: Optional[str] = None


class PaymentOut(BaseModel):
    id: str
    receipt_no: str
    student_name: str
    email: str
    phone: str
    course_name: str
    amount: int
    payment_method: str
    transaction_ref: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Pagination ────────────────────────────────────────────────────────────────
class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    pages: int

