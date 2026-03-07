from fastapi import APIRouter, HTTPException

from models.requests import CompanyInput
from models.responses import CitiesListResponse, CostComparisonResponse
from services.comparison import compute_comparison, get_supported_cities

router = APIRouter()


@router.get("/cities", response_model=CitiesListResponse)
async def list_cities():
    """Return supported comparison cities for the frontend dropdown."""
    return CitiesListResponse(cities=get_supported_cities())


@router.post("/cost", response_model=CostComparisonResponse)
async def cost_comparison(body: CompanyInput):
    """Generate side-by-side cost comparison between current city and Winnipeg."""
    try:
        return compute_comparison(body)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Unsupported city: {e}")
