import uuid
from sqlalchemy.orm import Session

from app.models.worker import Worker
from app.schemas.worker import WorkerCreate


def create_worker_profile(db: Session, worker_data: WorkerCreate):
    existing_worker = (
        db.query(Worker)
        .filter(Worker.user_id == worker_data.user_id)
        .first()
    )

    if existing_worker:
        return existing_worker

    new_worker = Worker(
        id=str(uuid.uuid4()),
        user_id=worker_data.user_id,
        full_name=worker_data.full_name,
        profession=worker_data.profession,
        years_experience=worker_data.years_experience,
        state=worker_data.state,
        city=worker_data.city,
        area=worker_data.area,
        phone_number=worker_data.phone_number,
        profile_photo=worker_data.profile_photo,
        address=worker_data.address,
        national_id_number=worker_data.national_id_number,
        nin=worker_data.nin,
        bvn=worker_data.bvn,
        next_of_kin_name=worker_data.next_of_kin_name,
        next_of_kin_phone=worker_data.next_of_kin_phone,
        verification_status="pending",
        verification_level="bronze",
        availability_status="offline"
    )

    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)

    return new_worker

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
    verification_level: str,
    verification_note: str = None
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
    worker.verification_note = verification_note

    db.commit()
    db.refresh(worker)

    return worker

def get_workers_with_user_details(db: Session):
    workers = db.query(Worker).all()

    return [
        {
            "worker_id": worker.id,
            "user_id": worker.user_id,
            "profession": worker.profession,
            "state": worker.state,
            "city": worker.city,
            "area": worker.area,
            "phone_number": worker.phone_number,
            "verification_status": worker.verification_status,
            "verification_level": worker.verification_level,
            "availability_status": worker.availability_status,
            "average_rating": worker.average_rating,
            "completed_jobs": worker.completed_jobs,
        }
        for worker in workers
    ]