"""
Backend tests using pytest + httpx TestClient.
Run: pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import get_db, Base
from app.core.security import hash_password
from app.models.models import AdminUser

# ── In-memory SQLite for tests ────────────────────────────────────────────────
SQLALCHEMY_TEST_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(bind=engine)


def override_get_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True, scope="session")
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestSession()
    admin = AdminUser(
        email="test@admin.com",
        hashed_password=hash_password("TestPass@123"),
        full_name="Test Admin",
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(scope="session")
def auth_headers(client):
    resp = client.post("/api/auth/login", json={"email": "test@admin.com", "password": "TestPass@123"})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── Health ─────────────────────────────────────────────────────────────────────
def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# ── Auth ───────────────────────────────────────────────────────────────────────
def test_login_success(client):
    r = client.post("/api/auth/login", json={"email": "test@admin.com", "password": "TestPass@123"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_wrong_password(client):
    r = client.post("/api/auth/login", json={"email": "test@admin.com", "password": "wrong"})
    assert r.status_code == 401


def test_get_me(client, auth_headers):
    r = client.get("/api/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == "test@admin.com"


def test_get_me_no_token(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 401


# ── Notifications ──────────────────────────────────────────────────────────────
def test_create_notification(client, auth_headers):
    r = client.post(
        "/api/notifications",
        data={"title": "Test Notification", "description": "Test body", "is_published": "true"},
        headers=auth_headers,
    )
    assert r.status_code == 201
    assert r.json()["title"] == "Test Notification"


def test_list_notifications_public(client):
    r = client.get("/api/notifications")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert len(data["items"]) >= 1


def test_create_notification_no_auth(client):
    r = client.post("/api/notifications", data={"title": "X"})
    assert r.status_code == 401


# ── Courses ────────────────────────────────────────────────────────────────────
def test_create_course(client, auth_headers):
    r = client.post(
        "/api/courses",
        json={"name": "JEE Advanced", "description": "Top engineering prep", "is_published": True},
        headers=auth_headers,
    )
    assert r.status_code == 201


def test_list_courses_public(client):
    r = client.get("/api/courses")
    assert r.status_code == 200
    assert "items" in r.json()


# ── Events ─────────────────────────────────────────────────────────────────────
def test_create_event(client, auth_headers):
    r = client.post(
        "/api/events",
        data={"title": "Annual Science Fair", "venue": "Main Hall", "is_published": "true"},
        headers=auth_headers,
    )
    assert r.status_code == 201


def test_list_events_public(client):
    r = client.get("/api/events")
    assert r.status_code == 200


# ── Contact ────────────────────────────────────────────────────────────────────
def test_submit_contact(client):
    r = client.post(
        "/api/contact",
        json={"name": "Ravi Kumar", "email": "ravi@example.com", "message": "I want to enrol"},
    )
    assert r.status_code == 201


def test_admin_stats(client, auth_headers):
    r = client.get("/api/admin/stats", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert "notifications" in data
    assert "courses" in data
