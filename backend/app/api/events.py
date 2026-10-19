import math
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Event
from app.schemas.schemas import EventOut, EventCreate, EventUpdate
from app.utils.dependencies import get_current_admin
from app.utils.storage import save_upload, delete_file, get_download_url, ALLOWED_EXTENSIONS

router = APIRouter(prefix="/api/events", tags=["events"])

IMAGE_MIME = {"image/png", "image/jpeg", "image/gif", "image/webp"}


def _serialize(e: Event) -> dict:
    d = EventOut.model_validate(e).model_dump()
    d["image_url"] = get_download_url(e.image_filename) if e.image_filename else None
    d["document_url"] = get_download_url(e.document_filename) if e.document_filename else None
    return d


# ── Public ─────────────────────────────────────────────────────────────────────
@router.get("")
def list_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    q = db.query(Event).filter(Event.is_published == True)
    total = q.count()
    items = q.order_by(Event.event_date.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [_serialize(e) for e in items],
        "total": total, "page": page, "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
    }


@router.get("/{event_id}")
def get_event(event_id: str, db: Session = Depends(get_db)):
    e = db.query(Event).filter(Event.id == event_id, Event.is_published == True).first()
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    return _serialize(e)


# ── Admin ──────────────────────────────────────────────────────────────────────
@router.get("/admin/all")
def list_all_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    q = db.query(Event)
    total = q.count()
    items = q.order_by(Event.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [_serialize(e) for e in items],
        "total": total, "page": page, "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
    }


@router.post("", response_model=dict, status_code=201)
async def create_event(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    event_date: Optional[str] = Form(None),
    venue: Optional[str] = Form(None),
    is_published: bool = Form(False),
    image: Optional[UploadFile] = File(None),
    document: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")

    evt_date = None
    if event_date:
        try:
            evt_date = datetime.fromisoformat(event_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid event_date")

    img_name = doc_name = doc_orig = None
    if image and image.filename:
        img_name, _, _, _ = await save_upload(image)
    if document and document.filename:
        doc_name, doc_orig, _, _ = await save_upload(document)

    e = Event(
        title=title.strip(),
        description=description,
        event_date=evt_date,
        venue=venue,
        is_published=is_published,
        image_filename=img_name,
        document_filename=doc_name,
        document_original_name=doc_orig,
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return _serialize(e)


@router.put("/{event_id}", response_model=dict)
async def update_event(
    event_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    event_date: Optional[str] = Form(None),
    venue: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    document: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    e = db.query(Event).filter(Event.id == event_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    if title is not None:
        e.title = title.strip()
    if description is not None:
        e.description = description
    if venue is not None:
        e.venue = venue
    if is_published is not None:
        e.is_published = is_published
    if event_date is not None:
        try:
            e.event_date = datetime.fromisoformat(event_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid event_date")
    if image and image.filename:
        if e.image_filename:
            delete_file(e.image_filename)
        e.image_filename, _, _, _ = await save_upload(image)
    if document and document.filename:
        if e.document_filename:
            delete_file(e.document_filename)
        e.document_filename, e.document_original_name, _, _ = await save_upload(document)
    e.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(e)
    return _serialize(e)


@router.delete("/{event_id}", status_code=204)
def delete_event(
    event_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    e = db.query(Event).filter(Event.id == event_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    if e.image_filename:
        delete_file(e.image_filename)
    if e.document_filename:
        delete_file(e.document_filename)
    db.delete(e)
    db.commit()
