from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.core.config import get_settings
from app.db_init import init_db
from app.api import auth, notifications, courses, materials, events, contact, payments

settings = get_settings()

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Yantrodharaka Coaching Center API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup ────────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    init_db()


# ── Health ─────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(notifications.router)
app.include_router(courses.router)
app.include_router(materials.router)
app.include_router(events.router)
app.include_router(contact.router)
app.include_router(payments.router)


# ── File download endpoint (local storage only) ────────────────────────────────
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

if settings.STORAGE_BACKEND == "local":
    app.mount("/api/files", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


# ── Dashboard stats (admin) ────────────────────────────────────────────────────
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Notification, Course, StudyMaterial, Event, ContactEnquiry, Payment
from app.utils.dependencies import get_current_admin


@app.get("/api/admin/stats", tags=["admin"])
def admin_stats(
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    payment_amounts = db.query(Payment.amount).filter(Payment.status == "SUCCESS").all()
    total_rev = sum(a[0] for a in payment_amounts) if payment_amounts else 0
    return {
        "notifications": db.query(Notification).count(),
        "courses": db.query(Course).count(),
        "study_materials": db.query(StudyMaterial).count(),
        "events": db.query(Event).count(),
        "enquiries": db.query(ContactEnquiry).count(),
        "unread_enquiries": db.query(ContactEnquiry).filter(ContactEnquiry.is_read == False).count(),
        "payments": db.query(Payment).count(),
        "total_revenue": total_rev,
    }
