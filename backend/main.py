from fastapi import FastAPI
from database import engine, Base
import models
from routes import auth, artists, songs, playlists, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Rythem API", version="1.0.0")

app.include_router(auth.router)
app.include_router(artists.router)
app.include_router(songs.router)
app.include_router(playlists.router)
app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "Welcome to Rythem API 🎵"}