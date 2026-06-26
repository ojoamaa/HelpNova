from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    notification_type: Optional[str] = None
    reference_id: Optional[str] = None


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    notification_type: Optional[str]
    reference_id: Optional[str]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
