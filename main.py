from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import json
from database import engine
from models import Base

from sqlalchemy.orm import Session

from scribe_engine import process_medical_transcript
from database import get_db
from models import ClinicalNote

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Medi-Sync AI API")
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Your Next.js URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Prescription(BaseModel):
    name: str
    dosage: str


class MedicalNote(BaseModel):
    patient_concerns: List[str]
    diagnosis_guess: str
    prescriptions: List[Prescription]
    follow_up: str


class TranscriptRequest(BaseModel):
    content: str


@app.get("/")
def read_root():
    return {"status": "Medi-Sync API is Online"}


@app.post("/analyze", response_model=MedicalNote)
async def analyze_transcript(
    request: TranscriptRequest,
    db: Session = Depends(get_db)
):
    try:
        # 1. AI processing
        raw_ai_response = process_medical_transcript(request.content)
        structured_data = json.loads(raw_ai_response)

        # 2. Save to database
        new_note = ClinicalNote(
            raw_transcript=request.content,
            structured_data=structured_data
        )

        db.add(new_note)
        db.commit()
        db.refresh(new_note)

        # 3. Return response
        return structured_data

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"AI Processing Failed: {str(e)}")