from sqlalchemy.orm import Session
from app.models.job import Job


def list_all_jobs(db: Session):
    return db.query(Job).order_by(Job.created_at.desc()).all()


def get_jobs_by_status(db: Session, status: str):
    return (
        db.query(Job)
        .filter(Job.status == status)
        .order_by(Job.created_at.desc())
        .all()
    )


def get_single_job(db: Session, job_id: str):
    return db.query(Job).filter(Job.id == job_id).first()


def admin_job_summary(db: Session):
    jobs = db.query(Job).all()

    return {
        "total_jobs": len(jobs),
        "pending": len([j for j in jobs if j.status == "pending"]),
        "accepted": len([j for j in jobs if j.status == "accepted"]),
        "on_my_way": len([j for j in jobs if j.status == "on_my_way"]),
        "arrived": len([j for j in jobs if j.status == "arrived"]),
        "in_progress": len([j for j in jobs if j.status == "in_progress"]),
        "completed": len([j for j in jobs if j.status == "completed"]),
        "cancelled": len([j for j in jobs if j.status == "cancelled"]),
    }
