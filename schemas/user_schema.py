from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from uuid import UUID

class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating a user"""
    password: str


class UserResponse(UserBase):
    """Schema for user response"""
    id: UUID
    is_active: bool
    onboarded: bool
    education_level: Optional[str] = None
    major: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token"""
    access_token: str
    token_type: str
    user: UserResponse  # Include user data in token response


class TokenData(BaseModel):
    """Schema for token data"""
    email: Optional[str] = None


class OnboardingRequest(BaseModel):
    """Schema for onboarding request"""
    education_level: str  # "Bachelors" or "Masters"
    major: str
    completed_courses: List[str] = []  # List of course codes or names


class OnboardingResponse(BaseModel):
    """Schema for onboarding response"""
    message: str
    user: UserResponse
