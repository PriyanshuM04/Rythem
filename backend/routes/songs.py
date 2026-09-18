from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
import models, schemas
from dependencies import get_db, get_current_user
from models.listen_history import ListenHistory
from models.like import Like
from datetime import datetime

router = APIRouter(prefix="/songs", tags=["Songs"])

@router.post("/", response_model=schemas.SongResponse, status_code=201)
def upload_song(song: schemas.SongCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    artist_profile = db.query(models.ArtistProfile).filter(models.ArtistProfile.user_id == current_user.id).first()
    if not artist_profile:
        raise HTTPException(status_code=403, detail="You need an artist profile to upload songs")
    new_song = models.Song(
        title=song.title,
        duration_seconds=song.duration_seconds,
        artist_id=artist_profile.id,
    )
    db.add(new_song)
    db.commit()
    db.refresh(new_song)
    return new_song

@router.get("/trending", response_model=schemas.SongListResponse)
def get_trending_songs(offset: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    songs = (
        db.query(models.Song)
        .order_by(desc(models.Song.play_count))
        .offset(offset).limit(limit + 1).all()
    )
    has_more = len(songs) > limit
    return {"songs": songs[:limit], "has_more": has_more}

@router.get("/recent", response_model=list[schemas.SongWithLastPlayed])
def get_recent_songs(limit: int = 12, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    rows = (
        db.query(models.Song, ListenHistory.played_at)
        .join(ListenHistory, ListenHistory.song_id == models.Song.id)
        .filter(ListenHistory.user_id == current_user.id)
        .order_by(desc(ListenHistory.played_at))
        .limit(limit).all()
    )
    results = []
    for song, played_at in rows:
        base = schemas.SongResponse.model_validate(song).model_dump()
        results.append(schemas.SongWithLastPlayed(**base, last_played_at=played_at))
    return results

@router.get("/history", response_model=schemas.HistoryListResponse)
def get_song_history(offset: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    rows = (
        db.query(models.Song, ListenHistory.played_at)
        .join(ListenHistory, ListenHistory.song_id == models.Song.id)
        .filter(ListenHistory.user_id == current_user.id)
        .order_by(desc(ListenHistory.played_at))
        .offset(offset).limit(limit + 1).all()
    )
    has_more = len(rows) > limit
    rows = rows[:limit]
    songs = []
    for song, played_at in rows:
        base = schemas.SongResponse.model_validate(song).model_dump()
        songs.append(schemas.SongWithLastPlayed(**base, last_played_at=played_at))
    return {"songs": songs, "has_more": has_more}

@router.get("/liked", response_model=schemas.LikedSongsResponse)
def get_liked_songs(offset: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    songs = (
        db.query(models.Song)
        .join(Like, Like.song_id == models.Song.id)
        .filter(Like.user_id == current_user.id)
        .order_by(desc(Like.created_at))
        .offset(offset).limit(limit + 1).all()
    )
    has_more = len(songs) > limit
    return {"songs": songs[:limit], "has_more": has_more}

@router.post("/{song_id}/play", status_code=200)
def log_play(song_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    existing = db.query(ListenHistory).filter(
        ListenHistory.user_id == current_user.id,
        ListenHistory.song_id == song_id,
    ).first()

    if existing:
        # already played before — just bump the timestamp so it reorders to the top
        existing.played_at = datetime.utcnow()
    else:
        # first time this user has played this song — counts once, ever
        db.add(ListenHistory(user_id=current_user.id, song_id=song_id))
        song.play_count += 1

    db.commit()
    return {"message": "Play logged"}

@router.get("/{song_id}", response_model=schemas.SongResponse)
def get_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song

@router.post("/{song_id}/like", response_model=schemas.LikeResponse)
def toggle_like(song_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    existing = db.query(Like).filter(Like.user_id == current_user.id, Like.song_id == song_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"liked": False}
    db.add(Like(user_id=current_user.id, song_id=song_id))
    db.commit()
    return {"liked": True}