from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LiveJobQueueItem(BaseModel):
    id: str
    title: Optional[str] = None
    worker_id: Optional[str] = None
    worker_name: Optional[str] = None
    status: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    urgency: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
