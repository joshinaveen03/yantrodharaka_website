import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import ContactEnquiry
from app.schemas.schemas import ContactCreate, ContactOut
from app.utils.dependencies import get_current_admin

router = APIRouter(prefix="/api/contact", tags=["contact"])


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
        "total": total, "page": page, "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
    }


@router.put("/admin/{enquiry_id}/mark-read", response_model=ContactOut)
def mark_read(
    enquiry_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    from fastapi import HTTPException
    c = db.query(ContactEnquiry).filter(ContactEnquiry.id == enquiry_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    c.is_read = True
    db.commit()
    db.refresh(c)
    return c
