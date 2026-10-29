from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
import models, schemas
from dependencies import get_db, get_current_user, get_current_user_optional
from models.playlist_save import PlaylistSave
from services.image_storage import build_image_path, upload_image, delete_image
from routes.songs import build_song_response

router = APIRouter(prefix="/playlists", tags=["Playlists"])

def build_playlist_response(playlist: models.Playlist, db: Session, current_user) -> schemas.PlaylistResponse:
    song_count = len(playlist.songs)
    total_duration = sum(s.duration_seconds for s in playlist.songs)
    saves_count = db.query(PlaylistSave).filter(PlaylistSave.playlist_id == playlist.id).count()
    is_saved = False
    if current_user:
        is_saved = db.query(PlaylistSave).filter(
            PlaylistSave.playlist_id == playlist.id, PlaylistSave.user_id == current_user.id
        ).first() is not None

    return schemas.PlaylistResponse(
        id=playlist.id,
        name=playlist.name,
        owner=schemas.PlaylistOwner.model_validate(playlist.owner),
        is_public=playlist.is_public,
        cover_url=playlist.cover_url,
        song_count=song_count,
        total_duration_seconds=total_duration,
        saves_count=saves_count,
        is_saved=is_saved,
        songs=[build_song_response(s, current_user) for s in playlist.songs],
    )

@router.post("/", response_model=schemas.PlaylistResponse, status_code=201)
def create_playlist(playlist: schemas.PlaylistCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    new_playlist = models.Playlist(name=playlist.name, owner_id=current_user.id, is_public=playlist.is_public)
    db.add(new_playlist)
    db.commit()
    db.refresh(new_playlist)
    return build_playlist_response(new_playlist, db, current_user)

@router.get("/mine", response_model=schemas.MyPlaylistsResponse)
def get_my_playlists(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    playlists = db.query(models.Playlist).filter(models.Playlist.owner_id == current_user.id).all()
    return {"playlists": playlists}

@router.get("/saved", response_model=schemas.SavedPlaylistsResponse)
def get_saved_playlists(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    playlists = (
        db.query(models.Playlist)
        .join(PlaylistSave, PlaylistSave.playlist_id == models.Playlist.id)
        .filter(PlaylistSave.user_id == current_user.id)
        .all()
    )
    return {"playlists": playlists}

@router.get("/{playlist_id}", response_model=schemas.PlaylistResponse)
def get_playlist(playlist_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user_optional)):
    playlist = db.query(models.Playlist).filter(models.Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    is_owner = current_user is not None and playlist.owner_id == current_user.id
    if not playlist.is_public and not is_owner:
        raise HTTPException(status_code=404, detail="Playlist not found")

    return build_playlist_response(playlist, db, current_user)

@router.patch("/{playlist_id}", response_model=schemas.PlaylistResponse)
def update_playlist(playlist_id: int, body: schemas.PlaylistUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    playlist = db.query(models.Playlist).filter(models.Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if playlist.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your playlist")
    if playlist.is_system:
        raise HTTPException(status_code=400, detail="System playlists cannot be edited")

    if body.name is not None:
        playlist.name = body.name
    if body.is_public is not None:
        playlist.is_public = body.is_public

    db.commit()
    db.refresh(playlist)
    return build_playlist_response(playlist, db, current_user)

def get_editable_playlist(playlist_id: int, db: Session, current_user) -> models.Playlist:
    playlist = db.query(models.Playlist).filter(models.Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if playlist.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your playlist")
    if playlist.is_system:
        raise HTTPException(status_code=400, detail="System playlists cannot be edited")
    return playlist

@router.put("/{playlist_id}/cover", response_model=schemas.PlaylistResponse)
def upload_playlist_cover(playlist_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    playlist = get_editable_playlist(playlist_id, db, current_user)

    path = build_image_path("playlist-covers", playlist.id, file)
    upload_image(file, path)

    old_path = playlist.cover_path
    playlist.cover_path = path
    db.commit()
    db.refresh(playlist)

    delete_image(old_path)
    return build_playlist_response(playlist, db, current_user)

@router.delete("/{playlist_id}/cover", response_model=schemas.PlaylistResponse)
def remove_playlist_cover(playlist_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    playlist = get_editable_playlist(playlist_id, db, current_user)

    old_path = playlist.cover_path
    playlist.cover_path = None
    db.commit()
    db.refresh(playlist)

    delete_image(old_path)
    return build_playlist_response(playlist, db, current_user)

@router.post("/{playlist_id}/songs", response_model=schemas.PlaylistResponse)
def add_song_to_playlist(playlist_id: int, body: schemas.AddSongToPlaylistRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    playlist = db.query(models.Playlist).filter(models.Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if playlist.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your playlist")
    song = db.query(models.Song).filter(models.Song.id == body.song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    if song in playlist.songs:
        raise HTTPException(status_code=400, detail="Song already in playlist")
    playlist.songs.append(song)
    db.commit()
    db.refresh(playlist)
    return build_playlist_response(playlist, db, current_user)

@router.post("/{playlist_id}/save", response_model=schemas.PlaylistSaveResponse)
def toggle_save_playlist(playlist_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    playlist = db.query(models.Playlist).filter(models.Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if not playlist.is_public and playlist.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Playlist not found")

    existing = db.query(PlaylistSave).filter(
        PlaylistSave.user_id == current_user.id, PlaylistSave.playlist_id == playlist_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False}

    db.add(PlaylistSave(user_id=current_user.id, playlist_id=playlist_id))
    db.commit()
    return {"saved": True}

@router.delete("/{playlist_id}/songs/{song_id}")
def remove_song_from_playlist(playlist_id: int, song_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    playlist = db.query(models.Playlist).filter(models.Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if playlist.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your playlist")
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    if song not in playlist.songs:
        raise HTTPException(status_code=400, detail="Song not in playlist")
    playlist.songs.remove(song)
    db.commit()
    return {"message": "Song removed from playlist"}