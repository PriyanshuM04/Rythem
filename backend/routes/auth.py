import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import models, schemas, auth
from dependencies import get_db
from services.email_service import (
    send_password_reset_email,
    send_confirmation_email,
    send_welcome_email,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.UserResponse, status_code=201)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(
        (models.User.username == user.username) | (models.User.email == user.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    hashed_password = auth.hash_password(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    confirm_token = auth.generate_secure_token()
    token_row = models.EmailConfirmationToken(
        token=confirm_token,
        user_id=new_user.id,
        expires_at=auth.get_email_confirm_expiry(),
    )
    db.add(token_row)
    db.commit()

    send_confirmation_email(new_user.email, confirm_token, os.getenv("FRONTEND_URL"))
    send_welcome_email(new_user.email, new_user.username)

    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        (models.User.username == user.username) | (models.User.email == user.username)
    ).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before logging in.")
    access_token = auth.create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password", response_model=schemas.MessageResponse)
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    generic_response = {"message": "If this account exists, a reset link has been sent."}

    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        return generic_response  # never leak whether the email exists

    reset_token = auth.generate_secure_token()
    token_row = models.PasswordResetToken(
        token=reset_token,
        user_id=user.id,
        expires_at=auth.get_password_reset_expiry(),
    )
    db.add(token_row)
    db.commit()

    send_password_reset_email(user.email, reset_token, os.getenv("FRONTEND_URL"))
    return generic_response

@router.post("/reset-password", response_model=schemas.MessageResponse)
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    token_row = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == payload.token
    ).first()

    if not token_row or token_row.used or token_row.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="This reset link is invalid or has expired.")

    user = db.query(models.User).filter(models.User.id == token_row.user_id).first()
    user.hashed_password = auth.hash_password(payload.new_password)
    token_row.used = True
    db.commit()

    return {"message": "Password updated successfully."}

@router.post("/confirm-email", response_model=schemas.MessageResponse)
def confirm_email(payload: schemas.ConfirmEmailRequest, db: Session = Depends(get_db)):
    token_row = db.query(models.EmailConfirmationToken).filter(
        models.EmailConfirmationToken.token == payload.token
    ).first()

    if not token_row or token_row.used or token_row.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="This confirmation link is invalid or has expired.")

    user = db.query(models.User).filter(models.User.id == token_row.user_id).first()
    user.is_verified = True
    token_row.used = True
    db.commit()

    return {"message": "Email confirmed successfully."}