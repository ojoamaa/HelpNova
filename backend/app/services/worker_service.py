import uuid

from sqlalchemy.orm import Session

from app.models.worker import Worker
from app.schemas.worker import WorkerCreate


def create_worker_profile(
    db: Session,
    worker_data: WorkerCreate
):
    worker = Worker(
        id=str(uuid.uuid4()),
        user_id=worker_data.user_id,
        profession=worker_data.profession,
        years_experience=worker_data.years_experience,
        state=worker_data.state,
        city=worker_data.city,
        area=worker_data.area
    )

    db.add(worker)
    db.commit()
    db.refresh(worker)

    return worker

def update_worker_availability(
    db: Session,
    worker_id: str,
    availability_status: str
):
    worker = (
        db.query(Worker)
        .filter(Worker.id == worker_id)
        .first()
    )

    if not worker:
        return None

    worker.availability_status = availability_status

    db.commit()
    db.refresh(worker)

    return worker


def update_worker_verification(
    db: Session,
    worker_id: str,
    verification_status: str,
    verification_level: str
):
    worker = (
        db.query(Worker)
        .filter(Worker.id == worker_id)
        .first()
    )

    if not worker:
        return None

    worker.verification_status = verification_status
    worker.verification_level = verification_level

    db.commit()
    db.refresh(worker)

    return worker