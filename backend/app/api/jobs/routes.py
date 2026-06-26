from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.job import Job
from app.models.job_assignment import JobAssignment
from app.models.job_photo import JobPhoto
from app.models.payment import Payment
from app.schemas.job import JobCreate, JobResponse
from app.schemas.job_photo import JobPhotoCreate
from app.services.job_service import create_job, get_job_by_id


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


def attach_payment_status(db: Session, job: Job):
    payment = (
        db.query(Payment)
        .filter(Payment.job_id == job.id)
        .order_by(Payment.created_at.desc())
        .first()
    )

    job_data = job.__dict__.copy()
    job_data.pop("_sa_instance_state", None)

    job_data["payment_status"] = payment.status if payment else "no_payment"
    job_data["payment_released"] = payment.status == "released" if payment else False
    job_data["payment_id"] = payment.id if payment else None

    return job_data


@router.post("/create", response_model=JobResponse)
def create_customer_job(
    job: JobCreate,
    db: Session = Depends(get_db)
):
    return create_job(db, job)


@router.get("/")
def list_jobs(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Job)

    if status:
        clean_status = status.strip().lower()
        query = query.filter(Job.status == clean_status)

    jobs = query.all()

    return [attach_payment_status(db, job) for job in jobs]


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

    return [attach_payment_status(db, job) for job in jobs]


@router.get("/{job_id}")
def get_single_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    job = get_job_by_id(db, job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return attach_payment_status(db, job)


@router.post("/{job_id}/photos")
def upload_job_photo(
    job_id: str,
    payload: JobPhotoCreate,
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    photo = JobPhoto(
        job_id=job_id,
        photo_url=payload.photo_url,
        photo_type=payload.photo_type
    )

    db.add(photo)
    db.commit()
    db.refresh(photo)

    return {
        "message": "Photo uploaded",
        "photo_id": photo.id,
        "photo_type": photo.photo_type
    }


@router.get("/{job_id}/photos")
def list_job_photos(
    job_id: str,
    db: Session = Depends(get_db)
):
    return db.query(JobPhoto).filter(JobPhoto.job_id == job_id).all()