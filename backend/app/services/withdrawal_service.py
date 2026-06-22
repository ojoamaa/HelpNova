from datetime import datetime
from sqlalchemy.orm import Session

from app.models.withdrawal import Withdrawal
from app.models.wallet import Wallet


def create_withdrawal_request(db: Session, data):
    wallet = db.query(Wallet).filter(Wallet.worker_id == data.worker_id).first()

    if not wallet:
        return "wallet_not_found"

    if wallet.available_balance < data.amount:
        return "insufficient_balance"

    wallet.available_balance -= data.amount
    wallet.pending_balance += data.amount

    withdrawal = Withdrawal(
        worker_id=data.worker_id,
        amount=data.amount,
        bank_name=data.bank_name,
        account_number=data.account_number,
        account_name=data.account_name,
        status="pending"
    )

    db.add(withdrawal)
    db.commit()
    db.refresh(withdrawal)

    return withdrawal


def approve_withdrawal(db: Session, withdrawal_id: str):
    withdrawal = db.query(Withdrawal).filter(Withdrawal.id == withdrawal_id).first()

    if not withdrawal:
        return None

    if withdrawal.status != "pending":
        return "already_processed"

    wallet = db.query(Wallet).filter(Wallet.worker_id == withdrawal.worker_id).first()

    wallet.pending_balance -= withdrawal.amount
    withdrawal.status = "approved"
    withdrawal.approved_at = datetime.utcnow()

    db.commit()
    db.refresh(withdrawal)

    return withdrawal


def reject_withdrawal(db: Session, withdrawal_id: str):
    withdrawal = db.query(Withdrawal).filter(Withdrawal.id == withdrawal_id).first()

    if not withdrawal:
        return None

    if withdrawal.status != "pending":
        return "already_processed"

    wallet = db.query(Wallet).filter(Wallet.worker_id == withdrawal.worker_id).first()

    wallet.pending_balance -= withdrawal.amount
    wallet.available_balance += withdrawal.amount

    withdrawal.status = "rejected"
    withdrawal.rejected_at = datetime.utcnow()

    db.commit()
    db.refresh(withdrawal)

    return withdrawal


def list_withdrawals(db: Session):
    return db.query(Withdrawal).all()


def list_worker_withdrawals(db: Session, worker_id: str):
    return db.query(Withdrawal).filter(Withdrawal.worker_id == worker_id).all()
