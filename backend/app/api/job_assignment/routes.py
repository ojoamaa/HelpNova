from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.models.job_assignment import JobAssignment
from app.schemas.job_assignment import (
    JobAssignmentCreate,
    JobAssignmentResponse
)

from app.services.job_assignment_service import (
    create_assignment,
    update_assignment_status,
    get_job_assignments
)

router = APIRouter(
    prefix="/assignments",
    tags=["Job Assignments"]
)


@router.post(
    "/",
    response_model=JobAssignmentResponse
)
def assign_job(
    assignment: JobAssignmentCreate,
    db: Session = Depends(get_db)
):
    return create_assignment(
        db,
        assignment
    )


@router.patch("/{assignment_id}/accept")
def accept_assignment(
    assignment_id: str,
    db: Session = Depends(get_db)
):
    result = update_assignment_status(
        db,
        assignment_id,
        "accepted"
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    return result


@router.patch("/{assignment_id}/reject")
def reject_assignment(
    assignment_id: str,
    db: Session = Depends(get_db)
):
    result = update_assignment_status(
        db,
        assignment_id,
        "rejected"
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    return result


@router.patch("/{assignment_id}/complete")
def complete_assignment(
    assignment_id: str,
    db: Session = Depends(get_db)
):
    result = update_assignment_status(
        db,
        assignment_id,
        "completed"
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    return result


@router.get("/job/{job_id}")
def list_job_assignments(
    job_id: str,
    db: Session = Depends(get_db)
):
    return get_job_assignments(
        db,
        job_id
    )

@router.get("/")
def list_all_assignments(db: Session = Depends(get_db)):
    assignments = db.query(JobAssignment).all()

    return [
        {
            "assignment_id": a.id,
            "job_id": a.job_id,
            "worker_id": a.worker_id,
            "company_id": a.company_id,
            "assigned_to_type": a.assigned_to_type,
            "status": a.status,
            "assigned_at": a.assigned_at,
            "accepted_at": a.accepted_at,
            "rejected_at": a.rejected_at,
            "completed_at": a.completed_at,
        }
        for a in assignments
    ]