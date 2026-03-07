from fastapi import APIRouter, HTTPException

from models.requests import ImpactRequest
from models.responses import ImpactResponse
from services.calculator import compute_impact

router = APIRouter()


@router.post("/impact", response_model=ImpactResponse)
async def impact(body: ImpactRequest):
    """Compute detailed financial impact of relocating to a specific zone."""
    try:
        return compute_impact(
            body.company,
            body.selected_zone_id,
            body.office_sqft_per_employee,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
