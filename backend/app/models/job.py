from sqlalchemy import Column, String, DateTime
from datetime import datetime

from app.core.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True)

    @property
    def job_id(self):
        return self.id

    customer_id = Column(String, nullable=False)
    category_id = Column(String, nullable=False)

    title = Column(String, nullable=False)
    description = Column(String, nullable=True)

    urgency = Column(String, default="normal")

    state = Column(String, default="FCT")
    city = Column(String, default="Abuja")
    area = Column(String, nullable=False)

    status = Column(String, default="pending")

    job_type = Column(String, default="on_demand")

    employment_type = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    salary_range = Column(String, nullable=True)
    work_schedule = Column(String, nullable=True)

    accommodation_required = Column(String, default="no")
    feeding_included = Column(String, default="no")
    background_check_required = Column(String, default="no")

    created_at = Column(DateTime, default=datetime.utcnow)
   