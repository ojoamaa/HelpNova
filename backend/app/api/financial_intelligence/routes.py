from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.financial_intelligence_service import (
    finance_summary,
    revenue_stats,
    escrow_stats,
    withdrawal_stats,
    worker_payout_stats,
)

router = APIRouter(
    prefix="/admin/financial-intelligence",
    tags=["Admin Financial Intelligence"],
)


@router.get("/summary")
def get_finance_summary(
    db: Session = Depends(get_db),
):
    return {
        "success": True,
        "summary": finance_summary(db),
    }


@router.get("/revenue")
def get_revenue(
    db: Session = Depends(get_db),
):
    return {
        "success": True,
        "revenue": revenue_stats(db),
    }


@router.get("/escrow")
def get_escrow(
    db: Session = Depends(get_db),
):
    return {
        "success": True,
        "escrow": escrow_stats(db),
    }


@router.get("/withdrawals")
def get_withdrawals(
    db: Session = Depends(get_db),
):
    return {
        "success": True,
        "withdrawals": withdrawal_stats(db),
    }


@router.get("/worker-payouts")
def get_worker_payouts(
    db: Session = Depends(get_db),
):
    return {
        "success": True,
        "worker_payouts": worker_payout_stats(db),
    }
