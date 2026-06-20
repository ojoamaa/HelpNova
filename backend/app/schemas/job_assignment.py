from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class JobAssignmentCreate(BaseModel):
    job_id: str
    worker_id: Optional[str] = None
    company_id: Optional[str] = None
    assigned_to_type: str = "worker"


class JobAssignmentResponse(BaseModel):
    assignment_id: str
    job_id: str
    worker_id: Optional[str]
    company_id: Optional[str]
    assigned_to_type: str
    status: str
    assigned_at: datetime
    accepted_at: Optional[datetime]
    rejected_at: Optional[datetime]
    completed_at: Optional[datetime]

    # app/models/job_assignment.py
@property
def assignment_id(self):
    return self.id

    class Config:
        from_attributes = True
