from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Worker(Base):
    __tablename__ = "workers"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True)

    profession = Column(String, nullable=False)
    years_experience = Column(Integer, default=0)

    state = Column(String, default="FCT")
    city = Column(String, default="Abuja")
    area = Column(String)

    verification_status = Column(String, default="pending")
    verification_level = Column(String, default="bronze")

    availability_status = Column(String, default="offline")

    average_rating = Column(Float, default=0.0)
    completed_jobs = Column(Integer, default=0)

    user = relationship("User")

    @property
    def worker_id(self):
        return self.id