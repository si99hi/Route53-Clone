import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    account_name: Mapped[str] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    organization_name: Mapped[str] = mapped_column(String(255), nullable=True)
    phone_number: Mapped[str] = mapped_column(String(50), nullable=True)
    country: Mapped[str] = mapped_column(String(100), nullable=True)
    address_line1: Mapped[str] = mapped_column(String(255), nullable=True)
    address_line2: Mapped[str] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=True)
    state: Mapped[str] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=True)
    billing_plan: Mapped[str] = mapped_column(String(50), nullable=True)
    experience: Mapped[str] = mapped_column(String(1000), nullable=True)
    language: Mapped[str] = mapped_column(String(50), nullable=True)

    hosted_zones: Mapped[list["HostedZone"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
