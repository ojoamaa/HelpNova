from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.worker import Worker


def safe_value(obj, field, default=None):
    return getattr(obj, field, default)


def recommend_workers(db: Session, job_id: str):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        return None

    query = db.query(Worker).filter(
        Worker.verification_status == "approved",
        Worker.availability_status == "online",
    )

    workers = query.all()

    recommendations = []

    for worker in workers:
        rating = safe_value(worker, "average_rating", 0) or 0
        completed_jobs = safe_value(worker, "completed_jobs", 0) or 0
        experience = safe_value(worker, "years_experience", 0) or 0

        score = (
            rating * 20
            + completed_jobs
            + experience * 2
        )

        recommendations.append({
            "worker_id": worker.id,
            "full_name": safe_value(worker, "full_name", ""),
            "profession": safe_value(worker, "profession", ""),
            "phone_number": safe_value(worker, "phone_number", ""),
            "availability_status": safe_value(worker, "availability_status", ""),
            "verification_status": safe_value(worker, "verification_status", ""),
            "rating": rating,
            "completed_jobs": completed_jobs,
            "experience": experience,
            "score": score,
        })

    recommendations.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return {
        "job_id": job.id,
        "job_title": safe_value(job, "title", ""),
        "job_category_id": safe_value(job, "category_id", None),
        "recommended_workers": recommendations[:5],
        "total_recommended": len(recommendations[:5])
    }