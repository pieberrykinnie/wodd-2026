from fastapi import APIRouter, HTTPException

from models.responses import HeatmapDataResponse, ZoneDetail, ZonesListResponse
from services.zones import get_all_zones, get_heatmap_data, get_zone_detail

router = APIRouter()


@router.get("", response_model=ZonesListResponse)
async def list_zones():
    """Return all curated zones enriched with live Socrata data."""
    zones = await get_all_zones()
    return ZonesListResponse(zones=zones)


@router.get("/heatmap", response_model=HeatmapDataResponse)
async def heatmap_data():
    """Return per-neighbourhood density points for the heatmap layer."""
    return await get_heatmap_data()


@router.get("/{zone_id}", response_model=ZoneDetail)
async def zone_detail(zone_id: str):
    """Return detailed zone info with sample businesses and transit stops."""
    detail = await get_zone_detail(zone_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Zone not found: {zone_id}")
    return detail
