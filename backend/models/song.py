from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    album = Column(String, nullable=True)           # Placeholder
    duration_seconds = Column(Integer, nullable=False)
    thumbnail_url = Column(String, nullable=True)           # Placeholder
    audio_url = Column(String, nullable=True)               # Placeholder
    play_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now())
    artist_id = Column(Integer, ForeignKey("artist_profiles.id"), nullable=False)

    artist = relationship("ArtistProfile", back_populates="songs")
    playlists = relationship("Playlist", secondary="playlist_songs", back_populates="songs")

    @property
    def artists(self):
        return self.artist.artist_name if self.artist else None