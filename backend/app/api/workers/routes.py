from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.worker import (
    WorkerCreate,
    WorkerProfileResponse,
    WorkerProfileUpdate,
    WorkerResponse,
)
from app.schemas.worker_update import (
    CurrentWorkerAvailabilityUpdate,
    WorkerAvailabilityUpdate,
)

from app.models.worker import Worker
from app.models.worker_review import WorkerReview
from app.models.job_assignment import JobAssignment
from app.models.job import Job
from app.models.user import User
from datetime import datetime
from app.models.payment import Payment
from app.core.security import require_worker_user

from app.services.worker_service import (
    create_worker_profile,
    update_worker_availability,
    get_workers_with_user_details,
)

router = APIRouter(
    prefix="/workers",
    tags=["Workers"]
)

PROFILE_PHOTO_DIR = Path("uploads/worker_profiles")
PROFILE_PHOTO_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_PHOTO_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024


def _current_worker(db: Session, current_user: User) -> Worker:
    worker = db.query(Worker).filter(Worker.user_id == current_user.id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile not found for the authenticated user.",
        )
    return worker


def _profile_payload(worker: Worker) -> dict:
    return {
        "worker_id": worker.id,
        "user_id": worker.user_id,
        "full_name": worker.full_name,
        "profession": worker.profession,
        "years_experience": worker.years_experience or 0,
        "phone_number": worker.phone_number,
        "address": worker.address,
        "state": worker.state,
        "city": worker.city,
        "area": worker.area,
        "national_id_number": worker.national_id_number,
        "nin": worker.nin,
        "bvn": worker.bvn,
        "next_of_kin_name": worker.next_of_kin_name,
        "next_of_kin_phone": worker.next_of_kin_phone,
        "profile_photo": worker.profile_photo,
        "profile_photo_url": worker.profile_photo_url,
        "id_photo_url": worker.id_photo_url,
        "verification_status": worker.verification_status,
        "verification_level": worker.verification_level,
        "guarantor_status": worker.guarantor_status or "not_started",
        "availability_status": worker.availability_status,
        "average_rating": worker.average_rating or 0,
        "completed_jobs": worker.completed_jobs or 0,
    }


@router.get("/profile", response_model=WorkerProfileResponse)
def get_current_worker_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_worker_user),
):
    return _profile_payload(_current_worker(db, current_user))


@router.patch("/profile", response_model=WorkerProfileResponse)
def update_current_worker_profile(
    update_data: WorkerProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_worker_user),
):
    worker = _current_worker(db, current_user)
    changes = update_data.model_dump(exclude_unset=True)

    for field, value in changes.items():
        if field in {"full_name", "profession"} and value is not None and not value.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"{field} cannot be empty.",
            )
        setattr(worker, field, value.strip() if isinstance(value, str) else value)

    if "full_name" in changes:
        current_user.full_name = worker.full_name
    if "phone_number" in changes and changes["phone_number"]:
        worker.phone_number = changes["phone_number"].strip()

    db.commit()
    db.refresh(worker)
    return _profile_payload(worker)


@router.post("/profile/photo", response_model=WorkerProfileResponse)
async def upload_current_worker_photo(
    request: Request,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_worker_user),
):
    worker = _current_worker(db, current_user)
    extension = ALLOWED_PHOTO_TYPES.get(photo.content_type or "")
    if not extension:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG, and WebP profile photos are allowed.",
        )

    content = await photo.read(MAX_PROFILE_PHOTO_BYTES + 1)
    await photo.close()
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded photo is empty.")
    if len(content) > MAX_PROFILE_PHOTO_BYTES:
        raise HTTPException(status_code=413, detail="Profile photo must not exceed 5 MB.")

    filename = f"{worker.id}_{uuid4().hex}{extension}"
    destination = PROFILE_PHOTO_DIR / filename
    destination.write_bytes(content)

    previous_path = worker.profile_photo
    if previous_path and previous_path.startswith("/uploads/worker_profiles/"):
        old_file = Path(previous_path.lstrip("/"))
        if old_file.exists() and old_file != destination:
            old_file.unlink(missing_ok=True)

    relative_url = f"/uploads/worker_profiles/{filename}"
    absolute_url = str(request.base_url).rstrip("/") + relative_url
    worker.profile_photo = relative_url
    worker.profile_photo_url = absolute_url
    current_user.profile_photo_url = absolute_url

    db.commit()
    db.refresh(worker)
    return _profile_payload(worker)


@router.patch(
    "/availability",
    response_model=WorkerProfileResponse,
)
def update_current_worker_availability(
    update_data: CurrentWorkerAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_worker_user),
):
    worker = _current_worker(db, current_user)

    normalized_status = (
        update_data.availability_status
        or ""
    ).strip().lower()

    if normalized_status not in {"online", "offline"}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "availability_status must be either "
                "'online' or 'offline'."
            ),
        )

    worker.availability_status = normalized_status

    db.commit()
    db.refresh(worker)

    return _profile_payload(worker)

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

        payment = (
          db.query(Payment)
         .filter(Payment.job_id == job.id)
         .first()
    )

        job_price = payment.amount if payment else 0
        worker_amount = payment.worker_amount if payment else 0

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
            "price": job_price,
            "worker_amount": worker_amount,
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
    db: Session = Depends(get_db),
):
    worker = (
        db.query(Worker)
        .filter(Worker.user_id == user_id)
        .first()
    )

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker profile not found for this user.",
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