from sqlalchemy.orm import Session
from app.models.worker import Worker
from app.models.job_assignment import JobAssignment
from app.models.worker_review import WorkerReview
from app.models.dispute import Dispute


def calculate_worker_trust(db: Session, worker_id: str):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()

    if not worker:
        return None

    assignments = db.query(JobAssignment).filter(
        JobAssignment.worker_id == worker_id
    ).all()

    reviews = db.query(WorkerReview).filter(
        WorkerReview.worker_id == worker_id
    ).all()

    disputes = db.query(Dispute).filter(
        Dispute.worker_id == worker_id
    ).all()

    total_jobs = len(assignments)
    completed_jobs = len([a for a in assignments if a.status == "completed"])
    accepted_jobs = len([a for a in assignments if a.status in ["accepted", "completed"]])
    rejected_jobs = len([a for a in assignments if a.status == "rejected"])

    average_rating = 0
    if reviews:
        average_rating = round(sum(r.rating for r in reviews) / len(reviews), 2)

    completion_rate = round((completed_jobs / total_jobs) * 100, 2) if total_jobs else 0
    acceptance_rate = round((accepted_jobs / total_jobs) * 100, 2) if total_jobs else 0
    rejection_rate = round((rejected_jobs / total_jobs) * 100, 2) if total_jobs else 0

    dispute_count = len(disputes)

    trust_score = 0

    trust_score += average_rating * 15
    trust_score += completion_rate * 0.3
    trust_score += acceptance_rate * 0.2

    if dispute_count > 0:
        trust_score -= dispute_count * 10

    if rejection_rate > 0:
        trust_score -= rejection_rate * 0.2

    trust_score = round(max(0, min(trust_score, 100)), 2)

    if trust_score >= 85:
        trust_level = "Platinum"
    elif trust_score >= 70:
        trust_level = "Gold"
    elif trust_score >= 50:
        trust_level = "Silver"
    else:
        trust_level = "Bronze"

    return {
        "worker_id": worker.id,
        "full_name": worker.full_name,
        "profession": worker.profession,
        "verification_status": worker.verification_status,
        "verification_level": worker.verification_level,
        "total_jobs": total_jobs,
        "completed_jobs": completed_jobs,
        "average_rating": average_rating,
        "total_reviews": len(reviews),
        "disputes": dispute_count,
        "completion_rate": completion_rate,
        "acceptance_rate": acceptance_rate,
        "rejection_rate": rejection_rate,
        "trust_score": trust_score,
        "trust_level": trust_level
    }
