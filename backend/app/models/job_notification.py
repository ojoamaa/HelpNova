# app/models/job_notification.py

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.core.database import Base


class JobNotification(Base):
    __tablename__ = "job_notifications"

    id = Column(String, primary_key=True)
    job_id = Column(String, nullable=False)
    worker_id = Column(String, nullable=False)

    message = Column(String, nullable=False)

    status = Column(String, default="pending")
    sent_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)
