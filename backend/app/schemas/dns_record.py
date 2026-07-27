import ipaddress
import re
from datetime import datetime

from pydantic import BaseModel, field_validator, model_validator

from app.models.dns_record import RecordType

HOSTNAME_RE = re.compile(
    r"^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*\.?$"
)


def _validate_value_for_type(record_type: RecordType, value: str) -> None:
    value = value.strip()
    if record_type == RecordType.A:
        try:
            ipaddress.IPv4Address(value)
        except ValueError:
            raise ValueError("A record value must be a valid IPv4 address")
    elif record_type == RecordType.AAAA:
        try:
            ipaddress.IPv6Address(value)
        except ValueError:
            raise ValueError("AAAA record value must be a valid IPv6 address")
    elif record_type in (RecordType.CNAME, RecordType.NS, RecordType.PTR):
        for line in value.strip().splitlines():
            line_clean = line.strip().rstrip(".")
            if line_clean and not HOSTNAME_RE.match(line_clean):
                raise ValueError(f"{record_type.value} record value must be a valid hostname")
    elif record_type == RecordType.MX:
        if not HOSTNAME_RE.match(value):
            raise ValueError("MX record value must be a valid mail server hostname")
    elif record_type == RecordType.SRV:
        parts = value.split()
        if len(parts) != 3:
            raise ValueError("SRV record value must be '<weight> <port> <target>'")
    elif record_type == RecordType.CAA:
        parts = value.split(None, 2)
        if len(parts) != 3 or parts[1] not in ("issue", "issuewild", "iodef"):
            raise ValueError("CAA record value must be '<flag> <tag> <value>'")
    elif record_type == RecordType.SOA:
        pass
    # TXT: any text is valid


class DNSRecordCreate(BaseModel):
    name: str
    type: RecordType
    value: str
    ttl: int = 300
    priority: int | None = None
    alias: bool = False
    routing_policy: str = "Simple routing"

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip().lower().rstrip(".")
        if not HOSTNAME_RE.match(v):
            raise ValueError("Enter a valid record name, e.g. www.example.com")
        return v

    @field_validator("ttl")
    @classmethod
    def validate_ttl(cls, v: int) -> int:
        if v < 60 or v > 172800:
            raise ValueError("TTL must be between 60 and 172800 seconds")
        return v

    @field_validator("routing_policy")
    @classmethod
    def validate_routing_policy(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Routing policy is required")
        return v

    @model_validator(mode="after")
    def validate_value_and_priority(self) -> "DNSRecordCreate":
        _validate_value_for_type(self.type, self.value)
        if self.type in (RecordType.MX, RecordType.SRV) and self.priority is None:
            raise ValueError(f"{self.type.value} records require a priority")
        return self


class DNSRecordUpdate(BaseModel):
    name: str | None = None
    type: RecordType | None = None
    value: str | None = None
    ttl: int | None = None
    priority: int | None = None
    alias: bool | None = None
    routing_policy: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip().lower().rstrip(".")
            if not HOSTNAME_RE.match(v):
                raise ValueError("Enter a valid record name, e.g. www.example.com")
            return v
        return v

    @field_validator("ttl")
    @classmethod
    def validate_ttl(cls, v: int | None) -> int | None:
        if v is not None and (v < 60 or v > 172800):
            raise ValueError("TTL must be between 60 and 172800 seconds")
        return v

    @model_validator(mode="after")
    def validate_value_and_priority(self) -> "DNSRecordUpdate":
        # Only validate if value is being updated
        if self.value is not None and self.type is not None:
            _validate_value_for_type(self.type, self.value)
        # Only validate priority if type is being updated to MX/SRV AND priority is explicitly set to None
        if (self.type is not None and 
            self.type in (RecordType.MX, RecordType.SRV) and 
            self.priority is None and 
            "priority" in self.model_fields_set):
            raise ValueError(f"{self.type.value} records require a priority")
        return self


class DNSRecordOut(BaseModel):
    id: str
    hosted_zone_id: str
    name: str
    type: RecordType
    value: str
    ttl: int
    priority: int | None
    alias: bool
    routing_policy: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DNSRecordPage(BaseModel):
    items: list[DNSRecordOut]
    total: int
    page: int
    page_size: int
