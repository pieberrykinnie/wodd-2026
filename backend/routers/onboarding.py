from fastapi import APIRouter, File, HTTPException, UploadFile

from models.requests import ParseUrlRequest
from models.responses import ParsedCompanyData
from services.onboarding import parse_document, parse_url

router = APIRouter()

_MAX_FILE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/parse-url", response_model=ParsedCompanyData)
async def api_parse_url(body: ParseUrlRequest):
    """Fetch a company website and extract name, city, industry, and headcount via LLM."""
    try:
        return await parse_url(str(body.url))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to analyse URL: {exc}") from exc


@router.post("/parse-document", response_model=ParsedCompanyData)
async def api_parse_document(file: UploadFile = File(...)):
    """Accept a PDF, DOCX, TXT, or CSV upload and extract company details via LLM."""
    content = await file.read(_MAX_FILE_BYTES + 1)
    if len(content) > _MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds the 5 MB limit.")
    try:
        return await parse_document(content, file.filename or "upload.bin")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to analyse document: {exc}") from exc
