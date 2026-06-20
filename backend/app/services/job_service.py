import uuid

from sqlalchemy.orm import Session

from app.models.job import Job
from app.schemas.job import JobCreate


def create_job(
    db: Session,
    job_data: JobCreate
):
    job = Job(
        id=str(uuid.uuid4()),
        customer_id=job_data.customer_id,
        category_id=job_data.category_id,
        title=job_data.title,
        description=job_data.description,
        urgency=job_data.urgency,
        state=job_data.state,
        city=job_data.city,
        area=job_data.area,

        job_type=job_data.job_type,
employment_type=job_data.employment_type,
duration=job_data.duration,
salary_range=job_data.salary_range,
work_schedule=job_data.work_schedule,
accommodation_required=job_data.accommodation_required,
feeding_included=job_data.feeding_included,
background_check_required=job_data.background_check_required
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


def get_jobs(db: Session):
    return db.query(Job).all()


def get_job_by_id(
    db: Session,
    job_id: str
):
    return (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )
