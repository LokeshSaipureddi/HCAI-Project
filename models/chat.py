from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.database import Base
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID


class ChatConversation(Base):
    """Chat conversation model"""
    __tablename__ = "chat_conversations"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )
    title = Column(String, default="New Chat")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow,
                        server_default=func.now(), nullable=False)

    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow,
                        onupdate=datetime.utcnow, server_default=func.now(), nullable=False)

    # Relationships
    messages = relationship(
        "ChatMessage", back_populates="conversation", cascade="all, delete-orphan")
    user = relationship("User", back_populates="conversations")


class ChatMessage(Base):
    """Chat message model"""
    __tablename__ = "chat_messages"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False
    )
    conversation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("chat_conversations.id"),
        nullable=False
    )
    role = Column(String, nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow,
                        server_default=func.now(), nullable=False)

    # Relationships
    conversation = relationship("ChatConversation", back_populates="messages")
