import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class TagStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"

class SongArtistTag(Base):
    __tablename__ = "song_artist_tags"

    id = Column(Integer, primary_key=True, index=True)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    artist_id = Column(Integer, ForeignKey("artist_profiles.id"), nullable=False)
    status = Column(Enum(TagStatus), nullable=False, default=TagStatus.pending)
    created_at = Column(DateTime, server_default=func.now())
    responded_at = Column(DateTime, nullable=True)

    song = relationship("Song", back_populates="tags")
    artist = relationship("ArtistProfile", back_populates="song_tags")