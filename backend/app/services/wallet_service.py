import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.wallet import Wallet, WalletTransaction


def get_or_create_wallet(db: Session, worker_id: str):
    wallet = db.query(Wallet).filter(Wallet.worker_id == worker_id).first()

    if not wallet:
        wallet = Wallet(
            id=str(uuid.uuid4()),
            worker_id=worker_id,
            available_balance=0,
            pending_balance=0,
            total_earned=0,
            currency="NGN",
            status="active",
            updated_at=datetime.utcnow(),
            created_at=datetime.utcnow(),
        )
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    return wallet


def add_pending_balance(db: Session, worker_id: str, payment_id: str, amount: float):
    wallet = get_or_create_wallet(db, worker_id)

    existing_tx = (
        db.query(WalletTransaction)
        .filter(WalletTransaction.payment_id == payment_id)
        .filter(WalletTransaction.transaction_type == "pending_credit")
        .first()
    )

    if existing_tx:
        return wallet

    wallet.pending_balance += amount
    wallet.updated_at = datetime.utcnow()

    tx = WalletTransaction(
        id=str(uuid.uuid4()),
        wallet_id=wallet.id,
        worker_id=worker_id,
        payment_id=payment_id,
        transaction_type="pending_credit",
        amount=amount,
        status="success",
        description="Escrow amount held pending job completion",
        reference=payment_id,
        balance_after=wallet.pending_balance,
    )

    db.add(tx)
    db.commit()
    db.refresh(wallet)

    return wallet


def release_pending_balance(db: Session, worker_id: str, payment_id: str, amount: float):
    wallet = get_or_create_wallet(db, worker_id)

    existing_release = (
        db.query(WalletTransaction)
        .filter(WalletTransaction.payment_id == payment_id)
        .filter(WalletTransaction.transaction_type == "release_credit")
        .first()
    )

    if existing_release:
        return wallet

    wallet.pending_balance -= amount

    if wallet.pending_balance < 0:
        wallet.pending_balance = 0

    wallet.available_balance += amount
    wallet.total_earned += amount
    wallet.updated_at = datetime.utcnow()

    tx = WalletTransaction(
        id=str(uuid.uuid4()),
        wallet_id=wallet.id,
        worker_id=worker_id,
        payment_id=payment_id,
        transaction_type="release_credit",
        amount=amount,
        status="success",
        description="Escrow released to worker wallet",
        reference=payment_id,
        balance_after=wallet.available_balance,
    )

    db.add(tx)
    db.commit()
    db.refresh(wallet)

    return wallet


def get_wallet(db: Session, worker_id: str):
    return get_or_create_wallet(db, worker_id)


def get_wallet_transactions(db: Session, worker_id: str):
    return (
        db.query(WalletTransaction)
        .filter(WalletTransaction.worker_id == worker_id)
        .order_by(WalletTransaction.created_at.desc())
        .all()
    )