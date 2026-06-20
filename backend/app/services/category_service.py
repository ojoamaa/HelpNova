import uuid

from sqlalchemy.orm import Session

from app.models.service_category import ServiceCategory
from app.schemas.service_category import ServiceCategoryCreate


def create_category(
    db: Session,
    category_data: ServiceCategoryCreate
):
    category = ServiceCategory(
        id=str(uuid.uuid4()),
        name=category_data.name,
        description=category_data.description
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


def get_categories(db: Session):
    return db.query(ServiceCategory).all()

def seed_categories(db: Session):

    categories = [
        "Electrician",
        "Plumber",
        "Generator Technician",
        "Solar Installer",
        "AC Technician",
        "Carpenter",
        "Welder",
        "Painter",
        "POP Installer",
        "Mason",
        "Tiler",
        "Roofer",
        "Cleaner",
        "Laundry Services",
        "Fumigation",
        "Gardener",
        "Security Guard",
        "Driver",
        "Mechanic",
        "Vulcanizer",
        "Computer Repair",
        "Phone Repair",
        "CCTV Installer",
        "Internet Technician",
        "Home Appliance Repair",
        "Event Planner",
        "Caterer",
        "Photographer",
        "Videographer",
        "Health Care Assistant"
    ]

    for item in categories:

        exists = (
            db.query(ServiceCategory)
            .filter(ServiceCategory.name == item)
            .first()
        )

        if not exists:

            category = ServiceCategory(
                id=str(uuid.uuid4()),
                name=item
            )

            db.add(category)

    db.commit()

    return {"message": "Categories seeded"}
