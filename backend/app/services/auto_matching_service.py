from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.worker import Worker
from app.models.service_category import ServiceCategory
from app.models.skill_assessment import SkillAssessment


def calculate_match_score(worker, skill):
    score = 0

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

    if skill:
        score += min(skill.assessment_score, 20)

    score += min(worker.completed_jobs, 10)

    return score


def auto_match_job(db: Session, job_id: str):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        return None

    job_category_id = str(job.category_id).strip()

    category = (
        db.query(ServiceCategory)
        .filter(ServiceCategory.id == job_category_id)
        .first()
    )

    if not category:
        return {
            "job_id": job.job_id,
            "job_category_id": job_category_id,
            "message": "Category not found",
            "matches": []
        }

    print("========== AUTO MATCH DEBUG ==========")
    print("JOB ID:", job.id)
    print("JOB CATEGORY ID:", job.category_id)
    print("CATEGORY NAME:", category.name)
    print("JOB CITY:", job.city)

    workers = (
        db.query(Worker)
        .filter(Worker.profession == category.name)
        .filter(Worker.city == job.city)
        .filter(Worker.availability_status == "online")
        .filter(Worker.verification_status == "approved")
        .all()
    )

    print("MATCHED WORKERS:", len(workers))

    results = []

    for worker in workers:
        print(
            "WORKER:",
            worker.id,
            worker.profession,
            worker.city,
            worker.availability_status,
            worker.verification_status
        )

        skill = (
            db.query(SkillAssessment)
            .filter(SkillAssessment.worker_id == worker.id)
            .filter(SkillAssessment.category_id == job_category_id)
            .first()
        )

        score = calculate_match_score(worker, skill)

        results.append({
            "worker_id": worker.worker_id,
            "user_id": worker.user_id,
            "profession": worker.profession,
            "area": worker.area,
            "verification_level": worker.verification_level,
            "rating": worker.average_rating,
            "completed_jobs": worker.completed_jobs,
            "match_score": score
        })

    results = sorted(
        results,
        key=lambda item: item["match_score"],
        reverse=True
    )

    return {
        "job_id": job.job_id,
        "category_id": job_category_id,
        "category": category.name,
        "job_type": job.job_type,
        "location": {
            "state": job.state,
            "city": job.city,
            "area": job.area
        },
        "top_matches": results[:5]
    }