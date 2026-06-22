import uuid
from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime

from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, nullable=False)
    customer_id = Column(String, nullable=False)
    worker_id = Column(String, nullable=True)

    amount = Column(Float, nullable=False)
    platform_fee = Column(Float, default=0)
    worker_amount = Column(Float, default=0)

    status = Column(String, default="pending")  # pending, paid, released, refunded
    payment_reference = Column(String, unique=True, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)
    released_at = Column(DateTime, nullable=True)
