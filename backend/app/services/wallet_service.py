from sqlalchemy.orm import Session

from app.models.wallet import Wallet, WalletTransaction


def get_or_create_wallet(db: Session, worker_id: str):
    wallet = (
        db.query(Wallet)
        .filter(Wallet.worker_id == worker_id)
        .first()
    )

    if not wallet:
        wallet = Wallet(worker_id=worker_id)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    return wallet


def add_pending_balance(
    db: Session,
    worker_id: str,
    payment_id: str,
    amount: float
):
    wallet = get_or_create_wallet(db, worker_id)

    wallet.available_balance += amount
    wallet.total_earned += amount

    tx = WalletTransaction(
        wallet_id=wallet.id,
        worker_id=worker_id,
        payment_id=payment_id,
        transaction_type="pending_credit",
        amount=amount
    )

    db.add(tx)
    db.commit()

    return wallet


def release_pending_balance(
    db: Session,
    worker_id: str,
    payment_id: str,
    amount: float
):
    wallet = get_or_create_wallet(db, worker_id)

    wallet.available_balance += amount
    wallet.total_earned += amount

    tx = WalletTransaction(
        wallet_id=wallet.id,
        worker_id=worker_id,
        payment_id=payment_id,
        transaction_type="release_credit",
        amount=amount
    )

    db.add(tx)
    db.commit()
    db.refresh(wallet)

    return wallet


def get_wallet(db: Session, worker_id: str):
    return get_or_create_wallet(db, worker_id)


def get_wallet_transactions(
    db: Session,
    worker_id: str
):
    return (
        db.query(WalletTransaction)
        .filter(
            WalletTransaction.worker_id == worker_id
        )
        .order_by(
            WalletTransaction.created_at.desc()
        )
        .all()
    )
