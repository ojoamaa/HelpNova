from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.notification import NotificationCreate
from app.services.notification_service import (
    create_notification,
    get_user_notifications,
    mark_notification_read,
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.post("/")
def send_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db)
):
    return create_notification(db, notification)


@router.get("/user/{user_id}")
def list_notifications(
    user_id: str,
    db: Session = Depends(get_db)
):
    return get_user_notifications(db, user_id)


@router.patch("/{notification_id}/read")
def read_notification(
    notification_id: str,
    db: Session = Depends(get_db)
):
    notification = mark_notification_read(
        db,
        notification_id
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {
        "notification_id": notification.id,
        "is_read": notification.is_read,
        "message": "Notification marked as read"
    }
