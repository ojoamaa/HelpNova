from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.job import Job
from app.models.job_assignment import JobAssignment
from app.models.worker import Worker

router = APIRouter(
    prefix="/customer-history",
    tags=["Customer History"]
)


@router.get("/{customer_id}")
def customer_history(
    customer_id: str,
    db: Session = Depends(get_db)
):
    jobs = (
        db.query(Job)
        .filter(Job.customer_id == customer_id)
        .all()
    )

    result = []

    for job in jobs:

        assignment = (
            db.query(JobAssignment)
            .filter(JobAssignment.job_id == job.id)
            .first()
        )

        worker_name = None

        if assignment:
            worker = (
                db.query(Worker)
                .filter(
                    Worker.id == assignment.worker_id
                )
                .first()
            )

            if worker:
                worker_name = worker.full_name

        result.append(
            {
                "job_id": job.id,
                "title": job.title,
                "status": job.status,
                "worker": worker_name,
                "created_at": job.created_at
            }
        )

    return result
