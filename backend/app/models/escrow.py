import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime
from app.core.database import Base


class Escrow(Base):
    __tablename__ = "escrow"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    job_id = Column(String)
    customer_id = Column(String)
    worker_id = Column(String)

    amount = Column(Float)

    platform_fee = Column(Float)

    worker_amount = Column(Float)

    customer_fee = Column(Float, default=0)

    worker_commission = Column(Float, default=0)

    customer_pays = Column(Float, default=0)

    status = Column(String, default="holding")
    # holding
    # released
    # refunded
    # disputed

    created_at = Column(DateTime, default=datetime.utcnow)

    released_at = Column(DateTime, nullable=True)
