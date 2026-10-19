import math
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Course
from app.schemas.schemas import CourseCreate, CourseUpdate, CourseOut
from app.utils.dependencies import get_current_admin

router = APIRouter(prefix="/api/courses", tags=["courses"])


# ── Public ─────────────────────────────────────────────────────────────────────
@router.get("")
def list_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    q = db.query(Course).filter(Course.is_published == True)
    total = q.count()
    items = q.order_by(Course.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [CourseOut.model_validate(c).model_dump() for c in items],
        "total": total, "page": page, "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
    }


@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: str, db: Session = Depends(get_db)):
    c = db.query(Course).filter(Course.id == course_id, Course.is_published == True).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    return c


# ── Admin ──────────────────────────────────────────────────────────────────────
@router.get("/admin/all")
def list_all_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    q = db.query(Course)
    total = q.count()
    items = q.order_by(Course.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [CourseOut.model_validate(c).model_dump() for c in items],
        "total": total, "page": page, "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
    }


@router.post("", response_model=CourseOut, status_code=201)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    c = Course(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.put("/{course_id}", response_model=CourseOut)
def update_course(
    course_id: str,
    payload: CourseUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(c, field, value)
    c.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{course_id}", status_code=204)
def delete_course(
    course_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(c)
    db.commit()
