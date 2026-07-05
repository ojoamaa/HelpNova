from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.worker import Worker
from app.models.job import Job
from app.models.wallet import Wallet
from app.models.withdrawal import Withdrawal
from app.models.job_review import JobReview


def get_worker_performance(db: Session, worker_id: str):
    worker = db.query(Worker).filter(
        Worker.id == worker_id
    ).first()

    if not worker:
        return None

    # -----------------------------
    # JOB STATISTICS
    # -----------------------------
    total_jobs = db.query(func.count(Job.id)).filter(
        Job.assigned_worker_id == worker_id
    ).scalar() or 0

    completed_jobs = db.query(func.count(Job.id)).filter(
        Job.assigned_worker_id == worker_id,
        Job.status == "completed"
    ).scalar() or 0

    active_jobs = db.query(func.count(Job.id)).filter(
        Job.assigned_worker_id == worker_id,
        Job.status.in_([
            "accepted",
            "on_my_way",
            "arrived",
            "in_progress"
        ])
    ).scalar() or 0

    cancelled_jobs = db.query(func.count(Job.id)).filter(
        Job.assigned_worker_id == worker_id,
        Job.status == "cancelled"
    ).scalar() or 0

    pending_jobs = db.query(func.count(Job.id)).filter(
        Job.assigned_worker_id == worker_id,
        Job.status == "pending"
    ).scalar() or 0

    # -----------------------------
    # WALLET
    # -----------------------------
    wallet = db.query(Wallet).filter(
        Wallet.worker_id == worker_id
    ).first()

    available_balance = 0
    pending_balance = 0
    total_earned = 0

    if wallet:
        available_balance = wallet.available_balance
        pending_balance = wallet.pending_balance
        total_earned = wallet.total_earned

    # -----------------------------
    # WITHDRAWALS
    # -----------------------------
    total_withdrawn = db.query(
        func.coalesce(func.sum(Withdrawal.amount), 0)
    ).filter(
        Withdrawal.worker_id == worker_id,
        Withdrawal.status == "paid"
    ).scalar()

    pending_withdrawals = db.query(
        func.coalesce(func.sum(Withdrawal.amount), 0)
    ).filter(
        Withdrawal.worker_id == worker_id,
        Withdrawal.status == "pending"
    ).scalar()

    approved_withdrawals = db.query(
        func.coalesce(func.sum(Withdrawal.amount), 0)
    ).filter(
        Withdrawal.worker_id == worker_id,
        Withdrawal.status == "approved"
    ).scalar()

    rejected_withdrawals = db.query(
        func.coalesce(func.sum(Withdrawal.amount), 0)
    ).filter(
        Withdrawal.worker_id == worker_id,
        Withdrawal.status == "rejected"
    ).scalar()

    # -----------------------------
    # RATINGS
    # -----------------------------
    average_rating = db.query(
        func.coalesce(func.avg(JobReview.rating), 0)
    ).filter(
        JobReview.worker_id == worker_id
    ).scalar()

    total_reviews = db.query(
        func.count(JobReview.id)
    ).filter(
        JobReview.worker_id == worker_id
    ).scalar() or 0

    # -----------------------------
    # SUCCESS RATE
    # -----------------------------
    success_rate = 0

    if total_jobs > 0:
        success_rate = round(
            (completed_jobs / total_jobs) * 100,
            2
        )

    # -----------------------------
    # RESPONSE
    # -----------------------------
    return {
        "worker": {
            "id": worker.id,
            "name": getattr(worker, "full_name", ""),
            "profession": getattr(worker, "profession", ""),
            "phone_number": getattr(worker, "phone_number", ""),
            "email": getattr(worker, "email", ""),
            "status": getattr(worker, "availability_status", ""),
            "verification_status": getattr(worker, "verification_status", "")
        },

        "jobs": {
            "total_assigned": total_jobs,
            "completed": completed_jobs,
            "active": active_jobs,
            "pending": pending_jobs,
            "cancelled": cancelled_jobs,
            "success_rate": success_rate
        },

        "ratings": {
            "average_rating": round(float(average_rating), 2),
            "total_reviews": total_reviews
        },

        "wallet": {
            "available_balance": available_balance,
            "pending_balance": pending_balance,
            "total_earned": total_earned
        },

        "withdrawals": {
            "total_withdrawn": total_withdrawn,
            "pending": pending_withdrawals,
            "approved": approved_withdrawals,
            "rejected": rejected_withdrawals
        }
    }


def list_worker_performance(db: Session):
    workers = db.query(Worker).all()

    results = []

    for worker in workers:
        performance = get_worker_performance(db, worker.id)

        if performance:
            results.append(performance)

    return results