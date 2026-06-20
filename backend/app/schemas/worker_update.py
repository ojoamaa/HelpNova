from pydantic import BaseModel


class WorkerAvailabilityUpdate(BaseModel):
    availability_status: str


class WorkerVerificationUpdate(BaseModel):
    verification_status: str
    verification_level: str
