from datetime import datetime, timedelta

from app.models.job import Job
from app.services.auto_matching_service import auto_match_job


def check_and_redispatch(db, job_id: str, timeout_minutes: int = 2):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        return {
            "success": False,
            "message": "Job not found."
        }

    if job.status == "accepted":
        return {
            "success": True,
            "message": "Job already accepted. No redispatch needed.",
            "job_id": job.id,
            "assigned_worker_id": job.assigned_worker_id
        }

    if not job.created_at:
        return {
            "success": False,
            "message": "Job has no created_at time."
        }

    expiry_time = job.created_at + timedelta(minutes=timeout_minutes)

    if datetime.utcnow() < expiry_time:
        return {
            "success": True,
            "message": "Still within response window.",
            "job_id": job.id,
            "expires_at": expiry_time.isoformat()
        }

    matching = auto_match_job(db, job.id)

    return {
        "success": True,
        "message": "Response time expired. Re-dispatching to available professionals.",
        "job_id": job.id,
        "matching": matching
    }
