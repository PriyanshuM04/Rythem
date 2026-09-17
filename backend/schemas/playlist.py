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

class PlaylistSummary(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class MyPlaylistsResponse(BaseModel):
    playlists: list[PlaylistSummary]

class AddSongToPlaylistRequest(BaseModel):
    song_id: int

class PlaylistSaveResponse(BaseModel):
    saved: bool

class SavedPlaylistsResponse(BaseModel):
    playlists: list[PlaylistSummary]