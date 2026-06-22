from fastapi import FastAPI

from app.core.database import Base
from app.core.database import engine

from app.models import User

from app.api.auth.routes import router as auth_router

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

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HelpNova API",
    version="1.0.0"
)

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

@app.get("/")
def root():
    return {
        "message": "Welcome to HelpNova API"
    }