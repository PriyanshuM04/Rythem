from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from dependencies import get_db, get_current_user

router = APIRouter(prefix="/playlists", tags=["Playlists"])

@router.post("/", response_model=schemas.PlaylistResponse, status_code=201)
def create_playlist(playlist: schemas.PlaylistCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    new_playlist = models.Playlist(name=playlist.name, owner_id=current_user.id)
    db.add(new_playlist)
    db.commit()
    db.refresh(new_playlist)
    return new_playlist

@router.get("/{playlist_id}", response_model=schemas.PlaylistResponse)
def get_playlist(playlist_id: int, db: Session = Depends(get_db)):
    playlist = db.query(models.Playlist).filter(models.Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return playlist

@router.post("/{playlist_id}/songs", response_model=schemas.PlaylistResponse)
def add_song_to_playlist(playlist_id: int, song_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    playlist = db.query(models.Playlist).filter(models.Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if playlist.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your playlist")
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    if song in playlist.songs:
        raise HTTPException(status_code=400, detail="Song already in playlist")
    playlist.songs.append(song)
    db.commit()
    db.refresh(playlist)
    return playlist

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