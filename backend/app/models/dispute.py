import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Text

from app.core.database import Base


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    job_id = Column(String, nullable=False)

    customer_id = Column(String, nullable=False)

    worker_id = Column(String, nullable=False)

    reason = Column(String, nullable=False)

    description = Column(Text, nullable=True)

    status = Column(
        String,
        default="open"
    )

    resolution = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    resolved_at = Column(
        DateTime,
        nullable=True
    )