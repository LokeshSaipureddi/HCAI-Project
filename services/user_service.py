from sqlalchemy.orm import Session
from models.user import User


def get_user_by_email(email: str, db: Session):
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(user_id: int, db: Session):
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def update_user(user_id: int, update_data: dict, db: Session):
    """Update user information"""
    user = get_user_by_id(user_id, db)

    if not user:
        return None

    for key, value in update_data.items():
        if hasattr(user, key):
            setattr(user, key, value)

    db.commit()
    db.refresh(user)

    return user


def delete_user(user_id: int, db: Session):
    """Delete a user"""
    user = get_user_by_id(user_id, db)

    if not user:
        return False

    db.delete(user)
    db.commit()

    return True
