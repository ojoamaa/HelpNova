from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.dashboard_service import get_worker_dashboard

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/worker/{worker_id}")
def worker_dashboard(
    worker_id: str,
    db: Session = Depends(get_db)
):
    dashboard = get_worker_dashboard(db, worker_id)

    if not dashboard:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    return dashboard
