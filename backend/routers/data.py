from fastapi import APIRouter

from models.responses import DataOverviewResponse, DataSource, PopulationDataPoint
from services import socrata

router = APIRouter()


@router.get("/overview", response_model=DataOverviewResponse)
async def data_overview():
    """Combined overview of all data sources for transparency."""
    # Population trend
    population_trend: list[PopulationDataPoint] = []
    try:
        pop_data = await socrata.fetch_dataset(
            "population",
            order="year ASC",
            limit=50,
        )
        population_trend = [
            PopulationDataPoint(
                year=row["year"][:4] if "year" in row else "",
                population=float(
                    row.get("city_of_winnipeg_forecast_baseline", 0)
                ),
            )
            for row in pop_data
            if row.get("city_of_winnipeg_forecast_baseline")
        ]
    except Exception:
        pass

    # Total active businesses
    total_businesses = 0
    try:
        biz_data = await socrata.fetch_dataset(
            "business_licenses",
            select="count(*) as cnt",
            where="status='Issued'",
            limit=1,
        )
        if biz_data:
            total_businesses = int(biz_data[0].get("cnt", 0))
    except Exception:
        pass

    # Total permits YTD
    total_permits = 0
    try:
        permit_data = await socrata.fetch_dataset(
            "building_permits",
            select="sum(total_permits) as total",
            where="year >= '2024'",
            limit=1,
        )
        if permit_data:
            total_permits = int(float(permit_data[0].get("total", 0)))
    except Exception:
        pass

    sources = [
        DataSource(
            name="Assessment Parcels",
            url="https://data.winnipeg.ca/d/d4mq-wa44",
            licence="Open Government Licence - Winnipeg",
        ),
        DataSource(
            name="Business Licenses",
            url="https://data.winnipeg.ca/d/d5k3-sfzx",
            licence="Open Government Licence - Winnipeg",
        ),
        DataSource(
            name="Aggregate Building Permits",
            url="https://data.winnipeg.ca/d/p5sy-gt7y",
            licence="Open Government Licence - Winnipeg",
        ),
        DataSource(
            name="City of Winnipeg Population",
            url="https://data.winnipeg.ca/d/mhuw-u7yg",
            licence="Open Government Licence - Winnipeg",
        ),
        DataSource(
            name="Tree Inventory",
            url="https://data.winnipeg.ca/d/hfwk-jp4h",
            licence="Open Government Licence - Winnipeg",
        ),
        DataSource(
            name="Winnipeg Transit API",
            url="https://api.winnipegtransit.com",
            licence="Winnipeg Transit Open Data Terms",
        ),
    ]

    return DataOverviewResponse(
        population_trend=population_trend,
        total_active_businesses=total_businesses,
        total_permits_ytd=total_permits,
        sources=sources,
    )
