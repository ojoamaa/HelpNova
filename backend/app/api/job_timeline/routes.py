from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.job import Job
from app.models.job_assignment import JobAssignment
from app.models.worker import Worker
from app.models.job_photo import JobPhoto


router = APIRouter(
    prefix="/timeline",
    tags=["Job Timeline"]
)


@router.get("/job/{job_id}")
def get_job_timeline(job_id: str, db: Session = Depends(get_db)):
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

    if assignment:
        worker = (
            db.query(Worker)
            .filter(Worker.id == assignment.worker_id)
            .first()
        )

    photos = (
        db.query(JobPhoto)
        .filter(JobPhoto.job_id == job.id)
        .all()
    )

    before_photos = [p for p in photos if p.photo_type == "before"]
    after_photos = [p for p in photos if p.photo_type == "after"]

    return {
        "job_id": job.id,
        "job_status": job.status,
        "job": {
            "title": job.title,
            "description": job.description,
            "state": job.state,
            "city": job.city,
            "area": job.area,
            "created_at": job.created_at
        },
        "worker": {
            "worker_id": worker.id if worker else None,
            "full_name": worker.full_name if worker else None,
            "profession": worker.profession if worker else None,
            "phone_number": worker.phone_number if worker else None,
            "verification_level": worker.verification_level if worker else None
        } if worker else None,
        "assignment": {
            "assignment_id": assignment.id if assignment else None,
            "status": assignment.status if assignment else "not_assigned",
            "assigned_at": assignment.assigned_at if assignment else None,
            "accepted_at": assignment.accepted_at if assignment else None,
            "rejected_at": assignment.rejected_at if assignment else None,
            "completed_at": assignment.completed_at if assignment else None
        },
        "photos": {
            "before": [
                {
                    "photo_id": p.id,
                    "photo_url": p.photo_url,
                    "uploaded_at": p.created_at
                }
                for p in before_photos
            ],
            "after": [
                {
                    "photo_id": p.id,
                    "photo_url": p.photo_url,
                    "uploaded_at": p.created_at
                }
                for p in after_photos
            ]
        },
        "timeline": [
            {
                "stage": "job_created",
                "status": "completed",
                "time": job.created_at
            },
            {
                "stage": "worker_assigned",
                "status": "completed" if assignment else "pending",
                "time": assignment.assigned_at if assignment else None
            },
            {
                "stage": "worker_accepted",
                "status": "completed" if assignment and assignment.accepted_at else "pending",
                "time": assignment.accepted_at if assignment else None
            },
            {
                "stage": "before_photo_uploaded",
                "status": "completed" if before_photos else "pending",
                "time": before_photos[0].created_at if before_photos else None
            },
            {
                "stage": "after_photo_uploaded",
                "status": "completed" if after_photos else "pending",
                "time": after_photos[0].created_at if after_photos else None
            },
            {
                "stage": "job_completed",
                "status": "completed" if assignment and assignment.completed_at else "pending",
                "time": assignment.completed_at if assignment else None
            }
        ]
    }
