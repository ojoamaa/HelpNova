from fastapi import FastAPI

from app.core.database import Base
from app.core.database import engine

from app.models import User

from app.api.auth.routes import router as auth_router

from app.api.ai_recommendation.routes import (
    router as ai_recommendation_router,
)

from app.api.workers.routes import router as workers_router

from app.api.companies.routes import router as companies_router

from app.api.categories.routes import router as categories_router

from app.api.skills.routes import router as skills_router

from app.api.jobs.routes import router as jobs_router

from app.api.admin.routes import router as admin_router

from app.api.job_assignment.routes import router as matching_router

from app.api.job_assignment.routes import router as assignment_router

from app.api.auto_matching.routes import router as auto_matching_router

from app.api.reviews.routes import router as reviews_router

from app.api.payments.routes import router as payments_router

from app.models.payment import Payment

from app.models.wallet import Wallet, WalletTransaction

from app.api.wallet.routes import router as wallet_router

from app.api.withdrawals.routes import router as withdrawal_router
from app.models.withdrawal import Withdrawal

from app.api.dashboard.routes import router as dashboard_router

from app.api.search.routes import router as search_router

from app.models.job_notification import JobNotification

from app.api.job_notifications.routes import router as job_notification_router

from app.api.customer_tracking.routes import router as customer_tracking_router

from app.api.location.routes import router as location_router

from app.api.live_tracking.routes import router as live_tracking_router

from app.api.job_timeline.routes import router as job_timeline_router

Base.metadata.create_all(bind=engine)

from app.api.customer_history.routes import router as customer_history_router

from app.api.disputes.routes import router as disputes_router

from app.models.dispute import Dispute

from app.api.notifications.routes import router as notifications_router

from app.api.messages.routes import router as messages_router

from app.models.message import Message

from app.api.trust.routes import router as trust_router

from app.models.receipt import Receipt

from app.api.receipts.routes import router as receipts_router

from app.api.job_completion.routes import router as job_completion_router

from app.api.dashboard.routes import router as dashboard_router

from app.api.chatbot.routes import router as chatbot_router

from app.api.job_acceptance.routes import router as job_acceptance_router

from app.api.redispatch.routes import router as redispatch_router

from app.api.worker_dashboard.routes import router as worker_dashboard_router

from app.api.job_lifecycle.routes import router as job_lifecycle_router

from app.api.job_review.routes import router as job_review_router

from app.api.escrow.routes import router as escrow_router

from app.api.finance_dashboard.routes import router as finance_dashboard_router

from app.api.analytics.routes import router as analytics_router

from app.api.worker_performance.routes import router as worker_performance_router

from app.api.customer_analytics.routes import router as customer_analytics_router

from app.api.job_operations.routes import router as job_operations_router

from app.api.live_operations.routes import router as live_operations_router

from app.api.financial_intelligence.routes import (
    router as financial_intelligence_router,
)

from app.api.executive_dashboard.routes import (
    router as executive_dashboard_router,
)

from app.api.ai_operations_assistant.routes import (
    router as ai_operations_assistant_router,
)

app = FastAPI(
    title="HelpNova API",
    version="1.0.0"
)

from app.api.ai_pricing.routes import router as ai_pricing_router

from app.api.ai_fraud.routes import (
    router as ai_fraud_router,
)

from app.api.ai_customer_trust.routes import router as ai_customer_trust_router

from app.api.ai_worker_reliability.routes import router as ai_worker_reliability_router

from app.api.ai_predictive_analytics.routes import router as ai_predictive_analytics_router

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(workers_router)
app.include_router(companies_router)
app.include_router(categories_router)
app.include_router(jobs_router)
app.include_router(skills_router)
app.include_router(admin_router)
app.include_router(matching_router)
app.include_router(assignment_router)
app.include_router(auto_matching_router)
app.include_router(reviews_router)
app.include_router(payments_router)
app.include_router(wallet_router)
app.include_router(withdrawal_router)
app.include_router(dashboard_router)
app.include_router(search_router)
app.include_router(job_notification_router)
app.include_router(customer_tracking_router)
app.include_router(location_router)
app.include_router(live_tracking_router)
app.include_router(job_timeline_router)
app.include_router(customer_history_router)
app.include_router(disputes_router)
app.include_router(notifications_router)
app.include_router(messages_router)
app.include_router(trust_router)
app.include_router(receipts_router)
app.include_router(job_completion_router)
app.include_router(chatbot_router)
app.include_router(job_acceptance_router)
app.include_router(redispatch_router)
app.include_router(worker_dashboard_router)
app.include_router(job_lifecycle_router)
app.include_router(job_review_router)
app.include_router(escrow_router)
app.include_router(finance_dashboard_router)
app.include_router(analytics_router)
app.include_router(worker_performance_router)
app.include_router(customer_analytics_router)
app.include_router(job_operations_router)
app.include_router(live_operations_router)
app.include_router(financial_intelligence_router)
app.include_router(executive_dashboard_router)
app.include_router(ai_recommendation_router)
app.include_router(ai_pricing_router)
app.include_router(ai_fraud_router)
app.include_router(ai_customer_trust_router)
app.include_router(ai_worker_reliability_router)
app.include_router(ai_predictive_analytics_router)
app.include_router(ai_operations_assistant_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to HelpNova API"
    }