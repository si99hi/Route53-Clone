from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SendOTPRequest(BaseModel):
    email: EmailStr
    account_name: Optional[str] = None
    is_signup: Optional[bool] = False


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code: str
    password: Optional[str] = None
    account_name: Optional[str] = None
    is_signup: Optional[bool] = False
    full_name: Optional[str] = None
    organization_name: Optional[str] = None
    phone_number: Optional[str] = None
    country: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    billing_plan: Optional[str] = None
    experience: Optional[str] = None
    language: Optional[str] = None


class UserOut(BaseModel):
    id: str
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

