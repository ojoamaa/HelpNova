from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.worker import Worker
from app.models.service_category import ServiceCategory
from app.models.skill_assessment import SkillAssessment


def calculate_location_score(worker, job):
    score = 0

    if worker.state and job.state and worker.state.lower() == job.state.lower():
        score += 20

    if worker.city and job.city and worker.city.lower() == job.city.lower():
        score += 30

    if worker.area and job.area and worker.area.lower() == job.area.lower():
        score += 40

    return score


def calculate_match_score(worker, job, skill=None):
    score = 0

    score += calculate_location_score(worker, job)

    if worker.verification_status == "approved":
        score += 30

    if worker.availability_status == "online":
        score += 25

    if worker.verification_level == "silver":
        score += 10
    elif worker.verification_level == "gold":
        score += 20
    elif worker.verification_level == "platinum":
        score += 30

    if worker.average_rating:
        score += min(worker.average_rating * 5, 25)

    if worker.completed_jobs:
        score += min(worker.completed_jobs, 20)

    if skill:
        score += min(skill.assessment_score, 20)

    return score


def auto_match_job(db: Session, job_id: str):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        return {
            "message": "Job not found",
            "matches": []
        }

    category = (
        db.query(ServiceCategory)
        .filter(ServiceCategory.id == job.category_id)
        .first()
    )

    if not category:
        return {
            "job_id": job.id,
            "category_id": job.category_id,
            "message": "Category not found",
            "matches": []
        }

    workers = (
        db.query(Worker)
        .filter(Worker.profession == category.name)
        .filter(Worker.verification_status == "approved")
        .filter(Worker.availability_status == "online")
        .all()
    )

    results = []

    for worker in workers:
        skill = (
            db.query(SkillAssessment)
            .filter(SkillAssessment.worker_id == worker.id)
            .filter(SkillAssessment.category_id == job.category_id)
            .first()
        )

        location_score = calculate_location_score(worker, job)
        total_score = calculate_match_score(worker, job, skill)

        results.append({
            "worker_id": worker.id,
            "user_id": worker.user_id,
            "full_name": worker.full_name,
            "profession": worker.profession,
            "state": worker.state,
            "city": worker.city,
            "area": worker.area,
            "verification_status": worker.verification_status,
            "verification_level": worker.verification_level,
            "availability_status": worker.availability_status,
            "rating": worker.average_rating,
            "completed_jobs": worker.completed_jobs,
            "location_score": location_score,
            "match_score": total_score
        })

    results = sorted(
        results,
        key=lambda item: item["match_score"],
        reverse=True
    )

    return {
        "job_id": job.id,
        "category_id": job.category_id,
        "category": category.name,
        "job_type": job.job_type,
        "location": {
            "state": job.state,
            "city": job.city,
            "area": job.area
        },
        "total_matches": len(results),
        "top_match": results[0] if results else None,
        "top_matches": results[:5]
    }