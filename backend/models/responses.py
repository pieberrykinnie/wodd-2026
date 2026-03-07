from pydantic import BaseModel


# --- Cost Comparison ---


class CityMetrics(BaseModel):
    city_key: str
    display_name: str
    office_rent_per_sqft: float
    avg_housing_price: float
    avg_monthly_rent_1br: float
    avg_commute_minutes: float
    provincial_tax_rate: float
    cost_of_living_index: float
    avg_salary: float


class SavingsBreakdown(BaseModel):
    annual_office_rent_savings: float
    annual_salary_adjustment_savings: float
    per_employee_housing_savings: float
    per_employee_monthly_rent_savings: float
    per_employee_disposable_income_gain: float
    commute_time_saved_minutes: float


class CostComparisonResponse(BaseModel):
    company_name: str
    employee_count: int
    current_city: CityMetrics
    winnipeg: CityMetrics
    savings: SavingsBreakdown
    total_estimated_annual_savings: float


class CityOption(BaseModel):
    key: str
    display_name: str


class CitiesListResponse(BaseModel):
    cities: list[CityOption]


# --- Zones ---


class BusinessInfo(BaseModel):
    trade_name: str
    address: str
    category: str


class TransitStopInfo(BaseModel):
    stop_number: int
    name: str
    distance_m: float
    routes: list[str]


class ZoneSummary(BaseModel):
    id: str
    name: str
    description: str
    persona: str
    persona_label: str
    lat: float
    lng: float
    highlights: list[str]
    office_vibe: str
    avg_property_value: float | None = None
    active_business_count: int | None = None
    transit_stop_count: int | None = None
    recent_construction_value: float | None = None


class ZoneDetail(ZoneSummary):
    sample_businesses: list[BusinessInfo] = []
    nearby_transit_stops: list[TransitStopInfo] = []
    avg_year_built: int | None = None


class ZonesListResponse(BaseModel):
    zones: list[ZoneSummary]


# --- Impact Calculator ---


class ImpactResponse(BaseModel):
    company_name: str
    current_city: str
    selected_zone: str
    employee_count: int
    annual_office_savings: float
    annual_salary_adjustment: float
    total_annual_savings: float
    per_employee_disposable_income_gain: float
    projected_homeownership_rate: float
    commute_reduction_minutes: float
    five_year_projection: float
    retention_risk_without_lifestyle: float
    retention_risk_with_lifestyle: float


# --- Migration Plan (LLM) ---


class TimelinePhase(BaseModel):
    phase: str
    month_start: int
    month_end: int
    description: str
    actions: list[str]


class RiskMitigation(BaseModel):
    risk: str
    mitigation: str


class MigrationPlanResponse(BaseModel):
    company_name: str
    selected_zone: str
    phases: list[TimelinePhase]
    risks_and_mitigations: list[RiskMitigation]
    raw_markdown: str


class WelcomeGuideResponse(BaseModel):
    company_name: str
    zone_name: str
    raw_markdown: str


class DiscoveryWeekendActivity(BaseModel):
    time: str
    activity: str
    location: str


class DiscoveryWeekendDay(BaseModel):
    day: int
    activities: list[DiscoveryWeekendActivity]


class DiscoveryWeekendResponse(BaseModel):
    zone_name: str
    travel_month: int
    itinerary: list[DiscoveryWeekendDay]
    seasonal_events: list[str]
    raw_markdown: str


# --- Data Overview ---


class PopulationDataPoint(BaseModel):
    year: str
    population: float


class DataSource(BaseModel):
    name: str
    url: str
    licence: str


class DataOverviewResponse(BaseModel):
    population_trend: list[PopulationDataPoint]
    total_active_businesses: int
    total_permits_ytd: int
    sources: list[DataSource]
