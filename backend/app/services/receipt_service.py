import uuid

from sqlalchemy.orm import Session

from app.models.receipt import Receipt
from app.schemas.receipt import ReceiptCreate


def generate_receipt_number():
    return "HN-" + str(uuid.uuid4())[:8].upper()


def create_receipt(db: Session, receipt: ReceiptCreate):

    new_receipt = Receipt(
        payment_id=receipt.payment_id,
        job_id=receipt.job_id,
        customer_id=receipt.customer_id,
        worker_id=receipt.worker_id,
        receipt_number=generate_receipt_number(),
        amount=receipt.amount,
        platform_fee=receipt.platform_fee,
        worker_amount=receipt.worker_amount,
    )

    db.add(new_receipt)
    db.commit()
    db.refresh(new_receipt)

    return new_receipt


def get_receipts(db: Session):
    return db.query(Receipt).all()


def get_receipt(db: Session, receipt_id: str):
    return db.query(Receipt).filter(
        Receipt.id == receipt_id
    ).first()
