from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.guarantor import Guarantor
from app.models.worker import Worker
from app.schemas.guarantor import (
    GuarantorInvitationCreate,
    GuarantorPublicSubmission,
    GuarantorReviewRequest,
)

router = APIRouter(prefix="/guarantors", tags=["Guarantors"])


def serialize(record: Guarantor, public: bool = False):
    payload = {
        "id": record.id,
        "worker_id": record.worker_id,
        "token": record.token,
        "full_name": record.full_name,
        "phone": record.phone,
        "email": record.email,
        "relationship": record.relationship,
        "is_primary": record.is_primary,
        "status": record.status,
        "created_at": record.created_at.isoformat() if record.created_at else None,
        "submitted_at": record.submitted_at.isoformat() if record.submitted_at else None,
        "reviewed_at": record.reviewed_at.isoformat() if record.reviewed_at else None,
    }
    if not public:
        payload.update({
            "date_of_birth": record.date_of_birth,
            "address": record.address,
            "occupation": record.occupation,
            "employer": record.employer,
            "work_address": record.work_address,
            "years_known": record.years_known,
            "id_type": record.id_type,
            "id_number": record.id_number,
            "id_document_name": record.id_document_name,
            "address_proof_name": record.address_proof_name,
            "declaration": record.declaration,
            "signature": record.signature,
            "review_note": record.review_note,
            "audit": record.audit(),
        })
    return payload


def sync_worker_guarantor_status(
    db: Session,
    worker_id: str,
):
    worker = (
        db.query(Worker)
        .filter(Worker.id == worker_id)
        .first()
    )

    if not worker:
        return None

    if not hasattr(worker, "guarantor_status"):
        return worker

    records = (
        db.query(Guarantor)
        .filter(Guarantor.worker_id == worker_id)
        .all()
    )

    primary_approved = any(
        str(record.status).lower() == "approved"
        and record.is_primary is True
        for record in records
    )

    statuses = {
        str(record.status).lower()
        for record in records
        if record.status
    }

    if primary_approved:
        worker.guarantor_status = "approved"
    elif "submitted" in statuses:
        worker.guarantor_status = "submitted"
    elif "correction_requested" in statuses:
        worker.guarantor_status = "correction_requested"
    elif records:
        worker.guarantor_status = "invitation_sent"
    else:
        worker.guarantor_status = "not_started"

    db.add(worker)

    return worker


@router.post("/invitations", status_code=status.HTTP_201_CREATED)
def create_invitation(payload: GuarantorInvitationCreate, db: Session = Depends(get_db)):
    if payload.is_primary:
        db.query(Guarantor).filter(
            Guarantor.worker_id == payload.worker_id,
            Guarantor.is_primary.is_(True),
        ).update({Guarantor.is_primary: False}, synchronize_session=False)

    record = Guarantor(**payload.model_dump())
    record.append_audit("invitation_sent")
    db.add(record)
    sync_worker_guarantor_status(db, payload.worker_id)
    db.commit()
    db.refresh(record)
    return serialize(record)


@router.get("/worker/{worker_id}")
def list_worker_guarantors(worker_id: str, db: Session = Depends(get_db)):
    records = (
        db.query(Guarantor)
        .filter(Guarantor.worker_id == worker_id)
        .order_by(Guarantor.created_at.desc())
        .all()
    )
    return [serialize(row) for row in records]


@router.get("/public/{token}")
def get_public_invitation(token: str, db: Session = Depends(get_db)):
    record = db.query(Guarantor).filter(Guarantor.token == token).first()
    if not record:
        raise HTTPException(status_code=404, detail="Guarantor invitation not found.")
    if record.status in {"approved", "rejected"}:
        raise HTTPException(status_code=409, detail="This guarantor invitation is already closed.")
    return serialize(record, public=True)


@router.post("/public/{token}/submit")
def submit_public_form(token: str, payload: GuarantorPublicSubmission, db: Session = Depends(get_db)):
    record = db.query(Guarantor).filter(Guarantor.token == token).first()
    if not record:
        raise HTTPException(status_code=404, detail="Guarantor invitation not found.")
    if record.status in {"approved", "rejected"}:
        raise HTTPException(status_code=409, detail="This guarantor invitation is already closed.")

    for key, value in payload.model_dump().items():
        setattr(record, key, value)
    record.status = "submitted"
    record.submitted_at = datetime.utcnow()
    record.review_note = None
    record.append_audit("submitted")
    sync_worker_guarantor_status(db, record.worker_id)
    db.commit()
    db.refresh(record)
    return serialize(record)


@router.get("")
def list_all_guarantors(db: Session = Depends(get_db)):
    records = db.query(Guarantor).order_by(Guarantor.created_at.desc()).all()
    return [serialize(row) for row in records]


@router.patch("/{guarantor_id}/review")
def review_guarantor(
    guarantor_id: str,
    payload: GuarantorReviewRequest,
    db: Session = Depends(get_db),
):
    record = (
        db.query(Guarantor)
        .filter(Guarantor.id == guarantor_id)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Guarantor record not found.",
        )

    if (
        payload.decision == "approved"
        and record.status != "submitted"
    ):
        raise HTTPException(
            status_code=409,
            detail="Only a submitted guarantor form can be approved.",
        )

    record.status = payload.decision
    record.review_note = payload.note.strip() or None
    record.reviewed_at = datetime.utcnow()
    record.append_audit(
        payload.decision,
        record.review_note,
    )

    # Write the guarantor's new decision into the current DB session
    # before recalculating the linked worker's guarantor status.
    db.flush()

    sync_worker_guarantor_status(
        db,
        record.worker_id,
    )

    db.commit()
    db.refresh(record)

    worker = (
        db.query(Worker)
        .filter(Worker.id == record.worker_id)
        .first()
    )

    return {
        **serialize(record),
        "worker_guarantor_status": (
            worker.guarantor_status
            if worker
            else None
        ),
    }