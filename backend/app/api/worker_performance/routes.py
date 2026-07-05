from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.worker_performance_service import (
    get_worker_performance,
    list_worker_performance,
)

router = APIRouter(
    prefix="/admin/workers/performance",
    tags=["Admin Worker Performance"]
)


@router.get("/")
def all_worker_performance(db: Session = Depends(get_db)):
    return {
        "success": True,
        "workers": list_worker_performance(db)
    }


@router.get("/{worker_id}")
def single_worker_performance(
    worker_id: str,
    db: Session = Depends(get_db)
):
    performance = get_worker_performance(db, worker_id)

    if not performance:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    return {
        "success": True,
        "performance": performance
    }
