from sqlalchemy import Column, String, Boolean

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    profile_photo_url = Column(String, nullable=True)

    id = Column(String, primary_key=True)

    full_name = Column(String, nullable=False)

    phone = Column(
        String,
        unique=True,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=True
    )

    password_hash = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        default="customer"
    )

    is_active = Column(
        Boolean,
        default=True
    )