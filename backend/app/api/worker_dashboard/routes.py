from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.job import Job
from app.models.worker import Worker

router = APIRouter(prefix="/worker-dashboard", tags=["Worker Dashboard"])


@router.get("/{worker_id}/jobs")
def get_worker_jobs(worker_id: str, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()

    if not worker:
        return {
            "success": False,
            "message": "Worker not found."
        }

    jobs = (
        db.query(Job)
        .filter(Job.category_id != None)
        .filter(Job.status.in_(["pending", "accepted"]))
        .filter(
            (Job.assigned_worker_id == worker_id) |
            (Job.assigned_worker_id == None)
        )
        .order_by(Job.created_at.desc())
        .all()
    )

    return {
        "success": True,
        "worker_id": worker_id,
        "worker_name": worker.full_name,
        "availability_status": worker.availability_status,
        "total_jobs": len(jobs),
        "jobs": jobs
    }


@router.post("/{worker_id}/go-online")
def worker_go_online(worker_id: str, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()

    if not worker:
        return {
            "success": False,
            "message": "Worker not found."
        }

    worker.availability_status = "online"
    db.commit()
    db.refresh(worker)

    return {
        "success": True,
        "message": "Worker is now online.",
        "worker": worker
    }


@router.post("/{worker_id}/go-offline")
def worker_go_offline(worker_id: str, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()

    if not worker:
        return {
            "success": False,
            "message": "Worker not found."
        }

    worker.availability_status = "offline"
    db.commit()
    db.refresh(worker)

    return {
        "success": True,
        "message": "Worker is now offline.",
        "worker": worker
    }
