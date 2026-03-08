/**
 * lib/api.ts — Single data access layer.
 * Static helpers return local JSON (used for maps, charts, fallback).
 * Async helpers call the FastAPI backend with silent fallback on error.
 */

import citiesRaw from "@/data/cities.json";
import hotspotsRaw from "@/data/winnipeg-hotspots.json";
import neighborhoodsRaw from "@/data/neighborhoods.json";
import commuteRaw from "@/data/commute-data.json";
import festivalsRaw from "@/data/festivals.json";

// ── Type Definitions ────────────────────────────────────────
export interface City {
  id: string;
  name: string;
  province: string;
  coords: [number, number];
  costIndex: number;
  homePrice: number;
  officeSqft: number;
  avgCommute: number;
  avgSalary: number;
  monthlyRent2br: number;
  taxRate: number;
  color: string;
  climate: string;
  sunshineHours: number;
  transitScore: number;
  walkscore: number;
  comparisons: Record<string, number>;
}

export interface OfficeHotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  officeRent: number;
  vacancyRate: string;
  size: string;
  highlights: string[];
  transitScore: number;
  nearbyAmenities: string[];
}

export interface NeighborhoodHotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  avgHomePrice: number;
  avgRent1br: number;
  avgRent2br: number;
  commuteToCore: number;
  walkscore: number;
  persona: string;
  personaColor: string;
  highlights: string[];
}

export interface LifestyleHotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  type: string;
  typeColor: string;
  highlights: string[];
  visitorsPerYear: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  coords: [number, number];
  commuteMins: number;
  transitRoutes: string[];
  walkScore: number;
  avgRent1br: number;
  avgRent2br: number;
  avgHomePrice: number;
  description: string;
  persona: string;
}

export interface Festival {
  id: string;
  name: string;
  month: string;
  season: string;
  description: string;
  attendance: string;
  neighborhood: string;
}

// ── Data Accessors ──────────────────────────────────────────

export function getCities(): City[] {
  return citiesRaw as City[];
}

export function getCityById(id: string): City | undefined {
  return (citiesRaw as City[]).find((c) => c.id === id);
}

export function getWinnipeg(): City {
  return getCityById("winnipeg")!;
}

export function getHotspots(): {
  office: OfficeHotspot[];
  neighborhood: NeighborhoodHotspot[];
  lifestyle: LifestyleHotspot[];
} {
  return hotspotsRaw as {
    office: OfficeHotspot[];
    neighborhood: NeighborhoodHotspot[];
    lifestyle: LifestyleHotspot[];
  };
}

export function getNeighborhoods(): Neighborhood[] {
  return neighborhoodsRaw as Neighborhood[];
}

export function getCommuteData(cityId: string) {
  const data = commuteRaw.cities as Record<string, typeof commuteRaw.cities.toronto>;
  return data[cityId] ?? data["toronto"];
}

export function getAllCommuteData() {
  return commuteRaw.cities;
}

export function getFestivals(): Festival[] {
  return festivalsRaw as Festival[];
}

export function getSupportedCities(): { id: string; name: string }[] {
  return (citiesRaw as City[])
    .filter((c) => c.id !== "winnipeg")
    .map((c) => ({ id: c.id, name: c.name }));
}

// ── Backend API Types ────────────────────────────────────────

export interface CityOption {
  key: string;
  display_name: string;
}

export interface CityMetrics {
  city_key: string;
  display_name: string;
  office_rent_per_sqft: number;
  avg_housing_price: number;
  avg_monthly_rent_1br: number;
  avg_commute_minutes: number;
  provincial_tax_rate: number;
  cost_of_living_index: number;
  avg_salary: number;
}

export interface SavingsBreakdown {
  annual_office_rent_savings: number;
  annual_salary_adjustment_savings: number;
  per_employee_housing_savings: number;
  per_employee_monthly_rent_savings: number;
  per_employee_disposable_income_gain: number;
  commute_time_saved_minutes: number;
}

export interface CostComparisonResponse {
  company_name: string;
  employee_count: number;
  current_city: CityMetrics;
  winnipeg: CityMetrics;
  savings: SavingsBreakdown;
  total_estimated_annual_savings: number;
}

export interface ZoneSummary {
  id: string;
  name: string;
  description: string;
  persona: string;
  persona_label: string;
  category: "office" | "neighborhood" | "lifestyle";
  lat: number;
  lng: number;
  highlights: string[];
  office_vibe: string;
  neighbourhood_names?: string[];
  avg_property_value?: number;
  active_business_count?: number;
  transit_stop_count?: number;
  recent_construction_value?: number;
}

export interface ZoneDetail extends ZoneSummary {
  sample_businesses: Array<{ trade_name: string; address: string; category: string }>;
  nearby_transit_stops: Array<{
    stop_number: string;
    name: string;
    distance_m: number;
    routes: string[];
    lat?: number;
    lng?: number;
  }>;
  avg_year_built?: number;
}

export interface ImpactResponse {
  company_name: string;
  current_city: string;
  selected_zone: string;
  employee_count: number;
  annual_office_savings: number;
  annual_salary_adjustment: number;
  total_annual_savings: number;
  per_employee_disposable_income_gain: number;
  projected_homeownership_rate: number;
  commute_reduction_minutes: number;
  five_year_projection: number;
  retention_risk_without_lifestyle: number;
  retention_risk_with_lifestyle: number;
}

