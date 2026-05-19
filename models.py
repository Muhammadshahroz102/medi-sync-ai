from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class ClinicalNote(Base):
    __tablename__ = "clinical_notes"

    id = Column(Integer, primary_key=True, index=True)
    raw_transcript = Column(String)
    structured_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)