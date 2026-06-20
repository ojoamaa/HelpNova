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

@app.get("/")
def root():
    return {
        "message": "Welcome to HelpNova API"
    }