export interface TimelinePhase {
  phase: string;
  month_start: number;
  month_end: number;
  description: string;
  actions: string[];
}

export interface RiskMitigation {
  risk: string;
  mitigation: string;
}

export interface MigrationPlanResponse {
  company_name: string;
  selected_zone: string;
  phases: TimelinePhase[];
  risks_and_mitigations: RiskMitigation[];
  raw_markdown: string;
}

export interface WelcomeGuideResponse {
  company_name: string;
  zone_name: string;
  raw_markdown: string;
}

export interface DiscoveryWeekendActivity {
  time: string;
  activity: string;
  location: string;
}

export interface DiscoveryWeekendDay {
  day: string;
  activities: DiscoveryWeekendActivity[];
}

export interface DiscoveryWeekendResponse {
  zone_name: string;
  travel_month: number;
  itinerary: DiscoveryWeekendDay[];
  seasonal_events: string[];
  raw_markdown: string;
}

export interface DataOverviewResponse {
  population_trend: Array<{ year: number; population: number }>;
  total_active_businesses: number;
  total_permits_ytd: number;
  sources: Array<{ name: string; url: string; licence: string }>;
}

// ── Backend API Helpers ──────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ── Backend API Functions ────────────────────────────────────

export async function fetchSupportedCities(): Promise<CityOption[]> {
  try {
    const data = await apiFetch<{ cities: CityOption[] }>("/api/comparison/cities");
    return data.cities;
  } catch {
    return getSupportedCities().map((c) => ({ key: c.id, display_name: c.name }));
  }
}

export async function fetchCostComparison(
  company_name: string,
  current_city: string,
  employee_count: number,
  avg_salary: number
): Promise<CostComparisonResponse | null> {
  try {
    return await apiFetch<CostComparisonResponse>("/api/comparison/cost", {
      method: "POST",
      body: JSON.stringify({ company_name, current_city, employee_count, avg_salary }),
    });
  } catch {
    return null;
  }
}

export async function fetchZones(): Promise<ZoneSummary[]> {
  try {
    const data = await apiFetch<{ zones: ZoneSummary[] }>("/api/zones");
    return data.zones;
  } catch {
    return [];
  }
}

export async function fetchZoneDetail(zoneId: string): Promise<ZoneDetail | null> {
  try {
    return await apiFetch<ZoneDetail>(`/api/zones/${zoneId}`);
  } catch {
    return null;
  }
}

export async function fetchImpact(
  company_name: string,
  current_city: string,
  employee_count: number,
  avg_salary: number,
  selected_zone_id: string,
  office_sqft_per_employee: number
): Promise<ImpactResponse | null> {
  try {
    return await apiFetch<ImpactResponse>("/api/calculator/impact", {
      method: "POST",
      body: JSON.stringify({
        company: { company_name, current_city, employee_count, avg_salary },
        selected_zone_id,
        office_sqft_per_employee,
      }),
    });
  } catch {
    return null;
  }
}

export async function fetchMigrationPlan(
  company_name: string,
  current_city: string,
  employee_count: number,
  avg_salary: number,
  selected_zone_id: string,
  timeline_months = 6
): Promise<MigrationPlanResponse | null> {
  try {
    return await apiFetch<MigrationPlanResponse>("/api/plan/migration", {
      method: "POST",
      body: JSON.stringify({
        company: { company_name, current_city, employee_count, avg_salary },
        selected_zone_id,
        timeline_months,
      }),
    });
  } catch {
    return null;
  }
}

export async function fetchWelcomeGuide(
  company_name: string,
  current_city: string,
  employee_count: number,
  avg_salary: number,
  selected_zone_id: string
): Promise<WelcomeGuideResponse | null> {
  try {
    return await apiFetch<WelcomeGuideResponse>("/api/plan/welcome-guide", {
      method: "POST",
      body: JSON.stringify({
        company: { company_name, current_city, employee_count, avg_salary },
        selected_zone_id,
      }),
    });
  } catch {
    return null;
  }
}

export async function fetchDiscoveryWeekend(
  selected_zone_id: string,
  travel_month: number
): Promise<DiscoveryWeekendResponse | null> {
  try {
    return await apiFetch<DiscoveryWeekendResponse>("/api/plan/discovery-weekend", {
      method: "POST",
      body: JSON.stringify({ selected_zone_id, travel_month }),
    });
  } catch {
    return null;
  }
}

export async function fetchDataOverview(): Promise<DataOverviewResponse | null> {
  try {
    return await apiFetch<DataOverviewResponse>("/api/data/overview");
  } catch {
    return null;
  }
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  name: string;
  weight: number;
  business_count?: number;
  property_value?: number;
  permit_value?: number;
}

export interface HeatmapDataResponse {
  points: HeatmapPoint[];
  signal_max: { business: number; property: number; permit: number };
}

export async function fetchHeatmapData(): Promise<HeatmapDataResponse | null> {
  try {
    return await apiFetch<HeatmapDataResponse>("/api/zones/heatmap");
  } catch {
    return null;
  }
}

