import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import get_settings
from routers import calculator, comparison, data, plan, zones

logger = logging.getLogger("wri")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up — pre-warming Socrata cache...")
    try:
        from services.socrata import prefetch_all

        await prefetch_all()
        logger.info("Socrata cache warm.")
    except Exception as e:
        logger.warning(f"Socrata prefetch failed (non-fatal): {e}")
    yield


app = FastAPI(
    title="Winnipeg Relocation Intelligence",
    description="Proving why companies should relocate to Winnipeg.",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(comparison.router, prefix="/api/comparison", tags=["comparison"])
app.include_router(zones.router, prefix="/api/zones", tags=["zones"])
app.include_router(calculator.router, prefix="/api/calculator", tags=["calculator"])
app.include_router(plan.router, prefix="/api/plan", tags=["plan"])
app.include_router(data.router, prefix="/api/data", tags=["data"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "winnipeg-relocation-intelligence"}
