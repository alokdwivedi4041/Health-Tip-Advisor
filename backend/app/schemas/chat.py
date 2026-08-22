from pydantic import BaseModel


class ChatRequest(BaseModel):
    session_id: int
    message: str


class ChatResponse(BaseModel):
    user_message: str
    ai_response: str
    ai_message_id: int