from database import Base
from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

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