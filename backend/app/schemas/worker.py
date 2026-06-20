from pydantic import BaseModel


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

    # app/models/worker.py
@property
def worker_id(self):
    return self.id

    class Config:
        from_attributes = True
