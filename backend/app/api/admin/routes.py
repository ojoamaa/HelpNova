from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.worker import WorkerResponse
from app.schemas.worker_update import WorkerVerificationUpdate
from app.services.worker_service import update_worker_verification


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.patch(
    "/workers/{worker_id}/verify",
    response_model=WorkerResponse
)
def verify_worker(
    worker_id: str,
    update_data: WorkerVerificationUpdate,
    db: Session = Depends(get_db)
):
    worker = update_worker_verification(
        db,
        worker_id,
        update_data.verification_status,
        update_data.verification_level
    )

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    return worker

@router.patch("/workers/{worker_id}/verify")
def verify_worker(
    worker_id: str,
    update_data: WorkerVerificationUpdate,
    db: Session = Depends(get_db)
):
    worker = update_worker_verification(
        db=db,
        worker_id=worker_id,
        verification_status=update_data.verification_status,
        verification_level=update_data.verification_level,
        verification_note=update_data.verification_note
    )

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    return worker