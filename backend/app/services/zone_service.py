from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams
from app.models.dns_record import DNSRecord, RecordType
from app.models.hosted_zone import HostedZone
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneUpdate


class DuplicateZoneError(Exception):
    pass


class ZoneNotFoundError(Exception):
    pass


def list_zones(db: Session, owner_id: str, pagination: PaginationParams) -> tuple[list[HostedZone], int]:
    stmt = select(HostedZone).where(HostedZone.owner_id == owner_id)
    if pagination.search:
        stmt = stmt.where(HostedZone.domain_name.ilike(f"%{pagination.search}%"))

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    stmt = (
        stmt.order_by(HostedZone.created_at.desc())
        .offset((pagination.page - 1) * pagination.page_size)
        .limit(pagination.page_size)
    )
    items = list(db.scalars(stmt).all())
    return items, total


def get_zone(db: Session, owner_id: str, zone_id: str) -> HostedZone:
    zone = db.get(HostedZone, zone_id)
    if zone is None or zone.owner_id != owner_id:
        raise ZoneNotFoundError(zone_id)
    return zone


def create_zone(db: Session, owner_id: str, payload: HostedZoneCreate) -> HostedZone:
    existing = db.scalar(select(HostedZone).where(HostedZone.domain_name == payload.domain_name))
    if existing is not None:
        raise DuplicateZoneError(payload.domain_name)

    import json
    tags_json = json.dumps([t.model_dump() for t in payload.tags]) if payload.tags else "[]"

    zone = HostedZone(
        domain_name=payload.domain_name,
        description=payload.description,
        type=payload.type,
        tags=tags_json,
        owner_id=owner_id,
        record_count=2,
    )
    db.add(zone)
    db.flush()

    ns_record = DNSRecord(
        hosted_zone_id=zone.id,
        name=payload.domain_name,
        type=RecordType.NS,
        value="ns-1536.awsdns-00.co.uk.\nns-0.awsdns-00.com.\nns-1024.awsdns-00.org.\nns-512.awsdns-00.net.",
        ttl=172800,
    )
    soa_record = DNSRecord(
        hosted_zone_id=zone.id,
        name=payload.domain_name,
        type=RecordType.SOA,
        value="ns-1536.awsdns-00.co.uk. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
        ttl=900,
    )
    db.add(ns_record)
    db.add(soa_record)
    db.commit()
    db.refresh(zone)
    return zone


def update_zone(db: Session, owner_id: str, zone_id: str, payload: HostedZoneUpdate) -> HostedZone:
    zone = get_zone(db, owner_id, zone_id)
    if payload.description is not None:
        zone.description = payload.description
    if payload.type is not None:
        zone.type = payload.type
    if payload.tags is not None:
        import json
        zone.tags = json.dumps([t.model_dump() for t in payload.tags])
    db.commit()
    db.refresh(zone)
    return zone


def delete_zone(db: Session, owner_id: str, zone_id: str) -> None:
    zone = get_zone(db, owner_id, zone_id)
    db.delete(zone)
    db.commit()
