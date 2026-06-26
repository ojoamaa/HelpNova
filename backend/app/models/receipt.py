import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime

from app.core.database import Base


class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    payment_id = Column(String, nullable=False)
    job_id = Column(String, nullable=False)
    customer_id = Column(String, nullable=False)
    worker_id = Column(String, nullable=True)

    receipt_number = Column(String, unique=True, nullable=False)

    amount = Column(Float, nullable=False)
    platform_fee = Column(Float, default=0)
    worker_amount = Column(Float, default=0)

    receipt_type = Column(String, default="customer_payment")
    status = Column(String, default="generated")

    created_at = Column(DateTime, default=datetime.utcnow)
