from datetime import datetime
from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.payment import Payment
from app.services.payment_service import release_worker_payment


def complete_job(db: Session, job_id: str):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        return "not_found"

    if job.status == "completed":
        return "already_completed"

    job.status = "completed"

    if hasattr(job, "completed_at"):
        job.completed_at = datetime.utcnow()

    payment = (
        db.query(Payment)
        .filter(Payment.job_id == job_id)
        .filter(Payment.status == "paid")
        .first()
    )

    released_payment = None

    if payment:
        released_payment = release_worker_payment(db, payment.id)

    db.commit()
    db.refresh(job)

    return {
        "job_id": job.id,
        "status": job.status,
        "payment_released": True if released_payment and released_payment not in ["not_paid", "already_released"] else False,
        "released_payment_id": released_payment.id if released_payment and released_payment not in ["not_paid", "already_released"] else None,
    }