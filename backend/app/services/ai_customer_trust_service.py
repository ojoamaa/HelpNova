from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.job import Job
from app.models.dispute import Dispute
from app.models.payment import Payment


def trust_level(score: int):
    if score >= 85:
        return "EXCELLENT"
    if score >= 70:
        return "GOOD"
    if score >= 50:
        return "FAIR"
    return "LOW"


def customer_decision(score: int):
    if score >= 85:
        return "Preferred customer"
    if score >= 70:
        return "Trusted customer"
    if score >= 50:
        return "Monitor customer activity"
    return "High caution customer"


def calculate_customer_trust(db: Session, customer_id: str):
    total_jobs = db.query(func.count(Job.id)).filter(
        Job.customer_id == customer_id
    ).scalar() or 0

    completed_jobs = db.query(func.count(Job.id)).filter(
        Job.customer_id == customer_id,
        Job.status == "completed"
    ).scalar() or 0

    cancelled_jobs = db.query(func.count(Job.id)).filter(
        Job.customer_id == customer_id,
        Job.status == "cancelled"
    ).scalar() or 0

    disputes = db.query(func.count(Dispute.id)).filter(
        Dispute.customer_id == customer_id
    ).scalar() or 0

    successful_payments = db.query(func.count(Payment.id)).filter(
        Payment.customer_id == customer_id,
        Payment.status.in_(["success", "successful", "paid", "released"])
    ).scalar() or 0

    failed_payments = db.query(func.count(Payment.id)).filter(
        Payment.customer_id == customer_id,
        Payment.status == "failed"
    ).scalar() or 0

    total_spent = db.query(
        func.coalesce(func.sum(Payment.amount), 0)
    ).filter(
        Payment.customer_id == customer_id,
        Payment.status.in_(["success", "successful", "paid", "released"])
    ).scalar() or 0

    score = 50
    reasons = []

    if completed_jobs >= 5:
        score += 20
        reasons.append("Strong completed job history")
    elif completed_jobs >= 1:
        score += 10
        reasons.append("Some completed job history")
    else:
        reasons.append("No completed job history yet")

    if total_jobs > 0:
        cancellation_rate = cancelled_jobs / total_jobs

        if cancellation_rate >= 0.5:
            score -= 25
            reasons.append("High cancellation rate")
        elif cancellation_rate > 0:
            score -= 10
            reasons.append("Some cancelled jobs")
        else:
            score += 10
            reasons.append("No cancellation record")

    if disputes >= 2:
        score -= 25
        reasons.append("Multiple disputes recorded")
    elif disputes == 1:
        score -= 10
        reasons.append("One dispute recorded")
    else:
        score += 10
        reasons.append("No dispute record")

    if successful_payments >= 3:
        score += 15
        reasons.append("Good payment history")
    elif successful_payments >= 1:
        score += 8
        reasons.append("Payment history exists")

    if failed_payments >= 2:
        score -= 20
        reasons.append("Multiple failed payments")
    elif failed_payments == 1:
        score -= 8
        reasons.append("One failed payment")

    if total_spent >= 100000:
        score += 10
        reasons.append("High-value customer spending")

    score = max(0, min(score, 100))

    return {
        "customer_id": customer_id,
        "trust_score": score,
        "trust_level": trust_level(score),
        "decision": customer_decision(score),
        "reasons": reasons,
        "statistics": {
            "total_jobs": total_jobs,
            "completed_jobs": completed_jobs,
            "cancelled_jobs": cancelled_jobs,
            "disputes": disputes,
            "successful_payments": successful_payments,
            "failed_payments": failed_payments,
            "total_spent": total_spent,
        }
    }
