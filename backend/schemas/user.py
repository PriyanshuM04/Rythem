from pydantic import BaseModel, ConfigDict, EmailStr

class UserCreate(BaseModel):
    username: str
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

class UserMeResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    tier: str            # TODO Phase 4: replace hardcoded default with real tier engine
    is_artist: bool
    token_balance: int   # TODO Phase 4: replace hardcoded 0 with real token ledger balance

    model_config = ConfigDict(from_attributes=True)