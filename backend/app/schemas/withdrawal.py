from pydantic import BaseModel


class WithdrawalCreate(BaseModel):
    worker_id: str
    amount: float
    bank_name: str
    account_number: str
    account_name: str
