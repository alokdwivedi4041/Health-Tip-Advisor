from pydantic import BaseModel
from typing import Optional


class AdminStats(BaseModel):
    total_users: int
    total_sessions: int
    total_messages: int
    positive_feedback: int
    negative_feedback: int
    average_rating: Optional[float]
class TopicCount(BaseModel):
    topic: str
    count: int