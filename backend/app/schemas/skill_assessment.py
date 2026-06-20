from pydantic import BaseModel
from typing import Optional


class SkillAssessmentCreate(BaseModel):
    worker_id: str
    category_id: str
    skill_level: str = "basic"
    assessment_score: int = 0
    evidence_type: Optional[str] = None
    evidence_note: Optional[str] = None


class SkillAssessmentResponse(BaseModel):
    id: str
    worker_id: str
    category_id: str
    skill_level: str
    assessment_score: int
    evidence_type: Optional[str]
    evidence_note: Optional[str]
    status: str

    class Config:
        from_attributes = True
