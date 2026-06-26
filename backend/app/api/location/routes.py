from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.worker_location import LocationUpdate
from app.services.location_service import update_location

router = APIRouter(
    prefix="/location",
    tags=["Live Location"]
)


@router.post("/update/{worker_id}")
def update_worker_location(
    worker_id: str,
    payload: LocationUpdate,
    db: Session = Depends(get_db)
):
    return update_location(
        db,
        worker_id,
        payload.latitude,
        payload.longitude
    )
