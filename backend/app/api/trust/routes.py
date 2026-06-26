from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.trust_service import calculate_worker_trust


router = APIRouter(
    prefix="/trust",
    tags=["Trust Engine"]
)


@router.get("/worker/{worker_id}")
def worker_trust_score(
    worker_id: str,
    db: Session = Depends(get_db)
):
    trust = calculate_worker_trust(db, worker_id)

    if not trust:
        raise HTTPException(status_code=404, detail="Worker not found")

    return trust
