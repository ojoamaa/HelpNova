from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.auto_matching_service import auto_match_job


router = APIRouter(
    prefix="/auto-match",
    tags=["Auto Matching"]
)


@router.get("/{job_id}")
def match_job_automatically(
    job_id: str,
    db: Session = Depends(get_db)
):
    result = auto_match_job(db, job_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return result
