import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()  # must be first

DATABASE_URL = os.getenv("DATABASE_URL")

print("DEBUG DB URL:", DATABASE_URL)  # should NOT be None

if DATABASE_URL is None:
    raise ValueError("DATABASE_URL is missing in .env file")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()