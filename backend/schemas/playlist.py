from pydantic import BaseModel, ConfigDict
from schemas.song import SongResponse

class PlaylistCreate(BaseModel):
    name: str
    is_public: bool

class PlaylistUpdate(BaseModel):
    name: str | None = None
    cover_url: str | None = None
    is_public: bool | None = None

class PlaylistOwner(BaseModel):
    id: int
    username: str
    model_config = ConfigDict(from_attributes=True)

class PlaylistResponse(BaseModel):
    id: int
    name: str
    owner: PlaylistOwner
    is_public: bool
    cover_url: str | None = None
    song_count: int
    total_duration_seconds: int
    saves_count: int
    is_saved: bool
    songs: list[SongResponse]
    model_config = ConfigDict(from_attributes=True)

class PlaylistSummary(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class MyPlaylistsResponse(BaseModel):
    playlists: list[PlaylistSummary]

class SavedPlaylistsResponse(BaseModel):
    playlists: list[PlaylistSummary]

class AddSongToPlaylistRequest(BaseModel):
    song_id: int

class PlaylistSaveResponse(BaseModel):
    saved: bool