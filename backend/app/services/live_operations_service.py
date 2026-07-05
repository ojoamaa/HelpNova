from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.worker import Worker
from app.models.job import Job


ACTIVE_STATUSES = [
    "pending",
    "accepted",
    "on_my_way",
    "arrived",
    "in_progress",
]


def live_operations_snapshot(db: Session):
    online_workers = db.query(func.count(Worker.id)).filter(
        Worker.availability_status == "online"
    ).scalar() or 0

    offline_workers = db.query(func.count(Worker.id)).filter(
        Worker.availability_status == "offline"
    ).scalar() or 0

    active_jobs = db.query(func.count(Job.id)).filter(
        Job.status.in_(ACTIVE_STATUSES)
    ).scalar() or 0

    urgent_jobs = db.query(func.count(Job.id)).filter(
        Job.urgency == "urgent",
        Job.status.in_(ACTIVE_STATUSES)
    ).scalar() or 0

    pending_jobs = db.query(func.count(Job.id)).filter(
        Job.status == "pending"
    ).scalar() or 0

    in_progress_jobs = db.query(func.count(Job.id)).filter(
        Job.status == "in_progress"
    ).scalar() or 0

    return {
        "workers": {
            "online": online_workers,
            "offline": offline_workers,
        },
        "jobs": {
            "active": active_jobs,
            "pending": pending_jobs,
            "in_progress": in_progress_jobs,
            "urgent": urgent_jobs,
        }
    }


def live_active_jobs(db: Session):
    return (
        db.query(Job)
        .filter(Job.status.in_(ACTIVE_STATUSES))
        .order_by(Job.created_at.desc())
        .all()
    )


def live_urgent_jobs(db: Session):
    return (
        db.query(Job)
        .filter(
            Job.urgency == "urgent",
            Job.status.in_(ACTIVE_STATUSES)
        )
        .order_by(Job.created_at.desc())
        .all()
    )


def live_online_workers(db: Session):
    return (
        db.query(Worker)
        .filter(Worker.availability_status == "online")
        .all()
    )
