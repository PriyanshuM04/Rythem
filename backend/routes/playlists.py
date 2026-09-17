from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from dependencies import get_db, get_current_user
from models.playlist_save import PlaylistSave

router = APIRouter(prefix="/playlists", tags=["Playlists"])

@router.post("/", response_model=schemas.PlaylistResponse, status_code=201)
def create_playlist(playlist: schemas.PlaylistCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    new_playlist = models.Playlist(name=playlist.name, owner_id=current_user.id)
    db.add(new_playlist)
    db.commit()
    db.refresh(new_playlist)
    return new_playlist

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
def get_playlist(playlist_id: int, db: Session = Depends(get_db)):
    playlist = db.query(models.Playlist).filter(models.Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return playlist

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
    return playlist

@router.post("/{playlist_id}/save", response_model=schemas.PlaylistSaveResponse)
def toggle_save_playlist(playlist_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    playlist = db.query(models.Playlist).filter(models.Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    existing = db.query(PlaylistSave).filter(
        PlaylistSave.user_id == current_user.id,
        PlaylistSave.playlist_id == playlist_id,
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