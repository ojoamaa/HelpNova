from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.ai_customer_trust_service import calculate_customer_trust

router = APIRouter(
    prefix="/admin/ai-customer-trust",
    tags=["Admin AI Customer Trust"],
)


@router.get("/{customer_id}")
def customer_trust_score(
    customer_id: str,
    db: Session = Depends(get_db),
):
    return {
        "success": True,
        "trust_report": calculate_customer_trust(db, customer_id)
    }
