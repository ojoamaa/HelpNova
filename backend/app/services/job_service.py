import uuid
from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.service_category import ServiceCategory


def get_category_id(db: Session, category_name: str):
    if not category_name:
        return None

    category_name = category_name.strip()

    category = (
        db.query(ServiceCategory)
        .filter(ServiceCategory.name.ilike(category_name))
        .first()
    )

    if category:
        return category.id

    category = (
        db.query(ServiceCategory)
        .filter(ServiceCategory.name.ilike(f"%{category_name}%"))
        .first()
    )

    if category:
        return category.id

    category = ServiceCategory(
        id=str(uuid.uuid4()),
        name=category_name,
        description=f"{category_name} services"
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category.id


def create_job(db, job):
    job_data = job.dict()

    new_job = Job(
        id=str(uuid.uuid4()),
        **job_data
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job


def create_job_from_ai(db, user_id: str, draft: dict):
    category_name = draft.get("suggested_category") or draft.get("service")

    if category_name and category_name.lower() in ["plumbing", "plumber"]:
        category_id = "4277932c-3333-41ef-93fb-0a33f27d0472"
    else:
        category_id = draft.get("category_id")

    job = Job(
        id=str(uuid.uuid4()),
        customer_id=user_id,
        category_id=category_id,
        title=draft.get("title"),
        description=draft.get("description"),
        urgency=draft.get("urgency"),
        state=draft.get("state", "FCT"),
        city=draft.get("city", "Abuja"),
        area=draft.get("customer location") or draft.get("customer_location"),
        status="pending",
        job_type=draft.get("job_type", "on_demand"),
        employment_type=draft.get("employment_type"),
        duration=draft.get("duration"),
        salary_range=draft.get("estimated_price"),
        work_schedule=draft.get("preferred time") or draft.get("preferred_time"),
        accommodation_required=draft.get("accommodation_required", "no"),
        feeding_included=draft.get("feeding_included", "no"),
        background_check_required=draft.get("background_check_required", "no"),
        customer_latitude=draft.get("customer_latitude"),
        customer_longitude=draft.get("customer_longitude"),
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


def get_jobs(db: Session):
    return db.query(Job).all()


def get_job_by_id(db: Session, job_id: str):
    return db.query(Job).filter(Job.id == job_id).first()

