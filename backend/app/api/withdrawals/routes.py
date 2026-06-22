from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.withdrawal import WithdrawalCreate
from app.services.withdrawal_service import (
    create_withdrawal_request,
    approve_withdrawal,
    reject_withdrawal,
    list_withdrawals,
    list_worker_withdrawals,
)

router = APIRouter(
    prefix="/withdrawals",
    tags=["Withdrawals"]
)


@router.post("/request")
def request_withdrawal(
    data: WithdrawalCreate,
    db: Session = Depends(get_db)
):
    withdrawal = create_withdrawal_request(db, data)

    if withdrawal == "wallet_not_found":
        raise HTTPException(status_code=404, detail="Wallet not found")

    if withdrawal == "insufficient_balance":
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    return {
        "withdrawal_id": withdrawal.id,
        "worker_id": withdrawal.worker_id,
        "amount": withdrawal.amount,
        "status": withdrawal.status,
        "message": "Withdrawal request submitted"
    }


@router.patch("/{withdrawal_id}/approve")
def approve_request(
    withdrawal_id: str,
    db: Session = Depends(get_db)
):
    withdrawal = approve_withdrawal(db, withdrawal_id)

    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    if withdrawal == "already_processed":
        raise HTTPException(status_code=400, detail="Withdrawal already processed")

    return {
        "withdrawal_id": withdrawal.id,
        "status": withdrawal.status,
        "approved_at": withdrawal.approved_at,
        "message": "Withdrawal approved successfully"
    }


@router.patch("/{withdrawal_id}/reject")
def reject_request(
    withdrawal_id: str,
    db: Session = Depends(get_db)
):
    withdrawal = reject_withdrawal(db, withdrawal_id)

    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    if withdrawal == "already_processed":
        raise HTTPException(status_code=400, detail="Withdrawal already processed")

    return {
        "withdrawal_id": withdrawal.id,
        "status": withdrawal.status,
        "rejected_at": withdrawal.rejected_at,
        "message": "Withdrawal rejected and balance restored"
    }


@router.get("/")
def get_withdrawals(db: Session = Depends(get_db)):
    return list_withdrawals(db)


@router.get("/worker/{worker_id}")
def get_worker_withdrawals(
    worker_id: str,
    db: Session = Depends(get_db)
):
    return list_worker_withdrawals(db, worker_id)
