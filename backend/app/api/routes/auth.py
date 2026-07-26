from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, SendOTPRequest, UserOut, VerifyOTPRequest
from app.services.email_service import generate_otp, send_otp_email, store_otp, verify_otp_code

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_NAME = "session_token"


@router.post("/send-otp")
def send_otp(payload: SendOTPRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Send verification OTP code to user email in background."""
    if payload.is_signup:
        existing_user = db.scalar(select(User).where(User.email == payload.email))
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists. Please sign in instead.",
            )

    code = generate_otp()
    store_otp(payload.email, code)
    # Trigger non-blocking background task to send email via SMTP
    background_tasks.add_task(send_otp_email, payload.email, code)
    return {"message": "Verification code sent to email", "email": payload.email, "code": code}


@router.post("/verify-otp", response_model=AuthResponse)
def verify_otp(payload: VerifyOTPRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    """Verify OTP code and create/login user."""
    if payload.is_signup:
        existing_user = db.scalar(select(User).where(User.email == payload.email))
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists. Please sign in instead.",
            )

    is_valid = verify_otp_code(payload.email, payload.code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please check your email and try again.",
        )

    raw_password = payload.password if payload.password else "AwsAccount2026!"
    password_hash = get_password_hash(raw_password)

    # Check if user already exists
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        user = User(email=payload.email, password_hash=password_hash)
        db.add(user)
    else:
        if payload.password:
            user.password_hash = password_hash

    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=False,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
    )
    return AuthResponse(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(subject=user.id)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=False,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
    )
    return AuthResponse(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    response.delete_cookie(COOKIE_NAME)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
