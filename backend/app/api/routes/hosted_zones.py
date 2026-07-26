from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_user, get_db, pagination_params
from app.models.user import User
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneOut, HostedZoneUpdate, HostedZonePage
from app.services import zone_service
from app.services.zone_service import DuplicateZoneError, ZoneNotFoundError

router = APIRouter(prefix="/hosted-zones", tags=["hosted-zones"])


@router.get("", response_model=HostedZonePage)
def list_hosted_zones(
    pagination: PaginationParams = Depends(pagination_params),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HostedZonePage:
    items, total = zone_service.list_zones(db, current_user.id, pagination)
    return HostedZonePage(items=items, total=total, page=pagination.page, page_size=pagination.page_size)


@router.post("", response_model=HostedZoneOut, status_code=status.HTTP_201_CREATED)
def create_hosted_zone(
    payload: HostedZoneCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HostedZoneOut:
    try:
        return zone_service.create_zone(db, current_user.id, payload)
    except DuplicateZoneError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A hosted zone for '{payload.domain_name}' already exists",
        )


@router.get("/{zone_id}", response_model=HostedZoneOut)
def get_hosted_zone(
    zone_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HostedZoneOut:
    try:
        return zone_service.get_zone(db, current_user.id, zone_id)
    except ZoneNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")


@router.patch("/{zone_id}", response_model=HostedZoneOut)
def update_hosted_zone(
    zone_id: str,
    payload: HostedZoneUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HostedZoneOut:
    try:
        return zone_service.update_zone(db, current_user.id, zone_id, payload)
    except ZoneNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")


@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hosted_zone(
    zone_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    try:
        zone_service.delete_zone(db, current_user.id, zone_id)
    except ZoneNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
