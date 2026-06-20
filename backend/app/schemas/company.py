from pydantic import BaseModel
from typing import Optional


class CompanyCreate(BaseModel):
    company_name: str
    rc_number: Optional[str] = None
    company_address: str
    contact_person: str
    company_phone: str
    company_email: Optional[str] = None
    service_category: str
    number_of_staff: int = 1


class CompanyResponse(BaseModel):
    id: str
    company_name: str
    rc_number: Optional[str]
    company_address: str
    contact_person: str
    company_phone: str
    company_email: Optional[str]
    service_category: str
    number_of_staff: int
    verification_status: str
    verification_level: str

    class Config:
        from_attributes = True
