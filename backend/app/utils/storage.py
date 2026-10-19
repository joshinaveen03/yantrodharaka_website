"""
Storage abstraction: supports local filesystem and AWS S3.
Configure STORAGE_BACKEND=local|s3 in environment.
"""
import os
import uuid
import mimetypes
from pathlib import Path
from typing import Tuple, Optional
from fastapi import UploadFile, HTTPException
import aiofiles

from app.core.config import get_settings

settings = get_settings()

# ── Allowed file types ────────────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {
    ".pdf", ".docx", ".doc", ".pptx", ".ppt",
    ".xlsx", ".xls", ".txt", ".png", ".jpg", ".jpeg",
}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "image/png",
    "image/jpeg",
}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB

LOCAL_UPLOAD_DIR = Path("uploads")
LOCAL_UPLOAD_DIR.mkdir(exist_ok=True)


def _safe_filename(original: str) -> str:
    """Return a UUID-based filename preserving the original extension."""
    suffix = Path(original).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{suffix}' is not allowed.")
    return f"{uuid.uuid4().hex}{suffix}"


def _validate_upload(file: UploadFile, content: bytes) -> None:
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File extension '{suffix}' is not permitted.")
    mime = file.content_type or ""
    if mime and mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"MIME type '{mime}' is not permitted.")
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds the 20 MB size limit.")
    # Prevent path traversal
    if ".." in file.filename or "/" in file.filename or "\\" in file.filename:
        raise HTTPException(status_code=400, detail="Invalid filename.")


async def save_upload(file: UploadFile) -> Tuple[str, str, int, str]:
    """
    Read, validate, and persist an uploaded file.
    Returns (stored_filename, original_filename, file_size, mime_type).
    """
    content = await file.read()
    _validate_upload(file, content)

    stored_name = _safe_filename(file.filename)
    mime = file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream"

    if settings.STORAGE_BACKEND == "s3":
        await _save_to_s3(stored_name, content, mime)
    else:
        await _save_locally(stored_name, content)

    return stored_name, file.filename, len(content), mime


async def _save_locally(filename: str, content: bytes) -> None:
    path = LOCAL_UPLOAD_DIR / filename
    async with aiofiles.open(path, "wb") as f:
        await f.write(content)


async def _save_to_s3(filename: str, content: bytes, mime: str) -> None:
    import boto3
    s3 = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    s3.put_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=filename,
        Body=content,
        ContentType=mime,
    )


def delete_file(filename: str) -> None:
    if settings.STORAGE_BACKEND == "s3":
        _delete_from_s3(filename)
    else:
        path = LOCAL_UPLOAD_DIR / filename
        if path.exists():
            path.unlink()


def _delete_from_s3(filename: str) -> None:
    import boto3
    s3 = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    s3.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=filename)


def get_download_url(filename: str) -> Optional[str]:
    """Return a URL for downloading the file."""
    if not filename:
        return None
    if settings.STORAGE_BACKEND == "s3":
        return f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{filename}"
    return f"/api/files/{filename}"
