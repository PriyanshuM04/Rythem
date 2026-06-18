from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    duration = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    artist_id = Column(Integer, ForeignKey("artist_profiles.id"), nullable=False)

    artist = relationship("ArtistProfile", back_populates="songs")
    playlists = relationship("Playlist", secondary="playlist_songs", back_populates="songs")