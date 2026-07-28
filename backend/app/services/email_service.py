import json
import os
import random
import smtplib
import socket
import time
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

import resend
from app.core.config import settings

# In-memory OTP storage: { email: { "code": str, "expires_at": float } }
_otp_store: dict[str, dict] = {}


def _send_via_resend_api(to_email: str, subject: str, html_body: str, api_key: str) -> bool:
    """Send email using Resend SDK (HTTPS port 443, never blocked by cloud hosts)."""
    start_time = time.time()
    try:
        resend.api_key = api_key.strip()
        print(f"[Email Service] Resend API key set (length: {len(api_key.strip())})")
        # Try using verified email address as sender for testing
        # If this fails, user needs to verify a domain at resend.com/domains
        params = {
            "from": "AWS Verification <siddhib011@gmail.com>",
            "to": [to_email],
            "subject": subject,
            "html": html_body,
        }
        print(f"[Email Service] Sending email via Resend to {to_email}...")
        result = resend.Emails.send(params)
        elapsed = time.time() - start_time
        print(f"[Email Service] Resend API response: {result}")
        if result and result.get("id"):
            print(f"[Email Service] Successfully sent OTP email to {to_email} via Resend API! Email ID: {result.get('id')} (took {elapsed:.2f}s)")
            return True
        else:
            print(f"[Email Service] Resend API returned unexpected result: {result} (took {elapsed:.2f}s)")
            return False
    except Exception as err:
        elapsed = time.time() - start_time
        print(f"[Email Service] Resend API attempt failed after {elapsed:.2f}s: {err}")
        import traceback
        print(f"[Email Service] Traceback: {traceback.format_exc()}")
        return False


