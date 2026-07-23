from datetime import datetime, timedelta
from database import Base, engine, get_db
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from models import DiaryEntry, User
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session
import jwt
import bcrypt


# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security configurations
SECRET_KEY = "SUPER_SECRET_KEY_CHANGE_IN_PRODUCTION"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# --- Pydantic Schemas ---
class UserCreate(BaseModel):
  username: str
  email: str
  password: str


class UserResponse(BaseModel):
  id: int
  username: str
  email: str

class Token(BaseModel):
  access_token: str
  token_type: str


class EntryCreate(BaseModel):
  title: str
  content: str


class EntryResponse(BaseModel):
  id: int
  title: str
  content: str
  created_at: datetime
  owner_id: int

  class Config:
    from_attributes = True


# --- Helper Functions ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
  """
  Verifies if the provided plain password matches the hashed password.

  args:
      plain_password (str): The plain text password to verify.
      hashed_password (str): The hashed password to compare against. 
  returns: True if the passwords match, False otherwise.
  """
  return bcrypt.checkpw(
      plain_password.encode("utf-8"), hashed_password.encode("utf-8")
  )


def get_password_hash(password: str) -> str:
  """
  Hashes the provided password using bcrypt.

  args:
      password (str): The plain text password to hash.
  returns: The hashed password as a string.
  """
  pwd_bytes = password.encode("utf-8")
  salt = bcrypt.gensalt()
  hashed = bcrypt.hashpw(pwd_bytes, salt)
  return hashed.decode("utf-8")


def create_access_token(data: dict, expires_delta: timedelta | None = None):
  """
  Creates a JWT access token with the provided data and expiration time.

  args:
      data (dict): The data to encode in the JWT token.
      expires_delta (timedelta | None): Optional expiration time for the token.
  returns: The encoded JWT token as a string.
  """
  to_encode = data.copy()
  expire = datetime.utcnow() + (
      expires_delta
      if expires_delta
      else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  )
  to_encode.update({"exp": expire})
  return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
  """
  Retrieves the current authenticated user based on the provided JWT token.

  args:
      token (str): The JWT token extracted from the request.
      db (Session): The SQLAlchemy database session.
  returns: The authenticated User object.
  raises: HTTPException if the token is invalid or the user does not exist.
  """
  credentials_exception = HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Could not validate credentials",
      headers={"WWW-Authenticate": "Bearer"},
  )
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    email: str = payload.get("sub")
    if email is None:
      raise credentials_exception
  except jwt.PyJWTError:
    raise credentials_exception

  user = db.query(User).filter(User.email == email).first()
  if user is None:
    raise credentials_exception
  return user


# --- Auth Routes ---

@app.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
  """
  Registers a new user with the provided data.

  args:
      user_data (UserCreate): The user registration data.
      db (Session): The SQLAlchemy database session.
  returns: The created User object.
  raises: HTTPException if the email or username is already registered.
  """
  existing_user = (
      db.query(User)
      .filter(
          (User.email == user_data.email)
          | (User.username == user_data.username)
      )
      .first()
  )
  if existing_user:
    raise HTTPException(
        status_code=400, detail="Email or username already registered"
    )

  hashed_password = get_password_hash(user_data.password)
  new_user = User(
      username=user_data.username,
      email=user_data.email,
      hashed_password=hashed_password,
  )
  db.add(new_user)
  db.commit()
  db.refresh(new_user)
  return new_user


@app.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
  """
  Authenticates a user and returns a JWT access token.

  args:
      form_data (OAuth2PasswordRequestForm): The login form data containing username/email and password.
      db (Session): The SQLAlchemy database session.
  returns: A dictionary containing the access token and token type.
  raises: HTTPException if the credentials are invalid.
  """
  user = (
      db.query(User)
      .filter(
          or_(
              User.email == form_data.username,
              User.username == form_data.username,
          )
      )
      .first()
  )

  if not user or not verify_password(form_data.password, user.hashed_password):
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email/username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

  access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  access_token = create_access_token(
      data={"sub": user.email}, expires_delta=access_token_expires
  )
  return {"access_token": access_token, "token_type": "bearer"}


# --- Protected Diary Routes ---
@app.get("/entries/", response_model=list[EntryResponse])
def get_entries(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
  """
  Retrieves all diary entries for the authenticated user.

  args:
      current_user (User): The currently authenticated user.
      db (Session): The SQLAlchemy database session.
  returns: A list of diary entries associated with the authenticated user.
  """
  return (
      db.query(DiaryEntry)
      .filter(DiaryEntry.owner_id == current_user.id)
      .all()
  )


@app.post("/entries/", response_model=EntryResponse)
def create_entry(
    entry: EntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
  """
  Creates a new diary entry for the authenticated user.
  
  args:
      entry (EntryCreate): The diary entry data to create.
      current_user (User): The currently authenticated user.
      db (Session): The SQLAlchemy database session.
  returns: The created diary entry.
  """
  new_entry = DiaryEntry(
      title=entry.title, content=entry.content, owner_id=current_user.id
  )
  db.add(new_entry)
  db.commit()
  db.refresh(new_entry)
  return new_entry


@app.delete("/entries/{entry_id}")
def delete_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
  """
  Deletes a diary entry by its ID for the authenticated user.

  args:
      entry_id (int): The ID of the diary entry to delete.
      current_user (User): The currently authenticated user.
      db (Session): The SQLAlchemy database session.
  returns: A message indicating successful deletion.
  raises: HTTPException if the entry is not found or does not belong to the user.
  """
  entry = (
      db.query(DiaryEntry)
      .filter(DiaryEntry.id == entry_id, DiaryEntry.owner_id == current_user.id)
      .first()
  )
  if not entry:
    raise HTTPException(status_code=404, detail="Entry not found")

  db.delete(entry)
  db.commit()
  return {"message": "Entry deleted successfully"}

