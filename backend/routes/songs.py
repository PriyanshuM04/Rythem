from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from dependencies import get_db, get_current_user

router = APIRouter(prefix="/songs", tags=["Songs"])

@router.post("/", response_model=schemas.SongResponse, status_code=201)
def upload_song(song: schemas.SongCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    artist_profile = db.query(models.ArtistProfile).filter(models.ArtistProfile.user_id == current_user.id).first()
    if not artist_profile:
        raise HTTPException(status_code=403, detail="You need an artist profile to upload songs")
    new_song = models.Song(title=song.title, duration=song.duration, artist_id=artist_profile.id)
    db.add(new_song)
    db.commit()
    db.refresh(new_song)
    return new_song

@router.get("/", response_model=list[schemas.SongResponse])
def get_all_songs(db: Session = Depends(get_db)):
    return db.query(models.Song).all()

@router.get("/{song_id}", response_model=schemas.SongResponse)
def get_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song