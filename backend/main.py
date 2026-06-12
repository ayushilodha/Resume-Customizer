import os
import io
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from parser import extract_text_from_pdf, extract_text_from_docx
from llm import customize_resume

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Resume Customizer API", version="1.0.0")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "docx",
}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/customize")
async def customize(
    job_description: str = Form(...),
    resume: UploadFile = File(...),
):
    # Validate JD
    jd = job_description.strip()
    if not jd or len(jd) < 50:
        raise HTTPException(
            status_code=422,
            detail="Job description is too short. Please paste the full JD (min 50 characters).",
        )

    # Validate file type
    content_type = resume.content_type or ""
    if content_type not in ALLOWED_TYPES:
        # Fallback: sniff extension
        filename = resume.filename or ""
        if filename.endswith(".pdf"):
            content_type = "application/pdf"
        elif filename.endswith(".docx"):
            content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        else:
            raise HTTPException(
                status_code=422,
                detail="Only PDF and DOCX files are supported.",
            )

    # Read file
    file_bytes = await resume.read()

    if len(file_bytes) == 0:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=422,
            detail=f"File too large. Maximum allowed size is 5MB.",
        )

    # Extract text
    try:
        file_type = ALLOWED_TYPES[content_type]
        if file_type == "pdf":
            resume_text = extract_text_from_pdf(io.BytesIO(file_bytes))
        else:
            resume_text = extract_text_from_docx(io.BytesIO(file_bytes))
    except Exception as e:
        logger.error(f"Parsing error: {e}")
        raise HTTPException(
            status_code=422,
            detail="Could not parse the resume file. Please ensure it's a valid, non-corrupted PDF or DOCX.",
        )

    if not resume_text or len(resume_text.strip()) < 100:
        raise HTTPException(
            status_code=422,
            detail="Could not extract enough text from the resume. Ensure it's not a scanned image-only PDF.",
        )

    # Call LLM
    try:
        result = await customize_resume(jd=jd, resume_text=resume_text)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        logger.error(f"LLM error: {e}")
        raise HTTPException(
            status_code=502,
            detail="The AI service is temporarily unavailable. Please try again in a moment.",
        )

    return JSONResponse(content=result)
