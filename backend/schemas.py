from datetime import datetime
from pydantic import BaseModel

# Pydantic models for handling diary entry data

class DiaryEntryCreate(BaseModel):
    """
        Pydantic model for creating a new diary entry.

    args:
        BaseModel: The base class for Pydantic models.
    attributes:
        title (str): The title of the diary entry.  
        content (str): The content of the diary entry.
    """
    title: str
    content: str

class DiaryEntryResponse(DiaryEntryCreate):
    """
        Pydantic model for responding with a diary entry.
        
        args:
            DiaryEntryCreate: Inherits from the DiaryEntryCreate model.
        attributes:
            id (int): The unique identifier for the diary entry.
            created_at (datetime): The timestamp when the diary entry was created
    """
    id: int
    created_at: datetime

    class Config:
        """
        Configuration for the Pydantic model.
        attributes:
            orm_mode (bool): Enables compatibility with ORM models.
        """
        orm_mode = True