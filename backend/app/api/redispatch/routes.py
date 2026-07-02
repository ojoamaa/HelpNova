from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.redispatch_service import check_and_redispatch

router = APIRouter(prefix="/redispatch", tags=["Redispatch"])


@router.post("/check")
def check(payload: dict, db: Session = Depends(get_db)):
    return check_and_redispatch(
        db=db,
        job_id=payload["job_id"],
        timeout_minutes=payload.get("timeout_minutes", 2)
    )