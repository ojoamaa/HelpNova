from sqlalchemy import Column, String, Integer

from app.core.database import Base


class SkillAssessment(Base):
    __tablename__ = "skill_assessments"

    id = Column(String, primary_key=True)

    worker_id = Column(String, nullable=False)
    category_id = Column(String, nullable=False)

    skill_level = Column(String, default="basic")
    assessment_score = Column(Integer, default=0)

    evidence_type = Column(String, nullable=True)
    evidence_note = Column(String, nullable=True)

    status = Column(String, default="pending")
