from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.job import Job
from app.models.worker import Worker


BASE_PRICES = {
    "plumber": 15000,
    "electrician": 18000,
    "cleaner": 10000,
    "carpenter": 16000,
    "painter": 14000,
    "technician": 20000,
}


def get_base_price(job_title: str):
    title = (job_title or "").lower()

    for key, price in BASE_PRICES.items():
        if key in title:
            return price

    return 12000


def urgency_multiplier(urgency: str):
    urgency = (urgency or "").lower()

    if urgency == "urgent":
        return 1.25

    if urgency == "emergency":
        return 1.5

    return 1.0


def time_multiplier():
    hour = datetime.utcnow().hour

    if hour >= 18 or hour <= 6:
        return 1.15

    return 1.0


def supply_demand_multiplier(db: Session):
    pending_jobs = db.query(func.count(Job.id)).filter(
        Job.status == "pending"
    ).scalar() or 0

    online_workers = db.query(func.count(Worker.id)).filter(
        Worker.availability_status == "online",
        Worker.verification_status == "approved"
    ).scalar() or 0

    if online_workers == 0:
        return 1.5

    ratio = pending_jobs / online_workers

    if ratio >= 5:
        return 1.35

    if ratio >= 3:
        return 1.2

    if ratio >= 1:
        return 1.1

    return 1.0


def generate_dynamic_price(db: Session, job_id: str):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        return None

    base_price = get_base_price(getattr(job, "title", ""))

    urgency_factor = urgency_multiplier(
        getattr(job, "urgency", "normal")
    )

    time_factor = time_multiplier()

    demand_factor = supply_demand_multiplier(db)

    recommended_price = round(
        base_price
        * urgency_factor
        * time_factor
        * demand_factor,
        2,
    )

    minimum_price = round(recommended_price * 0.85, 2)
    maximum_price = round(recommended_price * 1.25, 2)

    reasons = []

    if urgency_factor > 1:
        reasons.append("Urgency increased price")

    if time_factor > 1:
        reasons.append("After-hours pricing applied")

    if demand_factor > 1:
        reasons.append("Demand is higher than worker supply")

    if len(reasons) == 0:
        reasons.append("Normal demand and standard pricing applied")

    confidence = 85

    if demand_factor > 1.2:
        confidence += 5

    if urgency_factor > 1:
        confidence += 5

    if time_factor > 1:
        confidence += 3

    if confidence > 98:
        confidence = 98

    return {
        "job_id": job.id,
        "job_title": getattr(job, "title", ""),
        "base_price": base_price,
        "recommended_price": recommended_price,
        "minimum_price": minimum_price,
        "maximum_price": maximum_price,
        "currency": "NGN",
        "confidence": confidence,
        "pricing_factors": {
            "urgency_multiplier": urgency_factor,
            "time_multiplier": time_factor,
            "supply_demand_multiplier": demand_factor,
        },
        "reasons": reasons,
    }
