from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.core.config import get_settings
from app.db_init import init_db
from app.api import auth, notifications, courses, materials, events, contact, payments, gallery

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
cors_origins = [settings.FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"]
if settings.FRONTEND_ORIGIN == "*":
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
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
app.include_router(gallery.router)


# ── File download endpoint (local storage only) ────────────────────────────────
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

if settings.STORAGE_BACKEND == "local":
    app.mount("/api/files", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


# ── Dashboard stats (admin) ────────────────────────────────────────────────────
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Notification, Course, StudyMaterial, Event, ContactEnquiry, Payment, GalleryItem
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
        "gallery": db.query(GalleryItem).count(),
        "total_revenue": total_rev,
    }


# ── Frontend SPA Serving (Unified Service) ────────────────────────────────────
# Check both potential locations (running from backend/ or project root)
possible_dist_paths = [
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
    Path("frontend/dist").resolve(),
    Path("../frontend/dist").resolve(),
]
FRONTEND_DIST = next((p for p in possible_dist_paths if p.is_dir()), None)

if FRONTEND_DIST:
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="frontend-assets")


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    # Never intercept backend API routes
    if full_path.startswith("api/") or full_path == "api":
        return JSONResponse({"detail": "Not Found"}, status_code=404)

    if not FRONTEND_DIST or not FRONTEND_DIST.is_dir():
        return JSONResponse(
            {"detail": "Frontend not built yet. Run 'npm run build' inside frontend/"},
            status_code=404,
        )

    # 1. Direct static file match in dist (e.g. favicon.png, logo.png, robots.txt)
    target_file = (FRONTEND_DIST / full_path).resolve()
    try:
        # Prevent directory traversal attacks
        target_file.relative_to(FRONTEND_DIST.resolve())
        if target_file.is_file():
            return FileResponse(target_file)
    except ValueError:
        return JSONResponse({"detail": "Forbidden"}, status_code=403)

    # 2. SPA client-side routes (e.g. /about, /courses, /admin/login) -> return index.html
    index_file = FRONTEND_DIST / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)

    return JSONResponse({"detail": "Frontend index.html not found"}, status_code=404)

