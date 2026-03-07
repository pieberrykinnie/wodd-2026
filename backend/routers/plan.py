import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from models.requests import (
    DiscoveryWeekendRequest,
    MigrationPlanRequest,
    WelcomeGuideRequest,
)
from models.responses import (
    DiscoveryWeekendResponse,
    MigrationPlanResponse,
    WelcomeGuideResponse,
)
from services.comparison import compute_comparison
from services.llm import (
    generate_discovery_weekend,
    generate_migration_plan,
    generate_welcome_guide,
)

router = APIRouter()

_ZONE_DEFS: list[dict] | None = None
_ZONES_PATH = Path(__file__).parent.parent / "data" / "zones.json"


def _load_zones() -> list[dict]:
    global _ZONE_DEFS
    if _ZONE_DEFS is None:
        _ZONE_DEFS = json.loads(_ZONES_PATH.read_text())
    return _ZONE_DEFS


def _get_zone(zone_id: str) -> dict:
    zones = _load_zones()
    zone = next((z for z in zones if z["id"] == zone_id), None)
    if zone is None:
        raise HTTPException(status_code=400, detail=f"Unknown zone: {zone_id}")
    return zone


@router.post("/migration", response_model=MigrationPlanResponse)
async def migration_plan(body: MigrationPlanRequest):
    """Generate an LLM-powered migration plan with phased timeline."""
    zone = _get_zone(body.selected_zone_id)
    comparison = compute_comparison(body.company)

    context = {
        "company_name": body.company.company_name,
        "current_city": comparison.current_city.display_name,
        "employee_count": body.company.employee_count,
        "zone_name": zone["name"],
        "zone_description": zone["description"],
        "timeline_months": body.timeline_months,
        "annual_savings": comparison.total_estimated_annual_savings,
    }

    try:
        return await generate_migration_plan(context)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM service error: {e}")


@router.post("/welcome-guide", response_model=WelcomeGuideResponse)
async def welcome_guide(body: WelcomeGuideRequest):
    """Generate an LLM-powered employee welcome guide."""
    zone = _get_zone(body.selected_zone_id)
    comparison = compute_comparison(body.company)

    context = {
        "company_name": body.company.company_name,
        "current_city": comparison.current_city.display_name,
        "employee_count": body.company.employee_count,
        "zone_name": zone["name"],
        "zone_description": zone["description"],
    }

    try:
        return await generate_welcome_guide(context)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM service error: {e}")


@router.post("/discovery-weekend", response_model=DiscoveryWeekendResponse)
async def discovery_weekend(body: DiscoveryWeekendRequest):
    """Generate an LLM-powered CEO/HR discovery weekend itinerary."""
    zone = _get_zone(body.selected_zone_id)

    context = {
        "zone_name": zone["name"],
        "zone_description": zone["description"],
        "travel_month": body.travel_month,
    }

    try:
        return await generate_discovery_weekend(context)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM service error: {e}")
