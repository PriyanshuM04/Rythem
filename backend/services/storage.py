import os
import uuid
import boto3
from botocore.client import Config
from dotenv import load_dotenv
import re

load_dotenv()

B2_ENDPOINT_URL = os.getenv("B2_ENDPOINT_URL")
B2_KEY_ID = os.getenv("B2_KEY_ID")
B2_APPLICATION_KEY = os.getenv("B2_APPLICATION_KEY")
B2_BUCKET_NAME = os.getenv("B2_BUCKET_NAME")
UPLOAD_URL_EXPIRY = int(os.getenv("B2_UPLOAD_URL_EXPIRY_SECONDS", "900"))
DOWNLOAD_URL_EXPIRY = int(os.getenv("B2_DOWNLOAD_URL_EXPIRY_SECONDS", "3600"))

ALLOWED_AUDIO_EXTENSIONS = {"mp3", "wav", "flac", "m4a", "ogg"}

def _extract_region(endpoint_url: str) -> str:
    match = re.search(r"s3\.([a-z0-9-]+)\.backblazeb2\.com", endpoint_url)
    return match.group(1) if match else "us-east-1"

_client = boto3.client(
    "s3",
    endpoint_url=B2_ENDPOINT_URL,
    aws_access_key_id=B2_KEY_ID,
    aws_secret_access_key=B2_APPLICATION_KEY,
    region_name=_extract_region(B2_ENDPOINT_URL),
    config=Config(signature_version="s3v4"),
)

def build_audio_key(artist_id: int, file_extension: str) -> str:
    ext = file_extension.lower().lstrip(".")
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise ValueError(f"Unsupported file extension: {ext}")
    return f"audio/{artist_id}/{uuid.uuid4()}.{ext}"

def generate_upload_url(key: str) -> str:
    return _client.generate_presigned_url(
        ClientMethod="put_object",
        Params={"Bucket": B2_BUCKET_NAME, "Key":key},
        ExpiresIn=UPLOAD_URL_EXPIRY,
    )

def generate_download_url(key: str) -> str:
    return _client.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": B2_BUCKET_NAME, "Key": key},
        ExpiresIn=DOWNLOAD_URL_EXPIRY,
    )

def object_exists(key: str) -> bool:
    try:
        _client.head_object(Bucket=B2_BUCKET_NAME, Key=key)
        return True
    except Exception:
        return False