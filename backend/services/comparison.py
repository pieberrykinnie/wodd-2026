import json
from pathlib import Path

from models.requests import CompanyInput
from models.responses import (
    CityMetrics,
    CityOption,
    CostComparisonResponse,
    SavingsBreakdown,
)

_REFERENCE_DATA: dict | None = None
_DATA_PATH = Path(__file__).parent.parent / "data" / "reference_cities.json"


def _load_reference_data() -> dict:
    global _REFERENCE_DATA
    if _REFERENCE_DATA is None:
        _REFERENCE_DATA = json.loads(_DATA_PATH.read_text())
    return _REFERENCE_DATA


def get_supported_cities() -> list[CityOption]:
    ref = _load_reference_data()
    return [
        CityOption(key=k, display_name=v["display_name"])
        for k, v in ref.items()
        if k != "winnipeg"
    ]


def compute_comparison(
    company: CompanyInput,
    sqft_per_employee: float = 150.0,
) -> CostComparisonResponse:
    ref = _load_reference_data()
    city_key = company.current_city.lower()
    current = ref.get(city_key) or ref["toronto"]
    wpg = ref["winnipeg"]

    total_sqft = company.employee_count * sqft_per_employee

    office_savings = (
        current["office_rent_per_sqft"] - wpg["office_rent_per_sqft"]
    ) * total_sqft

    col_ratio = (
        current["cost_of_living_index"] - wpg["cost_of_living_index"]
    ) / current["cost_of_living_index"]
    salary_adjustment = company.avg_salary * col_ratio * company.employee_count

    housing_savings = current["avg_housing_price"] - wpg["avg_housing_price"]
    rent_savings = current["avg_monthly_rent_1br"] - wpg["avg_monthly_rent_1br"]
    commute_diff = current["avg_commute_minutes"] - wpg["avg_commute_minutes"]

    disposable_gain = rent_savings * 12

    total_savings = office_savings + salary_adjustment

    resolved_key = city_key if city_key in ref else "toronto"

    return CostComparisonResponse(
        company_name=company.company_name,
        employee_count=company.employee_count,
        current_city=CityMetrics(city_key=resolved_key, **current),
        winnipeg=CityMetrics(city_key="winnipeg", **wpg),
        savings=SavingsBreakdown(
            annual_office_rent_savings=round(office_savings, 2),
            annual_salary_adjustment_savings=round(salary_adjustment, 2),
            per_employee_housing_savings=round(housing_savings, 2),
            per_employee_monthly_rent_savings=round(rent_savings, 2),
            per_employee_disposable_income_gain=round(disposable_gain, 2),
            commute_time_saved_minutes=round(commute_diff, 1),
        ),
        total_estimated_annual_savings=round(total_savings, 2),
    )
