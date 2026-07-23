import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()  # Load environment variables from .env file
engine = create_engine(os.getenv("DATABASE_URL"))
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency to get database session per request
def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()