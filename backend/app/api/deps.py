import uuid
from dataclasses import dataclass

from fastapi import Cookie, Header, Depends, HTTPException, status
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
    """Reads session token from Header or Cookie and returns current authenticated user."""
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

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )


@dataclass
class PaginationParams:
    search: str | None = None
    page: int = 1
    page_size: int = 10


def pagination_params(search: str | None = None, page: int = 1, page_size: int = 10) -> PaginationParams:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    return PaginationParams(search=search, page=page, page_size=page_size)
