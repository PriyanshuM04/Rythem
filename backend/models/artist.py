from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class ArtistProfile(Base):
    __tablename__ = "artist_profiles"

    id = Column(Integer, primary_key=True, index=True)
    artist_name = Column(String, nullable=False)
    bio = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    user = relationship("User", back_populates="artist_profile")
    songs = relationship("Song", back_populates="artist")