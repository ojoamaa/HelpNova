from sqlalchemy import Column, String, DateTime
from datetime import datetime

from app.core.database import Base


class JobAssignment(Base):
    __tablename__ = "job_assignments"

    id = Column(String, primary_key=True)

    job_id = Column(String, nullable=False)
    worker_id = Column(String, nullable=True)
    company_id = Column(String, nullable=True)

    assigned_to_type = Column(String, default="worker")

    status = Column(String, default="pending")

    assigned_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)
    rejected_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    @property
    def assignment_id(self):
        return self.id
