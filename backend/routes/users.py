import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
import models, schemas
from dependencies import get_db, get_current_user, get_current_user_optional
from services.email_service import send_welcome_email

router = APIRouter(prefix="/users", tags=["Users"])

# No "@" allowed, so a username can never collide with someone's email (login matches both).
USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_.]{3,30}$")

def ensure_username_available(username: str, db: Session, current_user_id: int):
    if not USERNAME_PATTERN.match(username):
        raise HTTPException(
            status_code=400,
            detail="Username must be 3-30 characters: letters, numbers, underscores or dots",
        )
    taken = db.query(models.User).filter(
        models.User.id != current_user_id,
        models.User.username == username,
    ).first()
    if taken:
        raise HTTPException(status_code=400, detail="Username is already taken")

def count_playlists(db: Session, user_id: int, public_only: bool = False) -> int:
    # system "All Songs" playlists belong to the artist page, so they're not counted here
    query = db.query(models.Playlist).filter(
        models.Playlist.owner_id == user_id, models.Playlist.is_system == False
    )
    if public_only:
        query = query.filter(models.Playlist.is_public == True)
    return query.count()

def build_me_response(user: models.User, db: Session) -> schemas.UserMeResponse:
    return schemas.UserMeResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        tier="T3",          # TODO Phase 3: pull from tier assignment engine
        is_artist=user.artist_profile is not None,
        token_balance=0,    # TODO Phase 3: pull from token ledger
        avatar_url=user.avatar_url,
        gender=user.gender,
        country=user.country,
        date_of_birth=user.date_of_birth,
        account_type=user.account_type,
        playlist_count=count_playlists(db, user.id),
        profile_completed=user.profile_completed,
    )

@router.get("/me", response_model=schemas.UserMeResponse)
def get_me(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return build_me_response(current_user, db)

@router.post("/me/complete-profile", response_model=schemas.UserMeResponse)
def complete_profile(body: schemas.CompleteProfileRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.profile_completed:
        raise HTTPException(status_code=400, detail="Profile already completed. Use PATCH /users/me to edit it.")

    ensure_username_available(body.username, db, current_user.id)

    current_user.username = body.username
    current_user.gender = body.gender
    current_user.country = body.country
    current_user.date_of_birth = body.date_of_birth
    current_user.account_type = body.account_type
    current_user.privacy_policy_accepted_at = datetime.utcnow()
    current_user.marketing_consent = body.marketing_consent
    current_user.profile_completed = True

    db.commit()
    db.refresh(current_user)
    try:
        send_welcome_email(current_user.email, current_user.username)
    except Exception:
        pass  # a mail failure must never break onboarding; the profile is already saved

    return build_me_response(current_user, db)

@router.patch("/me", response_model=schemas.UserMeResponse)
def update_me(body: schemas.UpdateProfileRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not current_user.profile_completed:
        raise HTTPException(status_code=400, detail="Complete your profile first")

    data = body.model_dump(exclude_unset=True)

    if data.get("username") is not None:
        ensure_username_available(data["username"], db, current_user.id)
        current_user.username = data["username"]

    for field in ("gender", "country", "date_of_birth", "account_type"):
        if data.get(field) is not None:
            setattr(current_user, field, data[field])

    if "avatar_url" in data:  # explicit null clears the avatar
        current_user.avatar_url = data["avatar_url"]

    db.commit()
    db.refresh(current_user)
    return build_me_response(current_user, db)

# must stay BELOW the /me routes, otherwise "me" gets parsed as a user_id
@router.get("/{user_id}", response_model=schemas.PublicUserResponse)
def get_public_user(user_id: int, db: Session = Depends(get_db), viewer = Depends(get_current_user_optional)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.profile_completed:
        raise HTTPException(status_code=404, detail="User not found")

    is_owner = viewer is not None and viewer.id == user.id
    if user.account_type == "private" and not is_owner:
        raise HTTPException(status_code=404, detail="User not found")

    playlists = db.query(models.Playlist).filter(
        models.Playlist.owner_id == user.id,
        models.Playlist.is_system == False,
        models.Playlist.is_public == True,
    ).all()

    return schemas.PublicUserResponse(
        id=user.id,
        username=user.username,
        avatar_url=user.avatar_url,
        playlist_count=len(playlists),
        playlists=[schemas.PlaylistSummary.model_validate(p) for p in playlists],
    )