from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.worker_review import WorkerReviewCreate, WorkerReviewResponse
from app.services.review_service import create_worker_review, get_worker_reviews


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


@router.post("/worker", response_model=WorkerReviewResponse)
def review_worker(
    review: WorkerReviewCreate,
    db: Session = Depends(get_db)
):
    return create_worker_review(db, review)


@router.get("/worker/{worker_id}", response_model=list[WorkerReviewResponse])
def list_worker_reviews(
    worker_id: str,
    db: Session = Depends(get_db)
):
    return get_worker_reviews(db, worker_id)