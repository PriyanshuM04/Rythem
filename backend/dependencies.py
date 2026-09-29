from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import SessionLocal
import models
import auth

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _user_from_subject(subject: str, db: Session):
    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        return None  # old tokens carrying a username land here and get rejected cleanly
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    subject = auth.verify_token(token)
    user = _user_from_subject(subject, db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_current_user_optional(token: str = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        subject = auth.verify_token(token)
    except HTTPException:
        return None
    return _user_from_subject(subject, db)