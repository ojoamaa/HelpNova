import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime
from app.core.database import Base


class Withdrawal(Base):
    __tablename__ = "withdrawals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    worker_id = Column(String, nullable=False)

    # NEW
    wallet_id = Column(String, nullable=False)

    amount = Column(Float, nullable=False)

    bank_name = Column(String, nullable=False)
    account_number = Column(String, nullable=False)
    account_name = Column(String, nullable=False)

    status = Column(String, default="pending")
    # pending, approved, rejected, paid, failed

    # NEW
    reference = Column(String, nullable=True)
    admin_note = Column(String, nullable=True)

    requested_at = Column(DateTime, default=datetime.utcnow)

    approved_by = Column(String, nullable=True)
    approved_at = Column(DateTime, nullable=True)

    rejected_by = Column(String, nullable=True)
    rejected_at = Column(DateTime, nullable=True)

    paid_by = Column(String, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    
    