from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.wallet import Wallet, WalletTransaction
from app.models.escrow import Escrow
from app.models.withdrawal import Withdrawal


def get_finance_dashboard(db: Session):
    total_wallet_balance = db.query(func.coalesce(func.sum(Wallet.available_balance), 0)).scalar()
    total_pending_wallet = db.query(func.coalesce(func.sum(Wallet.pending_balance), 0)).scalar()
    total_worker_earnings = db.query(func.coalesce(func.sum(Wallet.total_earned), 0)).scalar()

    total_escrow_holding = (
        db.query(func.coalesce(func.sum(Escrow.worker_amount), 0))
        .filter(Escrow.status == "holding")
        .scalar()
    )

    total_escrow_released = (
        db.query(func.coalesce(func.sum(Escrow.worker_amount), 0))
        .filter(Escrow.status == "released")
        .scalar()
    )

    total_platform_revenue = (
        db.query(func.coalesce(func.sum(Escrow.platform_fee), 0))
        .filter(Escrow.status.in_(["holding", "released"]))
        .scalar()
    )

    pending_withdrawals = (
        db.query(func.coalesce(func.sum(Withdrawal.amount), 0))
        .filter(Withdrawal.status == "pending")
        .scalar()
    )

    approved_withdrawals = (
        db.query(func.coalesce(func.sum(Withdrawal.amount), 0))
        .filter(Withdrawal.status == "approved")
        .scalar()
    )

    paid_withdrawals = (
        db.query(func.coalesce(func.sum(Withdrawal.amount), 0))
        .filter(Withdrawal.status == "paid")
        .scalar()
    )

    return {
        "wallets": {
            "available_balance": total_wallet_balance,
            "pending_balance": total_pending_wallet,
            "total_worker_earnings": total_worker_earnings,
        },
        "escrow": {
            "holding": total_escrow_holding,
            "released": total_escrow_released,
        },
        "platform": {
            "total_revenue": total_platform_revenue,
        },
        "withdrawals": {
            "pending": pending_withdrawals,
            "approved": approved_withdrawals,
            "paid": paid_withdrawals,
        }
    }


def get_recent_finance_transactions(db: Session, limit: int = 20):
    return (
        db.query(WalletTransaction)
        .order_by(WalletTransaction.created_at.desc())
        .limit(limit)
        .all()
    )
