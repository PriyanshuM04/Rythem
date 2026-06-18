from pydantic import BaseModel, ConfigDict
from datetime import datetime
from schemas.artist import ArtistProfileResponse

class SongCreate(BaseModel):
    title: str
    duration: int

class SongResponse(BaseModel):
    id: int
    title: str
    artist: ArtistProfileResponse
    duration: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)