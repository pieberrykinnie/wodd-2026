import ipaddress
import json
import re
import socket
from io import BytesIO

import httpx
from groq import AsyncGroq

from core.config import get_settings
from models.responses import ParsedCompanyData

_MAX_TEXT_CHARS = 6_000
_MAX_FILE_BYTES = 5 * 1024 * 1024  # 5 MB


def _truncate(text: str) -> str:
    return text[:_MAX_TEXT_CHARS]


def _is_private_hostname(hostname: str) -> bool:
    """SSRF guard — returns True if hostname resolves to a private/loopback/reserved IP."""
    try:
        ip = ipaddress.ip_address(socket.gethostbyname(hostname))
        return (
            ip.is_loopback
            or ip.is_private
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
        )
    except Exception:
        return True  # Fail-safe: treat unresolvable hosts as private


async def parse_url(url: str) -> ParsedCompanyData:
    from urllib.parse import urlparse

    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only http and https URLs are supported.")

    hostname = parsed.hostname or ""
    if not hostname:
        raise ValueError("Could not determine hostname from URL.")
    if _is_private_hostname(hostname):
        raise ValueError("URL resolves to a private or restricted address.")

    async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; WinnipegRelocationBot/1.0)"}
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        raw_html = resp.text[:500_000]  # cap at 500 KB

    # Strip HTML tags
    try:
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(raw_html, "lxml")
        for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
            tag.decompose()
        text = soup.get_text(separator=" ", strip=True)
    except Exception:
        text = re.sub(r"<[^>]+>", " ", raw_html)

    return await _extract_with_llm(_truncate(text))


async def parse_document(content: bytes, filename: str) -> ParsedCompanyData:
    if len(content) > _MAX_FILE_BYTES:
        raise ValueError("File exceeds the 5 MB limit.")

    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    text = ""

    if ext == "pdf":
        try:
            from pypdf import PdfReader

            reader = PdfReader(BytesIO(content))
            parts = [page.extract_text() or "" for page in reader.pages[:20]]
            text = " ".join(parts)
        except Exception as e:
            raise ValueError(f"Could not parse PDF: {e}") from e

    elif ext == "docx":
        try:
            from docx import Document

            doc = Document(BytesIO(content))
            parts = [para.text for para in doc.paragraphs if para.text.strip()]
            text = " ".join(parts)
        except Exception as e:
            raise ValueError(f"Could not parse DOCX: {e}") from e

    elif ext in ("txt", "csv"):
        try:
            text = content.decode("utf-8", errors="replace")
        except Exception as e:
            raise ValueError(f"Could not decode file: {e}") from e

    else:
        raise ValueError(f"Unsupported file type: .{ext}. Please upload PDF, DOCX, TXT, or CSV.")

    return await _extract_with_llm(_truncate(text))


async def _extract_with_llm(text: str) -> ParsedCompanyData:
    settings = get_settings()
    client = AsyncGroq(api_key=settings.groq_api_key)

    system_prompt = (
        "You are a structured data extraction assistant. "
        "Given text from a company website or document, extract these four fields "
        "and return ONLY valid JSON matching this exact schema:\n"
        '{"company_name": "string or null", "city": "string or null", '
        '"industry": "string or null", "headcount": number or null}\n'
        "Rules:\n"
        "- company_name: the organisation's trading name\n"
        "- city: the city of the main headquarters (city name only, no country)\n"
        "- industry: a short sector label (e.g. Technology, Healthcare, Finance)\n"
        "- headcount: approximate total employee count as an integer, or null if unknown\n"
        "If a field cannot be determined, use null. Output JSON only — no markdown, no commentary."
    )

    user_prompt = f"Extract company details from this text:\n\n{text}"

    response = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.1,
        max_tokens=300,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content or "{}"
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        parsed = {}

    headcount = parsed.get("headcount")
    if headcount is not None:
        try:
            headcount = int(headcount)
        except (TypeError, ValueError):
            headcount = None

    return ParsedCompanyData(
        company_name=parsed.get("company_name") or None,
        city=parsed.get("city") or None,
        industry=parsed.get("industry") or None,
        headcount=headcount,
    )
