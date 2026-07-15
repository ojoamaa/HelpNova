from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.services.operations_service import (
    get_live_operations_summary,
    get_live_job_queue,
)

router = APIRouter(
    prefix="/operations",
    tags=["Operations"],
)


@router.get("/summary")
def live_operations_summary(db: Session = Depends(get_db)):
    return get_live_operations_summary(db)


@router.get("/live-jobs")
def live_job_queue(db: Session = Depends(get_db)):
    return get_live_job_queue(db)