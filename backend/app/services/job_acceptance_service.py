from app.models.job import Job

from app.services.customer_notification_service import (
    notify_customer_job_accepted,
    notify_customer_job_rejected
)

def accept_job(db, job_id: str, worker_id: str):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        return {
            "success": False,
            "message": "Job not found."
        }

    if job.status == "accepted":
        return {
            "success": False,
            "message": "This job has already been accepted."
        }

    job.assigned_worker_id = worker_id
    job.status = "accepted"

    db.commit()
    db.refresh(job)

    notification = notify_customer_job_accepted(job, worker_id)

    return {
    "success": True,
    "message": "Job accepted successfully.",
    "job": job,
    "notification": notification
}


def reject_job(db, job_id: str, worker_id: str):
    job = db.query(Job).filter(Job.id == job_id).first()

    notification = notify_customer_job_rejected(job_id, worker_id)

    if not job:
        return {
            "success": False,
            "message": "Job not found.",
            "notification": notification
        }

    return {
        "success": True,
        "message": "Job rejected. The request will move to the next available professional.",
        "job_id": job_id,
        "worker_id": worker_id,
        "notification": notification
    }

    return {
        "success": True,
        "message": "Job rejected. The request will move to the next available professional.",
        "job_id": job_id,
        "worker_id": worker_id

    }
