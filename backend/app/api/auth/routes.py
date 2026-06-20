from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.schemas.user import UserCreate
from app.schemas.user import UserResponse

from app.services.auth_service import create_user

from app.core.database import get_db

from fastapi import HTTPException

from app.schemas.user import UserLogin

from app.services.auth_service import authenticate_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.get("/")
def auth_home():
    return {
        "message": "HelpNova Authentication Module"
    }


@router.post(
    "/register",
    response_model=UserResponse
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    return {
    "id": user.id,
    "full_name": user.full_name,
    "phone": user.phone,
    "email": user.email,
    "role": user.role
}

@router.post("/login")
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    user = authenticate_user(
        db,
        credentials.phone,
        credentials.password
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    return {
    "message": "Login successful",
    "user": {
        "id": user.id,
        "full_name": user.full_name,
        "phone": user.phone,
        "email": user.email,
        "role": user.role
    }
}