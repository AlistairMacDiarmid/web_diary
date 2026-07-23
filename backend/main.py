from database import SessionLocal, engine
import models
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import schemas
from sqlalchemy.orm import Session

# Create tables on startup (if not already created)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow your frontend to talk to your backend later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency to get the database session
def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


# API Endpoints
@app.get("/")
def read_root():
  return {"message": "Welcome to the Web Diary API!"}


#[POST] Create a new diary entry
@app.post("/entries/", response_model=schemas.DiaryEntryResponse)
def create_entry(entry: schemas.DiaryEntryCreate, db: Session = Depends(get_db)):
  """
    Create a new diary entry in the database.

    Args:
        entry (schemas.DiaryEntryCreate): The diary entry data to be created.
        db (Session): The database session. 
    returns:
        The created diary entry as a response model (schemas.DiaryEntryResponse).
  """
  db_entry = models.DiaryEntry(title=entry.title, content=entry.content)
  db.add(db_entry)
  db.commit()
  db.refresh(db_entry)
  return db_entry


@app.get("/entries/", response_model=list[schemas.DiaryEntryResponse])
def get_entries(db: Session = Depends(get_db)):
  """
    Retrieve all diary entries from the database.
    
    Args:
        db (Session): The database session.
    Returns:
        A list of diary entries as response models (schemas.DiaryEntryResponse).
  """
  return db.query(models.DiaryEntry).all()