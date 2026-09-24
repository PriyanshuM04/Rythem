from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
import models, schemas
from dependencies import get_db, get_current_user, get_current_user_optional
from models.follow import Follow
from models.song_artist_tag import SongArtistTag, TagStatus

router = APIRouter(prefix="/artists", tags=["Artists"])

TOP_SONGS_LIMIT = 5

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

    system_playlist = models.Playlist(
        name=f"{new_artist.artist_name} — All Songs",
        owner_id=current_user.id,
        is_system=True,
        is_public=True,
    )
    db.add(system_playlist)
    db.commit()

    return build_artist_response(new_artist, db, current_user)

@router.get("/search", response_model=list[schemas.ArtistProfileResponse])
def search_artists(q: str, db: Session = Depends(get_db), current_user = Depends(get_current_user_optional)):
    results = db.query(models.ArtistProfile).filter(models.ArtistProfile.artist_name.ilike(f"%{q}%")).all()
    if not results:
        raise HTTPException(status_code=404, detail="Artist does not exist")
    return [build_artist_response(a, db, current_user) for a in results]

@router.get("/{artist_id}", response_model=schemas.ArtistProfileResponse)
def view_artist_profile(artist_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user_optional)):
    artist = db.query(models.ArtistProfile).filter(models.ArtistProfile.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return build_artist_response(artist, db, current_user)

@router.post("/{artist_id}/follow", response_model=schemas.FollowResponse)
def toggle_follow(artist_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    artist = db.query(models.ArtistProfile).filter(models.ArtistProfile.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    if artist.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot follow your own artist profile")

    existing = db.query(Follow).filter(
        Follow.user_id == current_user.id, Follow.artist_id == artist_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"following": False}

    db.add(Follow(user_id=current_user.id, artist_id=artist_id))
    db.commit()
    return {"following": True}

def build_artist_response(artist: models.ArtistProfile, db: Session, current_user) -> schemas.ArtistProfileResponse:
    follower_count = db.query(Follow).filter(Follow.artist_id == artist.id).count()

    is_following = False
    if current_user:
        is_following = db.query(Follow).filter(
            Follow.user_id == current_user.id, Follow.artist_id == artist.id
        ).first() is not None

    credited_song_ids = [
        t.song_id for t in db.query(SongArtistTag).filter(
            SongArtistTag.artist_id == artist.id, SongArtistTag.status == TagStatus.accepted
        ).all()
    ]
    top_songs = (
        db.query(models.Song)
        .filter(models.Song.id.in_(credited_song_ids))
        .order_by(desc(models.Song.play_count))
        .limit(TOP_SONGS_LIMIT)
        .all()
    ) if credited_song_ids else []

    system_playlist = db.query(models.Playlist).filter(
        models.Playlist.owner_id == artist.user_id, models.Playlist.is_system == True
    ).first()

    return schemas.ArtistProfileResponse(
        id=artist.id,
        artist_name=artist.artist_name,
        bio=artist.bio,
        follower_count=follower_count,
        is_following=is_following,
        top_songs=[schemas.SongResponse.model_validate(s) for s in top_songs],
        all_songs_playlist_id=system_playlist.id if system_playlist else None,
    )