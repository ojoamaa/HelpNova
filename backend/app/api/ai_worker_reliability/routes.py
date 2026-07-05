from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.ai_worker_reliability_service import calculate_worker_reliability

router = APIRouter(
    prefix="/admin/ai-worker-reliability",
    tags=["Admin AI Worker Reliability"],
)


@router.get("/{worker_id}")
def worker_reliability_score(
    worker_id: str,
    db: Session = Depends(get_db),
):
    result = calculate_worker_reliability(db, worker_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    return {
        "success": True,
        "reliability_report": result
    }
