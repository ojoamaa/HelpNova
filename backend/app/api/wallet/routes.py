from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.wallet_service import (
    get_wallet,
    get_wallet_transactions
)

router = APIRouter(
    prefix="/wallet",
    tags=["Wallet"]
)


@router.get("/{worker_id}")
def view_wallet(
    worker_id: str,
    db: Session = Depends(get_db)
):
    return get_wallet(db, worker_id)


@router.get("/{worker_id}/transactions")
def view_wallet_transactions(
    worker_id: str,
    db: Session = Depends(get_db)
):
    return get_wallet_transactions(db, worker_id)
