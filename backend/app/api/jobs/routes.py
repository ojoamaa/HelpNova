from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.job_assignment import JobAssignment

from app.core.database import get_db
from app.schemas.job import JobCreate, JobResponse
from app.services.job_service import (
    create_job,
    get_jobs,
    get_job_by_id
)


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


@router.post(
    "/create",
    response_model=JobResponse
)
def create_customer_job(
    job: JobCreate,
    db: Session = Depends(get_db)
):
    return create_job(db, job)


@router.get(
    "/",
    response_model=list[JobResponse]
)
def list_jobs(
    db: Session = Depends(get_db)
):
    return get_jobs(db)

@router.get("/worker/{worker_id}")
def get_worker_jobs(
    worker_id: str,
    db: Session = Depends(get_db)
):
    assignments = (
        db.query(JobAssignment)
        .filter(JobAssignment.worker_id == worker_id)
        .all()
    )

    results = []

    for assignment in assignments:
        job = db.query(Job).filter(Job.id == assignment.job_id).first()

        results.append({
            "assignment_id": assignment.id,
            "job_id": assignment.job_id,
            "worker_id": assignment.worker_id,
            "assignment_status": assignment.status,
            "assigned_at": assignment.assigned_at,
            "accepted_at": assignment.accepted_at,
            "completed_at": assignment.completed_at,
            "job_title": job.title if job else None,
            "job_status": job.status if job else None,
        })

    return results

@router.get("/customer/{customer_id}")
def get_customer_jobs(
    customer_id: str,
    db: Session = Depends(get_db)
):
    jobs = (
        db.query(Job)
        .filter(Job.customer_id == customer_id)
        .all()
    )

    return jobs

@router.get(
    "/{job_id}",
    response_model=JobResponse
)
def get_single_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    job = get_job_by_id(db, job_id)

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return job

