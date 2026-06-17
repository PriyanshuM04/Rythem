from pydantic import BaseModel, ConfigDict
from datetime import datetime

class SongCreate(BaseModel):
    title: str
    artist: str
    duration: int

class SongResponse(BaseModel):
    id: int
    title: str
    artist: str
    duration: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)