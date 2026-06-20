from sqlalchemy import Column, String, Integer

from app.core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(String, primary_key=True)

    company_name = Column(String, nullable=False)
    rc_number = Column(String, nullable=True)

    company_address = Column(String, nullable=False)

    contact_person = Column(String, nullable=False)
    company_phone = Column(String, nullable=False)
    company_email = Column(String, nullable=True)

    service_category = Column(String, nullable=False)
    number_of_staff = Column(Integer, default=1)

    verification_status = Column(String, default="pending")
    verification_level = Column(String, default="bronze")
