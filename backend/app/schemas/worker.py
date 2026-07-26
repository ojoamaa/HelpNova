from pydantic import BaseModel
from typing import Optional


class WorkerCreate(BaseModel):
    user_id: str
    full_name: str
    profession: str
    years_experience: int = 0
    state: str = "FCT"
    city: str = "Abuja"
    area: str

    phone_number: Optional[str] = None
    profile_photo: Optional[str] = None
    address: Optional[str] = None
    national_id_number: Optional[str] = None
    nin: Optional[str] = None
    bvn: Optional[str] = None
    next_of_kin_name: Optional[str] = None
    next_of_kin_phone: Optional[str] = None


class WorkerResponse(BaseModel):
    worker_id: str
    user_id: str
    full_name: str | None = None
    profession: str
    years_experience: int
    state: str
    city: str
    area: str

    phone_number: Optional[str] = None
    profile_photo: Optional[str] = None
    address: Optional[str] = None
    national_id_number: Optional[str] = None
    nin: Optional[str] = None
    bvn: Optional[str] = None
    next_of_kin_name: Optional[str] = None
    next_of_kin_phone: Optional[str] = None

    verification_status: str
    verification_level: str
    verification_note: Optional[str] = None
    availability_status: str

    average_rating: float = 0
    completed_jobs: int = 0

    class Config:
        from_attributes = True

class WorkerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    profession: Optional[str] = None
    years_experience: Optional[int] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    national_id_number: Optional[str] = None
    nin: Optional[str] = None
    bvn: Optional[str] = None
    next_of_kin_name: Optional[str] = None
    next_of_kin_phone: Optional[str] = None


class WorkerProfileResponse(BaseModel):
    worker_id: str
    user_id: str
    full_name: str
    profession: str
    years_experience: int = 0
    phone_number: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    national_id_number: Optional[str] = None
    nin: Optional[str] = None
    bvn: Optional[str] = None
    next_of_kin_name: Optional[str] = None
    next_of_kin_phone: Optional[str] = None
    profile_photo: Optional[str] = None
    profile_photo_url: Optional[str] = None
    id_photo_url: Optional[str] = None
    verification_status: str
    verification_level: str
    guarantor_status: str
    availability_status: str
    average_rating: float = 0
    completed_jobs: int = 0
