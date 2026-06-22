from sqlalchemy.orm import Session

from app.models.worker import Worker
from app.models.job_assignment import JobAssignment
from app.models.payment import Payment
from app.models.withdrawal import Withdrawal


def get_worker_dashboard(db: Session, worker_id: str):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()

    if not worker:
        return None

    assignments = (
        db.query(JobAssignment)
        .filter(JobAssignment.worker_id == worker_id)
        .all()
    )

    payments = (
        db.query(Payment)
        .filter(Payment.worker_id == worker_id)
        .all()
    )

    withdrawals = (
        db.query(Withdrawal)
        .filter(Withdrawal.worker_id == worker.user_id)
        .all()
    )

    total_earned = sum(p.worker_amount for p in payments if p.status == "released")
    pending_payout = sum(p.worker_amount for p in payments if p.status == "paid")

    return {
        "worker": {
            "worker_id": worker.id,
            "user_id": worker.user_id,
            "full_name": worker.full_name,
            "profession": worker.profession,
            "state": worker.state,
            "city": worker.city,
            "area": worker.area,
            "phone_number": worker.phone_number,
            "verification_status": worker.verification_status,
            "verification_level": worker.verification_level,
            "availability_status": worker.availability_status,
            "average_rating": worker.average_rating,
            "completed_jobs": worker.completed_jobs,
        },
        "jobs": {
            "total_assignments": len(assignments),
            "pending": len([a for a in assignments if a.status == "pending"]),
            "accepted": len([a for a in assignments if a.status == "accepted"]),
            "completed": len([a for a in assignments if a.status == "completed"]),
        },
        "earnings": {
            "total_earned": total_earned,
            "pending_payout": pending_payout,
            "total_payments": len(payments),
        },
        "withdrawals": {
            "total_requests": len(withdrawals),
            "pending": len([w for w in withdrawals if w.status == "pending"]),
            "approved": len([w for w in withdrawals if w.status == "approved"]),
            "rejected": len([w for w in withdrawals if w.status == "rejected"]),
        }
    }
