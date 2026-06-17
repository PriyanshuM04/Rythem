from pydantic import BaseModel, ConfigDict
from schemas.song import SongResponse

class PlaylistCreate(BaseModel):
    name: str

class PlaylistResponse(BaseModel):
    id: int
    name: str
    owner_id: int
    songs: list[SongResponse]
    model_config = ConfigDict(from_attributes=True)