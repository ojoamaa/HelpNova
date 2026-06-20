from pydantic import BaseModel
from typing import Optional


class ServiceCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ServiceCategoryResponse(BaseModel):
    category_id: str
    name: str
    description: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True
