from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SendOTPRequest(BaseModel):
    email: EmailStr
    account_name: Optional[str] = None


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code: str
    password: Optional[str] = None
    account_name: Optional[str] = None


class UserOut(BaseModel):
    id: str
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

