from database import Base
from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class User(Base):
    """
    SQLAlchemy model for a user.

    args:
        Base: The declarative base class from SQLAlchemy.
    attributes:
        __tablename__ (str): The name of the table in the database.
        id (int): The primary key for the user.
        username (str): The username of the user.
        email (str): The email address of the user.
        created_at (datetime): The timestamp when the user was created.
        entries (list): A list of diary entries associated with the user.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    entries = relationship("DiaryEntry", back_populates="owner", cascade="all, delete-orphan")


class DiaryEntry(Base):
    """
    SQLAlchemy model for a diary entry.

    args:
        Base: The declarative base class from SQLAlchemy.
    attributes:
        __tablename__ (str): The name of the table in the database.
        id (int): The primary key for the diary entry.
        title (str): The title of the diary entry.
        content (str): The content of the diary entry.
        created_at (datetime): The timestamp when the diary entry was created.
    """
    __tablename__ = "diary_entries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="entries")