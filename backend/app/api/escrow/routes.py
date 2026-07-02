from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.escrow_service import (
    create_escrow_for_job,
    release_escrow
)

router = APIRouter(
    prefix="/escrow",
    tags=["Escrow"]
)


@router.post("/create")
def create(payload: dict, db: Session = Depends(get_db)):
    return create_escrow_for_job(
        db=db,
        job_id=payload["job_id"],
        job_amount=payload["job_amount"]
    )


@router.post("/release")
def release(payload: dict, db: Session = Depends(get_db)):
    return release_escrow(
        db=db,
        escrow_id=payload["escrow_id"]
    )
