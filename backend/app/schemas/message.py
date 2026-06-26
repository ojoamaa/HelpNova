from pydantic import BaseModel
from datetime import datetime


class MessageCreate(BaseModel):
    job_id: str
    sender_id: str
    receiver_id: str
    message: str


class MessageResponse(BaseModel):
    id: str
    job_id: str
    sender_id: str
    receiver_id: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
