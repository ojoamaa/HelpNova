from sqlalchemy.orm import Session

from app.services.executive_dashboard_service import executive_dashboard
from app.services.ai_predictive_analytics_service import get_ai_predictive_dashboard
from app.services.financial_intelligence_service import finance_summary
from app.services.live_operations_service import live_operations_snapshot
from app.services.ai_fraud_service import platform_fraud_overview


def ai_operations_answer(db: Session, question: str):
    q = (question or "").lower()

    if "revenue" in q or "money" in q or "income" in q:
        return {
            "topic": "finance",
            "answer": "Here is the current financial intelligence summary.",
            "data": finance_summary(db),
        }

    if "predict" in q or "forecast" in q or "tomorrow" in q or "demand" in q:
        return {
            "topic": "predictive_analytics",
            "answer": "Here is the latest predictive analytics dashboard.",
            "data": get_ai_predictive_dashboard(db),
        }

    if "fraud" in q or "risk" in q or "suspicious" in q:
        return {
            "topic": "fraud_detection",
            "answer": "Here is the current platform fraud risk overview.",
            "data": platform_fraud_overview(db),
        }

    if "live" in q or "online" in q or "worker" in q or "active job" in q:
        return {
           "topic": "live_operations",
           "answer": "Here is the current live operations snapshot.",
           "data": live_operations_snapshot(db),
      }

    if "dashboard" in q or "overview" in q or "business" in q:
        return {
            "topic": "executive_dashboard",
            "answer": "Here is the executive overview for HelpNova.",
            "data": executive_dashboard(db),
        }

    return {
        "topic": "general",
        "answer": (
            "I can help with revenue, predictive analytics, fraud risk, "
            "live operations, workers, jobs, and executive dashboard insights."
        ),
        "available_questions": [
            "What is our revenue summary?",
            "Predict job demand.",
            "Show platform fraud risk.",
            "Show live operations.",
            "Give executive dashboard overview.",
        ],
    }
