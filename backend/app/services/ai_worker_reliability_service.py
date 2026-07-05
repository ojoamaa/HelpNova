from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.worker import Worker
from app.models.job import Job
from app.models.dispute import Dispute
from app.models.job_review import JobReview


def reliability_level(score: int):
    if score >= 85:
        return "ELITE"
    if score >= 70:
        return "RELIABLE"
    if score >= 50:
        return "AVERAGE"
    return "HIGH_RISK"


def worker_recommendation(score: int):
    if score >= 85:
        return "Top priority for job assignment"
    if score >= 70:
        return "Good worker for normal assignments"
    if score >= 50:
        return "Assign with monitoring"
    return "Review worker before assigning jobs"


def calculate_worker_reliability(db: Session, worker_id: str):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()

    if not worker:
        return None

    total_jobs = db.query(func.count(Job.id)).filter(
        Job.assigned_worker_id == worker_id
    ).scalar() or 0

    completed_jobs = db.query(func.count(Job.id)).filter(
        Job.assigned_worker_id == worker_id,
        Job.status == "completed"
    ).scalar() or 0

    cancelled_jobs = db.query(func.count(Job.id)).filter(
        Job.assigned_worker_id == worker_id,
        Job.status == "cancelled"
    ).scalar() or 0

    active_jobs = db.query(func.count(Job.id)).filter(
        Job.assigned_worker_id == worker_id,
        Job.status.in_(["accepted", "on_my_way", "arrived", "in_progress"])
    ).scalar() or 0

    disputes = db.query(func.count(Dispute.id)).filter(
        Dispute.worker_id == worker_id
    ).scalar() or 0

    average_rating = db.query(
        func.coalesce(func.avg(JobReview.rating), 0)
    ).filter(
        JobReview.worker_id == worker_id
    ).scalar() or 0

    total_reviews = db.query(func.count(JobReview.id)).filter(
        JobReview.worker_id == worker_id
    ).scalar() or 0

    years_experience = getattr(worker, "years_experience", 0) or 0
    verification_status = getattr(worker, "verification_status", "")
    availability_status = getattr(worker, "availability_status", "")

    score = 50
    reasons = []

    if total_jobs > 0:
        completion_rate = completed_jobs / total_jobs

        if completion_rate >= 0.8:
            score += 20
            reasons.append("Strong job completion rate")
        elif completion_rate >= 0.5:
            score += 10
            reasons.append("Average job completion rate")
        else:
            score -= 15
            reasons.append("Low job completion rate")
    else:
        reasons.append("No assigned job history yet")

    if cancelled_jobs > 0 and total_jobs > 0:
        cancellation_rate = cancelled_jobs / total_jobs

        if cancellation_rate >= 0.4:
            score -= 25
            reasons.append("High cancellation rate")
        else:
            score -= 8
            reasons.append("Some cancelled jobs")
    else:
        score += 8
        reasons.append("No cancellation record")

    if average_rating >= 4.5:
        score += 15
        reasons.append("Excellent customer rating")
    elif average_rating >= 3.5:
        score += 8
        reasons.append("Good customer rating")
    elif average_rating > 0:
        score -= 15
        reasons.append("Low customer rating")

    if disputes >= 2:
        score -= 25
        reasons.append("Multiple disputes recorded")
    elif disputes == 1:
        score -= 10
        reasons.append("One dispute recorded")
    else:
        score += 10
        reasons.append("No dispute record")

    if verification_status == "approved":
        score += 10
        reasons.append("Worker verification approved")
    else:
        score -= 15
        reasons.append("Worker verification not approved")

    if years_experience >= 5:
        score += 10
        reasons.append("Strong work experience")
    elif years_experience >= 2:
        score += 5
        reasons.append("Moderate work experience")

    if availability_status == "online":
        score += 5
        reasons.append("Worker currently online")

    score = max(0, min(score, 100))

    return {
        "worker_id": worker.id,
        "worker_name": getattr(worker, "full_name", ""),
        "profession": getattr(worker, "profession", ""),
        "reliability_score": score,
        "reliability_level": reliability_level(score),
        "recommendation": worker_recommendation(score),
        "reasons": reasons,
        "statistics": {
            "total_jobs": total_jobs,
            "completed_jobs": completed_jobs,
            "cancelled_jobs": cancelled_jobs,
            "active_jobs": active_jobs,
            "completion_rate": round((completed_jobs / total_jobs) * 100, 2) if total_jobs > 0 else 0,
            "average_rating": round(float(average_rating), 2),
            "total_reviews": total_reviews,
            "disputes": disputes,
            "years_experience": years_experience,
            "verification_status": verification_status,
            "availability_status": availability_status,
        }
    }
