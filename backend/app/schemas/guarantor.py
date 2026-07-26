from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class GuarantorInvitationCreate(BaseModel):
    worker_id: str = Field(min_length=1, max_length=100)
    full_name: str = Field(min_length=2, max_length=150)
    phone: str = Field(min_length=7, max_length=30)
    email: Optional[str] = Field(default=None, max_length=200)
    relationship: str = Field(min_length=2, max_length=100)
    is_primary: bool = False


class GuarantorPublicSubmission(BaseModel):
    date_of_birth: str = Field(min_length=4, max_length=30)
    address: str = Field(min_length=5, max_length=1000)
    occupation: str = Field(min_length=2, max_length=150)
    employer: Optional[str] = Field(default=None, max_length=200)
    work_address: Optional[str] = Field(default=None, max_length=1000)
    years_known: int = Field(ge=1, le=100)
    id_type: str = Field(min_length=2, max_length=100)
    id_number: str = Field(min_length=3, max_length=100)
    id_document_name: str = Field(min_length=1, max_length=255)
    address_proof_name: str = Field(min_length=1, max_length=255)
    declaration: bool
    signature: str = Field(min_length=2, max_length=150)

    @field_validator("declaration")
    @classmethod
    def declaration_must_be_true(cls, value: bool):
        if not value:
            raise ValueError("The guarantor declaration must be accepted.")
        return value


class GuarantorReviewRequest(BaseModel):
    decision: str
    note: str = Field(default="", max_length=2000)

    @field_validator("decision")
    @classmethod
    def validate_decision(cls, value: str):
        allowed = {"approved", "correction_requested", "rejected"}
        normalized = value.strip().lower()
        if normalized not in allowed:
            raise ValueError(f"Decision must be one of: {', '.join(sorted(allowed))}")
        return normalized


class GuarantorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    worker_id: str
    token: str
    full_name: str
    phone: str
    email: Optional[str]
    relationship: str
    is_primary: bool
    status: str
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    occupation: Optional[str] = None
    employer: Optional[str] = None
    work_address: Optional[str] = None
    years_known: Optional[int] = None
    id_type: Optional[str] = None
    id_number: Optional[str] = None
    id_document_name: Optional[str] = None
    address_proof_name: Optional[str] = None
    declaration: bool = False
    signature: Optional[str] = None
    review_note: Optional[str] = None
    created_at: datetime
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    audit: list[dict] = []
