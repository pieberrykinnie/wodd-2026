import json
import re

from groq import AsyncGroq

from core.config import get_settings
from models.responses import (
    DiscoveryWeekendActivity,
    DiscoveryWeekendDay,
    DiscoveryWeekendResponse,
    MigrationPlanResponse,
    RiskMitigation,
    TimelinePhase,
    WelcomeGuideResponse,
)

MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]


def _sanitize(text: str) -> str:
    """Strip anything that isn't alphanumeric, spaces, or basic punctuation."""
    return re.sub(r"[^\w\s.,&'()-]", "", text)[:200]


async def generate_migration_plan(context: dict) -> MigrationPlanResponse:
    settings = get_settings()
    client = AsyncGroq(api_key=settings.groq_api_key)

    system_prompt = (
        "You are a corporate relocation strategist specializing in Winnipeg, Manitoba. "
        "Generate a detailed migration plan in valid JSON with this exact schema:\n"
        '{"phases": [{"phase": "string", "month_start": int, "month_end": int, '
        '"description": "string", "actions": ["string"]}], '
        '"risks_and_mitigations": [{"risk": "string", "mitigation": "string"}]}\n'
        "No markdown, no commentary. Only output the JSON object."
    )

    user_prompt = (
        f"Company: {_sanitize(context['company_name'])}\n"
        f"Current City: {_sanitize(context['current_city'])}\n"
        f"Employees: {context['employee_count']}\n"
        f"Target Zone: {_sanitize(context['zone_name'])}\n"
        f"Timeline: {context['timeline_months']} months\n"
        f"Estimated Annual Savings: ${context['annual_savings']:,.0f}\n\n"
        "Generate a phased migration plan with at least 3 phases. "
        "Include risks specific to relocating to Winnipeg (winter, talent retention, etc)."
    )

    response = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=2000,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content or "{}"

    try:
        parsed = json.loads(raw)
        phases = [
            TimelinePhase(**p) for p in parsed.get("phases", [])
        ]
        risks = [
            RiskMitigation(**r) for r in parsed.get("risks_and_mitigations", [])
        ]
    except (json.JSONDecodeError, TypeError, KeyError):
        phases = []
        risks = []

    return MigrationPlanResponse(
        company_name=context["company_name"],
        selected_zone=context["zone_name"],
        phases=phases,
        risks_and_mitigations=risks,
        raw_markdown=raw,
    )


async def generate_welcome_guide(context: dict) -> WelcomeGuideResponse:
    settings = get_settings()
    client = AsyncGroq(api_key=settings.groq_api_key)

    system_prompt = (
        "You are a relocation specialist creating an employee welcome guide for "
        "people moving to Winnipeg, Manitoba. Write a comprehensive, warm, and "
        "practical guide in markdown format. Include sections on: neighbourhood "
        "overview, getting around (transit, commute), dining & culture, winter "
        "readiness (block heaters, parkas, skywalks), provincial switches "
        "(health card, auto insurance MPI, Manitoba Hydro), local services, "
        "and lifestyle tips."
    )

    user_prompt = (
        f"Company: {_sanitize(context['company_name'])}\n"
        f"Moving from: {_sanitize(context['current_city'])}\n"
        f"Employees: {context['employee_count']}\n"
        f"Target Neighbourhood: {_sanitize(context['zone_name'])} - "
        f"{_sanitize(context['zone_description'])}\n\n"
        "Write a welcome guide for employees relocating to this neighbourhood."
    )

    response = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=2500,
    )

    raw = response.choices[0].message.content or ""

    return WelcomeGuideResponse(
        company_name=context["company_name"],
        zone_name=context["zone_name"],
        raw_markdown=raw,
    )


async def generate_discovery_weekend(context: dict) -> DiscoveryWeekendResponse:
    settings = get_settings()
    client = AsyncGroq(api_key=settings.groq_api_key)

    month_name = MONTH_NAMES[context["travel_month"]]

    system_prompt = (
        "You are a Winnipeg tourism and relocation expert. Generate a 2-day "
        "Discovery Weekend itinerary in valid JSON with this exact schema:\n"
        '{"itinerary": [{"day": int, "activities": [{"time": "string", '
        '"activity": "string", "location": "string"}]}], '
        '"seasonal_events": ["string"]}\n'
        "No markdown, no commentary. Only output the JSON object."
    )

    user_prompt = (
        f"Zone: {_sanitize(context['zone_name'])}\n"
        f"Travel Month: {month_name}\n"
        f"Zone Description: {_sanitize(context['zone_description'])}\n\n"
        "Create a 2-day CEO/HR discovery weekend itinerary. Day 1: arrive, "
        "explore the zone, dinner at a notable restaurant. Day 2: neighbourhood "
        "tours, cultural attractions, meetings with economic development. "
        f"Include seasonal events happening in {month_name}."
    )

    response = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=1500,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content or "{}"

    try:
        parsed = json.loads(raw)
        itinerary = [
            DiscoveryWeekendDay(
                day=d["day"],
                activities=[DiscoveryWeekendActivity(**a) for a in d["activities"]],
            )
            for d in parsed.get("itinerary", [])
        ]
        seasonal = parsed.get("seasonal_events", [])
    except (json.JSONDecodeError, TypeError, KeyError):
        itinerary = []
        seasonal = []

    return DiscoveryWeekendResponse(
        zone_name=context["zone_name"],
        travel_month=context["travel_month"],
        itinerary=itinerary,
        seasonal_events=seasonal,
        raw_markdown=raw,
    )
