from sqlalchemy.orm import Session

from app.models.worker_location import WorkerLocation


def update_location(
    db: Session,
    worker_id: str,
    latitude: float,
    longitude: float
):
    location = (
        db.query(WorkerLocation)
        .filter(WorkerLocation.worker_id == worker_id)
        .first()
    )

    if location:
        location.latitude = latitude
        location.longitude = longitude

    else:
        location = WorkerLocation(
            worker_id=worker_id,
            latitude=latitude,
            longitude=longitude
        )
        db.add(location)

    db.commit()
    db.refresh(location)

    return location
