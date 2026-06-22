from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.job import Job
from app.models.job_assignment import JobAssignment
from app.models.worker import Worker


router = APIRouter(
    prefix="/tracking",
    tags=["Customer Tracking"]
)


@router.get("/job/{job_id}")
def track_customer_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    assignment = (
     db.query(JobAssignment)
     .filter(JobAssignment.job_id == job_id)
     .filter(
        JobAssignment.status.in_(
            ["pending", "accepted", "completed"]
        )
    )
    .order_by(JobAssignment.assigned_at.desc())
    .first()
)

    if not assignment:
        return {
            "job_id": job.id,
            "job_status": job.status,
            "assignment_status": "not_assigned",
            "assigned_worker": None,
            "message": "No worker has been assigned to this job yet"
        }

    worker = db.query(Worker).filter(Worker.id == assignment.worker_id).first()

    return {
        "job_id": job.id,
        "job_status": job.status,
        "assignment_status": assignment.status,
        "assigned_worker": {
            "worker_id": worker.id if worker else None,
            "full_name": worker.full_name if worker else None,
            "profession": worker.profession if worker else None,
            "phone_number": worker.phone_number if worker else None,
            "verification_level": worker.verification_level if worker else None,
            "average_rating": worker.average_rating if worker else None,
            "completed_jobs": worker.completed_jobs if worker else None,
            "availability_status": worker.availability_status if worker else None,
        },
        "message": "Customer job tracking retrieved successfully"
    }