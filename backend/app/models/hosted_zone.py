import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ZoneType(str, enum.Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    domain_name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    type: Mapped[ZoneType] = mapped_column(Enum(ZoneType), default=ZoneType.PUBLIC, nullable=False)
    record_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tags: Mapped[str | None] = mapped_column(String(2000), nullable=True, default="[]")
    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    owner: Mapped["User"] = relationship(back_populates="hosted_zones")
    records: Mapped[list["DNSRecord"]] = relationship(
        back_populates="hosted_zone", cascade="all, delete-orphan"
    )
