from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.worker import Worker
from app.models.job import Job
from app.models.wallet import Wallet
from app.models.withdrawal import Withdrawal
from app.models.escrow import Escrow
from datetime import datetime, timedelta

def user_statistics(db: Session):
    total_workers = db.query(func.count(Worker.id)).scalar()

    total_customers = (
        db.query(func.count(Job.customer_id.distinct()))
        .filter(Job.customer_id.isnot(None))
        .scalar()
    )

    return {
        "workers": total_workers,
        "customers": total_customers,
    }
def job_statistics(db: Session):

    total = db.query(func.count(Job.id)).scalar()

    completed = (
        db.query(func.count(Job.id))
        .filter(Job.status == "completed")
        .scalar()
    )

    pending = (
        db.query(func.count(Job.id))
        .filter(Job.status == "pending")
        .scalar()
    )

    accepted = (
        db.query(func.count(Job.id))
        .filter(Job.status == "accepted")
        .scalar()
    )

    cancelled = (
        db.query(func.count(Job.id))
        .filter(Job.status == "cancelled")
        .scalar()
    )

    return {
        "total_jobs": total,
        "completed": completed,
        "pending": pending,
        "accepted": accepted,
        "cancelled": cancelled,
    }

def wallet_statistics(db: Session):

    available = db.query(
        func.coalesce(func.sum(Wallet.available_balance),0)
    ).scalar()

    pending = db.query(
        func.coalesce(func.sum(Wallet.pending_balance),0)
    ).scalar()

    earned = db.query(
        func.coalesce(func.sum(Wallet.total_earned),0)
    ).scalar()

    return {
        "available": available,
        "pending": pending,
        "earned": earned,
    }

def withdrawal_statistics(db: Session):

    return {

        "pending": db.query(
            func.count(Withdrawal.id)
        ).filter(
            Withdrawal.status=="pending"
        ).scalar(),

        "approved": db.query(
            func.count(Withdrawal.id)
        ).filter(
            Withdrawal.status=="approved"
        ).scalar(),

        "paid": db.query(
            func.count(Withdrawal.id)
        ).filter(
            Withdrawal.status=="paid"
        ).scalar(),

        "rejected": db.query(
            func.count(Withdrawal.id)
        ).filter(
            Withdrawal.status=="rejected"
        ).scalar(),

    }

def escrow_statistics(db: Session):

    holding = db.query(
        func.coalesce(func.sum(Escrow.worker_amount),0)
    ).filter(
        Escrow.status=="holding"
    ).scalar()

    released = db.query(
        func.coalesce(func.sum(Escrow.worker_amount),0)
    ).filter(
        Escrow.status=="released"
    ).scalar()

    return {

        "holding": holding,

        "released": released

    }

def admin_dashboard(db: Session):

    return {

        "users": user_statistics(db),

        "jobs": job_statistics(db),

        "wallet": wallet_statistics(db),

        "withdrawals": withdrawal_statistics(db),

        "escrow": escrow_statistics(db),

        "revenue": revenue_statistics(db)

    }

def revenue_statistics(db: Session):
    today = datetime.utcnow().date()
    week_start = today - timedelta(days=7)
    month_start = today - timedelta(days=30)

    total_revenue = (
        db.query(func.coalesce(func.sum(Escrow.platform_fee), 0))
        .filter(Escrow.status.in_(["holding", "released"]))
        .scalar()
    )

    daily_revenue = (
        db.query(func.coalesce(func.sum(Escrow.platform_fee), 0))
        .filter(func.date(Escrow.created_at) == today)
        .scalar()
    )

    weekly_revenue = (
        db.query(func.coalesce(func.sum(Escrow.platform_fee), 0))
        .filter(func.date(Escrow.created_at) >= week_start)
        .scalar()
    )

    monthly_revenue = (
        db.query(func.coalesce(func.sum(Escrow.platform_fee), 0))
        .filter(func.date(Escrow.created_at) >= month_start)
        .scalar()
    )

    return {
        "total_revenue": total_revenue,
        "today": daily_revenue,
        "last_7_days": weekly_revenue,
        "last_30_days": monthly_revenue,
    }