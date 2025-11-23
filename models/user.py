from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.database import Base
from datetime import datetime
from passlib.context import CryptContext
import uuid
from sqlalchemy.dialects.postgresql import UUID

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False
    )
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Onboarding fields
    onboarded = Column(Boolean, default=False, nullable=False)
    education_level = Column(String, nullable=True)  # "Bachelors" or "Masters"
    major = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow,
                        server_default=func.now(), nullable=False)


    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow,
                        onupdate=datetime.utcnow, server_default=func.now(), nullable=False)
        
    def verify_password(self, plain_password: str) -> bool:
        return pwd_context.verify(plain_password, self.hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

    # Relationships
    conversations = relationship(
        "ChatConversation", back_populates="user", cascade="all, delete-orphan")
    user_courses = relationship(
        "UserCourse", back_populates="user", cascade="all, delete-orphan")


class UserCourse(Base):
    """Junction table for user completed courses"""
    __tablename__ = "user_courses"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow,
                        server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="user_courses")
    course = relationship("Course")
