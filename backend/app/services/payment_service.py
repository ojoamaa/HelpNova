import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.payment import Payment
from app.models.job_assignment import JobAssignment
from app.models.receipt import Receipt
from app.services.wallet_service import release_pending_balance
from app.services.wallet_service import add_pending_balance, release_pending_balance
from app.services.pdf_receipt_service import generate_receipt_pdf

PLATFORM_FEE_PERCENT = 10


def create_payment_record(db: Session, payment_data):
    platform_fee = payment_data.amount * PLATFORM_FEE_PERCENT / 100
    worker_amount = payment_data.amount - platform_fee

    assignment = (
        db.query(JobAssignment)
        .filter(
            JobAssignment.job_id == payment_data.job_id,
            JobAssignment.status.in_(["accepted", "assigned", "completed"])
        )
        .first()
    )

    worker_id = payment_data.worker_id

    if not worker_id and assignment:
        worker_id = assignment.worker_id

    payment = Payment(
        job_id=payment_data.job_id,
        customer_id=payment_data.customer_id,
        worker_id=worker_id,
        amount=payment_data.amount,
        platform_fee=platform_fee,
        worker_amount=worker_amount,
        status="pending",
        payment_reference=f"HELPNOVA-{uuid.uuid4()}"
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment


def mark_payment_paid(db: Session, payment_reference: str):
    payment = (
        db.query(Payment)
        .filter(Payment.payment_reference == payment_reference)
        .first()
    )

    if not payment:
        return None

    payment.status = "paid"
    payment.paid_at = datetime.utcnow()

    if payment.worker_id:
       add_pending_balance(
        db=db,
        worker_id=payment.worker_id,
        payment_id=payment.id,
        amount=payment.worker_amount
    )

    receipt = (
        db.query(Receipt)
        .filter(Receipt.payment_id == payment.id)
        .first()
    )

    if not receipt:
        receipt = Receipt(
            payment_id=payment.id,
            job_id=payment.job_id,
            customer_id=payment.customer_id,
            worker_id=payment.worker_id,
            receipt_number=f"HN-{str(uuid.uuid4())[:8].upper()}",
            amount=payment.amount,
            platform_fee=payment.platform_fee,
            worker_amount=payment.worker_amount,
            receipt_type="customer_payment",
            status="generated",
        )

        db.add(receipt)
        db.flush()

    generate_receipt_pdf(receipt)

    db.commit()
    db.refresh(payment)

    return payment


def release_worker_payment(db: Session, payment_id: str):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()

    if not payment:
        return None

    if payment.status == "released":
        return "already_released"

    if payment.status != "paid":
        return "not_paid"

    if not payment.worker_id:
        assignment = (
            db.query(JobAssignment)
            .filter(
                JobAssignment.job_id == payment.job_id,
                JobAssignment.status.in_(["accepted", "assigned", "completed"])
            )
            .first()
        )

        if not assignment or not assignment.worker_id:
            return "worker_not_found"

        payment.worker_id = assignment.worker_id

    payment.status = "released"
    payment.released_at = datetime.utcnow()

    release_pending_balance(
        db=db,
        worker_id=payment.worker_id,
        payment_id=payment.id,
        amount=payment.worker_amount
    )

    db.commit()
    db.refresh(payment)

    return payment


def get_all_payments(db: Session):
    return db.query(Payment).all()


def get_worker_earnings(db: Session, worker_id: str):
    payments = db.query(Payment).filter(Payment.worker_id == worker_id).all()

    return {
        "worker_id": worker_id,
        "total_payments": len(payments),
        "total_earned": sum(p.worker_amount for p in payments if p.status == "released"),
        "pending_payout": sum(p.worker_amount for p in payments if p.status == "paid")
    }


def get_admin_revenue(db: Session):
    payments = db.query(Payment).all()

    return {
        "total_transactions": len(payments),
        "total_revenue": sum(p.platform_fee for p in payments if p.status in ["paid", "released"]),
        "pending_payouts": sum(p.worker_amount for p in payments if p.status == "paid"),
        "released_payouts": sum(p.worker_amount for p in payments if p.status == "released")
    }