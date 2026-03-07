import httpx

from core import cache
from core.config import get_settings

DATASET_IDS = {
    "assessment_parcels": "d4mq-wa44",
    "business_licenses": "d5k3-sfzx",
    "building_permits": "p5sy-gt7y",
    "population": "mhuw-u7yg",
    "trees": "hfwk-jp4h",
}


async def fetch_dataset(
    dataset_key: str,
    *,
    select: str | None = None,
    where: str | None = None,
    group: str | None = None,
    order: str | None = None,
    limit: int = 5000,
) -> list[dict]:
    cache_key = f"socrata:{dataset_key}:{select}:{where}:{group}:{limit}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    settings = get_settings()
    dataset_id = DATASET_IDS[dataset_key]
    url = f"{settings.socrata_base_url}/{dataset_id}.json"

    params: dict[str, str] = {"$limit": str(limit)}
    if select:
        params["$select"] = select
    if where:
        params["$where"] = where
    if group:
        params["$group"] = group
    if order:
        params["$order"] = order
    if settings.socrata_app_token:
        params["$$app_token"] = settings.socrata_app_token

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    cache.set(cache_key, data)
    return data


async def prefetch_all() -> None:
    """Pre-warm cache with aggregated data on startup."""
    import asyncio

    await asyncio.gather(
        fetch_dataset(
            "business_licenses",
            select="neighbourhood_name, count(*) as cnt",
            where="status='Issued'",
            group="neighbourhood_name",
            limit=1000,
        ),
        fetch_dataset(
            "assessment_parcels",
            select="neighbourhood_area, avg(total_assessed_value) as avg_val",
            group="neighbourhood_area",
            limit=1000,
        ),
        fetch_dataset(
            "building_permits",
            select="neighbourhood, sum(total_declared_construction_value) as total_val, year",
            where="year >= '2023'",
            group="neighbourhood, year",
            limit=1000,
        ),
        fetch_dataset(
            "trees",
            select="neighbourhood, count(*) as cnt",
            group="neighbourhood",
            limit=1000,
        ),
        fetch_dataset(
            "population",
            order="year DESC",
            limit=50,
        ),
        return_exceptions=True,
    )
