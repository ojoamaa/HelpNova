from datetime import datetime

from app.models.job import Job


def update_job_status(db, job_id: str, worker_id: str, new_status: str):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        return {"success": False, "message": "Job not found."}

    if job.assigned_worker_id != worker_id:
        return {
            "success": False,
            "message": "This job is not assigned to this worker."
        }

    job.status = new_status
    db.commit()
    db.refresh(job)

    return {
        "success": True,
        "message": f"Job status updated to {new_status}.",
        "job": job,
        "notification": {
            "customer_id": job.customer_id,
            "job_id": job.id,
            "worker_id": worker_id,
            "status": new_status,
            "message": f"Your service request is now {new_status.replace('_', ' ')}."
        }
    }


def mark_on_my_way(db, job_id: str, worker_id: str):
    return update_job_status(db, job_id, worker_id, "on_my_way")


def mark_arrived(db, job_id: str, worker_id: str):
    return update_job_status(db, job_id, worker_id, "arrived")


def start_job(db, job_id: str, worker_id: str):
    return update_job_status(db, job_id, worker_id, "in_progress")


def complete_job(db, job_id: str, worker_id: str):
    return update_job_status(db, job_id, worker_id, "completed")
