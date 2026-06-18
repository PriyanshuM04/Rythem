from pydantic import BaseModel, ConfigDict

class ArtistProfileCreate(BaseModel):
    artist_name: str
    bio: str | None = None

class ArtistProfileResponse(BaseModel):
    id: int
    artist_name: str
    bio: str | None = None

    model_config = ConfigDict(from_attributes=True)