import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.job_assignment import JobAssignment
from app.models.job import Job
from app.models.worker import Worker
from app.models.service_category import ServiceCategory
from app.models.job_notification import JobNotification
from app.schemas.job_assignment import JobAssignmentCreate


def create_assignment(db: Session, assignment_data: JobAssignmentCreate):
    assignment = JobAssignment(
        id=str(uuid.uuid4()),
        job_id=assignment_data.job_id,
        worker_id=assignment_data.worker_id,
        company_id=assignment_data.company_id,
        assigned_to_type=assignment_data.assigned_to_type,
        status="pending"
    )

    db.add(assignment)

    job = db.query(Job).filter(Job.id == assignment_data.job_id).first()
    if job:
        job.status = "assigned"

    notification = JobNotification(
        id=str(uuid.uuid4()),
        job_id=assignment_data.job_id,
        worker_id=assignment_data.worker_id,
        message=f"You have a new {assignment_data.assigned_to_type} job request.",
        status="unread"
    )

    db.add(notification)
    db.commit()
    db.refresh(assignment)

    return assignment


def update_assignment_status(db: Session, assignment_id: str, status: str):
    assignment = (
        db.query(JobAssignment)
        .filter(JobAssignment.id == assignment_id)
        .first()
    )

    if not assignment:
        return None

    job = db.query(Job).filter(Job.id == assignment.job_id).first()

    assignment.status = status

    if status == "accepted":
        assignment.accepted_at = datetime.utcnow()

        if job:
            job.status = "in_progress"

    elif status == "rejected":
        assignment.rejected_at = datetime.utcnow()

        if job:
            category = (
                db.query(ServiceCategory)
                .filter(ServiceCategory.id == job.category_id)
                .first()
            )

            next_worker = None

            if category:
                next_worker = (
                    db.query(Worker)
                    .filter(Worker.profession == category.name)
                    .filter(Worker.availability_status == "online")
                    .filter(Worker.verification_status == "approved")
                    .filter(Worker.id != assignment.worker_id)
                    .filter(Worker.user_id != assignment.worker_id)
                    .order_by(
                          Worker.average_rating.desc(),
                          Worker.completed_jobs.desc()
                    )
                    .first()
            )

            if next_worker:
                new_assignment = JobAssignment(
                    id=str(uuid.uuid4()),
                    job_id=job.id,
                    worker_id=next_worker.id,
                    company_id=assignment.company_id,
                    assigned_to_type="worker",
                    status="pending"
                )

                db.add(new_assignment)

                notification = JobNotification(
                    id=str(uuid.uuid4()),
                    job_id=job.id,
                    worker_id=next_worker.id,
                    message="A new job has been assigned to you.",
                    status="unread"
                )

                db.add(notification)
                job.status = "assigned"
            else:
                job.status = "open"

    elif status == "completed":
        assignment.completed_at = datetime.utcnow()

        if job:
            job.status = "completed"

    db.commit()
    db.refresh(assignment)

    return assignment


def get_job_assignments(db: Session, job_id: str):
    return (
        db.query(JobAssignment)
        .filter(JobAssignment.job_id == job_id)
        .all()
    )