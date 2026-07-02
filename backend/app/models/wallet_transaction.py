import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime
from app.core.database import Base


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    wallet_id = Column(String, nullable=False)

    transaction_type = Column(String)
    # credit
    # debit

    category = Column(String)
    # funding
    # job_payment
    # commission
    # withdrawal
    # refund

    amount = Column(Float)

    description = Column(String)

    reference = Column(String)

    status = Column(String, default="completed")

    created_at = Column(DateTime, default=datetime.utcnow)
