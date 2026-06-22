from pydantic import BaseModel
from typing import Optional


class PaymentCreate(BaseModel):
    job_id: str
    customer_id: str
    worker_id: Optional[str] = None
    amount: float


class PaymentResponse(BaseModel):
    payment_id: str
    job_id: str
    customer_id: str
    worker_id: Optional[str]
    amount: float
    platform_fee: float
    worker_amount: float
    status: str
    payment_reference: str

    class Config:
        from_attributes = True
