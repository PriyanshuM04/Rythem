import logging
import os
import uuid

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException, UploadFile

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").rstrip("/")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY") or ""
SUPABASE_IMAGE_BUCKET = os.getenv("SUPABASE_IMAGE_BUCKET") or ""

MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_IMAGE_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
IMAGE_KINDS = {"avatars", "playlist-covers", "song-covers"}

_http = httpx.Client(timeout=15.0)


def _is_configured() -> bool:
    return bool(SUPABASE_URL and SUPABASE_SECRET_KEY and SUPABASE_IMAGE_BUCKET)


def _auth_headers() -> dict:
    # New-format keys (sb_secret_...) are opaque, not JWTs: they go in `apikey` only.
    # A legacy service_role key is a JWT and is also sent as the bearer token.
    headers = {"apikey": SUPABASE_SECRET_KEY}
    if SUPABASE_SECRET_KEY.startswith("eyJ"):
        headers["Authorization"] = f"Bearer {SUPABASE_SECRET_KEY}"
    return headers


def _object_url(path: str) -> str:
    return f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_IMAGE_BUCKET}/{path}"


def public_image_url(path: str | None) -> str | None:
    """Build the public URL from the stored object path. The DB never stores URLs."""
    if not path or not SUPABASE_URL or not SUPABASE_IMAGE_BUCKET:
        return None
    return f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_IMAGE_BUCKET}/{path}"


def _sniff_image_type(data: bytes) -> str | None:
    # Check the real bytes. The client-declared content type and filename are not trusted.
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None


def _read_capped(file: UploadFile) -> bytes:
    # Read at most cap + 1 bytes, so memory stays bounded even for a huge upload
    data = file.file.read(MAX_IMAGE_BYTES + 1)
    if not data:
        raise HTTPException(status_code=400, detail="The uploaded file is empty")
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image must be {MAX_IMAGE_BYTES // (1024 * 1024)} MB or smaller",
        )
    return data


def build_image_path(kind: str, owner_id: int, file: UploadFile) -> str:
    """Server-generated object path. The declared type picks the extension; upload_image verifies it."""
    if kind not in IMAGE_KINDS:
        raise ValueError(f"Unknown image kind: {kind}")
    ext = ALLOWED_IMAGE_TYPES.get((file.content_type or "").lower())
    if ext is None:
        raise HTTPException(status_code=415, detail="Only jpg, png and webp images are allowed")
    return f"{kind}/{owner_id}/{uuid.uuid4()}.{ext}"


def upload_image(file: UploadFile, path: str) -> str:
    """Validate and upload an image to Supabase Storage. Returns the public URL."""
    if not _is_configured():
        raise HTTPException(status_code=503, detail="Image storage is not configured")

    data = _read_capped(file)

    sniffed = _sniff_image_type(data)
    path_ext = path.rsplit(".", 1)[-1].lower()
    if sniffed is None or ALLOWED_IMAGE_TYPES[sniffed] != path_ext:
        raise HTTPException(status_code=415, detail="File is not a valid jpg, png or webp image")

    try:
        response = _http.post(
            _object_url(path),
            content=data,
            headers={
                **_auth_headers(),
                "Content-Type": sniffed,
                "x-upsert": "false",
                "cache-control": "max-age=31536000",  # safe: every upload gets a fresh uuid path
            },
        )
    except httpx.HTTPError as exc:
        logger.error("Supabase image upload failed: %s", exc)
        raise HTTPException(status_code=502, detail="Could not store the image, please try again")

    if response.status_code not in (200, 201):
        logger.error("Supabase image upload rejected: %s %s", response.status_code, response.text)
        raise HTTPException(status_code=502, detail="Could not store the image, please try again")

    return public_image_url(path)


def delete_image(path: str | None) -> None:
    """Best-effort delete. A failed cleanup must never fail the request."""
    if not path or not _is_configured():
        return
    try:
        response = _http.delete(_object_url(path), headers=_auth_headers())
        if response.status_code not in (200, 204):
            logger.warning("Supabase image delete failed for %s: %s %s", path, response.status_code, response.text)
    except httpx.HTTPError as exc:
        logger.warning("Supabase image delete failed for %s: %s", path, exc)