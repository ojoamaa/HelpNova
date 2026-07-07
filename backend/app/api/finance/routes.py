from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.finance_service import FinanceService

router = APIRouter(tags=["Finance"])


@router.get("/summary")
def finance_summary(db: Session = Depends(get_db)):
    service = FinanceService(db)
    return service.get_finance_summary()


@router.get("/withdrawals")
def all_withdrawals(db: Session = Depends(get_db)):
    service = FinanceService(db)
    return service.get_all_withdrawals()


@router.get("/withdrawals/pending")
def pending_withdrawals(db: Session = Depends(get_db)):
    service = FinanceService(db)
    return service.get_pending_withdrawals()


@router.post("/withdrawals/{withdrawal_id}/approve")
def approve_withdrawal(withdrawal_id: str, db: Session = Depends(get_db)):
    service = FinanceService(db)
    result = service.approve_withdrawal(withdrawal_id)

    if result is None:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    if result == "invalid_status":
        raise HTTPException(status_code=400, detail="Only pending withdrawals can be approved")

    return {
        "message": "Withdrawal approved successfully",
        "withdrawal": result,
    }


@router.post("/withdrawals/{withdrawal_id}/reject")
def reject_withdrawal(withdrawal_id: str, db: Session = Depends(get_db)):
    service = FinanceService(db)
    result = service.reject_withdrawal(withdrawal_id)

    if result is None:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    if result == "invalid_status":
        raise HTTPException(status_code=400, detail="Only pending withdrawals can be rejected")

    return {
        "message": "Withdrawal rejected successfully",
        "withdrawal": result,
    }


@router.post("/withdrawals/{withdrawal_id}/paid")
def mark_withdrawal_paid(withdrawal_id: str, db: Session = Depends(get_db)):
    service = FinanceService(db)
    result = service.mark_withdrawal_paid(withdrawal_id)

    if result is None:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    if result == "not_approved":
        raise HTTPException(status_code=400, detail="Withdrawal must be approved before payment")

    if result == "wallet_not_found":
        raise HTTPException(status_code=404, detail="Worker wallet not found")

    if result == "insufficient_balance":
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    return {
        "message": "Withdrawal marked as paid successfully",
        "withdrawal": result,
    }