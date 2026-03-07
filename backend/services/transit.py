import httpx

from core import cache
from core.config import get_settings


async def get_stops_near(lat: float, lon: float, distance_m: int = 500) -> list[dict]:
    cache_key = f"transit:stops:{lat:.4f}:{lon:.4f}:{distance_m}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    settings = get_settings()
    if not settings.transit_api_key:
        return []

    url = f"{settings.transit_base_url}/stops.json"
    params = {
        "lat": str(lat),
        "lon": str(lon),
        "distance": str(distance_m),
        "api-key": settings.transit_api_key,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
    except (httpx.HTTPError, Exception):
        return []

    stops = data.get("stops", [])
    cache.set(cache_key, stops)
    return stops
