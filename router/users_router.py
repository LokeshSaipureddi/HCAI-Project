from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.user_schema import UserResponse, OnboardingRequest, OnboardingResponse
from dependencies import get_current_user
from models.user import User, UserCourse
from models.rag import Course
from db.database import get_db

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.post("/onboarding", response_model=OnboardingResponse)
async def submit_onboarding(
    onboarding_data: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit academic onboarding information
    """
    # Validate education level
    valid_levels = ["Bachelors", "Masters"]
    if onboarding_data.education_level not in valid_levels:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Education level must be one of: {', '.join(valid_levels)}"
        )
    
    # Update user fields
    current_user.education_level = onboarding_data.education_level
    current_user.major = onboarding_data.major
    current_user.onboarded = True
    
    # Process completed courses
    if onboarding_data.completed_courses:
        for course_identifier in onboarding_data.completed_courses:
            # Try to find course by code or title
            course = db.query(Course).filter(
                (Course.course_code.ilike(f"%{course_identifier}%")) |
                (Course.title.ilike(f"%{course_identifier}%"))
            ).first()
            
            if course:
                # Check if relationship already exists
                existing = db.query(UserCourse).filter(
                    UserCourse.user_id == current_user.id,
                    UserCourse.course_id == course.id
                ).first()
                
                if not existing:
                    user_course = UserCourse(
                        user_id=current_user.id,
                        course_id=course.id
                    )
                    db.add(user_course)
    
    # Commit changes
    db.commit()
    db.refresh(current_user)
    
    return OnboardingResponse(
        message="Onboarding completed successfully",
        user=current_user
    )
