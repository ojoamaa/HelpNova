from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.skill_assessment import (
    SkillAssessmentCreate,
    SkillAssessmentResponse
)
from app.services.skill_service import (
    create_skill_assessment,
    get_worker_skills
)


router = APIRouter(
    prefix="/skills",
    tags=["Skill Verification"]
)


@router.post(
    "/assess",
    response_model=SkillAssessmentResponse
)
def assess_skill(
    skill: SkillAssessmentCreate,
    db: Session = Depends(get_db)
):
    return create_skill_assessment(db, skill)


@router.get(
    "/worker/{worker_id}",
    response_model=list[SkillAssessmentResponse]
)
def list_worker_skills(
    worker_id: str,
    db: Session = Depends(get_db)
):
    return get_worker_skills(db, worker_id)
