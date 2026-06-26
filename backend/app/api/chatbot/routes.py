from fastapi import APIRouter
from pydantic import BaseModel

from app.services.chatbot_service import helpnova_chatbot_reply


router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)


class ChatbotRequest(BaseModel):
    message: str


@router.post("/")
def chat_with_bot(payload: ChatbotRequest):
    return helpnova_chatbot_reply(payload.message)
