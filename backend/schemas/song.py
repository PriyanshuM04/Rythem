from pydantic import BaseModel, ConfigDict, field_serializer
from datetime import datetime

class SongCreate(BaseModel):
    title: str
    duration_seconds: int

class SongResponse(BaseModel):
    id: int
    title: str
    artists: str | None = None
    album: str | None = None
    play_count: int
    thumbnail_url: str | None = None
    duration_seconds: int
    audio_url: str | None = None

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("play_count")
    def serialize_play_count(self, value: int) -> str:
        return str(value)

class SongWithLastPlayed(SongResponse):
    last_played_at: datetime

class SongListResponse(BaseModel):
    songs: list[SongResponse]
    has_more: bool

class HistoryListResponse(BaseModel):
    songs: list[SongWithLastPlayed]
    has_more: bool

class LikeResponse(BaseModel):
    liked: bool

class LikedSongsResponse(BaseModel):
    songs: list[SongResponse]
    has_more: bool

class TagArtistsRequest(BaseModel):
    artist_ids: list[int]

class TagRespondRequest(BaseModel):
    status: str  # "accepted" or "declined"

class PendingTagResponse(BaseModel):
    tag_id: int
    song_id: int
    song_title: str
    uploader_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)