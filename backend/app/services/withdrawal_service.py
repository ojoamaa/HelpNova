from datetime import datetime
from sqlalchemy.orm import Session

from app.models.withdrawal import Withdrawal
from app.models.wallet import Wallet, WalletTransaction


MIN_WITHDRAWAL_AMOUNT = 1000

def create_withdrawal_request(db: Session, data):
    wallet = db.query(Wallet).filter(Wallet.worker_id == data.worker_id).first()

    if not wallet:
        return "wallet_not_found"

    if data.amount < MIN_WITHDRAWAL_AMOUNT:
        return "below_minimum"

    if wallet.available_balance < data.amount:
        return "insufficient_balance"

    wallet.available_balance -= data.amount
    wallet.pending_balance += data.amount
    wallet.updated_at = datetime.utcnow()

    withdrawal = Withdrawal(
        worker_id=data.worker_id,
        wallet_id=wallet.id,
        amount=data.amount,
        bank_name=data.bank_name,
        account_number=data.account_number,
        account_name=data.account_name,
        status="pending",
        reference=f"WD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        requested_at=datetime.utcnow()
    )

    db.add(withdrawal)
    db.flush()

    tx = WalletTransaction(
        wallet_id=wallet.id,
        worker_id=data.worker_id,
        payment_id=withdrawal.id,
        transaction_type="withdrawal_request",
        amount=data.amount,
        status="pending",
        description="Worker withdrawal request created",
        reference=withdrawal.reference,
        balance_after=wallet.available_balance
    )

    db.add(tx)
    db.commit()
    db.refresh(withdrawal)

    return withdrawal

def mark_withdrawal_paid(db: Session, withdrawal_id: str):
    from app.services.payout_service import process_bank_payout

    withdrawal = db.query(Withdrawal).filter(Withdrawal.id == withdrawal_id).first()
    withdrawal = db.query(Withdrawal).filter(Withdrawal.id == withdrawal_id).first()

    if not withdrawal:
         return None

    if withdrawal.status == "paid":
         return "already_paid"

    if withdrawal.status != "approved":
         return "not_approved"

    wallet = db.query(Wallet).filter(Wallet.worker_id == withdrawal.worker_id).first()

    payout = process_bank_payout(withdrawal)

    if not payout.get("success"):
        withdrawal.status = "failed"
        withdrawal.admin_note = payout.get("message", "Payout failed")
        db.commit()
        db.refresh(withdrawal)
        return withdrawal

    if wallet:
        wallet.pending_balance -= withdrawal.amount
        if wallet.pending_balance < 0:
            wallet.pending_balance = 0

        wallet.updated_at = datetime.utcnow()

        tx = WalletTransaction(
            wallet_id=wallet.id,
            worker_id=withdrawal.worker_id,
            payment_id=withdrawal.id,
            transaction_type="withdrawal_paid",
            amount=withdrawal.amount,
            status="success",
            description="Withdrawal paid to worker bank account",
            reference=payout.get("reference"),
            balance_after=wallet.available_balance
        )

        db.add(tx)

    withdrawal.status = "paid"
    withdrawal.reference = payout.get("reference")
    withdrawal.paid_at = datetime.utcnow()

    db.commit()
    db.refresh(withdrawal)

    return withdrawal


def approve_withdrawal(db: Session, withdrawal_id: str, admin_note: str = None):
    withdrawal = db.query(Withdrawal).filter(Withdrawal.id == withdrawal_id).first()

    if not withdrawal:
        return None

    if withdrawal.status != "pending":
        return "already_processed"

    withdrawal.status = "approved"
    withdrawal.approved_at = datetime.utcnow()
    withdrawal.admin_note = admin_note

    db.commit()
    db.refresh(withdrawal)

    return withdrawal


def reject_withdrawal(db: Session, withdrawal_id: str, admin_note: str = None):
    withdrawal = db.query(Withdrawal).filter(Withdrawal.id == withdrawal_id).first()

    if not withdrawal:
        return None

    if withdrawal.status != "pending":
        return "already_processed"

    wallet = db.query(Wallet).filter(Wallet.worker_id == withdrawal.worker_id).first()

    if wallet:
        wallet.pending_balance -= withdrawal.amount
        if wallet.pending_balance < 0:
            wallet.pending_balance = 0

        wallet.available_balance += withdrawal.amount
        wallet.updated_at = datetime.utcnow()

        tx = WalletTransaction(
            wallet_id=wallet.id,
            worker_id=withdrawal.worker_id,
            payment_id=withdrawal.id,
            transaction_type="withdrawal_reversal",
            amount=withdrawal.amount,
            status="success",
            description="Withdrawal rejected and balance returned",
            reference=withdrawal.reference,
            balance_after=wallet.available_balance
        )

        db.add(tx)

    withdrawal.status = "rejected"
    withdrawal.rejected_at = datetime.utcnow()
    withdrawal.admin_note = admin_note

    db.commit()
    db.refresh(withdrawal)

    return withdrawal


def list_withdrawals(db: Session):
    return db.query(Withdrawal).order_by(Withdrawal.requested_at.desc()).all()


def list_worker_withdrawals(db: Session, worker_id: str):
    return (
        db.query(Withdrawal)
        .filter(Withdrawal.worker_id == worker_id)
        .order_by(Withdrawal.requested_at.desc())
        .all()
    )