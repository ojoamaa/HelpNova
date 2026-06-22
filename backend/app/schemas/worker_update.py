from pydantic import BaseModel
from typing import Optional


class WorkerAvailabilityUpdate(BaseModel):
    availability_status: str


class WorkerVerificationUpdate(BaseModel):
    verification_status: str
    verification_level: str
    verification_note: Optional[str] = None