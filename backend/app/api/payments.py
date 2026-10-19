import math
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.models.models import Payment
from app.schemas.schemas import PaymentCreate, PaymentOut
from app.utils.dependencies import get_current_admin

router = APIRouter(prefix="/api/payments", tags=["payments"])


def _gen_receipt_no():
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    rnd = uuid.uuid4().hex[:4].upper()
    return f"YDC-{ts}-{rnd}"


@router.post("", response_model=PaymentOut)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)):
    receipt_no = _gen_receipt_no()
    p = Payment(
        receipt_no=receipt_no,
        student_name=payload.student_name.strip(),
        email=payload.email.strip(),
        phone=payload.phone.strip(),
        course_name=payload.course_name.strip(),
        amount=payload.amount,
        payment_method=payload.payment_method,
        transaction_ref=payload.transaction_ref,
        status="SUCCESS",
        notes=payload.notes,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.get("/{ref}", response_model=PaymentOut)
def get_payment(ref: str, db: Session = Depends(get_db)):
    p = db.query(Payment).filter(
        or_(Payment.id == ref, Payment.receipt_no == ref)
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment receipt not found")
    return p


@router.get("/admin/all")
def list_payments_admin(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: str = Query("", description="Search by name, email, phone or receipt"),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    query = db.query(Payment)
    if q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Payment.student_name.ilike(term),
                Payment.email.ilike(term),
                Payment.phone.ilike(term),
                Payment.receipt_no.ilike(term),
                Payment.course_name.ilike(term),
                Payment.transaction_ref.ilike(term),
            )
        )
    total = query.count()
    items = query.order_by(Payment.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    all_amounts = db.query(Payment.amount).filter(Payment.status == "SUCCESS").all()
    revenue = sum(a[0] for a in all_amounts) if all_amounts else 0

    return {
        "items": [PaymentOut.model_validate(p).model_dump() for p in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
        "total_revenue": revenue,
    }
