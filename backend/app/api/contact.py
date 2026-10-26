import math
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import ContactEnquiry, ContactSetting
from app.schemas.schemas import (
    ContactCreate, ContactOut,
    ContactSettingOut, ContactSettingUpdate
)
from app.utils.dependencies import get_current_admin

router = APIRouter(prefix="/api/contact", tags=["contact"])


# ── Contact Settings Endpoints ───────────────────────────────────────────────
@router.get("/settings", response_model=ContactSettingOut)
def get_contact_settings(db: Session = Depends(get_db)):
    """Public endpoint to get organization contact details."""
    setting = db.query(ContactSetting).first()
    if not setting:
        setting = ContactSetting(
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
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting


@router.put("/settings", response_model=ContactSettingOut)
def update_contact_settings(
    payload: ContactSettingUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    """Admin endpoint to update organization contact details."""
    setting = db.query(ContactSetting).first()
    if not setting:
        setting = ContactSetting()
        db.add(setting)

    for field, value in payload.model_dump().items():
        setattr(setting, field, value)

    setting.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(setting)
    return setting


# ── Contact Enquiries Endpoints ──────────────────────────────────────────────
@router.post("", response_model=ContactOut, status_code=201)
def submit_enquiry(payload: ContactCreate, db: Session = Depends(get_db)):
    c = ContactEnquiry(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.get("/admin/all")
def list_enquiries(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    q = db.query(ContactEnquiry)
    total = q.count()
    items = q.order_by(ContactEnquiry.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [ContactOut.model_validate(i).model_dump() for i in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
    }


@router.put("/admin/{enquiry_id}/mark-read", response_model=ContactOut)
def mark_read(
    enquiry_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    c = db.query(ContactEnquiry).filter(ContactEnquiry.id == enquiry_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    c.is_read = True
    db.commit()
    db.refresh(c)
    return c
