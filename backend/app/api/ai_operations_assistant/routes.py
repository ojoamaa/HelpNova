from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.ai_operations_assistant_service import ai_operations_answer


class AssistantQuestion(BaseModel):
    question: str


router = APIRouter(
    prefix="/admin/ai-assistant",
    tags=["Admin AI Operations Assistant"],
)


@router.post("/ask")
def ask_ai_assistant(
    data: AssistantQuestion,
    db: Session = Depends(get_db),
):
    return {
        "success": True,
        "response": ai_operations_answer(db, data.question),
    }