def _send_via_brevo_api(to_email: str, subject: str, html_body: str, api_key: str) -> bool:
    """Send email using Brevo (Sendinblue) REST API (HTTPS port 443)."""
    try:
        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "api-key": api_key.strip(),
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        payload = {
            "sender": {"name": "Amazon Web Services", "email": settings.smtp_from_email or "no-reply@route53clone.dev"},
            "to": [{"email": to_email}],
            "subject": subject,
            "htmlContent": html_body,
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                print(f"[Email Service] Successfully sent OTP email to {to_email} via Brevo HTTPS API!")
                return True
    except Exception as err:
        print(f"[Email Service] Brevo HTTPS API attempt failed: {err}")
    return False


class IPv4SMTP(smtplib.SMTP):
    """SMTP client that forces IPv4 socket connection (AF_INET) to prevent IPv6 unreachable errors on Linux containers."""

    def _get_socket(self, host, port, timeout):
        # Create socket with AF_INET family to force IPv4
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        sock.connect((host, port))
        return sock


class IPv4SMTP_SSL(smtplib.SMTP_SSL):
    """SMTP_SSL client that forces IPv4 socket connection (AF_INET)."""

    def _get_socket(self, host, port, timeout):
        # Create socket with AF_INET family to force IPv4
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        sock.connect((host, port))
        return self.context.wrap_socket(sock, server_hostname=self._host)


def generate_otp() -> str:
    """Generate a random 6-digit verification code."""
    return f"{random.randint(100000, 999999)}"


def store_otp(email: str, code: str, valid_seconds: int = 600) -> None:
    """Store OTP in memory with expiration timestamp."""
    _otp_store[email.lower().strip()] = {
        "code": code,
        "expires_at": time.time() + valid_seconds,
    }


def verify_otp_code(email: str, code: str) -> bool:
    """Verify OTP code for the given email."""
    email_key = email.lower().strip()
    clean_code = code.strip()

    record = _otp_store.get(email_key)
    if not record:
        return False
    if time.time() > record["expires_at"]:
        _otp_store.pop(email_key, None)
        return False
    if record["code"].strip() == clean_code:
        _otp_store.pop(email_key, None)
        return True
    return False


def send_otp_email(to_email: str, code: str) -> None:
    """Send OTP email via Resend API (preferred), Brevo API, or fallback to SMTP."""
    subject = f"{code} is your AWS verification code"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 20px; margin: 0;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="background-color: #232f3e; padding: 20px; text-align: center;">
          <h2 style="color: #ff9900; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px;">Amazon Web Services</h2>
        </div>
        <div style="padding: 28px; color: #1e293b;">
          <h3 style="margin-top: 0; color: #0f172a; font-size: 18px;">Verification code</h3>
          <p style="font-size: 16px; line-height: 1.5; color: #475569;">
            Please use the following verification code to confirm your email address and proceed with setting up your AWS account:
          </p>
          <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 34px; font-weight: 800; letter-spacing: 8px; text-align: center; padding: 18px; margin: 24px 0; color: #0f172a;">
            {code}
          </div>
          <p style="font-size: 16px; line-height: 1.5; color: #64748b;">
            This code will expire in 10 minutes. If you did not request an AWS account verification code, no further action is required.
          </p>
        </div>
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px; text-align: center; font-size: 16px; color: #94a3b8;">
          Amazon Web Services, Inc. | Privacy Policy
        </div>
      </div>
    </body>
    </html>
    """

    print(f"[Email Service] ===== STARTING OTP EMAIL SEND =====")
    print(f"[Email Service] Target email: {to_email}")
    print(f"[Email Service] OTP code: {code}")
    
    # Try Brevo API first (no domain verification required)
    brevo_key = settings.brevo_api_key or os.getenv("BREVO_API_KEY")
    print(f"[Email Service] Brevo API key: '{brevo_key[:10] if brevo_key else 'None'}...' (length: {len(brevo_key) if brevo_key else 0})")
    if brevo_key and len(brevo_key) > 10:
        print(f"[Email Service] Attempting to send via Brevo API to {to_email}...")
        if _send_via_brevo_api(to_email, subject, html_body, brevo_key):
            print(f"[Email Service] ===== OTP EMAIL SENT SUCCESSFULLY =====")
            return
        print(f"[Email Service] Brevo API failed, trying next method...")

    # Try Resend API as fallback (requires domain verification)
    resend_key = settings.resend_api_key or os.getenv("RESEND_API_KEY")
    print(f"[Email Service] Resend API key from settings: '{settings.resend_api_key}'")
    print(f"[Email Service] Resend API key from env: '{os.getenv('RESEND_API_KEY')}'")
    print(f"[Email Service] Final resend_key: '{resend_key[:10] if resend_key else 'None'}...' (length: {len(resend_key) if resend_key else 0})")
    
    if resend_key and len(resend_key) > 10:
        print(f"[Email Service] Attempting to send via Resend API to {to_email}...")
        if _send_via_resend_api(to_email, subject, html_body, resend_key):
            print(f"[Email Service] ===== OTP EMAIL SENT SUCCESSFULLY =====")
            return
        print(f"[Email Service] Resend API failed, trying next method...")
    else:
        print(f"[Email Service] No valid Resend API key found (key is empty or too short)")

    # Fallback to SMTP
    user = settings.smtp_user
    password = settings.smtp_password
    from_email = settings.smtp_from_email or user

    print(f"[Email Service] SMTP config - user: '{user}', from_email: '{from_email}'")

    if not user or not password:
        print(f"[Email Service] ===== NO EMAIL SERVICE CONFIGURED =====")
        print(f"[Email Service] OTP code for {to_email}: {code}")
        print(f"[Email Service] Please set RESEND_API_KEY or BREVO_API_KEY environment variable for production.")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    smtp_host = settings.smtp_host or "smtp.gmail.com"

    print(f"[Email Service] Attempting IPv4 SMTP connection to {smtp_host} for {to_email}...")

    # Method 1: Try IPv4 TLS on Port 587
    try:
        with IPv4SMTP(smtp_host, 587, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(user, password)
            server.sendmail(from_email, [to_email], msg.as_string())
        print(f"[Email Service] Successfully sent OTP email to {to_email} via IPv4 TLS:587!")
        print(f"[Email Service] ===== OTP EMAIL SENT SUCCESSFULLY =====")
        return
    except Exception as tls_err:
        print(f"[Email Service] IPv4 TLS:587 failed ({tls_err}), trying IPv4 SSL:465...")

    # Method 2: Try IPv4 SSL on Port 465
    try:
        with IPv4SMTP_SSL(smtp_host, 465, timeout=10) as server:
            server.login(user, password)
            server.sendmail(from_email, [to_email], msg.as_string())
        print(f"[Email Service] Successfully sent OTP email to {to_email} via IPv4 SSL:465!")
        print(f"[Email Service] ===== OTP EMAIL SENT SUCCESSFULLY =====")
        return
    except Exception as ssl_err:
        print(f"[Email Error] Failed to send OTP via IPv4 SMTP to {to_email}: {ssl_err}")
        print(f"[Email Service] ===== EMAIL SEND FAILED =====")
        print(f"[Email Service] OTP code for {to_email}: {code}")

