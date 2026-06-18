from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas
from dependencies import get_db, get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user = Depends(get_current_user)):
    return current_user