from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams
from app.models.dns_record import DNSRecord, RecordType
from app.models.hosted_zone import HostedZone
from app.schemas.dns_record import DNSRecordCreate, DNSRecordUpdate, _validate_value_for_type
from app.services.zone_service import ZoneNotFoundError, get_zone


class RecordNotFoundError(Exception):
    pass


def _sync_zone_record_count(db: Session, zone: HostedZone) -> None:
    zone.record_count = db.scalar(
        select(func.count()).select_from(DNSRecord).where(DNSRecord.hosted_zone_id == zone.id)
    ) or 0
    db.add(zone)


def list_records(
    db: Session,
    owner_id: str,
    zone_id: str,
    pagination: PaginationParams,
    record_type: RecordType | None = None,
) -> tuple[list[DNSRecord], int]:
    zone = get_zone(db, owner_id, zone_id)  # raises ZoneNotFoundError if not owned

    stmt = select(DNSRecord).where(DNSRecord.hosted_zone_id == zone.id)
    if pagination.search:
        stmt = stmt.where(DNSRecord.name.ilike(f"%{pagination.search}%"))
    if record_type is not None:
        stmt = stmt.where(DNSRecord.type == record_type)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    stmt = (
        stmt.order_by(DNSRecord.created_at.desc())
        .offset((pagination.page - 1) * pagination.page_size)
        .limit(pagination.page_size)
    )
    items = list(db.scalars(stmt).all())
    return items, total


def get_record(db: Session, owner_id: str, zone_id: str, record_id: str) -> DNSRecord:
    get_zone(db, owner_id, zone_id)  # ownership check
    record = db.get(DNSRecord, record_id)
    if record is None or record.hosted_zone_id != zone_id:
        raise RecordNotFoundError(record_id)
    return record


def create_record(db: Session, owner_id: str, zone_id: str, payload: DNSRecordCreate) -> DNSRecord:
    zone = get_zone(db, owner_id, zone_id)

    record = DNSRecord(
        hosted_zone_id=zone.id,
        name=payload.name,
        type=payload.type,
        value=payload.value,
        ttl=payload.ttl,
        priority=payload.priority,
        alias=payload.alias,
        routing_policy=payload.routing_policy,
    )
    db.add(record)
    db.flush()
    _sync_zone_record_count(db, zone)
    db.commit()
    db.refresh(record)
    return record


def update_record(
    db: Session, owner_id: str, zone_id: str, record_id: str, payload: DNSRecordUpdate
) -> DNSRecord:
    record = get_record(db, owner_id, zone_id, record_id)

    if payload.value is not None:
        _validate_value_for_type(record.type, payload.value)

    if payload.ttl is not None:
        if payload.ttl < 60 or payload.ttl > 172800:
            raise ValueError("TTL must be between 60 and 172800 seconds")

    if record.type in (RecordType.MX, RecordType.SRV):
        priority_was_provided = "priority" in payload.model_fields_set
        if priority_was_provided and payload.priority is None:
            raise ValueError(f"{record.type.value} records require a priority")
        new_priority = payload.priority if payload.priority is not None else record.priority
        if new_priority is None:
            raise ValueError(f"{record.type.value} records require a priority")

    if payload.value is not None:
        record.value = payload.value
    if payload.ttl is not None:
        record.ttl = payload.ttl
    if payload.priority is not None:
        record.priority = payload.priority

    db.commit()
    db.refresh(record)
    return record


def delete_record(db: Session, owner_id: str, zone_id: str, record_id: str) -> None:
    record = get_record(db, owner_id, zone_id, record_id)
    zone = get_zone(db, owner_id, zone_id)
    db.delete(record)
    db.flush()
    _sync_zone_record_count(db, zone)
    db.commit()
