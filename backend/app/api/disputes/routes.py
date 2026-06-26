import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.models.dispute import Dispute

from app.schemas.dispute import (
    DisputeCreate,
    DisputeResolve,
    DisputeResponse
)

router = APIRouter(
    prefix="/disputes",
    tags=["Disputes"]
)


@router.post(
    "/",
    response_model=DisputeResponse
)
def create_dispute(
    dispute: DisputeCreate,
    db: Session = Depends(get_db)
):
    new_dispute = Dispute(
        id=str(uuid.uuid4()),
        job_id=dispute.job_id,
        customer_id=dispute.customer_id,
        title=dispute.title,
        description=dispute.description,
        status="open"
    )

    db.add(new_dispute)
    db.commit()
    db.refresh(new_dispute)

    return new_dispute


@router.get("/")
def list_disputes(
    db: Session = Depends(get_db)
):
    return db.query(Dispute).all()


@router.get("/job/{job_id}")
def get_job_disputes(
    job_id: str,
    db: Session = Depends(get_db)
):
    return (
        db.query(Dispute)
        .filter(Dispute.job_id == job_id)
        .all()
    )


@router.patch(
    "/{dispute_id}/resolve"
)
def resolve_dispute(
    dispute_id: str,
    payload: DisputeResolve,
    db: Session = Depends(get_db)
):
    dispute = (
        db.query(Dispute)
        .filter(Dispute.id == dispute_id)
        .first()
    )

    if not dispute:
        raise HTTPException(
            status_code=404,
            detail="Dispute not found"
        )

    dispute.status = "resolved"
    dispute.resolution = payload.resolution
    dispute.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(dispute)

    return dispute