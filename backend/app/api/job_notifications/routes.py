# app/api/job_notifications/routes.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.job_notification import JobNotification

router = APIRouter(
    prefix="/job-notifications",
    tags=["Job Notifications"]
)


@router.get("/")
def list_job_notifications(db: Session = Depends(get_db)):
    return db.query(JobNotification).all()
