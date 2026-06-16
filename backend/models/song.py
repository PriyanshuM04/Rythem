from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    artist = Column(String, nullable=False)
    duration = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    playlists = relationship("Playlist", secondary="playlist_songs", back_populates="songs")