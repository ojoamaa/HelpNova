import uuid

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password

from app.core.security import verify_password
from app.models.user import User


def authenticate_user(
    db,
    phone: str,
    password: str
):
    user = (
        db.query(User)
        .filter(User.phone == phone)
        .first()
    )

    if not user:
        return None

    if not verify_password(
        password,
        user.password_hash
    ):
        return None

    return user

def create_user(
    db: Session,
    user_data: UserCreate
):
    user = User(
        id=str(uuid.uuid4()),
        full_name=user_data.full_name,
        phone=user_data.phone,
        email=user_data.email,
        password_hash=hash_password(
            user_data.password
        ),
        role=user_data.role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user