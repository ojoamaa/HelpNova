from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.ai_pricing_service import generate_dynamic_price

router = APIRouter(
    prefix="/admin/ai-pricing",
    tags=["Admin AI Dynamic Pricing"],
)


@router.get("/{job_id}")
def ai_dynamic_pricing(
    job_id: str,
    db: Session = Depends(get_db),
):
    result = generate_dynamic_price(db, job_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return {
        "success": True,
        "pricing": result
    }
