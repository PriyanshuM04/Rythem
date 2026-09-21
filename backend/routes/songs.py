from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
import models, schemas
from dependencies import get_db, get_current_user
from models.listen_history import ListenHistory
from models.like import Like
from models.song_artist_tag import SongArtistTag, TagStatus

router = APIRouter(prefix="/songs", tags=["Songs"])

MAX_TAGGED_ARTISTS = 5

@router.post("/", response_model=schemas.SongResponse, status_code=201)
def upload_song(song: schemas.SongCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    artist_profile = db.query(models.ArtistProfile).filter(models.ArtistProfile.user_id == current_user.id).first()
    if not artist_profile:
        raise HTTPException(status_code=403, detail="You need an artist profile to upload songs")

    new_song = models.Song(
        title=song.title,
        duration_seconds=song.duration_seconds,
        uploader_id=artist_profile.id,
    )
    db.add(new_song)
    db.commit()
    db.refresh(new_song)

    # uploader is auto-tagged and auto-accepted
    uploader_tag = SongArtistTag(
        song_id=new_song.id,
        artist_id=artist_profile.id,
        status=TagStatus.accepted,
        responded_at=datetime.utcnow(),
    )
    db.add(uploader_tag)

    # add to uploader's system playlist immediately
    system_playlist = db.query(models.Playlist).filter(
        models.Playlist.owner_id == current_user.id, models.Playlist.is_system == True
    ).first()
    if system_playlist:
        system_playlist.songs.append(new_song)

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

@router.get("/tags/pending", response_model=list[schemas.PendingTagResponse])
def get_pending_tags(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    artist_profile = db.query(models.ArtistProfile).filter(models.ArtistProfile.user_id == current_user.id).first()
    if not artist_profile:
        return []

    pending = db.query(SongArtistTag).filter(
        SongArtistTag.artist_id == artist_profile.id, SongArtistTag.status == TagStatus.pending
    ).all()

    return [
        schemas.PendingTagResponse(
            tag_id=t.id, song_id=t.song_id, song_title=t.song.title,
            uploader_name=t.song.uploader.artist_name, created_at=t.created_at,
        )
        for t in pending
    ]

@router.patch("/tags/{tag_id}/respond")
def respond_to_tag(tag_id: int, body: schemas.TagRespondRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if body.status not in ("accepted", "declined"):
        raise HTTPException(status_code=400, detail="status must be 'accepted' or 'declined'")

    tag = db.query(SongArtistTag).filter(SongArtistTag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    artist_profile = db.query(models.ArtistProfile).filter(models.ArtistProfile.user_id == current_user.id).first()
    if not artist_profile or tag.artist_id != artist_profile.id:
        raise HTTPException(status_code=403, detail="This tag does not belong to you")

    if tag.status != TagStatus.pending:
        raise HTTPException(status_code=400, detail="This tag has already been responded to")

    tag.status = TagStatus.accepted if body.status == "accepted" else TagStatus.declined
    tag.responded_at = datetime.utcnow()

    if tag.status == TagStatus.accepted:
        system_playlist = db.query(models.Playlist).filter(
            models.Playlist.owner_id == current_user.id, models.Playlist.is_system == True
        ).first()
        song = db.query(models.Song).filter(models.Song.id == tag.song_id).first()
        if system_playlist and song not in system_playlist.songs:
            system_playlist.songs.append(song)

    db.commit()
    return {"message": f"Tag {tag.status.value}"}

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
        existing.played_at = datetime.utcnow()
    else:
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

@router.post("/{song_id}/artists")
def tag_artists(song_id: int, body: schemas.TagArtistsRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    uploader_profile = db.query(models.ArtistProfile).filter(models.ArtistProfile.user_id == current_user.id).first()
    if not uploader_profile or song.uploader_id != uploader_profile.id:
        raise HTTPException(status_code=403, detail="Only the uploader can tag artists on this song")

    existing_active_count = len([t for t in song.tags if t.status != TagStatus.declined])
    new_artist_ids = [aid for aid in body.artist_ids if aid != uploader_profile.id]

    if existing_active_count + len(new_artist_ids) > MAX_TAGGED_ARTISTS:
        raise HTTPException(status_code=400, detail=f"Cannot tag more than {MAX_TAGGED_ARTISTS} artists total (including you)")

    artists = db.query(models.ArtistProfile).filter(models.ArtistProfile.id.in_(new_artist_ids)).all()
    if len(artists) != len(new_artist_ids):
        raise HTTPException(status_code=404, detail="Artist does not exist")

    already_tagged_ids = {t.artist_id for t in song.tags}
    for artist in artists:
        if artist.id in already_tagged_ids:
            continue
        db.add(SongArtistTag(song_id=song.id, artist_id=artist.id, status=TagStatus.pending))

    db.commit()
    return {"message": "Tag invitations sent"}