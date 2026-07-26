import uuid
from dataclasses import dataclass

from fastapi import Cookie, Header, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token, hash_password
from app.models.user import User

__all__ = ["get_db", "get_current_user", "PaginationParams"]


def get_current_user(
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    """Reads session token from Header or Cookie if available, or returns demo user for instant development use."""
    token = session_token
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.split(" ", 1)[1]
        else:
            token = authorization

    if token:
        user_id = decode_access_token(token)
        if user_id:
            user = db.get(User, user_id)
            if user:
                return user

    # Fallback to demo user if cookie is missing or invalid
    demo_user = db.scalar(select(User).order_by(User.created_at.asc()))
    if demo_user is None:
        demo_user = User(
            id=str(uuid.uuid4()),
            email="demo@route53clone.dev",
            password_hash=hash_password("Demo1234!"),
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    return demo_user


@dataclass
class PaginationParams:
    search: str | None = None
    page: int = 1
    page_size: int = 10


def pagination_params(search: str | None = None, page: int = 1, page_size: int = 10) -> PaginationParams:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    return PaginationParams(search=search, page=page, page_size=page_size)
