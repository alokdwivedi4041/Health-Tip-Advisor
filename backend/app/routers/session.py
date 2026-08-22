from fastapi import HTTPException
from app.models.message import Message
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.session import Session as ChatSession
from app.schemas.session import SessionResponse
from app.schemas.message import MessageResponse
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.post("/session", response_model=SessionResponse)
def create_session(
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_session = ChatSession(user_id=current_user.id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


@router.get("/sessions", response_model=List[SessionResponse])
def get_sessions(
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
        .all()
    )
    return sessions

@router.get("/history/{session_id}", response_model=List[MessageResponse])
def get_history(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check that the session belongs to the current user
    chat_session = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id
        )
        .first()
    )

    if not chat_session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return messages