import re
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

class UserBase(BaseModel):
    email: str = Field(..., description="User's email address")
    full_name: str = Field(..., min_length=2, max_length=150)
    role: str = "patient"
    phone_number: Optional[str] = None
    is_active: Optional[bool] = True

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        if not v or not EMAIL_REGEX.match(v.strip()):
            raise ValueError("Invalid email format. Expected format: name@domain.com")
        return v.strip().lower()

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128, description="Password must be at least 6 characters")

class UserLogin(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        if not v or not EMAIL_REGEX.match(v.strip()):
            raise ValueError("Invalid email format. Expected format: name@domain.com")
        return v.strip().lower()

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    phone_number: Optional[str] = None
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None
