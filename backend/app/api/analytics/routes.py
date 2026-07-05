from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.analytics_service import (
    admin_dashboard,
    user_statistics,
    job_statistics,
    wallet_statistics,
    withdrawal_statistics,
    escrow_statistics,
    revenue_statistics,
)

router = APIRouter(
    prefix="/admin/analytics",
    tags=["Admin Analytics"]
)


@router.get("/dashboard")
def get_admin_dashboard(db: Session = Depends(get_db)):
    return {
        "success": True,
        "dashboard": admin_dashboard(db)
    }


@router.get("/users")
def get_user_stats(db: Session = Depends(get_db)):
    return {
        "success": True,
        "users": user_statistics(db)
    }


@router.get("/jobs")
def get_job_stats(db: Session = Depends(get_db)):
    return {
        "success": True,
        "jobs": job_statistics(db)
    }


@router.get("/wallet")
def get_wallet_stats(db: Session = Depends(get_db)):
    return {
        "success": True,
        "wallet": wallet_statistics(db)
    }


@router.get("/withdrawals")
def get_withdrawal_stats(db: Session = Depends(get_db)):
    return {
        "success": True,
        "withdrawals": withdrawal_statistics(db)
    }


@router.get("/escrow")
def get_escrow_stats(db: Session = Depends(get_db)):
    return {
        "success": True,
        "escrow": escrow_statistics(db)
    }

@router.get("/revenue")
def get_revenue_stats(db: Session = Depends(get_db)):
    return {
        "success": True,
        "revenue": revenue_statistics(db)
    }