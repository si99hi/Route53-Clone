import json
import re
from datetime import datetime

from pydantic import BaseModel, field_validator

from app.models.hosted_zone import ZoneType

DOMAIN_RE = re.compile(
    r"^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))+$"
)


class TagItem(BaseModel):
    key: str
    value: str


class HostedZoneCreate(BaseModel):
    domain_name: str
    description: str | None = None
    type: ZoneType = ZoneType.PUBLIC
    tags: list[TagItem] | None = None

    @field_validator("domain_name")
    @classmethod
    def validate_domain(cls, v: str) -> str:
        v = v.strip().lower().rstrip(".")
        if not DOMAIN_RE.match(v):
            raise ValueError("Enter a valid domain name, e.g. example.com")
        return v


class HostedZoneUpdate(BaseModel):
    description: str | None = None
    type: ZoneType | None = None
    tags: list[TagItem] | None = None


class HostedZoneOut(BaseModel):
    id: str
    domain_name: str
    description: str | None
    type: ZoneType
    record_count: int
    tags: list[TagItem] = []
    created_at: datetime
    updated_at: datetime

    @field_validator("tags", mode="before")
    @classmethod
    def parse_tags_json(cls, v: str | list | None) -> list[dict[str, str]]:
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass
            return []
        if isinstance(v, list):
            return v
        return []

    model_config = {"from_attributes": True}


class HostedZonePage(BaseModel):
    items: list[HostedZoneOut]
    total: int
    page: int
    page_size: int
