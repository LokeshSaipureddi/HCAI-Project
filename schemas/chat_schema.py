from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from uuid import UUID


class MessageCreate(BaseModel):
    """Schema for creating a message"""
    content: str


class MessageResponse(BaseModel):
    """Schema for message response"""
    id: UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    """Schema for creating a conversation"""
    title: Optional[str] = "New Chat"


class ConversationResponse(BaseModel):
    """Schema for conversation response"""
    id: UUID
    title: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ConversationWithMessages(ConversationResponse):
    """Schema for conversation with messages"""
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True
