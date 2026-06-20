import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime

from app.core.database import Base


class WorkerReview(Base):
    __tablename__ = "worker_reviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, nullable=False)
    assignment_id = Column(String, nullable=False)
    worker_id = Column(String, nullable=False)
    customer_id = Column(String, nullable=False)

    rating = Column(Integer, nullable=False)
    comment = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def review_id(self):
        return self.id
