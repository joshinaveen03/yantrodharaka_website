import math
import hmac
import hashlib
import time
from pathlib import Path
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, Request, Header
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import get_settings
from app.core.security import decode_access_token
from app.models.models import StudyMaterial, MaterialFolder, MaterialAccessRequest, AdminUser
from app.schemas.schemas import (
    StudyMaterialOut, MaterialFolderOut, MaterialFolderAdminOut,
    MaterialFolderCreate, MaterialFolderUpdate,
    FolderUnlockRequest, FolderUnlockResponse,
    MaterialAccessRequestCreate, MaterialAccessRequestUpdate, MaterialAccessRequestOut,
)
from app.utils.dependencies import get_current_admin
from app.utils.storage import save_upload, delete_file, get_download_url, LOCAL_UPLOAD_DIR

settings = get_settings()
router = APIRouter(prefix="/api/materials", tags=["materials"])


# ── Helpers ───────────────────────────────────────────────────────────────────
def create_folder_token(folder_id: str) -> str:
    """Generate a signed folder access token valid for 24 hours."""
    exp = int(time.time()) + 86400
    payload = f"{folder_id}:{exp}"
    sig = hmac.new(settings.JWT_SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{sig}"


def verify_folder_token(folder_id: str, token: Optional[str]) -> bool:
    """Verify signed folder token."""
    if not token:
        return False
    try:
        parts = token.split(":")
        if len(parts) != 3:
            return False
        fid, exp_str, sig = parts
        if fid != folder_id:
            return False
        if int(exp_str) < int(time.time()):
            return False
        expected_sig = hmac.new(settings.JWT_SECRET_KEY.encode(), f"{fid}:{exp_str}".encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(sig, expected_sig)
    except Exception:
        return False


def is_admin_request(request: Request, db: Session) -> bool:
    """Check if the incoming request has valid Admin Bearer token."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            admin = db.query(AdminUser).filter(AdminUser.id == payload.get("sub"), AdminUser.is_active == True).first()
            if admin:
                return True
    return False


def _serialize_folder(f: MaterialFolder, is_admin: bool = False) -> dict:
    count = len(f.materials) if f.materials else 0
    d = {
        "id": f.id,
        "name": f.name,
        "description": f.description,
        "subject": f.subject,
        "course": f.course,
        "is_protected": f.is_protected,
        "is_published": f.is_published,
        "display_order": f.display_order,
        "items_count": count,
        "created_at": f.created_at,
        "updated_at": f.updated_at,
    }
    if is_admin:
        d["access_password"] = f.access_password
    return d


def _serialize(m: StudyMaterial) -> dict:
    d = StudyMaterialOut.model_validate(m).model_dump()
    d["folder_name"] = m.folder.name if m.folder else None
    d["download_url"] = get_download_url(m.filename) if m.filename else None
    return d


# ── Public: Folder Browsing & Unlock ──────────────────────────────────────────
@router.get("/folders")
def list_folders(
    subject: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List all published folders for public browsing."""
    q = db.query(MaterialFolder).filter(MaterialFolder.is_published == True)
    if subject:
        q = q.filter(MaterialFolder.subject.ilike(f"%{subject}%"))
    if course:
        q = q.filter(MaterialFolder.course.ilike(f"%{course}%"))
    folders = q.order_by(MaterialFolder.display_order.asc(), MaterialFolder.created_at.desc()).all()
    return [_serialize_folder(f, is_admin=False) for f in folders]


@router.post("/folders/{folder_id}/unlock", response_model=FolderUnlockResponse)
def unlock_folder(
    folder_id: str,
    payload: FolderUnlockRequest,
    db: Session = Depends(get_db),
):
    """Verify password to unlock a protected material folder."""
    folder = db.query(MaterialFolder).filter(MaterialFolder.id == folder_id, MaterialFolder.is_published == True).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    if not folder.is_protected:
        token = create_folder_token(folder.id)
        return FolderUnlockResponse(
            success=True,
            folder_id=folder.id,
            token=token,
            message="This folder is open access."
        )

    expected = (folder.access_password or "").strip()
    provided = (payload.password or "").strip()

    if not expected or provided.lower() != expected.lower():
        raise HTTPException(
            status_code=401,
            detail="Incorrect access password. Please contact the administrator or request permission to access these study materials."
        )

    token = create_folder_token(folder.id)
    return FolderUnlockResponse(
        success=True,
        folder_id=folder.id,
        token=token,
        message=f"Access granted to folder '{folder.name}'."
    )


@router.get("/folders/{folder_id}/items")
def get_folder_items(
    folder_id: str,
    request: Request,
    token: Optional[str] = Query(None),
    x_folder_token: Optional[str] = Header(None, alias="X-Folder-Token"),
    db: Session = Depends(get_db),
):
    """Retrieve materials inside a folder. Requires token if folder is password protected."""
    folder = db.query(MaterialFolder).filter(MaterialFolder.id == folder_id, MaterialFolder.is_published == True).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    # If folder is password protected, check unlock token or admin auth
    if folder.is_protected:
        auth_token = token or x_folder_token
        is_unlocked = verify_folder_token(folder.id, auth_token)
        is_admin = is_admin_request(request, db)

        if not is_unlocked and not is_admin:
            raise HTTPException(
                status_code=403,
                detail="Folder is password protected. Please enter the access password or request permission from the admin."
            )

    items = db.query(StudyMaterial).filter(
        StudyMaterial.folder_id == folder_id,
        StudyMaterial.is_published == True,
    ).order_by(StudyMaterial.created_at.desc()).all()

    return {
        "folder": _serialize_folder(folder, is_admin=False),
        "items": [_serialize(m) for m in items],
        "total": len(items),
    }


# ── Public: Access Permission Request ─────────────────────────────────────────
@router.post("/access-request", status_code=201)
def request_folder_access(
    req: MaterialAccessRequestCreate,
    db: Session = Depends(get_db),
):
    """Students submit a request for folder password access."""
    folder = db.query(MaterialFolder).filter(MaterialFolder.id == req.folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Material folder not found")

    new_req = MaterialAccessRequest(
        folder_id=folder.id,
        folder_name=folder.name,
        student_name=req.student_name.strip(),
        email=req.email.strip(),
        phone=req.phone.strip(),
        message=req.message.strip() if req.message else None,
        status="PENDING",
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return {
        "message": "Access permission request submitted successfully. The administrator will contact you with the password.",
        "id": new_req.id,
        "folder_name": folder.name,
    }


# ── Public: Material Listing & Download ────────────────────────────────────────
@router.get("")
def list_materials(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    subject: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    folder_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(StudyMaterial).filter(StudyMaterial.is_published == True)
    if folder_id:
        q = q.filter(StudyMaterial.folder_id == folder_id)
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


@router.get("/{material_id}/download")
def download_material(
    material_id: str,
    request: Request,
    token: Optional[str] = Query(None),
    x_folder_token: Optional[str] = Header(None, alias="X-Folder-Token"),
    db: Session = Depends(get_db),
):
    """Download study material file with its original filename, verifying folder protection."""
    m = db.query(StudyMaterial).filter(StudyMaterial.id == material_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Material not found")

    # If belonging to a protected folder, verify token
    if m.folder and m.folder.is_protected:
        auth_token = token or x_folder_token
        is_unlocked = verify_folder_token(m.folder.id, auth_token)
        is_admin = is_admin_request(request, db)
        if not is_unlocked and not is_admin:
            raise HTTPException(
                status_code=403,
                detail="Folder is password protected. Please unlock the folder to download this file."
            )

    file_path = LOCAL_UPLOAD_DIR / m.filename
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="File content not found on server")

    return FileResponse(
        path=str(file_path),
        filename=m.original_filename or m.title,
        media_type=m.mime_type or "application/octet-stream",
    )


# ── Admin: Folders Management ──────────────────────────────────────────────────
@router.get("/admin/folders")
def admin_list_folders(
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    """List all folders with passwords for Admin."""
    folders = db.query(MaterialFolder).order_by(MaterialFolder.display_order.asc(), MaterialFolder.created_at.desc()).all()
    return [_serialize_folder(f, is_admin=True) for f in folders]


@router.post("/admin/folders", status_code=201)
def admin_create_folder(
    payload: MaterialFolderCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    """Admin creates a new folder with password protection."""
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Folder name is required")

    folder = MaterialFolder(
        name=payload.name.strip(),
        description=payload.description,
        subject=payload.subject,
        course=payload.course,
        is_protected=payload.is_protected,
        access_password=payload.access_password.strip() if payload.access_password else None,
        is_published=payload.is_published,
        display_order=payload.display_order,
    )
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return _serialize_folder(folder, is_admin=True)


@router.put("/admin/folders/{folder_id}")
def admin_update_folder(
    folder_id: str,
    payload: MaterialFolderUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    """Admin updates folder details and access password."""
    folder = db.query(MaterialFolder).filter(MaterialFolder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    if payload.name is not None:
        folder.name = payload.name.strip()
    if payload.description is not None:
        folder.description = payload.description
    if payload.subject is not None:
        folder.subject = payload.subject
    if payload.course is not None:
        folder.course = payload.course
    if payload.is_protected is not None:
        folder.is_protected = payload.is_protected
    if payload.access_password is not None:
        folder.access_password = payload.access_password.strip() if payload.access_password else None
    if payload.is_published is not None:
        folder.is_published = payload.is_published
    if payload.display_order is not None:
        folder.display_order = payload.display_order

    folder.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(folder)
    return _serialize_folder(folder, is_admin=True)


@router.delete("/admin/folders/{folder_id}", status_code=204)
def admin_delete_folder(
    folder_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    """Admin deletes a folder."""
    folder = db.query(MaterialFolder).filter(MaterialFolder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    db.delete(folder)
    db.commit()


# ── Admin: Access Requests Management ──────────────────────────────────────────
@router.get("/admin/access-requests")
def admin_list_access_requests(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    """List student permission requests."""
    q = db.query(MaterialAccessRequest).order_by(MaterialAccessRequest.created_at.desc())
    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    out = []
    for r in items:
        out.append({
            "id": r.id,
            "folder_id": r.folder_id,
            "folder_name": r.folder_name,
            "folder_password": r.folder.access_password if r.folder else None,
            "student_name": r.student_name,
            "email": r.email,
            "phone": r.phone,
            "message": r.message,
            "status": r.status,
            "admin_notes": r.admin_notes,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        })
    return {
        "items": out,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
    }


@router.put("/admin/access-requests/{req_id}")
def admin_update_access_request(
    req_id: str,
    payload: MaterialAccessRequestUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    """Update status (e.g. APPROVED, REJECTED) or notes of access request."""
    req = db.query(MaterialAccessRequest).filter(MaterialAccessRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if payload.status is not None:
        req.status = payload.status
    if payload.admin_notes is not None:
        req.admin_notes = payload.admin_notes
    req.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(req)
    return {
        "id": req.id,
        "status": req.status,
        "admin_notes": req.admin_notes,
        "updated_at": req.updated_at,
    }


@router.delete("/admin/access-requests/{req_id}", status_code=204)
def admin_delete_access_request(
    req_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    req = db.query(MaterialAccessRequest).filter(MaterialAccessRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    db.delete(req)
    db.commit()


# ── Admin: Materials CRUD ──────────────────────────────────────────────────────
@router.get("/admin/all")
def list_all_materials(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    folder_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    q = db.query(StudyMaterial)
    if folder_id:
        q = q.filter(StudyMaterial.folder_id == folder_id)
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
    folder_id: Optional[str] = Form(None),
    is_published: bool = Form(False),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")

    # If folder_id provided, ensure valid
    clean_folder_id = folder_id.strip() if folder_id and folder_id.strip() else None
    if clean_folder_id:
        folder = db.query(MaterialFolder).filter(MaterialFolder.id == clean_folder_id).first()
        if not folder:
            raise HTTPException(status_code=400, detail="Selected folder does not exist")

    stored, orig, size, mime = await save_upload(file)
    m = StudyMaterial(
        title=title.strip(),
        description=description,
        subject=subject,
        course=course,
        folder_id=clean_folder_id,
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
    folder_id: Optional[str] = Form(None),
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
    if folder_id is not None:
        m.folder_id = folder_id.strip() if folder_id.strip() else None
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
