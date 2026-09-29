from datetime import date
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from schemas.playlist import PlaylistSummary

Gender = Literal["male", "female", "other", "prefer_not_to_say"]
AccountType = Literal["public", "private"]
MIN_AGE = 13

def _check_dob(value: date) -> date:
    today = date.today()
    if value > today:
        raise ValueError("Date of birth cannot be in the future")
    age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
    if age < MIN_AGE:
        raise ValueError(f"You must be at least {MIN_AGE} years old to use Rythem")
    if age > 120:
        raise ValueError("Please enter a valid date of birth")
    return value

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ConfirmEmailRequest(BaseModel):
    token: str

class MessageResponse(BaseModel):
    message: str

class CompleteProfileRequest(BaseModel):
    username: str
    gender: Gender
    country: str = Field(min_length=2, max_length=64)
    date_of_birth: date
    account_type: AccountType = "public"
    accept_privacy_policy: bool
    marketing_consent: bool = False

    @field_validator("username")
    @classmethod
    def strip_username(cls, v: str) -> str:
        return v.strip()

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, v: date) -> date:
        return _check_dob(v)

    @field_validator("accept_privacy_policy")
    @classmethod
    def must_accept_policy(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must accept the Privacy Policy to continue")
        return v

class UpdateProfileRequest(BaseModel):
    username: str | None = None
    gender: Gender | None = None
    country: str | None = Field(default=None, min_length=2, max_length=64)
    date_of_birth: date | None = None
    account_type: AccountType | None = None
    avatar_url: str | None = None

    @field_validator("username")
    @classmethod
    def strip_username(cls, v: str | None) -> str | None:
        return v.strip() if v is not None else v

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, v: date | None) -> date | None:
        return _check_dob(v) if v is not None else v

class UserMeResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    tier: str            # TODO Phase 3: replace hardcoded default with real tier engine
    is_artist: bool
    token_balance: int   # TODO Phase 3: replace hardcoded 0 with real token ledger balance
    avatar_url: str | None = None
    gender: str | None = None
    country: str | None = None
    date_of_birth: date | None = None
    account_type: str
    playlist_count: int
    profile_completed: bool

    model_config = ConfigDict(from_attributes=True)

class PublicUserResponse(BaseModel):
    id: int
    username: str
    avatar_url: str | None = None
    playlist_count: int
    playlists: list[PlaylistSummary]