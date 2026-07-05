from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.executive_dashboard_service import (
    executive_dashboard,
)

router = APIRouter(
    prefix="/admin/executive",
    tags=["Admin Executive Dashboard"],
)


@router.get("/dashboard")
def get_executive_dashboard(
    db: Session = Depends(get_db),
):
    """
    Complete Executive Dashboard
    """

    return {
        "success": True,
        "dashboard": executive_dashboard(db),
    }


@router.get("/health")
def business_health(
    db: Session = Depends(get_db),
):
    dashboard = executive_dashboard(db)

    return {
        "success": True,
        "business_health_score": dashboard["business_health_score"]
    }


@router.get("/overview")
def executive_overview(
    db: Session = Depends(get_db),
):
    dashboard = executive_dashboard(db)

    return {
        "success": True,

        "jobs": dashboard["jobs"],

        "finance": {
            "platform_revenue":
                dashboard["finance"]["platform"]["total_revenue"],

            "wallet_balance":
                dashboard["finance"]["wallets"]["available_balance"],

            "escrow_holding":
                dashboard["finance"]["escrow"]["holding"],
        },

        "live_operations":
            dashboard["live_operations"],

        "business_health":
            dashboard["business_health_score"],
    }
