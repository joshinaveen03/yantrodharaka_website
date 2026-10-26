import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.models.models import Notification
from app.schemas.schemas import NotificationOut, NotificationCreate, NotificationUpdate
from app.utils.dependencies import get_current_admin
from app.utils.storage import save_upload, delete_file, get_download_url, LOCAL_UPLOAD_DIR
from app.core.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/notifications", tags=["notifications"])


def _serialize(n: Notification) -> dict:
    d = NotificationOut.model_validate(n).model_dump()
    d["download_url"] = get_download_url(n.attachment_filename) if n.attachment_filename else None
    return d


# ── Public ─────────────────────────────────────────────────────────────────────
@router.get("")
def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    q = db.query(Notification).filter(Notification.is_published == True)
    total = q.count()
    items = q.order_by(Notification.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [_serialize(n) for n in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
    }


@router.get("/{notification_id}")
def get_notification(notification_id: str, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.is_published == True,
    ).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return _serialize(n)


# ── Admin ──────────────────────────────────────────────────────────────────────
@router.get("/admin/all")
def list_all_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    q = db.query(Notification)
    total = q.count()
    items = q.order_by(Notification.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [_serialize(n) for n in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
    }


@router.post("", response_model=dict, status_code=201)
async def create_notification(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    publication_date: Optional[str] = Form(None),
    is_published: bool = Form(False),
    dates: Optional[str] = Form("15 & 16 August 2026"),
    dates_sub: Optional[str] = Form("Saturday & Sunday"),
    timing: Optional[str] = Form("5:00 PM – 7:00 PM IST"),
    timing_sub: Optional[str] = Form("Live Interactive Sessions"),
    platform: Optional[str] = Form("Microsoft Teams"),
    platform_sub: Optional[str] = Form("Online Hands-on Classroom"),
    fee: Optional[str] = Form("₹49 Only"),
    perks: Optional[str] = Form("Certificate & Code Files"),
    payment_url: Optional[str] = Form("/payment?course=python-crash"),
    form_url: Optional[str] = Form("https://forms.gle/TAYVJrSX7DAbpuFN8"),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")

    stored_name = orig_name = size = mime = None
    if attachment and attachment.filename:
        stored_name, orig_name, size, mime = await save_upload(attachment)

    pub_date = None
    if publication_date:
        try:
            pub_date = datetime.fromisoformat(publication_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid publication_date format")

    n = Notification(
        title=title.strip(),
        description=description,
        publication_date=pub_date,
        is_published=is_published,
        dates=dates.strip() if dates else "15 & 16 August 2026",
        dates_sub=dates_sub.strip() if dates_sub else "Saturday & Sunday",
        timing=timing.strip() if timing else "5:00 PM – 7:00 PM IST",
        timing_sub=timing_sub.strip() if timing_sub else "Live Interactive Sessions",
        platform=platform.strip() if platform else "Microsoft Teams",
        platform_sub=platform_sub.strip() if platform_sub else "Online Hands-on Classroom",
        fee=fee.strip() if fee else "₹49 Only",
        perks=perks.strip() if perks else "Certificate & Code Files",
        payment_url=payment_url.strip() if payment_url else "/payment?course=python-crash",
        form_url=form_url.strip() if form_url else "https://forms.gle/TAYVJrSX7DAbpuFN8",
        attachment_filename=stored_name,
        attachment_original_name=orig_name,
        attachment_size=size,
        attachment_mime=mime,
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return _serialize(n)


@router.put("/{notification_id}", response_model=dict)
async def update_notification(
    notification_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    publication_date: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(None),
    dates: Optional[str] = Form(None),
    dates_sub: Optional[str] = Form(None),
    timing: Optional[str] = Form(None),
    timing_sub: Optional[str] = Form(None),
    platform: Optional[str] = Form(None),
    platform_sub: Optional[str] = Form(None),
    fee: Optional[str] = Form(None),
    perks: Optional[str] = Form(None),
    payment_url: Optional[str] = Form(None),
    form_url: Optional[str] = Form(None),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")

    if title is not None:
        n.title = title.strip()
    if description is not None:
        n.description = description
    if is_published is not None:
        n.is_published = is_published
    if dates is not None:
        n.dates = dates.strip()
    if dates_sub is not None:
        n.dates_sub = dates_sub.strip()
    if timing is not None:
        n.timing = timing.strip()
    if timing_sub is not None:
        n.timing_sub = timing_sub.strip()
    if platform is not None:
        n.platform = platform.strip()
    if platform_sub is not None:
        n.platform_sub = platform_sub.strip()
    if fee is not None:
        n.fee = fee.strip()
    if perks is not None:
        n.perks = perks.strip()
    if payment_url is not None:
        n.payment_url = payment_url.strip()
    if form_url is not None:
        n.form_url = form_url.strip()

    if publication_date is not None:
        try:
            n.publication_date = datetime.fromisoformat(publication_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid publication_date format")

    if attachment and attachment.filename:
        if n.attachment_filename:
            delete_file(n.attachment_filename)
        stored, orig, size, mime = await save_upload(attachment)
        n.attachment_filename = stored
        n.attachment_original_name = orig
        n.attachment_size = size
        n.attachment_mime = mime

    n.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(n)
    return _serialize(n)


@router.delete("/{notification_id}", status_code=204)
def delete_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    if n.attachment_filename:
        delete_file(n.attachment_filename)
    db.delete(n)
    db.commit()
