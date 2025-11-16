from fastapi import APIRouter, Depends
from schemas.user_schema import UserResponse
from dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user
