from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.models.models import GalleryItem
from app.schemas.schemas import GalleryItemOut
from app.utils.dependencies import get_current_admin
from app.utils.storage import save_upload, delete_file, get_download_url

router = APIRouter(prefix="/api/gallery", tags=["gallery"])


def _serialize(item: GalleryItem) -> dict:
    d = {
        "id": item.id,
        "title": item.title,
        "caption": item.caption or "",
        "category": item.category or "workshops",
        "date_label": item.date_label or "",
        "badge": item.badge or "",
        "image_url": item.image_url,
        "image_filename": item.image_filename,
        "order": item.order or 0,
        "created_at": item.created_at,
    }
    if item.image_filename:
        d["image_src"] = get_download_url(item.image_filename)
    elif item.image_url:
        d["image_src"] = item.image_url
    else:
        d["image_src"] = "/gallery/python-crash-course.jpg"
    return d


# ── Public ─────────────────────────────────────────────────────────────────────
@router.get("", response_model=List[dict])
def list_gallery(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(GalleryItem)
    if category and category != "all":
        q = q.filter(GalleryItem.category == category)
    items = q.order_by(GalleryItem.order.asc(), GalleryItem.created_at.desc()).all()
    return [_serialize(item) for item in items]


# ── Admin ──────────────────────────────────────────────────────────────────────
@router.get("/admin/all", response_model=List[dict])
def list_all_gallery_admin(
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    items = db.query(GalleryItem).order_by(GalleryItem.order.asc(), GalleryItem.created_at.desc()).all()
    return [_serialize(item) for item in items]


@router.post("", response_model=dict, status_code=201)
async def create_gallery_item(
    title: str = Form(...),
    caption: Optional[str] = Form(None),
    category: str = Form("workshops"),
    date_label: Optional[str] = Form(None),
    badge: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None),
    order: Optional[int] = Form(0),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")

    stored_filename = None
    if image and image.filename:
        stored_filename, _, _, _ = await save_upload(image)

    if not stored_filename and not (image_url and image_url.strip()):
        raise HTTPException(status_code=400, detail="Please upload an image or provide an image URL")

    item = GalleryItem(
        title=title.strip(),
        caption=caption.strip() if caption else None,
        category=category.strip() if category else "workshops",
        date_label=date_label.strip() if date_label else None,
        badge=badge.strip() if badge else None,
        image_url=image_url.strip() if image_url else None,
        image_filename=stored_filename,
        order=order or 0,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _serialize(item)


@router.put("/{item_id}", response_model=dict)
async def update_gallery_item(
    item_id: str,
    title: Optional[str] = Form(None),
    caption: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    date_label: Optional[str] = Form(None),
    badge: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None),
    order: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    if title is not None:
        item.title = title.strip()
    if caption is not None:
        item.caption = caption.strip()
    if category is not None:
        item.category = category.strip()
    if date_label is not None:
        item.date_label = date_label.strip()
    if badge is not None:
        item.badge = badge.strip()
    if image_url is not None:
        item.image_url = image_url.strip() if image_url.strip() else None
    if order is not None:
        item.order = order

    if image and image.filename:
        if item.image_filename:
            delete_file(item.image_filename)
        stored_filename, _, _, _ = await save_upload(image)
        item.image_filename = stored_filename

    db.commit()
    db.refresh(item)
    return _serialize(item)


@router.delete("/{item_id}", status_code=204)
def delete_gallery_item(
    item_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    if item.image_filename:
        delete_file(item.image_filename)

    db.delete(item)
    db.commit()
