from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.job_completion_service import complete_job

router = APIRouter(
    prefix="/job-completion",
    tags=["Job Completion"]
)


@router.post("/{job_id}")
def complete_job_route(
    job_id: str,
    db: Session = Depends(get_db)
):
    result = complete_job(db, job_id)

    if result == "not_found":
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    if result == "already_completed":
        raise HTTPException(
            status_code=400,
            detail="Job already completed"
        )

    return {
        "message": "Job completed successfully.",
        "job": result
    }
