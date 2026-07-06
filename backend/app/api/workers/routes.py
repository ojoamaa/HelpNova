from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.worker import WorkerCreate, WorkerResponse
from app.schemas.worker_update import WorkerAvailabilityUpdate

from app.models.worker import Worker
from app.models.worker_review import WorkerReview
from app.models.job_assignment import JobAssignment
from app.models.job import Job
from app.models.user import User
from datetime import datetime

from app.services.worker_service import (
    create_worker_profile,
    update_worker_availability,
    get_workers_with_user_details,
)

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
    return get_workers_with_user_details(db)


@router.get("/jobs")
def get_worker_job_requests(db: Session = Depends(get_db)):
    assignments = (
        db.query(JobAssignment)
        .filter(JobAssignment.completed_at == None)
        .filter(JobAssignment.status == "pending")
        .all()
    )

    job_requests = []

    for assignment in assignments:
        job = (
            db.query(Job)
            .filter(Job.id == assignment.job_id)
            .first()
        )

        if not job:
            continue

        customer = (
            db.query(User)
            .filter(User.id == job.customer_id)
            .first()
        )

        location_parts = [
            job.area,
            job.city,
            job.state,
        ]

        location = ", ".join(
            [part for part in location_parts if part]
        )

        job_requests.append({
            "id": str(assignment.id),
            "assignment_id": str(assignment.id),
            "job_id": str(job.id),
            "worker_id": str(assignment.worker_id) if assignment.worker_id else None,
            "title": job.title,
            "description": job.description,
            "customer_name": customer.full_name if customer else "Customer",
            "customer_phone": customer.phone if customer else None,
            "category_id": job.category_id,
            "location": location,
            "area": job.area,
            "city": job.city,
            "state": job.state,
            "price": 0,
            "urgency": job.urgency,
            "priority": job.urgency,
            "status": assignment.status,
            "job_status": job.status,
            "created_at": job.created_at.isoformat() if job.created_at else None,
            "assigned_at": assignment.assigned_at.isoformat() if assignment.assigned_at else None,
        })

    return {
        "jobs": job_requests
    }

@router.get("/accepted-jobs")
def get_worker_accepted_jobs(db: Session = Depends(get_db)):
    assignments = (
        db.query(JobAssignment)
        .filter(JobAssignment.completed_at == None)
        .filter(JobAssignment.status == "accepted")
        .all()
    )

    accepted_jobs = []

    for assignment in assignments:
        job = (
            db.query(Job)
            .filter(Job.id == assignment.job_id)
            .first()
        )

        if not job:
            continue

        customer = (
            db.query(User)
            .filter(User.id == job.customer_id)
            .first()
        )

        location_parts = [
            job.area,
            job.city,
            job.state,
        ]

        location = ", ".join(
            [part for part in location_parts if part]
        )

        accepted_jobs.append({
            "id": str(assignment.id),
            "assignment_id": str(assignment.id),
            "job_id": str(job.id),
            "worker_id": str(assignment.worker_id) if assignment.worker_id else None,
            "title": job.title,
            "description": job.description,
            "customer_name": customer.full_name if customer else "Customer",
            "customer_phone": customer.phone if customer else None,
            "category_id": job.category_id,
            "location": location,
            "area": job.area,
            "city": job.city,
            "state": job.state,
            "price": 0,
            "urgency": job.urgency,
            "priority": job.urgency,
            "status": job.status,
            "assignment_status": assignment.status,
            "created_at": job.created_at.isoformat() if job.created_at else None,
            "assigned_at": assignment.assigned_at.isoformat() if assignment.assigned_at else None,
            "accepted_at": assignment.accepted_at.isoformat() if assignment.accepted_at else None,
        })

    return {
        "jobs": accepted_jobs
    }

@router.post("/jobs/{assignment_id}/accept")
def accept_worker_job(
    assignment_id: str,
    db: Session = Depends(get_db)
):
    assignment = (
        db.query(JobAssignment)
        .filter(JobAssignment.id == assignment_id)
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Job assignment not found"
        )

    if hasattr(assignment, "status"):
        assignment.status = "accepted"

    db.commit()
    db.refresh(assignment)

    return {
        "message": "Job accepted successfully",
        "assignment_id": str(assignment.id),
        "status": getattr(assignment, "status", "accepted"),
    }


@router.post("/jobs/{assignment_id}/reject")
def reject_worker_job(
    assignment_id: str,
    db: Session = Depends(get_db)
):
    assignment = (
        db.query(JobAssignment)
        .filter(JobAssignment.id == assignment_id)
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Job assignment not found"
        )

    if hasattr(assignment, "status"):
        assignment.status = "rejected"

    db.commit()
    db.refresh(assignment)

    return {
        "message": "Job rejected successfully",
        "assignment_id": str(assignment.id),
        "status": getattr(assignment, "status", "rejected"),
    }


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


@router.get("/user/{user_id}")
def get_worker_by_user_id(
    user_id: str,
    db: Session = Depends(get_db)
):
    return (
        db.query(Worker)
        .filter(Worker.user_id == user_id)
        .first()
    )


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


@router.get("/{worker_id}")
def get_worker(worker_id: str, db: Session = Depends(get_db)):
    worker = (
        db.query(Worker)
        .filter(Worker.id == worker_id)
        .first()
    )

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    return worker