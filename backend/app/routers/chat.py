from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.user import User
from app.models.session import Session as ChatSession
from app.models.message import Message
from app.schemas.chat import ChatRequest, ChatResponse
from app.utils.dependencies import get_current_user
from app.services.ai_service import get_ai_response

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(
    chat_request: ChatRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat_session = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == chat_request.session_id,
            ChatSession.user_id == current_user.id
        )
        .first()
    )

    if not chat_session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not chat_request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    user_message = Message(
        session_id=chat_request.session_id,
        sender="user",
        content=chat_request.message,
    )

    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    past_messages = (
        db.query(Message)
        .filter(Message.session_id == chat_request.session_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    conversation_history = [
        {
            "role": "user" if m.sender == "user" else "assistant",
            "content": m.content
        }
        for m in past_messages[-10:]
    ]

    try:
        ai_reply = get_ai_response(conversation_history)
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI service error: {str(e)}"
        )

    ai_message = Message(
        session_id=chat_request.session_id,
        sender="ai",
        content=ai_reply,
    )

    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)

    return {
        "user_message": chat_request.message,
        "ai_response": ai_reply,
         "ai_message_id": ai_message.id,
    }