from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.payment import PaymentCreate
from app.services.payment_service import (
    create_payment_record,
    mark_payment_paid,
    release_worker_payment,
    get_all_payments,
    get_worker_earnings,
    get_admin_revenue,
)

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post("/initialize")
def initialize_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db)
):
    new_payment = create_payment_record(db, payment)

    return {
        "payment_id": new_payment.id,
        "job_id": new_payment.job_id,
        "amount": new_payment.amount,
        "platform_fee": new_payment.platform_fee,
        "worker_amount": new_payment.worker_amount,
        "status": new_payment.status,
        "payment_reference": new_payment.payment_reference,
        "message": "Payment initialized. Awaiting customer payment."
    }


@router.patch("/{payment_reference}/mark-paid")
def confirm_payment(
    payment_reference: str,
    db: Session = Depends(get_db)
):
    payment = mark_payment_paid(db, payment_reference)

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return {
        "payment_id": payment.id,
        "status": payment.status,
        "paid_at": payment.paid_at,
        "message": "Payment confirmed and held in escrow"
    }


@router.patch("/{payment_id}/release")
def release_payment(
    payment_id: str,
    db: Session = Depends(get_db)
):
    payment = release_worker_payment(db, payment_id)

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment == "not_paid":
        raise HTTPException(status_code=400, detail="Payment has not been paid yet")

    if payment == "already_released":
        raise HTTPException(status_code=400, detail="Payment has already been released")

    return {
        "payment_id": payment.id,
        "status": payment.status,
        "worker_amount": payment.worker_amount,
        "released_at": payment.released_at,
        "message": "Worker payment released successfully"
    }


@router.get("/")
def list_payments(db: Session = Depends(get_db)):
    return get_all_payments(db)


@router.get("/worker/{worker_id}/earnings")
def worker_earnings(
    worker_id: str,
    db: Session = Depends(get_db)
):
    return get_worker_earnings(db, worker_id)


@router.get("/admin/revenue")
def admin_revenue(db: Session = Depends(get_db)):
    return get_admin_revenue(db)