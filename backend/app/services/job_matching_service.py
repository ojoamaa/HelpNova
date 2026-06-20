from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.worker import Worker
from app.models.company import Company
from app.models.service_category import ServiceCategory


def find_matching_workers(
    db: Session,
    job_id: str
):
    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        return None

    job_category_id = str(job.category_id).strip()

category = (
    db.query(ServiceCategory)
    .filter(ServiceCategory.id == job_category_id)
    .first()
)

if not category:
    category = (
        db.query(ServiceCategory)
        .filter(ServiceCategory.name == job_category_id)
        .first()
    )

if not category:
    return {
        "job_id": job.id,
        "job_category_id": job.category_id,
        "message": "Category not found",
        "matches": []
    }

    workers = (
        db.query(Worker)
        .filter(Worker.profession == category.name)
        .filter(Worker.city == job.city)
        .filter(Worker.availability_status == "online")
        .filter(Worker.verification_status == "approved")
        .all()
    )

    companies = (
        db.query(Company)
        .filter(Company.service_category == category.name)
        .filter(Company.verification_status == "approved")
        .all()
    )

    return {
        "job_id": job.id,
        "category": category.name,
        "location": {
            "state": job.state,
            "city": job.city,
            "area": job.area
        },
        "matched_workers": [
            {
                "worker_id": worker.id,
                "user_id": worker.user_id,
                "profession": worker.profession,
                "area": worker.area,
                "verification_level": worker.verification_level,
                "average_rating": worker.average_rating,
                "completed_jobs": worker.completed_jobs
            }
            for worker in workers
        ],
        "matched_companies": [
            {
                "company_id": company.id,
                "company_name": company.company_name,
                "service_category": company.service_category,
                "number_of_staff": company.number_of_staff,
                "verification_level": company.verification_level
            }
            for company in companies
        ]
    }
