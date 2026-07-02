from datetime import datetime

from app.models.job import Job
from app.models.escrow import Escrow
from app.services.commission_service import calculate_commission
from app.services.wallet_service import add_pending_balance, release_pending_balance


def create_escrow_for_job(db, job_id: str, job_amount: float):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        return {"success": False, "message": "Job not found."}

    if not job.assigned_worker_id:
        return {"success": False, "message": "No worker assigned to this job."}

    commission = calculate_commission(job_amount)

    escrow = Escrow(
        job_id=job.id,
        customer_id=job.customer_id,
        worker_id=job.assigned_worker_id,
        amount=commission["job_amount"],
        platform_fee=commission["platform_revenue"],
        worker_amount=commission["worker_receives"],
        customer_fee=commission["customer_fee"],
        worker_commission=commission["worker_commission"],
        customer_pays=commission["customer_pays"],
        status="holding"
    )

    db.add(escrow)
    db.commit()
    db.refresh(escrow)

    add_pending_balance(
        db=db,
        worker_id=escrow.worker_id,
        payment_id=escrow.id,
        amount=escrow.worker_amount
    )

    return {
        "success": True,
        "message": "Escrow created and worker pending balance updated.",
        "escrow": escrow,
        "commission": commission
    }


def release_escrow(db, escrow_id: str):
    escrow = db.query(Escrow).filter(Escrow.id == escrow_id).first()

    if not escrow:
        return {"success": False, "message": "Escrow not found."}

    if escrow.status == "released":
        return {"success": False, "message": "Escrow already released."}

    release_pending_balance(
        db=db,
        worker_id=escrow.worker_id,
        payment_id=escrow.id,
        amount=escrow.worker_amount
    )

    escrow.status = "released"
    escrow.released_at = datetime.utcnow()

    db.commit()
    db.refresh(escrow)

    return {
        "success": True,
        "message": "Escrow released and worker wallet credited.",
        "escrow": escrow
    }