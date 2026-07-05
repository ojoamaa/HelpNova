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
    mark_withdrawal_paid,
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

    if withdrawal == "below_minimum":
        raise HTTPException(status_code=400, detail="Minimum withdrawal amount is ₦1,000")

    if withdrawal == "insufficient_balance":
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    if withdrawal == "already_paid":
        raise HTTPException(
        status_code=400,
        detail="Withdrawal has already been paid"
    )

    return {
        "success": True,
        "message": "Withdrawal request submitted",
        "withdrawal": withdrawal
    }


@router.patch("/{withdrawal_id}/approve")
def approve_request(
    withdrawal_id: str,
    admin_note: str | None = None,
    db: Session = Depends(get_db)
):
    withdrawal = approve_withdrawal(db, withdrawal_id, admin_note)

    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    if withdrawal == "already_processed":
        raise HTTPException(status_code=400, detail="Withdrawal already processed")

    return {
        "success": True,
        "message": "Withdrawal approved successfully",
        "withdrawal": withdrawal
    }


@router.patch("/{withdrawal_id}/reject")
def reject_request(
    withdrawal_id: str,
    admin_note: str | None = None,
    db: Session = Depends(get_db)
):
    withdrawal = reject_withdrawal(db, withdrawal_id, admin_note)

    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    if withdrawal == "already_processed":
        raise HTTPException(status_code=400, detail="Withdrawal already processed")

    return {
        "success": True,
        "message": "Withdrawal rejected and balance restored",
        "withdrawal": withdrawal
    }


@router.patch("/{withdrawal_id}/mark-paid")
def mark_paid(
    withdrawal_id: str,
    db: Session = Depends(get_db)
):
    withdrawal = mark_withdrawal_paid(db, withdrawal_id)

    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    if withdrawal == "not_approved":
        raise HTTPException(
            status_code=400,
            detail="Withdrawal must be approved before marking as paid"
        )

    return {
        "success": True,
        "message": "Withdrawal marked as paid successfully",
        "withdrawal": withdrawal
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