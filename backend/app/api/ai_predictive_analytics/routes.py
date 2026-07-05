from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.ai_predictive_analytics_service import (
    get_ai_predictive_dashboard,
)

router = APIRouter(
    prefix="/admin/ai-predictive-analytics",
    tags=["Admin AI Predictive Analytics"],
)


@router.get("/dashboard")
def predictive_dashboard(db: Session = Depends(get_db)):
    return {
        "success": True,
        "dashboard": get_ai_predictive_dashboard(db)
    }
