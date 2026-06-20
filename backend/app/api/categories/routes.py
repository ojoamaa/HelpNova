from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.service_category import (
    ServiceCategoryCreate,
    ServiceCategoryResponse
)
from app.services.category_service import (
    create_category,
    get_categories
)

from app.services.category_service import seed_categories

router = APIRouter(
    prefix="/categories",
    tags=["Service Categories"]
)


@router.post(
    "/",
    response_model=ServiceCategoryResponse
)
def add_category(
    category: ServiceCategoryCreate,
    db: Session = Depends(get_db)
):
    return create_category(db, category)


@router.get(
    "/",
    response_model=list[ServiceCategoryResponse]
)
def list_categories(
    db: Session = Depends(get_db)
):
    return get_categories(db)

@router.post("/seed")
def seed(db: Session = Depends(get_db)):
    return seed_categories(db)