from sqlalchemy.orm import Session
from datetime import datetime

from app.models.message import Message


def send_message(db: Session, data):
    message = Message(
        job_id=data.job_id,
        sender_id=data.sender_id,
        receiver_id=data.receiver_id,
        message=data.message
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


def get_job_messages(db: Session, job_id: str):
    return (
        db.query(Message)
        .filter(Message.job_id == job_id)
        .order_by(Message.created_at.asc())
        .all()
    )


def get_user_messages(db: Session, user_id: str):
    return (
        db.query(Message)
        .filter(
            (Message.sender_id == user_id) |
            (Message.receiver_id == user_id)
        )
        .order_by(Message.created_at.desc())
        .all()
    )


def mark_message_read(db: Session, message_id: str):
    message = db.query(Message).filter(Message.id == message_id).first()

    if not message:
        return None

    message.is_read = True

    db.commit()
    db.refresh(message)

    return message
