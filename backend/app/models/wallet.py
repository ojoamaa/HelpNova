import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime

from app.core.database import Base


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    worker_id = Column(String, unique=True, nullable=False)

    available_balance = Column(Float, default=0)
    pending_balance = Column(Float, default=0)
    total_earned = Column(Float, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_id = Column(String, nullable=False)
    worker_id = Column(String, nullable=False)
    payment_id = Column(String, nullable=True)

    transaction_type = Column(String, nullable=False)  
    # pending_credit, release_credit, withdrawal, reversal

    amount = Column(Float, nullable=False)
    status = Column(String, default="success")

    created_at = Column(DateTime, default=datetime.utcnow)
