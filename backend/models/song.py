from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    album = Column(String, nullable=True)
    duration_seconds = Column(Integer, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)
    play_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now())

    uploader_id = Column(Integer, ForeignKey("artist_profiles.id"), nullable=False)
    uploader = relationship("ArtistProfile", foreign_keys=[uploader_id], back_populates="uploaded_songs")

    tags = relationship("SongArtistTag", back_populates="song", cascade="all, delete-orphan")
    playlists = relationship("Playlist", secondary="playlist_songs", back_populates="songs")

    @property
    def artists(self) -> str:
        # Only the uploader + artists who've actually accepted are shown as credited.
        # Pending/declined tags never appear here.
        from models.song_artist_tag import TagStatus
        names = [self.uploader.artist_name] if self.uploader else []
        names += [
            t.artist.artist_name for t in self.tags
            if t.status == TagStatus.accepted and t.artist_id != self.uploader_id
        ]
        return ", ".join(names)