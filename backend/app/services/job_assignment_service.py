import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.job_assignment import JobAssignment
from app.models.job import Job
from app.schemas.job_assignment import JobAssignmentCreate


def create_assignment(
    db: Session,
    assignment_data: JobAssignmentCreate
):
    assignment = JobAssignment(
        id=str(uuid.uuid4()),
        job_id=assignment_data.job_id,
        worker_id=assignment_data.worker_id,
        company_id=assignment_data.company_id,
        assigned_to_type=assignment_data.assigned_to_type
    )

    db.add(assignment)

    job = db.query(Job).filter(Job.id == assignment_data.job_id).first()

    if job:
        job.status = "assigned"

    db.commit()
    db.refresh(assignment)

    return assignment


def update_assignment_status(
    db: Session,
    assignment_id: str,
    status: str
):
    assignment = (
        db.query(JobAssignment)
        .filter(JobAssignment.id == assignment_id)
        .first()
    )

    if not assignment:
        return None

    assignment.status = status

    if status == "accepted":
        assignment.accepted_at = datetime.utcnow()

    if status == "rejected":
        assignment.rejected_at = datetime.utcnow()

    if status == "completed":
        assignment.completed_at = datetime.utcnow()

        job = db.query(Job).filter(Job.id == assignment.job_id).first()
        if job:
            job.status = "completed"

    db.commit()
    db.refresh(assignment)

    return assignment


def get_job_assignments(
    db: Session,
    job_id: str
):
    return (
        db.query(JobAssignment)
        .filter(JobAssignment.job_id == job_id)
        .all()
    )
