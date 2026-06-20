import uuid

from sqlalchemy.orm import Session

from app.models.company import Company
from app.schemas.company import CompanyCreate


def create_company(
    db: Session,
    company_data: CompanyCreate
):
    company = Company(
        id=str(uuid.uuid4()),
        company_name=company_data.company_name,
        rc_number=company_data.rc_number,
        company_address=company_data.company_address,
        contact_person=company_data.contact_person,
        company_phone=company_data.company_phone,
        company_email=company_data.company_email,
        service_category=company_data.service_category,
        number_of_staff=company_data.number_of_staff
    )

    db.add(company)
    db.commit()
    db.refresh(company)

    return company
