from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.worker import Worker
from app.models.job_assignment import JobAssignment
from app.models.worker_review import WorkerReview
from app.schemas.worker_review import WorkerReviewCreate


def create_worker_review(db: Session, review_data: WorkerReviewCreate):
    assignment = (
        db.query(JobAssignment)
        .filter(JobAssignment.id == review_data.assignment_id)
        .first()
    )

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if assignment.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Customer can only review after job is completed"
        )

    existing_review = (
        db.query(WorkerReview)
        .filter(WorkerReview.assignment_id == review_data.assignment_id)
        .first()
    )

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="This assignment has already been reviewed"
        )

    review = WorkerReview(**review_data.model_dump())

    db.add(review)

    worker = (
        db.query(Worker)
        .filter(Worker.id == review_data.worker_id)
        .first()
    )

    if worker:
        worker.completed_jobs = (worker.completed_jobs or 0) + 1

        old_rating = worker.average_rating or 0
        total_jobs = worker.completed_jobs

        worker.average_rating = (
            ((old_rating * (total_jobs - 1)) + review_data.rating) / total_jobs
        )

    db.commit()
    db.refresh(review)

    return review


def get_worker_reviews(db: Session, worker_id: str):
    return (
        db.query(WorkerReview)
        .filter(WorkerReview.worker_id == worker_id)
        .all()
    )