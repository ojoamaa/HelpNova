import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class JobReview(Base):
    __tablename__ = "job_reviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    customer_id = Column(String, ForeignKey("users.id"), nullable=False)
    worker_id = Column(String, ForeignKey("workers.id"), nullable=False)

    rating = Column(Integer, nullable=False)  # 1 to 5
    review = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job")
    customer = relationship("User")
    worker = relationship("Worker")
