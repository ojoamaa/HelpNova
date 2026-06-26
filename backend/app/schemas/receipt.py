from pydantic import BaseModel
from datetime import datetime


class ReceiptCreate(BaseModel):
    payment_id: str
    job_id: str
    customer_id: str
    worker_id: str | None = None

    amount: float
    platform_fee: float
    worker_amount: float


class ReceiptResponse(BaseModel):
    id: str
    payment_id: str
    job_id: str
    customer_id: str
    worker_id: str | None = None

    receipt_number: str

    amount: float
    platform_fee: float
    worker_amount: float

    receipt_type: str
    status: str

    created_at: datetime

    class Config:
        from_attributes = True
