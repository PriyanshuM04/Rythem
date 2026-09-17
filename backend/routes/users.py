from fastapi import APIRouter, Depends
import schemas
from dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=schemas.UserMeResponse)
def get_me(current_user = Depends(get_current_user)):
    return schemas.UserMeResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        tier="T3",          # TODO Phase 4: pull from tier assignment engine
        is_artist=current_user.artist_profile is not None,
        token_balance=0,    # TODO Phase 4: pull from token ledger
    )