from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class WorkerReviewCreate(BaseModel):
    assignment_id: str
    job_id: str
    worker_id: str
    customer_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class WorkerReviewResponse(BaseModel):
    review_id: str
    assignment_id: str
    job_id: str
    worker_id: str
    customer_id: str
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
