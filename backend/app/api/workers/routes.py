from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.worker import WorkerCreate, WorkerResponse
from app.services.worker_service import create_worker_profile

from fastapi import HTTPException
from app.schemas.worker_update import WorkerAvailabilityUpdate
from app.services.worker_service import update_worker_availability
from app.models.worker import Worker


router = APIRouter(
    prefix="/workers",
    tags=["Workers"]
)


@router.post(
    "/register",
    response_model=WorkerResponse
)
def register_worker(
    worker: WorkerCreate,
    db: Session = Depends(get_db)
):
    return create_worker_profile(db, worker)

@router.get("/")
def list_workers(db: Session = Depends(get_db)):
    return db.query(Worker).all()

@router.patch(
    "/{worker_id}/availability",
    response_model=WorkerResponse
)
def update_availability(
    worker_id: str,
    update_data: WorkerAvailabilityUpdate,
    db: Session = Depends(get_db)
):
    worker = update_worker_availability(
        db,
        worker_id,
        update_data.availability_status
    )

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    return worker
