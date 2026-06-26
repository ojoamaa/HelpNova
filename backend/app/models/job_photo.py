from sqlalchemy import Column, String, DateTime
from datetime import datetime
import uuid

from app.core.database import Base


class JobPhoto(Base):
    __tablename__ = "job_photos"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    job_id = Column(String, nullable=False)

    photo_url = Column(String, nullable=False)

    photo_type = Column(String, nullable=False)

    uploaded_by = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )