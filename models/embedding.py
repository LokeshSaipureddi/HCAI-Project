from sqlalchemy import Column, Integer, String
from pgvector.sqlalchemy import Vector
from db.database import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID

class Document(Base):
    __tablename__ = "documents"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False
    )
    content = Column(String, nullable=False)
    embedding = Column(Vector(1536))
