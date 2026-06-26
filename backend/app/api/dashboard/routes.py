from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.job import Job
from app.models.worker import Worker
from app.models.user import User
from app.models.payment import Payment
from app.models.wallet import Wallet

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/admin")
def admin_dashboard(db: Session = Depends(get_db)):
    payments = db.query(Payment).all()

    return {
        "customers": db.query(User).count(),
        "workers": db.query(Worker).count(),
        "jobs": db.query(Job).count(),
        "pending_jobs": db.query(Job).filter(Job.status == "pending").count(),
        "assigned_jobs": db.query(Job).filter(Job.status == "assigned").count(),
        "completed_jobs": db.query(Job).filter(Job.status == "completed").count(),
        "payments": len(payments),
        "total_revenue": sum(p.platform_fee or 0 for p in payments if p.status in ["paid", "released"]),
        "pending_payouts": sum(p.worker_amount or 0 for p in payments if p.status == "paid"),
        "released_payouts": sum(p.worker_amount or 0 for p in payments if p.status == "released"),
    }


@router.get("/worker/{worker_id}")
def worker_dashboard(worker_id: str, db: Session = Depends(get_db)):
    jobs = db.query(Job).filter(Job.customer_id == worker_id).all()
    payments = db.query(Payment).filter(Payment.worker_id == worker_id).all()
    wallet = db.query(Wallet).filter(Wallet.worker_id == worker_id).first()

    return {
        "worker_id": worker_id,
        "assigned_jobs": db.query(Job).filter(Job.status == "assigned").count(),
        "completed_jobs": len([j for j in jobs if j.status == "completed"]),
        "total_payments": len(payments),
        "pending_balance": wallet.pending_balance if wallet else 0,
        "available_balance": wallet.available_balance if wallet else 0,
        "total_earned": wallet.total_earned if wallet else 0,
        "pending_payout": sum(p.worker_amount or 0 for p in payments if p.status == "paid"),
        "released_payout": sum(p.worker_amount or 0 for p in payments if p.status == "released"),
    }