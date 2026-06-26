from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DisputeCreate(BaseModel):
    job_id: str
    customer_id: str
    worker_id: str
    reason: str
    description: str | None = None


class DisputeResolve(BaseModel):
    resolution: str


class DisputeResponse(BaseModel):
    id: str
    job_id: str
    customer_id: str
    worker_id: str

    reason: str
    description: Optional[str] = None

    status: str
    resolution: Optional[str] = None

    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True