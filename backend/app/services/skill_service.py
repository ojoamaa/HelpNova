import uuid

from sqlalchemy.orm import Session

from app.models.skill_assessment import SkillAssessment
from app.schemas.skill_assessment import SkillAssessmentCreate


def create_skill_assessment(
    db: Session,
    skill_data: SkillAssessmentCreate
):
    skill = SkillAssessment(
        id=str(uuid.uuid4()),
        worker_id=skill_data.worker_id,
        category_id=skill_data.category_id,
        skill_level=skill_data.skill_level,
        assessment_score=skill_data.assessment_score,
        evidence_type=skill_data.evidence_type,
        evidence_note=skill_data.evidence_note
    )

    db.add(skill)
    db.commit()
    db.refresh(skill)

    return skill


def get_worker_skills(
    db: Session,
    worker_id: str
):
    return (
        db.query(SkillAssessment)
        .filter(SkillAssessment.worker_id == worker_id)
        .all()
    )
