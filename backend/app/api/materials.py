import math
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import StudyMaterial
from app.schemas.schemas import StudyMaterialOut
from app.utils.dependencies import get_current_admin
from app.utils.storage import save_upload, delete_file, get_download_url

router = APIRouter(prefix="/api/materials", tags=["materials"])


def _serialize(m: StudyMaterial) -> dict:
    d = StudyMaterialOut.model_validate(m).model_dump()
    d["download_url"] = get_download_url(m.filename) if m.filename else None
    return d


# ── Public ─────────────────────────────────────────────────────────────────────
@router.get("")
def list_materials(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    subject: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(StudyMaterial).filter(StudyMaterial.is_published == True)
    if subject:
        q = q.filter(StudyMaterial.subject.ilike(f"%{subject}%"))
    if course:
        q = q.filter(StudyMaterial.course.ilike(f"%{course}%"))
    total = q.count()
    items = q.order_by(StudyMaterial.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [_serialize(m) for m in items],
        "total": total, "page": page, "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
    }


# ── Admin ──────────────────────────────────────────────────────────────────────
@router.get("/admin/all")
def list_all_materials(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    q = db.query(StudyMaterial)
    total = q.count()
    items = q.order_by(StudyMaterial.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [_serialize(m) for m in items],
        "total": total, "page": page, "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
    }


@router.post("", response_model=dict, status_code=201)
async def upload_material(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    course: Optional[str] = Form(None),
    is_published: bool = Form(False),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")
    stored, orig, size, mime = await save_upload(file)
    m = StudyMaterial(
        title=title.strip(),
        description=description,
        subject=subject,
        course=course,
        is_published=is_published,
        filename=stored,
        original_filename=orig,
        file_size=size,
        mime_type=mime,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return _serialize(m)


@router.put("/{material_id}", response_model=dict)
async def update_material(
    material_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    course: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    m = db.query(StudyMaterial).filter(StudyMaterial.id == material_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Material not found")
    if title is not None:
        m.title = title.strip()
    if description is not None:
        m.description = description
    if subject is not None:
        m.subject = subject
    if course is not None:
        m.course = course
    if is_published is not None:
        m.is_published = is_published
    if file and file.filename:
        delete_file(m.filename)
        stored, orig, size, mime = await save_upload(file)
        m.filename = stored
        m.original_filename = orig
        m.file_size = size
        m.mime_type = mime
    m.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(m)
    return _serialize(m)


@router.delete("/{material_id}", status_code=204)
def delete_material(
    material_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    m = db.query(StudyMaterial).filter(StudyMaterial.id == material_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Material not found")
    delete_file(m.filename)
    db.delete(m)
    db.commit()
