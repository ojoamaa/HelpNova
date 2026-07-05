from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.live_operations_service import (
    live_operations_snapshot,
    live_active_jobs,
    live_urgent_jobs,
    live_online_workers,
)

router = APIRouter(
    prefix="/admin/live-operations",
    tags=["Admin Live Operations"]
)


@router.get("/snapshot")
def operations_snapshot(db: Session = Depends(get_db)):
    return {
        "success": True,
        "snapshot": live_operations_snapshot(db)
    }


@router.get("/active-jobs")
def active_jobs(db: Session = Depends(get_db)):
    jobs = live_active_jobs(db)

    return {
        "success": True,
        "count": len(jobs),
        "jobs": jobs
    }


@router.get("/urgent-jobs")
def urgent_jobs(db: Session = Depends(get_db)):
    jobs = live_urgent_jobs(db)

    return {
        "success": True,
        "count": len(jobs),
        "jobs": jobs
    }


@router.get("/online-workers")
def online_workers(db: Session = Depends(get_db)):
    workers = live_online_workers(db)

    return {
        "success": True,
        "count": len(workers),
        "workers": workers
    }
