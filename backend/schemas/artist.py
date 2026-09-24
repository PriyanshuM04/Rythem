from pydantic import BaseModel, ConfigDict
from schemas.song import SongResponse

class ArtistProfileCreate(BaseModel):
    artist_name: str
    bio: str | None = None

class ArtistProfileResponse(BaseModel):
    id: int
    artist_name: str
    bio: str | None = None
    follower_count: int
    is_following: bool
    top_songs: list[SongResponse]
    all_songs_playlist_id: int | None = None

    model_config = ConfigDict(from_attributes=True)

class FollowResponse(BaseModel):
    following: bool