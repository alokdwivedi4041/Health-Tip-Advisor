from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.session import Session as ChatSession
from app.models.message import Message
from app.models.feedback import Feedback
from typing import List

from app.schemas.admin import AdminStats, TopicCount
from app.utils.dependencies import get_current_admin

router = APIRouter()


@router.get("/admin/stats", response_model=AdminStats)
def get_admin_stats(
    db: DBSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    total_users = db.query(func.count(User.id)).scalar()
    total_sessions = db.query(func.count(ChatSession.id)).scalar()
    total_messages = db.query(func.count(Message.id)).scalar()

    positive_feedback = (
        db.query(func.count(Feedback.id))
        .filter(Feedback.rating == 1)
        .scalar()
    )

    negative_feedback = (
        db.query(func.count(Feedback.id))
        .filter(Feedback.rating == -1)
        .scalar()
    )

    average_rating = db.query(func.avg(Feedback.rating)).scalar()

    return {
        "total_users": total_users,
        "total_sessions": total_sessions,
        "total_messages": total_messages,
        "positive_feedback": positive_feedback,
        "negative_feedback": negative_feedback,
        "average_rating": round(average_rating, 2)
        if average_rating is not None
        else None,
    }
@router.get("/admin/topics", response_model=List[TopicCount])
def get_common_topics(
    db: DBSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    results = (
        db.query(Message.content, func.count(Message.id).label("count"))
        .filter(Message.sender == "user")
        .group_by(Message.content)
        .order_by(func.count(Message.id).desc())
        .limit(10)
        .all()
    )

    return [{"topic": content, "count": count} for content, count in results]