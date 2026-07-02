from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.job_lifecycle_service import (
    mark_on_my_way,
    mark_arrived,
    start_job,
    complete_job,
)

router = APIRouter(prefix="/job-lifecycle", tags=["Job Lifecycle"])


@router.post("/on-my-way")
def on_my_way(payload: dict, db: Session = Depends(get_db)):
    return mark_on_my_way(db, payload["job_id"], payload["worker_id"])


@router.post("/arrived")
def arrived(payload: dict, db: Session = Depends(get_db)):
    return mark_arrived(db, payload["job_id"], payload["worker_id"])


@router.post("/start")
def start(payload: dict, db: Session = Depends(get_db)):
    return start_job(db, payload["job_id"], payload["worker_id"])


@router.post("/complete")
def complete(payload: dict, db: Session = Depends(get_db)):
    return complete_job(db, payload["job_id"], payload["worker_id"])
