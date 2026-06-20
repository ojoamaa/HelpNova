from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    full_name: str
    phone: str
    email: Optional[str] = None
    password: str
    role: str = "customer"


class UserResponse(BaseModel):
    full_name: str
    phone: str
    email: Optional[str]
    role: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    phone: str
    password: str