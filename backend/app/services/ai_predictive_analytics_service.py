from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.job import Job
from app.models.worker import Worker
from app.models.payment import Payment
from app.models.escrow import Escrow


def get_ai_predictive_dashboard(db: Session):
    now = datetime.utcnow()
    last_7_days = now - timedelta(days=7)
    last_30_days = now - timedelta(days=30)

    jobs_7_days = db.query(func.count(Job.id)).filter(
        Job.created_at >= last_7_days
    ).scalar() or 0

    jobs_30_days = db.query(func.count(Job.id)).filter(
        Job.created_at >= last_30_days
    ).scalar() or 0

    completed_30_days = db.query(func.count(Job.id)).filter(
        Job.created_at >= last_30_days,
        Job.status == "completed"
    ).scalar() or 0

    cancelled_30_days = db.query(func.count(Job.id)).filter(
        Job.created_at >= last_30_days,
        Job.status == "cancelled"
    ).scalar() or 0

    online_workers = db.query(func.count(Worker.id)).filter(
        Worker.availability_status == "online",
        Worker.verification_status == "approved"
    ).scalar() or 0

    total_workers = db.query(func.count(Worker.id)).scalar() or 0

    revenue_30_days = db.query(
        func.coalesce(func.sum(Escrow.platform_fee), 0)
    ).filter(
        Escrow.status == "released",
        Escrow.released_at >= last_30_days
    ).scalar() or 0

    average_daily_jobs = round(jobs_30_days / 30, 2)
    average_daily_revenue = round(revenue_30_days / 30, 2)

    predicted_jobs_next_7_days = round(average_daily_jobs * 7, 2)
    predicted_revenue_next_7_days = round(average_daily_revenue * 7, 2)

    predicted_jobs_next_30_days = round(average_daily_jobs * 30, 2)
    predicted_revenue_next_30_days = round(average_daily_revenue * 30, 2)

    completion_rate = 0
    cancellation_rate = 0

    if jobs_30_days > 0:
        completion_rate = round((completed_30_days / jobs_30_days) * 100, 2)
        cancellation_rate = round((cancelled_30_days / jobs_30_days) * 100, 2)

    worker_supply_risk = "LOW"

    if online_workers < 3:
        worker_supply_risk = "HIGH"
    elif online_workers < 10:
        worker_supply_risk = "MEDIUM"

    recommendations = []

    if worker_supply_risk == "HIGH":
        recommendations.append(
            "Online worker supply is low. Encourage approved workers to come online."
        )

    if cancellation_rate >= 20:
        recommendations.append(
            "Cancellation rate is high. Review job quality, pricing, and worker assignment."
        )

    if completion_rate < 60 and jobs_30_days > 0:
        recommendations.append(
            "Completion rate is below target. Improve dispatch and worker follow-up."
        )

    if predicted_jobs_next_7_days > jobs_7_days:
        recommendations.append(
            "Demand may increase soon. Prepare more workers for active service categories."
        )

    if not recommendations:
        recommendations.append(
            "Platform trend is stable. Continue monitoring demand, revenue, and worker supply."
        )

    return {
        "forecast": {
            "predicted_jobs_next_7_days": predicted_jobs_next_7_days,
            "predicted_jobs_next_30_days": predicted_jobs_next_30_days,
            "predicted_revenue_next_7_days": predicted_revenue_next_7_days,
            "predicted_revenue_next_30_days": predicted_revenue_next_30_days,
        },
        "trends": {
            "jobs_last_7_days": jobs_7_days,
            "jobs_last_30_days": jobs_30_days,
            "revenue_last_30_days": revenue_30_days,
            "average_daily_jobs": average_daily_jobs,
            "average_daily_revenue": average_daily_revenue,
        },
        "operations": {
            "completion_rate": completion_rate,
            "cancellation_rate": cancellation_rate,
            "completed_jobs_30_days": completed_30_days,
            "cancelled_jobs_30_days": cancelled_30_days,
        },
        "workforce": {
            "online_workers": online_workers,
            "total_workers": total_workers,
            "worker_supply_risk": worker_supply_risk,
        },
        "ai_recommendations": recommendations,
    }
