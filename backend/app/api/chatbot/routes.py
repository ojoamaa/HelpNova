from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.helpnova_ai.ai_engine import HelpNovaAIEngine

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)


class ChatRequest(BaseModel):
    message: str
    role: str = "customer"
    user_id: str | None = None
    worker_id: str | None = None
    job_id: str | None = None
    receipt_number: str | None = None


@router.post("/")
def chat_with_bot(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    engine = HelpNovaAIEngine()

    return engine.respond(
        message=request.message,
        role=request.role,
        user_id=request.user_id,
        worker_id=request.worker_id,
        job_id=request.job_id,
        receipt_number=request.receipt_number,
        db=db
    )