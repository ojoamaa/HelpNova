from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from math import radians, sin, cos, sqrt, atan2

from app.core.database import get_db
from app.models.job import Job
from app.models.job_assignment import JobAssignment
from app.models.worker import Worker
from app.models.worker_location import WorkerLocation


router = APIRouter(prefix="/live-tracking", tags=["Live Tracking"])


def calculate_distance_km(lat1, lon1, lat2, lon2):
    radius_km = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return round(radius_km * c, 2)


def calculate_eta_minutes(distance_km, average_speed_kmh=35):
    return round((distance_km / average_speed_kmh) * 60)


@router.get("/{job_id}")
def get_live_tracking(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        return {
            "job_id": job_id,
            "message": "Job not found"
        }

    assignment = (
        db.query(JobAssignment)
        .filter(JobAssignment.job_id == job.id)
        .order_by(JobAssignment.assigned_at.desc())
        .first()
    )

    worker = None
    location = None

    if assignment:
        worker = db.query(Worker).filter(
            Worker.id == assignment.worker_id
        ).first()

    if worker:
        location = db.query(WorkerLocation).filter(
            WorkerLocation.worker_id == worker.id
        ).first()

    if assignment and assignment.status == "completed":
        tracking_status = "completed"
        distance_km = None
        eta_minutes = None
    else:
        distance_km = None
        eta_minutes = None

        if (
            location
            and location.latitude is not None
            and location.longitude is not None
            and job.customer_latitude is not None
            and job.customer_longitude is not None
        ):
            distance_km = calculate_distance_km(
                location.latitude,
                location.longitude,
                job.customer_latitude,
                job.customer_longitude
            )
            eta_minutes = calculate_eta_minutes(distance_km)

        if distance_km is not None:
            if distance_km <= 0.2:
                tracking_status = "arrived"
                eta_minutes = 0
            else:
                tracking_status = "en_route"
        else:
            tracking_status = "location_unavailable"

    return {
        "job_id": job.id,
        "job_status": job.status,
        "assignment_status": assignment.status if assignment else "not_assigned",
        "worker": {
            "worker_id": worker.id if worker else None,
            "full_name": worker.full_name if worker else None,
            "profession": worker.profession if worker else None,
            "phone_number": worker.phone_number if worker else None,
            "verification_level": worker.verification_level if worker else None
        } if worker else None,
        "location": {
            "latitude": location.latitude if location else None,
            "longitude": location.longitude if location else None,
            "updated_at": location.updated_at if location else None
        },
        "distance": {
            "distance_km": distance_km,
            "eta_minutes": eta_minutes,
            "status": tracking_status
        }
    }


@router.patch("/{job_id}/start")
def start_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        return {"message": "Job not found"}

    job.status = "in_progress"

    db.commit()
    db.refresh(job)

    return {
        "message": "Job started",
        "status": job.status
    }