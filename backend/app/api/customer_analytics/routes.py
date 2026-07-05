from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.customer_analytics_service import (
    get_customer_analytics,
    list_customer_analytics,
)

router = APIRouter(
    prefix="/admin/customers/analytics",
    tags=["Admin Customer Analytics"]
)


@router.get("/")
def all_customer_analytics(
    db: Session = Depends(get_db)
):
    customers = list_customer_analytics(db)

    return {
        "success": True,
        "total_customers": len(customers),
        "customers": customers
    }


@router.get("/{customer_id}")
def single_customer_analytics(
    customer_id: str,
    db: Session = Depends(get_db)
):
    analytics = get_customer_analytics(db, customer_id)

    if analytics is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return {
        "success": True,
        "analytics": analytics
    }


@router.get("/summary/dashboard")
def customer_dashboard_summary(
    db: Session = Depends(get_db)
):
    customers = list_customer_analytics(db)

    total_customers = len(customers)

    total_jobs = 0
    completed_jobs = 0
    active_jobs = 0
    cancelled_jobs = 0
    total_spent = 0

    for customer in customers:

        total_jobs += customer["jobs"]["total_requested"]
        completed_jobs += customer["jobs"]["completed"]
        active_jobs += customer["jobs"]["active"]
        cancelled_jobs += customer["jobs"]["cancelled"]

        total_spent += customer["spending"]["total_spent"]

    return {
        "success": True,
        "dashboard": {
            "customers": total_customers,
            "jobs": {
                "total_requested": total_jobs,
                "completed": completed_jobs,
                "active": active_jobs,
                "cancelled": cancelled_jobs
            },
            "revenue": {
                "customer_spending": total_spent
            }
        }
    }
