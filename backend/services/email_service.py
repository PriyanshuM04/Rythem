import os
import httpx
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
EMAIL_FROM_AUTH = os.getenv("EMAIL_FROM_AUTH")
EMAIL_FROM_SUPPORT = os.getenv("EMAIL_FROM_SUPPORT")

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def _send_email(to_email: str, sender_email: str, sender_name: str, subject: str, html_content: str):
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
    }
    payload = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content,
    }

    try:
        response = httpx.post(BREVO_API_URL, headers=headers, json=payload, timeout=10.0)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        print(f"Brevo API error: {e.response.status_code} - {e.response.text}")
        raise
    except httpx.RequestError as e:
        print(f"Brevo request failed: {e}")
        raise


def send_password_reset_email(to_email: str, reset_token: str, frontend_url: str):
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    html_content = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Reset your Rythem password</h2>
        <p>We received a request to reset your password. Click the button below to choose a new one.</p>
        <p style="margin: 24px 0;">
            <a href="{reset_link}"
               style="background:#1DB954;color:#fff;padding:12px 24px;
                      text-decoration:none;border-radius:6px;display:inline-block;">
                Reset Password
            </a>
        </p>
        <p><strong>This link will expire in 10 minutes.</strong></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
    """
    return _send_email(
        to_email=to_email,
        sender_email=EMAIL_FROM_AUTH,
        sender_name="Rythem",
        subject="Reset your Rythem password",
        html_content=html_content,
    )


def send_confirmation_email(to_email: str, confirm_token: str, frontend_url: str):
    confirm_link = f"{frontend_url}/confirm-email?token={confirm_token}"
    html_content = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Confirm your email</h2>
        <p>Thanks for signing up for Rythem! Please confirm your email address to activate your account.</p>
        <p style="margin: 24px 0;">
            <a href="{confirm_link}"
               style="background:#1DB954;color:#fff;padding:12px 24px;
                      text-decoration:none;border-radius:6px;display:inline-block;">
                Confirm Email
            </a>
        </p>
        <p>This link will expire in 24 hours.</p>
    </div>
    """
    return _send_email(
        to_email=to_email,
        sender_email=EMAIL_FROM_AUTH,
        sender_name="Rythem",
        subject="Confirm your Rythem account",
        html_content=html_content,
    )


def send_welcome_email(to_email: str, username: str):
    html_content = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Welcome to Rythem, {username}!</h2>
        <p>Your account has been created. Start streaming, build playlists, and earn tokens as you listen.</p>
    </div>
    """
    return _send_email(
        to_email=to_email,
        sender_email=EMAIL_FROM_AUTH,
        sender_name="Rythem",
        subject="Welcome to Rythem 🎵",
        html_content=html_content,
    )


def send_support_reply(to_email: str, subject: str, message_html: str):
    return _send_email(
        to_email=to_email,
        sender_email=EMAIL_FROM_SUPPORT,
        sender_name="Rythem Support",
        subject=subject,
        html_content=message_html,
    )