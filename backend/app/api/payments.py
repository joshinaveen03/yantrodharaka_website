import math
import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.models.models import Payment, PaymentSetting, PaymentPackage
from app.schemas.schemas import (
    PaymentCreate, PaymentOut,
    PaymentSettingOut, PaymentSettingUpdate,
    PaymentPackageOut, PaymentPackageCreate, PaymentPackageUpdate,
)
from app.utils.dependencies import get_current_admin

router = APIRouter(prefix="/api/payments", tags=["payments"])


def _gen_receipt_no():
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    rnd = uuid.uuid4().hex[:4].upper()
    return f"YDC-{ts}-{rnd}"


# ── Payment Settings Endpoints ───────────────────────────────────────────────
@router.get("/settings", response_model=PaymentSettingOut)
def get_payment_settings(db: Session = Depends(get_db)):
    setting = db.query(PaymentSetting).first()
    if not setting:
        setting = PaymentSetting(
            upi_id="9483208991@upi",
            payee_name="Yantrodharaka Coaching Centre",
            enable_upi=True,
            enable_bank=True,
            enable_card=True,
            bank_name="State Bank of India",
            account_name="Yantrodharaka Coaching Centre",
            account_number="9483208991001",
            ifsc_code="SBIN0001234",
            branch="Main Branch",
            contact_phone="+91 94832 08991",
            contact_email="robo.yantrodharaka2026@gmail.com",
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting


@router.put("/settings", response_model=PaymentSettingOut)
def update_payment_settings(
    payload: PaymentSettingUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    setting = db.query(PaymentSetting).first()
    if not setting:
        setting = PaymentSetting()
        db.add(setting)

    for field, value in payload.model_dump().items():
        setattr(setting, field, value)

    setting.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(setting)
    return setting


# ── Payment Packages Endpoints ───────────────────────────────────────────────
@router.get("/packages", response_model=List[PaymentPackageOut])
def get_public_payment_packages(db: Session = Depends(get_db)):
    """Public endpoint to fetch active payment programs/courses."""
    pkgs = (
        db.query(PaymentPackage)
        .filter(PaymentPackage.is_active == True)
        .order_by(PaymentPackage.display_order.asc(), PaymentPackage.amount.asc())
        .all()
    )
    return pkgs


@router.get("/admin/packages", response_model=List[PaymentPackageOut])
def list_all_packages_admin(
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    """Admin endpoint to fetch all packages including inactive ones."""
    return (
        db.query(PaymentPackage)
        .order_by(PaymentPackage.display_order.asc(), PaymentPackage.created_at.asc())
        .all()
    )


@router.post("/admin/packages", response_model=PaymentPackageOut, status_code=201)
def create_payment_package(
    payload: PaymentPackageCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    existing = db.query(PaymentPackage).filter(PaymentPackage.pkg_key == payload.pkg_key).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Package key '{payload.pkg_key}' already exists")

    pkg = PaymentPackage(
        pkg_key=payload.pkg_key.strip(),
        name=payload.name.strip(),
        amount=payload.amount,
        badge=payload.badge.strip() if payload.badge else None,
        description=payload.description.strip() if payload.description else None,
        is_custom=payload.is_custom,
        is_active=payload.is_active,
        display_order=payload.display_order,
    )
    db.add(pkg)
    db.commit()
    db.refresh(pkg)
    return pkg


@router.put("/admin/packages/{pkg_id}", response_model=PaymentPackageOut)
def update_payment_package(
    pkg_id: str,
    payload: PaymentPackageUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    pkg = db.query(PaymentPackage).filter(PaymentPackage.id == pkg_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Payment package not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "pkg_key" in update_data and update_data["pkg_key"] != pkg.pkg_key:
        conflict = db.query(PaymentPackage).filter(
            PaymentPackage.pkg_key == update_data["pkg_key"],
            PaymentPackage.id != pkg_id,
        ).first()
        if conflict:
            raise HTTPException(status_code=400, detail="Package key already in use")

    for field, value in update_data.items():
        if value is not None:
            setattr(pkg, field, value)

    pkg.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(pkg)
    return pkg


@router.delete("/admin/packages/{pkg_id}", status_code=204)
def delete_payment_package(
    pkg_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    pkg = db.query(PaymentPackage).filter(PaymentPackage.id == pkg_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Payment package not found")
    db.delete(pkg)
    db.commit()


# ── Payment Transactions Endpoints ───────────────────────────────────────────
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


@router.delete("/{payment_id}", status_code=204)
def delete_payment(
    payment_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    p = db.query(Payment).filter(Payment.id == payment_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment record not found")
    db.delete(p)
    db.commit()


@router.get("/{ref}", response_model=PaymentOut)
def get_payment(ref: str, db: Session = Depends(get_db)):
    p = db.query(Payment).filter(
        or_(Payment.id == ref, Payment.receipt_no == ref)
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment receipt not found")
    return p
