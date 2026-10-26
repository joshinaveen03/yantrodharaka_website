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
    dates: Optional[str] = "15 & 16 August 2026"
    dates_sub: Optional[str] = "Saturday & Sunday"
    timing: Optional[str] = "5:00 PM – 7:00 PM IST"
    timing_sub: Optional[str] = "Live Interactive Sessions"
    platform: Optional[str] = "Microsoft Teams"
    platform_sub: Optional[str] = "Online Hands-on Classroom"
    fee: Optional[str] = "₹49 Only"
    perks: Optional[str] = "Certificate & Code Files"
    payment_url: Optional[str] = "/payment?course=python-crash"
    form_url: Optional[str] = "https://forms.gle/TAYVJrSX7DAbpuFN8"


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    publication_date: Optional[datetime] = None
    is_published: Optional[bool] = None
    dates: Optional[str] = None
    dates_sub: Optional[str] = None
    timing: Optional[str] = None
    timing_sub: Optional[str] = None
    platform: Optional[str] = None
    platform_sub: Optional[str] = None
    fee: Optional[str] = None
    perks: Optional[str] = None
    payment_url: Optional[str] = None
    form_url: Optional[str] = None


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


# ── Gallery ───────────────────────────────────────────────────────────────────
class GalleryItemBase(BaseModel):
    title: str
    caption: Optional[str] = None
    category: str = "workshops"
    date_label: Optional[str] = None
    badge: Optional[str] = None
    image_url: Optional[str] = None
    order: Optional[int] = 0


class GalleryItemCreate(GalleryItemBase):
    pass


class GalleryItemUpdate(BaseModel):
    title: Optional[str] = None
    caption: Optional[str] = None
    category: Optional[str] = None
    date_label: Optional[str] = None
    badge: Optional[str] = None
    image_url: Optional[str] = None
    order: Optional[int] = None


class GalleryItemOut(GalleryItemBase):
    id: str
    image_filename: Optional[str] = None
    image_src: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Payment Packages ──────────────────────────────────────────────────────────
class PaymentPackageBase(BaseModel):
    pkg_key: str
    name: str
    amount: int
    badge: Optional[str] = None
    description: Optional[str] = None
    is_custom: bool = False
    is_active: bool = True
    display_order: int = 0


class PaymentPackageCreate(PaymentPackageBase):
    pass


class PaymentPackageUpdate(BaseModel):
    pkg_key: Optional[str] = None
    name: Optional[str] = None
    amount: Optional[int] = None
    badge: Optional[str] = None
    description: Optional[str] = None
    is_custom: Optional[bool] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class PaymentPackageOut(PaymentPackageBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Payment Settings ──────────────────────────────────────────────────────────
class PaymentSettingBase(BaseModel):
    upi_id: str = "9483208991@upi"
    payee_name: str = "Yantrodharaka Coaching Centre"
    enable_upi: bool = True
    enable_bank: bool = True
    enable_card: bool = True
    bank_name: Optional[str] = "State Bank of India"
    account_name: Optional[str] = "Yantrodharaka Coaching Centre"
    account_number: Optional[str] = "9483208991001"
    ifsc_code: Optional[str] = "SBIN0001234"
    branch: Optional[str] = "Main Branch"
    contact_phone: Optional[str] = "+91 94832 08991"
    contact_email: Optional[str] = "robo.yantrodharaka2026@gmail.com"


class PaymentSettingUpdate(PaymentSettingBase):
    pass


class PaymentSettingOut(PaymentSettingBase):
    id: str
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Contact Settings ──────────────────────────────────────────────────────────
class ContactSettingBase(BaseModel):
    primary_phone: str = "+91 94832 08991"
    secondary_phone: Optional[str] = None
    whatsapp_number: Optional[str] = "+91 94832 08991"
    email: str = "robo.yantrodharaka2026@gmail.com"
    secondary_email: Optional[str] = None
    address: Optional[str] = "Yantrodharaka Online Coaching Center & STEM Labs, Bengaluru, Karnataka, India"
    city: Optional[str] = "Bengaluru"
    state: Optional[str] = "Karnataka"
    pincode: Optional[str] = "560001"
    working_hours: Optional[str] = "Mon – Sat: 9:00 AM – 7:00 PM | Sun: 10:00 AM – 4:00 PM"
    instagram_url: Optional[str] = "https://www.instagram.com/robo.yantrodharaka2026?rpxt=cWlqeTU0b3ZwcHky"
    youtube_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    map_embed_url: Optional[str] = None


class ContactSettingUpdate(ContactSettingBase):
    pass


class ContactSettingOut(ContactSettingBase):
    id: str
    updated_at: datetime

    class Config:
        from_attributes = True




