from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.worker import Worker

router = APIRouter(
    prefix="/search",
    tags=["Worker Search"]
)


@router.get("/workers")
def search_workers(
    profession: str | None = None,
    state: str | None = None,
    city: str | None = None,
    area: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Worker).filter(
        Worker.verification_status == "approved",
        Worker.availability_status == "online"
    )

    if profession:
        query = query.filter(Worker.profession.ilike(f"%{profession}%"))

    if state:
        query = query.filter(Worker.state.ilike(f"%{state}%"))

    if city:
        query = query.filter(Worker.city.ilike(f"%{city}%"))

    if area:
        query = query.filter(Worker.area.ilike(f"%{area}%"))

    workers = query.all()

    return {
        "total_results": len(workers),
        "workers": [
            {
                "worker_id": worker.id,
                "user_id": worker.user_id,
                "full_name": worker.full_name,
                "profession": worker.profession,
                "state": worker.state,
                "city": worker.city,
                "area": worker.area,
                "phone_number": worker.phone_number,
                "verification_status": worker.verification_status,
                "verification_level": worker.verification_level,
                "availability_status": worker.availability_status,
                "average_rating": worker.average_rating,
                "completed_jobs": worker.completed_jobs
            }
            for worker in workers
        ]
    }
