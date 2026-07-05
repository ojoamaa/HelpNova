from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.wallet import Wallet
from app.models.escrow import Escrow
from app.models.withdrawal import Withdrawal


def finance_summary(db: Session):
    total_platform_revenue = db.query(
        func.coalesce(func.sum(Escrow.platform_fee), 0)
    ).filter(Escrow.status == "released").scalar()

    escrow_holding = db.query(
        func.coalesce(func.sum(Escrow.worker_amount), 0)
    ).filter(Escrow.status == "holding").scalar()

    released_escrow = db.query(
        func.coalesce(func.sum(Escrow.worker_amount), 0)
    ).filter(Escrow.status == "released").scalar()

    total_worker_earnings = db.query(
        func.coalesce(func.sum(Wallet.total_earned), 0)
    ).scalar()

    wallet_available = db.query(
        func.coalesce(func.sum(Wallet.available_balance), 0)
    ).scalar()

    wallet_pending = db.query(
        func.coalesce(func.sum(Wallet.pending_balance), 0)
    ).scalar()

    pending_withdrawals = db.query(
        func.coalesce(func.sum(Withdrawal.amount), 0)
    ).filter(Withdrawal.status == "pending").scalar()

    approved_withdrawals = db.query(
        func.coalesce(func.sum(Withdrawal.amount), 0)
    ).filter(Withdrawal.status == "approved").scalar()

    paid_withdrawals = db.query(
        func.coalesce(func.sum(Withdrawal.amount), 0)
    ).filter(Withdrawal.status == "paid").scalar()

    return {
        "platform": {
            "total_revenue": total_platform_revenue
        },
        "escrow": {
            "holding": escrow_holding,
            "released": released_escrow
        },
        "wallets": {
            "available_balance": wallet_available,
            "pending_balance": wallet_pending,
            "total_worker_earnings": total_worker_earnings
        },
       "withdrawals": {
            "pending": pending_withdrawals,
            "approved": approved_withdrawals,
            "paid": paid_withdrawals
        }
    }


def revenue_stats(db: Session):
    now = datetime.utcnow()

    today_start = datetime(now.year, now.month, now.day)
    last_7_days = now - timedelta(days=7)
    last_30_days = now - timedelta(days=30)

    total_revenue = db.query(
        func.coalesce(func.sum(Escrow.platform_fee), 0)
    ).filter(
        Escrow.status == "released"
    ).scalar()

    today_revenue = db.query(
        func.coalesce(func.sum(Escrow.platform_fee), 0)
    ).filter(
        Escrow.status == "released",
        Escrow.released_at >= today_start
    ).scalar()

    revenue_7_days = db.query(
        func.coalesce(func.sum(Escrow.platform_fee), 0)
    ).filter(
        Escrow.status == "released",
        Escrow.released_at >= last_7_days
    ).scalar()

    revenue_30_days = db.query(
        func.coalesce(func.sum(Escrow.platform_fee), 0)
    ).filter(
        Escrow.status == "released",
        Escrow.released_at >= last_30_days
    ).scalar()

    return {
        "total_revenue": total_revenue,
        "today": today_revenue,
        "last_7_days": revenue_7_days,
        "last_30_days": revenue_30_days,
    }


def escrow_stats(db: Session):

    holding = db.query(
        func.coalesce(func.sum(Escrow.worker_amount), 0)
    ).filter(
        Escrow.status == "holding"
    ).scalar()

    released = db.query(
        func.coalesce(func.sum(Escrow.worker_amount), 0)
    ).filter(
        Escrow.status == "released"
    ).scalar()

    total_customer_payments = db.query(
        func.coalesce(func.sum(Escrow.customer_pays), 0)
    ).scalar()

    total_platform_revenue = db.query(
        func.coalesce(func.sum(Escrow.platform_fee), 0)
    ).filter(
        Escrow.status == "released"
    ).scalar()

    return {
        "holding": holding,
        "released": released,
        "total_customer_payments": total_customer_payments,
        "total_platform_revenue": total_platform_revenue,
    }


def withdrawal_stats(db: Session):

    pending = db.query(
        func.coalesce(func.sum(Withdrawal.amount), 0)
    ).filter(
        Withdrawal.status == "pending"
    ).scalar()

    approved = db.query(
        func.coalesce(func.sum(Withdrawal.amount), 0)
    ).filter(
        Withdrawal.status == "approved"
    ).scalar()

    paid = db.query(
        func.coalesce(func.sum(Withdrawal.amount), 0)
    ).filter(
        Withdrawal.status == "paid"
    ).scalar()

    rejected = db.query(
        func.coalesce(func.sum(Withdrawal.amount), 0)
    ).filter(
        Withdrawal.status == "rejected"
    ).scalar()

    return {
        "pending": pending,
        "approved": approved,
        "paid": paid,
        "rejected": rejected,
    }


def worker_payout_stats(db: Session):

    total_earned = db.query(
        func.coalesce(func.sum(Wallet.total_earned), 0)
    ).scalar()

    available_balance = db.query(
        func.coalesce(func.sum(Wallet.available_balance), 0)
    ).scalar()

    pending_balance = db.query(
        func.coalesce(func.sum(Wallet.pending_balance), 0)
    ).scalar()

    return {
        "total_earned": total_earned,
        "available_balance": available_balance,
        "pending_balance": pending_balance,
    }
