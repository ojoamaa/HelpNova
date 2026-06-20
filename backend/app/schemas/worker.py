from pydantic import BaseModel
from typing import Optional

class WorkerCreate(BaseModel):
    user_id: str
    profession: str
    years_experience: int = 0
    state: str = "FCT"
    city: str = "Abuja"
    area: str


class WorkerResponse(BaseModel):
    worker_id: str
    user_id: str
    profession: str
    years_experience: int
    state: str
    city: str
    area: str
    verification_status: str
    verification_level: str
    availability_status: str
    profile_photo_url: Optional[str] = None
id_photo_url: Optional[str] = None
average_rating: float = 0
total_reviews: int = 0
completed_jobs: int = 0

    # app/models/worker.py
@property
def worker_id(self):
    return self.id

    class Config:
        from_attributes = True
