from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.services.ai_fraud_service import (
    customer_fraud_check,
    worker_fraud_check,
    payment_fraud_check,
    platform_fraud_overview,
)

router = APIRouter(
    prefix="/admin/ai-fraud",
    tags=["Admin AI Fraud Detection"],
)

@router.get("/customer/{customer_id}")
def customer_fraud(
    customer_id: str,
    db: Session = Depends(get_db),
):
    result = customer_fraud_check(db, customer_id)

    return {
        "success": True,
        "fraud_report": result,
    }

@router.get("/worker/{worker_id}")
def worker_fraud(
    worker_id: str,
    db: Session = Depends(get_db),
):
    result = worker_fraud_check(db, worker_id)

    return {
        "success": True,
        "fraud_report": result,
    }

@router.get("/payment/{payment_id}")
def payment_fraud(
    payment_id: str,
    db: Session = Depends(get_db),
):
    result = payment_fraud_check(db, payment_id)

    return {
        "success": True,
        "fraud_report": result,
    }

@router.get("/platform")
def platform_fraud(
    db: Session = Depends(get_db),
):
    result = platform_fraud_overview(db)

    return {
        "success": True,
        "fraud_report": result,
    }


