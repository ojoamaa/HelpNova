from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.finance_dashboard_service import (
    get_finance_dashboard,
    get_recent_finance_transactions,
)

router = APIRouter(
    prefix="/admin/finance",
    tags=["Admin Finance Dashboard"]
)


@router.get("/summary")
def finance_summary(db: Session = Depends(get_db)):
    return {
        "success": True,
        "dashboard": get_finance_dashboard(db)
    }


@router.get("/transactions")
def recent_transactions(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    return {
        "success": True,
        "transactions": get_recent_finance_transactions(db, limit)
    }
