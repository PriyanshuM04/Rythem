from sqlalchemy import Column, Integer, String, ForeignKey, Table, Boolean
from sqlalchemy.orm import relationship
from database import Base

playlist_songs = Table(
    "playlist_songs",
    Base.metadata,
    Column("playlist_id", Integer, ForeignKey("playlists.id"), primary_key=True),
    Column("song_id", Integer, ForeignKey("songs.id"), primary_key=True)
)

class Playlist(Base):
    __tablename__ = "playlists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_system = Column(Boolean, nullable=False, default=False)
    is_public = Column(Boolean, nullable=False, default=True)
    cover_url = Column(String, nullable=True)

    owner = relationship("User", back_populates="playlists")
    songs = relationship("Song", secondary=playlist_songs, back_populates="playlists")