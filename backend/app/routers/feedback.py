from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.user import User
from app.models.message import Message
from app.models.session import Session as ChatSession
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(
    feedback_data: FeedbackCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if feedback_data.rating not in (1, -1):
        raise HTTPException(status_code=400, detail="Rating must be 1 or -1")

    message = (
        db.query(Message)
        .join(ChatSession, Message.session_id == ChatSession.id)
        .filter(
            Message.id == feedback_data.message_id,
            ChatSession.user_id == current_user.id
        )
        .first()
    )

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if message.sender != "ai":
        raise HTTPException(
            status_code=400,
            detail="Feedback can only be given on AI messages"
        )

    existing_feedback = (
        db.query(Feedback)
        .filter(Feedback.message_id == feedback_data.message_id)
        .first()
    )

    if existing_feedback:
        existing_feedback.rating = feedback_data.rating
        db.commit()
        db.refresh(existing_feedback)
        return existing_feedback

    new_feedback = Feedback(
        message_id=feedback_data.message_id,
        rating=feedback_data.rating,
    )

    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)

    return new_feedback