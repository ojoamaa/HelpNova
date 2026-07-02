from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.job_acceptance_service import accept_job, reject_job

router = APIRouter(prefix="/job", tags=["Job Acceptance"])


@router.post("/accept")
def accept(payload: dict, db: Session = Depends(get_db)):
    return accept_job(
        db=db,
        job_id=payload["job_id"],
        worker_id=payload["worker_id"]
    )


@router.post("/reject")
def reject(payload: dict, db: Session = Depends(get_db)):
    return reject_job(
        db=db,
        job_id=payload["job_id"],
        worker_id=payload["worker_id"]
    )
