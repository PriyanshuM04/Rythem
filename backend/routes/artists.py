from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from dependencies import get_db, get_current_user

router = APIRouter(prefix="/artists", tags=["Artists"])

@router.post("/profile", response_model=schemas.ArtistProfileResponse, status_code=201)
def create_artist_profile(artist: schemas.ArtistProfileCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    existing = db.query(models.ArtistProfile).filter(models.ArtistProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Artist profile already exists")
    new_artist = models.ArtistProfile(
        artist_name=artist.artist_name,
        bio=artist.bio,
        user_id=current_user.id
    )
    db.add(new_artist)
    db.commit()
    db.refresh(new_artist)
    return new_artist

@router.get("/{artist_id}", response_model=schemas.ArtistProfileResponse)
def view_artist_profile(artist_id: int, db: Session = Depends(get_db)):
    artist = db.query(models.ArtistProfile).filter(models.ArtistProfile.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return artist