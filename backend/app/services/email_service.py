import random
import smtplib
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

# In-memory OTP storage: { email: { "code": str, "expires_at": float } }
_otp_store: dict[str, dict] = {}


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
    record = _otp_store.get(email_key)
    if not record:
        return False
    if time.time() > record["expires_at"]:
        _otp_store.pop(email_key, None)
        return False
    if record["code"].strip() == code.strip():
        _otp_store.pop(email_key, None)
        return True
    return False


def send_otp_email(to_email: str, code: str) -> None:
    """Send OTP email using Gmail SMTP app password with multi-port fallback."""
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

    user = settings.smtp_user or "siddhib011@gmail.com"
    password = (settings.smtp_password or "mvvvvumcqluprsvv").replace(" ", "")
    from_email = settings.smtp_from_email or user

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    print(f"[Email Service] Attempting to send OTP to {to_email} from {user}...")

    # Method 1: Try SSL on Port 465 (Direct & fast for Gmail)
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=12) as server:
            server.login(user, password)
            server.sendmail(from_email, [to_email], msg.as_string())
        print(f"[Email Service] Successfully sent OTP email to {to_email} via SSL:465!")
        return
    except Exception as ssl_err:
        print(f"[Email Service] SSL:465 failed ({ssl_err}), trying TLS:587...")

    # Method 2: Fallback to TLS on Port 587
    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=12) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(user, password)
            server.sendmail(from_email, [to_email], msg.as_string())
        print(f"[Email Service] Successfully sent OTP email to {to_email} via TLS:587!")
        return
    except Exception as tls_err:
        print(f"[Email Error] Failed to send OTP to {to_email}: {tls_err}")
        print(f"[DEV FALLBACK CODE] Verification code for {to_email} is: {code}")
