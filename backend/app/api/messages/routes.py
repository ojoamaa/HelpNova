from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.message import MessageCreate, MessageResponse
from app.services.message_service import (
    send_message,
    get_job_messages,
    get_user_messages,
    mark_message_read
)


router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)


@router.post("/", response_model=MessageResponse)
def create_message(
    message: MessageCreate,
    db: Session = Depends(get_db)
):
    return send_message(db, message)


@router.get("/job/{job_id}")
def list_job_messages(
    job_id: str,
    db: Session = Depends(get_db)
):
    return get_job_messages(db, job_id)


@router.get("/user/{user_id}")
def list_user_messages(
    user_id: str,
    db: Session = Depends(get_db)
):
    return get_user_messages(db, user_id)


@router.patch("/{message_id}/read")
def read_message(
    message_id: str,
    db: Session = Depends(get_db)
):
    message = mark_message_read(db, message_id)

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    return message
