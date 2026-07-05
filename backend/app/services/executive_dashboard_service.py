from sqlalchemy.orm import Session

from app.services.financial_intelligence_service import (
    finance_summary,
    revenue_stats,
    escrow_stats,
    withdrawal_stats,
    worker_payout_stats,
)

from app.services.job_operations_service import admin_job_summary
from app.services.live_operations_service import live_operations_snapshot
from app.services.customer_analytics_service import list_customer_analytics
from app.services.worker_performance_service import list_worker_performance


def calculate_business_health_score(data: dict):
    score = 100

    jobs = data["jobs"]
    live = data["live_operations"]
    withdrawals = data["finance"]["withdrawals"]
    escrow = data["finance"]["escrow"]

    if jobs.get("pending", 0) > 10:
        score -= 10

    if live["jobs"].get("urgent", 0) > 0:
        score -= 15

    if withdrawals.get("pending", 0) > 50000:
        score -= 10

    if escrow.get("holding", 0) > escrow.get("released", 0):
        score -= 10

    if score < 0:
        score = 0

    return score


def executive_dashboard(db: Session):
    finance = finance_summary(db)
    revenue = revenue_stats(db)
    escrow = escrow_stats(db)
    withdrawals = withdrawal_stats(db)
    worker_payouts = worker_payout_stats(db)
    jobs = admin_job_summary(db)
    live_operations = live_operations_snapshot(db)

    customers = list_customer_analytics(db)
    workers = list_worker_performance(db)

    dashboard = {
        "finance": finance,
        "revenue": revenue,
        "escrow": escrow,
        "withdrawals": withdrawals,
        "worker_payouts": worker_payouts,
        "jobs": jobs,
        "live_operations": live_operations,
        "customers": {
            "total_customers": len(customers),
            "records": customers,
        },
        "workers": {
            "total_workers": len(workers),
            "records": workers,
        },
    }

    dashboard["business_health_score"] = calculate_business_health_score(dashboard)

    return dashboard
