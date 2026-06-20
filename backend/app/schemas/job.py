from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class JobCreate(BaseModel):
    customer_id: str
    category_id: str
    title: str
    description: Optional[str] = None
    urgency: str = "normal"
    state: str = "FCT"
    city: str = "Abuja"
    area: str
    job_type: str = "on_demand"

    employment_type: Optional[str] = None
    duration: Optional[str] = None
    salary_range: Optional[str] = None
    work_schedule: Optional[str] = None

    accommodation_required: str = "no"
    feeding_included: str = "no"
    background_check_required: str = "no"


class JobResponse(BaseModel):
    job_id: str
    customer_id: str
    category_id: str
    title: str
    description: Optional[str]
    urgency: str
    state: str
    city: str
    area: str
    status: str
    created_at: datetime
    job_type: str

    employment_type: Optional[str]
    duration: Optional[str]
    salary_range: Optional[str]
    work_schedule: Optional[str]

    accommodation_required: str
    feeding_included: str
    background_check_required: str

    class Config:
        from_attributes = True