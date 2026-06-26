from pydantic import BaseModel


class LocationUpdate(BaseModel):
    latitude: float
    longitude: float


class LocationResponse(BaseModel):
    worker_id: str
    latitude: float
    longitude: float
