import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean

from app.core.database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    job_id = Column(String, nullable=False)

    sender_id = Column(String, nullable=False)
    receiver_id = Column(String, nullable=False)

    message = Column(String, nullable=False)

    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
