from db.database import engine, Base
# Import all models to ensure they're registered with Base
from models.user import User, UserCourse
from models.chat import ChatConversation, ChatMessage
from models.rag import Professor, Course


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
