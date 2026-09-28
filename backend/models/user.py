from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    # profile (filled in on the first-login "complete profile" page)
    avatar_url = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    country = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    account_type = Column(String, nullable=False, default="public")  # "public" | "private"
    profile_completed = Column(Boolean, nullable=False, default=False)
    privacy_policy_accepted_at = Column(DateTime, nullable=True)
    marketing_consent = Column(Boolean, nullable=False, default=False)

    playlists = relationship("Playlist", back_populates="owner")
    artist_profile = relationship("ArtistProfile", back_populates="user", uselist=False)