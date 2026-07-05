from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.job import Job
from app.models.worker import Worker
from app.models.withdrawal import Withdrawal
from app.models.dispute import Dispute
from app.models.payment import Payment


def risk_level(score: int):
    if score >= 75:
        return "HIGH"
    if score >= 45:
        return "MEDIUM"
    return "LOW"


def recommendation(score: int):
    if score >= 75:
        return "High risk detected. Hold transaction and review manually."
    if score >= 45:
        return "Medium risk detected. Continue with caution and monitor activity."
    return "Low risk. No immediate action required."


def customer_fraud_check(db: Session, customer_id: str):
    flags = []
    score = 0

    total_jobs = db.query(func.count(Job.id)).filter(
        Job.customer_id == customer_id
    ).scalar() or 0

    cancelled_jobs = db.query(func.count(Job.id)).filter(
        Job.customer_id == customer_id,
        Job.status == "cancelled"
    ).scalar() or 0

    disputes = db.query(func.count(Dispute.id)).filter(
        Dispute.customer_id == customer_id
    ).scalar() or 0

    if total_jobs >= 3:
        cancellation_rate = cancelled_jobs / total_jobs
        if cancellation_rate >= 0.5:
            score += 30
            flags.append("High customer cancellation rate")

    if disputes >= 2:
        score += 25
        flags.append("Multiple customer disputes")

    if total_jobs == 0:
        score += 10
        flags.append("New customer with no completed history")

    return {
        "entity": "customer",
        "entity_id": customer_id,
        "risk_score": min(score, 100),
        "risk_level": risk_level(min(score, 100)),
        "recommendation": recommendation(min(score, 100)),
        "flags": flags,
    }


def worker_fraud_check(db: Session, worker_id: str):
    flags = []
    score = 0

    worker = db.query(Worker).filter(
        Worker.id == worker_id
    ).first()

    if not worker:
        return None

    assigned_jobs = db.query(func.count(Job.id)).filter(
        Job.assigned_worker_id == worker_id
    ).scalar() or 0

    cancelled_jobs = db.query(func.count(Job.id)).filter(
        Job.assigned_worker_id == worker_id,
        Job.status == "cancelled"
    ).scalar() or 0

    disputes = db.query(func.count(Dispute.id)).filter(
        Dispute.worker_id == worker_id
    ).scalar() or 0

    if getattr(worker, "verification_status", "") != "approved":
        score += 35
        flags.append("Worker is not fully verified")

    if assigned_jobs >= 3:
        cancellation_rate = cancelled_jobs / assigned_jobs

        if cancellation_rate >= 0.40:
            score += 25
            flags.append("High worker cancellation rate")

    if disputes >= 2:
        score += 25
        flags.append("Multiple worker disputes")

    rating = getattr(worker, "average_rating", 0) or 0

    if rating > 0 and rating < 3:
        score += 20
        flags.append("Low worker rating")

    completed_jobs = getattr(worker, "completed_jobs", 0) or 0

    if completed_jobs < 5:
        score += 10
        flags.append("Limited completed job history")

    return {
        "entity": "worker",
        "entity_id": worker_id,
        "worker_name": worker.full_name,
        "risk_score": min(score, 100),
        "risk_level": risk_level(min(score, 100)),
        "recommendation": recommendation(min(score, 100)),
        "flags": flags,
        "statistics": {
            "assigned_jobs": assigned_jobs,
            "cancelled_jobs": cancelled_jobs,
            "completed_jobs": completed_jobs,
            "rating": rating,
            "disputes": disputes
        }
    }


def payment_fraud_check(db: Session, payment_id: str):
    flags = []
    score = 0

    payment = db.query(Payment).filter(
        Payment.id == payment_id
    ).first()

    if not payment:
        return None

    amount = payment.amount or 0
    status = payment.status or ""

    if amount >= 200000:
        score += 25
        flags.append("High-value payment")

    if status.lower() in ["failed", "reversed", "chargeback"]:
        score += 40
        flags.append("Payment has risky status")

    customer_history = db.query(func.count(Payment.id)).filter(
        Payment.customer_id == payment.customer_id
    ).scalar() or 0

    if customer_history <= 1:
        score += 10
        flags.append("Very limited payment history")

    return {
        "entity": "payment",
        "entity_id": payment_id,
        "risk_score": min(score, 100),
        "risk_level": risk_level(min(score, 100)),
        "recommendation": recommendation(min(score, 100)),
        "flags": flags,
        "payment": {
            "amount": amount,
            "status": status
        }
    }


def platform_fraud_overview(db: Session):
    pending_withdrawals = db.query(func.count(Withdrawal.id)).filter(
        Withdrawal.status == "pending"
    ).scalar() or 0

    open_disputes = db.query(func.count(Dispute.id)).filter(
        Dispute.status.in_(["open", "pending"])
    ).scalar() or 0

    failed_payments = db.query(func.count(Payment.id)).filter(
        Payment.status == "failed"
    ).scalar() or 0

    score = 0
    flags = []

    if pending_withdrawals >= 5:
        score += 20
        flags.append("High pending withdrawal activity")

    if open_disputes >= 3:
        score += 35
        flags.append("High number of active disputes")

    if failed_payments >= 5:
        score += 30
        flags.append("Large number of failed payments")

    return {
        "entity": "platform",
        "risk_score": min(score, 100),
        "risk_level": risk_level(min(score, 100)),
        "recommendation": recommendation(min(score, 100)),
        "flags": flags,
        "metrics": {
            "pending_withdrawals": pending_withdrawals,
            "open_disputes": open_disputes,
            "failed_payments": failed_payments
        }
    }