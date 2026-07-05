from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.ai_recommendation_service import recommend_workers

router = APIRouter(
    prefix="/admin/ai-recommendation",
    tags=["Admin AI Recommendation"],
)


@router.get("/{job_id}")
def ai_recommendation(
    job_id: str,
    db: Session = Depends(get_db),
):
    result = recommend_workers(db, job_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return {
        "success": True,
        "recommendation": result
    }
