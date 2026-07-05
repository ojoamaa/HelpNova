from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.job import Job
from app.models.escrow import Escrow


def get_customer_analytics(db: Session, customer_id: str):
    total_jobs = db.query(func.count(Job.id)).filter(
        Job.customer_id == customer_id
    ).scalar() or 0

    completed_jobs = db.query(func.count(Job.id)).filter(
        Job.customer_id == customer_id,
        Job.status == "completed"
    ).scalar() or 0

    active_jobs = db.query(func.count(Job.id)).filter(
        Job.customer_id == customer_id,
        Job.status.in_(["pending", "accepted", "on_my_way", "arrived", "in_progress"])
    ).scalar() or 0

    cancelled_jobs = db.query(func.count(Job.id)).filter(
        Job.customer_id == customer_id,
        Job.status == "cancelled"
    ).scalar() or 0

    total_spent = db.query(
        func.coalesce(func.sum(Escrow.customer_pays), 0)
    ).filter(
        Escrow.customer_id == customer_id,
        Escrow.status.in_(["holding", "released"])
    ).scalar()

    return {
        "customer_id": customer_id,
        "jobs": {
            "total_requested": total_jobs,
            "completed": completed_jobs,
            "active": active_jobs,
            "cancelled": cancelled_jobs,
        },
        "spending": {
            "total_spent": total_spent,
        }
    }


def list_customer_analytics(db: Session):
    customer_ids = (
        db.query(Job.customer_id)
        .filter(Job.customer_id.isnot(None))
        .distinct()
        .all()
    )

    return [
        get_customer_analytics(db, customer_id[0])
        for customer_id in customer_ids
    ]
