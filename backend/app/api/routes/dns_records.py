from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_user, get_db, pagination_params
from app.models.dns_record import RecordType
from app.models.user import User
from app.schemas.dns_record import DNSRecordCreate, DNSRecordOut, DNSRecordUpdate, DNSRecordPage
from app.services import record_service
from app.services.record_service import RecordNotFoundError
from app.services.zone_service import ZoneNotFoundError

router = APIRouter(prefix="/hosted-zones/{zone_id}/records", tags=["dns-records"])


@router.get("", response_model=DNSRecordPage)
def list_records(
    zone_id: str,
    type: RecordType | None = None,
    pagination: PaginationParams = Depends(pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DNSRecordPage:
    try:
        items, total = record_service.list_records(db, current_user.id, zone_id, pagination, type)
    except ZoneNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    return DNSRecordPage(items=items, total=total, page=pagination.page, page_size=pagination.page_size)


@router.post("", response_model=DNSRecordOut, status_code=status.HTTP_201_CREATED)
def create_record(
    zone_id: str,
    payload: DNSRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DNSRecordOut:
    try:
        return record_service.create_record(db, current_user.id, zone_id, payload)
    except ZoneNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")


@router.get("/{record_id}", response_model=DNSRecordOut)
def get_record(
    zone_id: str,
    record_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DNSRecordOut:
    try:
        return record_service.get_record(db, current_user.id, zone_id, record_id)
    except (ZoneNotFoundError, RecordNotFoundError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DNS record not found")


@router.patch("/{record_id}", response_model=DNSRecordOut)
def update_record(
    zone_id: str,
    record_id: str,
    payload: DNSRecordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DNSRecordOut:
    try:
        return record_service.update_record(db, current_user.id, zone_id, record_id, payload)
    except (ZoneNotFoundError, RecordNotFoundError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DNS record not found")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    zone_id: str,
    record_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    try:
        record_service.delete_record(db, current_user.id, zone_id, record_id)
    except (ZoneNotFoundError, RecordNotFoundError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DNS record not found")
