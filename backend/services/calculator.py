import json
from pathlib import Path

from models.requests import CompanyInput
from models.responses import ImpactResponse

_REFERENCE_DATA: dict | None = None
_ZONE_DEFS: list[dict] | None = None
_REF_PATH = Path(__file__).parent.parent / "data" / "reference_cities.json"
_ZONES_PATH = Path(__file__).parent.parent / "data" / "zones.json"


def _load_ref() -> dict:
    global _REFERENCE_DATA
    if _REFERENCE_DATA is None:
        _REFERENCE_DATA = json.loads(_REF_PATH.read_text())
    return _REFERENCE_DATA


def _load_zones() -> list[dict]:
    global _ZONE_DEFS
    if _ZONE_DEFS is None:
        _ZONE_DEFS = json.loads(_ZONES_PATH.read_text())
    return _ZONE_DEFS


def compute_impact(
    company: CompanyInput,
    zone_id: str,
    sqft_per_employee: float = 150.0,
) -> ImpactResponse:
    ref = _load_ref()
    zones = _load_zones()

    zone = next((z for z in zones if z["id"] == zone_id), None)
    if zone is None:
        raise ValueError(f"Unknown zone: {zone_id}")

    current = ref[company.current_city]
    wpg = ref["winnipeg"]

    total_sqft = company.employee_count * sqft_per_employee
    office_savings = (
        current["office_rent_per_sqft"] - wpg["office_rent_per_sqft"]
    ) * total_sqft

    col_ratio = (
        current["cost_of_living_index"] - wpg["cost_of_living_index"]
    ) / current["cost_of_living_index"]
    salary_adjustment = company.avg_salary * col_ratio * company.employee_count

    total_savings = office_savings + salary_adjustment

    rent_savings = current["avg_monthly_rent_1br"] - wpg["avg_monthly_rent_1br"]
    disposable_gain = rent_savings * 12

    commute_reduction = current["avg_commute_minutes"] - wpg["avg_commute_minutes"]

    # Homeownership projection: Winnipeg avg ~70%, adjusted by housing savings
    housing_ratio = wpg["avg_housing_price"] / current["avg_housing_price"]
    projected_homeownership = min(0.85, 0.45 + (1 - housing_ratio) * 0.5)

    # Retention risk modeling (simplified heuristic)
    retention_without = 0.72  # base retention without lifestyle sell
    lifestyle_boost = min(0.20, disposable_gain / 100000)
    retention_with = min(0.95, retention_without + lifestyle_boost)

    return ImpactResponse(
        company_name=company.company_name,
        current_city=current["display_name"],
        selected_zone=zone["name"],
        employee_count=company.employee_count,
        annual_office_savings=round(office_savings, 2),
        annual_salary_adjustment=round(salary_adjustment, 2),
        total_annual_savings=round(total_savings, 2),
        per_employee_disposable_income_gain=round(disposable_gain, 2),
        projected_homeownership_rate=round(projected_homeownership, 2),
        commute_reduction_minutes=round(commute_reduction, 1),
        five_year_projection=round(total_savings * 5, 2),
        retention_risk_without_lifestyle=round(retention_without, 2),
        retention_risk_with_lifestyle=round(retention_with, 2),
    )
