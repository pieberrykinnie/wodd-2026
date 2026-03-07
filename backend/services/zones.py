import json
from pathlib import Path

from models.responses import (
    BusinessInfo,
    HeatmapDataResponse,
    HeatmapPoint,
    SignalMax,
    TransitStopInfo,
    ZoneDetail,
    ZoneSummary,
)
from services import socrata, transit

_ZONE_DEFS: list[dict] | None = None
_DATA_PATH = Path(__file__).parent.parent / "data" / "zones.json"
_COORDS_PATH = Path(__file__).parent.parent / "data" / "neighbourhood_coords.json"

_NEIGHBOURHOOD_COORDS: dict[str, tuple[float, float]] | None = None


def _load_neighbourhood_coords() -> dict[str, tuple[float, float]]:
    global _NEIGHBOURHOOD_COORDS
    if _NEIGHBOURHOOD_COORDS is None:
        raw: list[dict] = json.loads(_COORDS_PATH.read_text())
        _NEIGHBOURHOOD_COORDS = {
            entry["name"].upper(): (entry["lat"], entry["lng"]) for entry in raw
        }
    return _NEIGHBOURHOOD_COORDS


def _load_zone_defs() -> list[dict]:
    global _ZONE_DEFS
    if _ZONE_DEFS is None:
        _ZONE_DEFS = json.loads(_DATA_PATH.read_text())
    return _ZONE_DEFS


def _lookup(
    data: list[dict],
    field: str,
    value_field: str,
    names: list[str],
) -> float | None:
    total = 0.0
    found = False
    for row in data:
        if row.get(field, "").upper() in [n.upper() for n in names]:
            try:
                total += float(row[value_field])
                found = True
            except (ValueError, TypeError, KeyError):
                continue
    return total if found else None


def _lookup_avg(
    data: list[dict],
    field: str,
    value_field: str,
    names: list[str],
) -> float | None:
    values: list[float] = []
    for row in data:
        if row.get(field, "").upper() in [n.upper() for n in names]:
            try:
                values.append(float(row[value_field]))
            except (ValueError, TypeError, KeyError):
                continue
    return round(sum(values) / len(values), 2) if values else None


async def _fetch_business_counts() -> list[dict]:
    return await socrata.fetch_dataset(
        "business_licenses",
        select="neighbourhood_name, count(*) as cnt",
        where="status='Issued'",
        group="neighbourhood_name",
        limit=1000,
    )


async def _fetch_property_averages() -> list[dict]:
    return await socrata.fetch_dataset(
        "assessment_parcels",
        select="neighbourhood_area, avg(total_assessed_value) as avg_val",
        group="neighbourhood_area",
        limit=1000,
    )


async def _fetch_permit_values() -> list[dict]:
    return await socrata.fetch_dataset(
        "building_permits",
        select="neighbourhood, sum(total_declared_construction_value) as total_val",
        where="year >= '2023'",
        group="neighbourhood",
        limit=1000,
    )


async def _fetch_tree_counts() -> list[dict]:
    return await socrata.fetch_dataset(
        "trees",
        select="neighbourhood, count(*) as cnt",
        group="neighbourhood",
        limit=1000,
    )


async def get_all_zones() -> list[ZoneSummary]:
    zones = _load_zone_defs()

    try:
        biz_counts = await _fetch_business_counts()
    except Exception:
        biz_counts = []
    try:
        property_avgs = await _fetch_property_averages()
    except Exception:
        property_avgs = []
    try:
        permit_values = await _fetch_permit_values()
    except Exception:
        permit_values = []

    results = []
    for z in zones:
        names = z["neighbourhood_names"]
        results.append(
            ZoneSummary(
                id=z["id"],
                name=z["name"],
                description=z["description"],
                persona=z["persona"],
                persona_label=z["persona_label"],
                category=z.get("category", "office"),
                lat=z["lat"],
                lng=z["lng"],
                highlights=z["highlights"],
                office_vibe=z["office_vibe"],
                neighbourhood_names=names,
                avg_property_value=_lookup_avg(
                    property_avgs, "neighbourhood_area", "avg_val", names
                ),
                active_business_count=int(v)
                if (v := _lookup(biz_counts, "neighbourhood_name", "cnt", names))
                is not None
                else None,
                recent_construction_value=_lookup(
                    permit_values, "neighbourhood", "total_val", names
                ),
            )
        )
    return results


