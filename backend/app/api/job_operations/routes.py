from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.job_operations_service import (
    list_all_jobs,
    get_jobs_by_status,
    get_single_job,
    admin_job_summary,
)

router = APIRouter(
    prefix="/admin/job-operations",
    tags=["Admin Job Operations"]
)


@router.get("/summary")
def job_summary(db: Session = Depends(get_db)):
    return {
        "success": True,
        "summary": admin_job_summary(db)
    }


@router.get("/")
def all_jobs(db: Session = Depends(get_db)):
    return {
        "success": True,
        "jobs": list_all_jobs(db)
    }


@router.get("/status/{status}")
def jobs_by_status(
    status: str,
    db: Session = Depends(get_db)
):
    jobs = get_jobs_by_status(db, status)

    return {
        "success": True,
        "status": status,
        "count": len(jobs),
        "jobs": jobs
    }


@router.get("/{job_id}")
def single_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    job = get_single_job(db, job_id)

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return {
        "success": True,
        "job": job
    }
