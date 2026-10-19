"""
Database initialization:
- Creates all tables (if they don't exist)
- Seeds the initial admin user from environment variables
"""
from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.core.security import hash_password
from app.core.config import get_settings
from app.models.models import Base, AdminUser

settings = get_settings()


def init_db() -> None:
    """Create tables and seed admin user on first run."""
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        existing = db.query(AdminUser).filter(AdminUser.email == settings.ADMIN_EMAIL).first()
        if not existing:
            admin = AdminUser(
                email=settings.ADMIN_EMAIL,
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                full_name="Administrator",
                is_active=True,
            )
            db.add(admin)
            db.commit()
            print(f"[init_db] Admin user created: {settings.ADMIN_EMAIL}")
        else:
            print(f"[init_db] Admin user already exists: {settings.ADMIN_EMAIL}")
    finally:
        db.close()
