from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.worker import WorkerCreate, WorkerResponse
from app.services.worker_service import create_worker_profile

from fastapi import HTTPException
from app.schemas.worker_update import WorkerAvailabilityUpdate
from app.services.worker_service import update_worker_availability
from app.models.worker import Worker

from app.models.worker_review import WorkerReview
from app.models.job_assignment import JobAssignment

router = APIRouter(
    prefix="/workers",
    tags=["Workers"]
)


@router.post(
    "/register",
    response_model=WorkerResponse
)
def register_worker(
    worker: WorkerCreate,
    db: Session = Depends(get_db)
):
    return create_worker_profile(db, worker)

@router.get("/")
def list_workers(db: Session = Depends(get_db)):
    return db.query(Worker).all()

@router.patch(
    "/{worker_id}/availability",
    response_model=WorkerResponse
)
def update_availability(
    worker_id: str,
    update_data: WorkerAvailabilityUpdate,
    db: Session = Depends(get_db)
):
    worker = update_worker_availability(
        db,
        worker_id,
        update_data.availability_status
    )

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    return worker

@router.get("/{worker_id}/reputation")
def get_worker_reputation(
    worker_id: str,
    db: Session = Depends(get_db)
):
    assignments = (
        db.query(JobAssignment)
        .filter(JobAssignment.worker_id == worker_id)
        .all()
    )

    assignment_ids = [assignment.id for assignment in assignments]

    reviews = (
        db.query(WorkerReview)
        .filter(WorkerReview.assignment_id.in_(assignment_ids))
        .all()
    )

    completed_jobs = (
        db.query(JobAssignment)
        .filter(JobAssignment.worker_id == worker_id)
        .filter(JobAssignment.completed_at != None)
        .count()
    )

    total_reviews = len(reviews)

    average_rating = 0
    if total_reviews > 0:
        average_rating = sum(review.rating for review in reviews) / total_reviews

    return {
        "worker_id": worker_id,
        "average_rating": round(average_rating, 1),
        "total_reviews": total_reviews,
        "completed_jobs": completed_jobs
    }