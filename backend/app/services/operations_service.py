from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.worker import Worker
from app.models.job import Job

from app.models.job_assignment import JobAssignment
from app.models.user import User


def get_live_operations_summary(db: Session):
    today = date.today()

    workers_online = (
        db.query(Worker)
        .filter(Worker.availability_status == "online")
        .count()
    )

    new_job_requests = (
        db.query(Job)
        .filter(Job.status == "pending")
        .count()
    )

    jobs_in_progress = (
        db.query(Job)
        .filter(Job.status.in_(["accepted", "on_my_way", "arrived", "started", "in_progress"]))
        .count()
    )

    workers_en_route = (
        db.query(Job)
        .filter(Job.status == "on_my_way")
        .count()
    )

    completed_today = (
        db.query(Job)
        .filter(
            Job.status == "completed",
            func.date(Job.created_at) == today,
        )
        .count()
    )

    delayed_jobs = (
        db.query(Job)
        .filter(Job.status.in_(["pending", "accepted", "on_my_way", "arrived"]))
        .count()
    )

    emergency_requests = (
        db.query(Job)
        .filter(
            Job.urgency.in_(["emergency", "urgent", "high"]),
            Job.status != "completed",
        )
        .count()
    )

    active_locations = (
        db.query(Job.city)
        .filter(Job.status != "completed")
        .distinct()
        .count()
    )

    return {
        "workers_online": workers_online,
        "new_job_requests": new_job_requests,
        "jobs_in_progress": jobs_in_progress,
        "workers_en_route": workers_en_route,
        "completed_today": completed_today,
        "delayed_jobs": delayed_jobs,
        "emergency_requests": emergency_requests,
        "active_locations": active_locations,
    }

def get_live_job_queue(db: Session):
    jobs = (
        db.query(Job)
        .filter(Job.status != "completed")
        .order_by(Job.created_at.desc())
        .limit(20)
        .all()
    )

    queue = []

    for job in jobs:
        assignment = (
            db.query(JobAssignment)
            .filter(JobAssignment.job_id == job.id)
            .first()
        )

        worker_id = None
        worker_name = None

        if assignment and assignment.worker_id:
            worker_id = assignment.worker_id

            worker = (
                db.query(Worker)
                .filter(Worker.id == assignment.worker_id)
                .first()
            )

            if worker:
                user = (
                    db.query(User)
                    .filter(User.id == worker.user_id)
                    .first()
                )

                if user:
                    worker_name = user.full_name

        queue.append(
            {
                "id": job.id,
                "title": job.title,
                "worker_id": worker_id,
                "worker_name": worker_name,
                "status": job.status,
                "city": job.city,
                "area": job.area,
                "urgency": job.urgency,
                "created_at": job.created_at,
            }
        )

    return queue