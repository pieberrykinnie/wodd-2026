from typing import Literal

from pydantic import BaseModel, Field

SUPPORTED_CITIES = Literal[
    "toronto", "vancouver", "montreal", "calgary", "ottawa"
]


class CompanyInput(BaseModel):
    company_name: str = Field(
        ...,
        min_length=1,
        max_length=200,
        examples=["Acme Corp"],
    )
    current_city: SUPPORTED_CITIES = Field(
        ...,
        description="City the company is currently located in",
    )
    employee_count: int = Field(
        ...,
        gt=0,
        le=10000,
        examples=[50],
    )
    avg_salary: float = Field(
        ...,
        gt=0,
        description="Average annual employee salary in CAD",
        examples=[85000.0],
    )


class ImpactRequest(BaseModel):
    company: CompanyInput
    selected_zone_id: str = Field(..., examples=["exchange-district"])
    office_sqft_per_employee: float = Field(
        default=150.0,
        gt=0,
        description="Square feet of office space per employee",
    )


class MigrationPlanRequest(BaseModel):
    company: CompanyInput
    selected_zone_id: str = Field(..., examples=["exchange-district"])
    timeline_months: int = Field(
        default=6,
        ge=3,
        le=36,
        description="Desired migration timeline in months",
    )


class WelcomeGuideRequest(BaseModel):
    company: CompanyInput
    selected_zone_id: str = Field(..., examples=["exchange-district"])


class DiscoveryWeekendRequest(BaseModel):
    selected_zone_id: str = Field(..., examples=["exchange-district"])
    travel_month: int = Field(
        ...,
        ge=1,
        le=12,
        description="Month of travel (1-12)",
        examples=[6],
    )
