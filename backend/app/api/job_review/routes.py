from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.job_review_service import submit_job_review

router = APIRouter(prefix="/job-review", tags=["Job Review"])


@router.post("/submit")
def submit_review(payload: dict, db: Session = Depends(get_db)):
    return submit_job_review(
        db=db,
        job_id=payload["job_id"],
        customer_id=payload["customer_id"],
        rating=payload["rating"],
        review=payload.get("review")
    )
