from pydantic import BaseModel
from datetime import datetime


class SessionResponse(BaseModel):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True