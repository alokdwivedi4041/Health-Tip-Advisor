from pydantic import BaseModel
from datetime import datetime


class FeedbackCreate(BaseModel):
    message_id: int
    rating: int  # 1 = thumbs up, -1 = thumbs down


class FeedbackResponse(BaseModel):
    id: int
    message_id: int
    rating: int
    created_at: datetime

    class Config:
        from_attributes = True