async def get_zone_detail(zone_id: str) -> ZoneDetail | None:
    zones = _load_zone_defs()
    zone_def = next((z for z in zones if z["id"] == zone_id), None)
    if zone_def is None:
        return None

    names = zone_def["neighbourhood_names"]

    try:
        property_avgs = await _fetch_property_averages()
    except Exception:
        property_avgs = []
    try:
        biz_counts = await _fetch_business_counts()
    except Exception:
        biz_counts = []
    try:
        permit_values = await _fetch_permit_values()
    except Exception:
        permit_values = []

    # Fetch sample businesses
    sample_businesses: list[BusinessInfo] = []
    try:
        names_filter = " OR ".join(
            f"neighbourhood_name='{n}'" for n in names
        )
        biz_data = await socrata.fetch_dataset(
            "business_licenses",
            select="trade_name, address, subdescription, folder_description",
            where=f"status='Issued' AND ({names_filter})",
            group="trade_name, address, subdescription, folder_description",
            limit=15,
        )
        seen: set[str] = set()
        for b in biz_data:
            name = b.get("trade_name", "Unknown")
            if name in seen:
                continue
            seen.add(name)
            sample_businesses.append(
                BusinessInfo(
                    trade_name=name,
                    address=b.get("address", ""),
                    category=b.get("subdescription", b.get("folder_description", "")),
                )
            )
            if len(sample_businesses) >= 10:
                break
    except Exception:
        pass

    # Fetch nearby transit stops
    nearby_stops: list[TransitStopInfo] = []
    try:
        raw_stops = await transit.get_stops_near(
            zone_def["lat"],
            zone_def["lng"],
            zone_def.get("transit_radius_m", 500),
        )
        for s in raw_stops[:15]:
            stop_key = s.get("key", s.get("number", 0))
            stop_name = s.get("name", "")
            distances = s.get("distances", {})
            distance_m = float(distances.get("direct", 0))

            route_names: list[str] = []
            if "routes" in s:
                for r in s["routes"]:
                    if isinstance(r, dict):
                        route_names.append(str(r.get("key", r.get("number", ""))))
                    else:
                        route_names.append(str(r))

            nearby_stops.append(
                TransitStopInfo(
                    stop_number=int(stop_key),
                    name=stop_name,
                    distance_m=distance_m,
                    routes=route_names,
                )
            )
    except Exception:
        pass

    # Fetch avg year built
    avg_year: int | None = None
    try:
        names_filter = " OR ".join(
            f"neighbourhood_area='{n}'" for n in names
        )
        year_data = await socrata.fetch_dataset(
            "assessment_parcels",
            select="avg(year_built) as avg_yr",
            where=f"({names_filter}) AND year_built IS NOT NULL",
            limit=1,
        )
        if year_data:
            avg_year = int(float(year_data[0]["avg_yr"]))
    except Exception:
        pass

    return ZoneDetail(
        id=zone_def["id"],
        name=zone_def["name"],
        description=zone_def["description"],
        persona=zone_def["persona"],
        persona_label=zone_def["persona_label"],
        category=zone_def.get("category", "office"),
        lat=zone_def["lat"],
        lng=zone_def["lng"],
        highlights=zone_def["highlights"],
        office_vibe=zone_def["office_vibe"],
        avg_property_value=_lookup_avg(
            property_avgs, "neighbourhood_area", "avg_val", names
        ),
        active_business_count=int(v)
        if (v := _lookup(biz_counts, "neighbourhood_name", "cnt", names))
        is not None
        else None,
        transit_stop_count=len(nearby_stops) if nearby_stops else None,
        recent_construction_value=_lookup(
            permit_values, "neighbourhood", "total_val", names
        ),
        sample_businesses=sample_businesses,
        nearby_transit_stops=nearby_stops,
        avg_year_built=avg_year,
    )


def _normalise(values: list[float]) -> list[float]:
    """Min-max normalise a list of floats to [0, 1]."""
    if not values:
        return values
    lo, hi = min(values), max(values)
    if hi == lo:
        return [0.5] * len(values)
    return [(v - lo) / (hi - lo) for v in values]


async def get_heatmap_data() -> HeatmapDataResponse:
    """
    Return per-neighbourhood density points for the heatmap layer.
    Each point carries normalised signals (business activity, property value,
    construction activity) and a composite weight.
    """
    coords = _load_neighbourhood_coords()

    # Fetch all three Socrata datasets in parallel
    try:
        biz_counts = await _fetch_business_counts()
    except Exception:
        biz_counts = []
    try:
        property_avgs = await _fetch_property_averages()
    except Exception:
        property_avgs = []
    try:
        permit_values = await _fetch_permit_values()
    except Exception:
        permit_values = []

    # Build name-keyed lookup dicts
    biz_lookup: dict[str, float] = {}
    for row in biz_counts:
        key = row.get("neighbourhood_name", "").upper()
        try:
            biz_lookup[key] = float(row["cnt"])
        except (ValueError, TypeError, KeyError):
            pass

    prop_lookup: dict[str, float] = {}
    for row in property_avgs:
        key = row.get("neighbourhood_area", "").upper()
        try:
            prop_lookup[key] = float(row["avg_val"])
        except (ValueError, TypeError, KeyError):
            pass

    permit_lookup: dict[str, float] = {}
    for row in permit_values:
        key = row.get("neighbourhood", "").upper()
        try:
            permit_lookup[key] = float(row["total_val"])
        except (ValueError, TypeError, KeyError):
            pass

    # Only include neighbourhoods we have coordinates for
    names = list(coords.keys())

    raw_biz = [biz_lookup.get(n, 0.0) for n in names]
    raw_prop = [prop_lookup.get(n, 0.0) for n in names]
    raw_permit = [permit_lookup.get(n, 0.0) for n in names]

    norm_biz = _normalise(raw_biz)
    norm_prop = _normalise(raw_prop)
    norm_permit = _normalise(raw_permit)

    signal_max = SignalMax(
        business=max(raw_biz) if raw_biz else 0.0,
        property=max(raw_prop) if raw_prop else 0.0,
        permit=max(raw_permit) if raw_permit else 0.0,
    )

    points: list[HeatmapPoint] = []
    for i, name in enumerate(names):
        lat, lng = coords[name]
        nb = norm_biz[i]
        np_ = norm_prop[i]
        npermit = norm_permit[i]
        # Skip neighbourhoods with no data at all
        if nb == 0.0 and np_ == 0.0 and npermit == 0.0:
            continue
        # Weighted composite: business 40%, property 35%, permits 25%
        weight = round(0.40 * nb + 0.35 * np_ + 0.25 * npermit, 4)
        points.append(
            HeatmapPoint(
                lat=lat,
                lng=lng,
                name=name.title(),
                weight=weight,
                business_count=round(nb, 4),
                property_value=round(np_, 4),
                permit_value=round(npermit, 4),
            )
        )

    return HeatmapDataResponse(points=points, signal_max=signal_max)
