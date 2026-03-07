import marimo

__generated_with = "0.20.4"
app = marimo.App(width="full")


@app.cell
def _():
    import marimo as mo
    import plotly.graph_objects as go
    import pandas as pd
    import httpx
    return go, httpx, mo, pd


@app.cell
def _(httpx, pd):
    # ── Statistics Canada Web Data Service ──────────────────────────────
    # REST API docs: https://www.statcan.gc.ca/en/developers/wds
    # No authentication required. HTTPS only. Rate limit: 300 req/min.
    #
    # Table used:
    #   34-10-0133-01  CMHC, average rents for areas with 10,000+ pop
    #
    # CRITICAL: coordinates must be zero-padded to exactly 10 positions.
    # ────────────────────────────────────────────────────────────────────

    _STATSCAN_URL = (
        "https://www150.statcan.gc.ca/t1/wds/rest/"
        "getDataFromCubePidCoordAndLatestNPeriods"
    )
    _TIMEOUT = 10.0

    def _pad_coord(coord: str) -> str:
        """Pad a dot-separated coordinate to exactly 10 positions."""
        parts = coord.split(".")
        return ".".join(parts + ["0"] * (10 - len(parts)))

    def _statscan_fetch(product_id: int, coordinate: str, latest_n: int = 1):
        """Fetch a single series from StatsCan WDS. Returns data points or []."""
        payload = [
            {
                "productId": product_id,
                "coordinate": _pad_coord(coordinate),
                "latestN": latest_n,
            }
        ]
        try:
            resp = httpx.post(
                _STATSCAN_URL,
                json=payload,
                timeout=_TIMEOUT,
                headers={"Content-Type": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()
            if (
                isinstance(data, list)
                and len(data) > 0
                and data[0].get("status") == "SUCCESS"
            ):
                return data[0]["object"].get("vectorDataPoint", [])
            return []
        except (httpx.HTTPError, ValueError, TypeError, KeyError, OSError):
            return []

    # ── CMHC Average 2BR Rent (latest year) per city ────────────────────
    # Table 34100133, coordinate: {geo}.1.3
    #   dim1 = geography member ID
    #   dim2 = 1 (Apartment structures of three units and over)
    #   dim3 = 3 (Two bedroom units)
    _RENT_GEO = {
        "Toronto": 125,
        "Vancouver": 184,
        "Montréal": 46,
        "Winnipeg": 134,
    }

    _rent_rows = []
    for city, geo_id in _RENT_GEO.items():
        points = _statscan_fetch(34100133, f"{geo_id}.1.3", latest_n=1)
        if points:
            val = points[0].get("value")
            if val is not None:
                _rent_rows.append({
                    "City": city,
                    "Avg 2BR Rent": float(val),
                    "Period": points[0].get("refPer", ""),
                })

    rent_df = pd.DataFrame(_rent_rows) if _rent_rows else pd.DataFrame()
    statscan_ok = len(rent_df) > 0
    return rent_df, statscan_ok


@app.cell
def _(httpx, pd):
    # ── City of Winnipeg Open Data Portal (Socrata API) ─────────────────
    # https://data.winnipeg.ca  — No authentication required.
    #
    # ── City of Vancouver Open Data (OpenDataSoft API) ──────────────────
    # https://opendata.vancouver.ca  — No authentication required.
    # ────────────────────────────────────────────────────────────────────

    _SOCRATA_BASE = "https://data.winnipeg.ca/resource"
    _ODS_BASE = "https://opendata.vancouver.ca/api/v2/catalog/datasets"
    _TIMEOUT = 10.0

    def _socrata_fetch(dataset_id: str, params: dict) -> list[dict]:
        """Fetch from Winnipeg Open Data (Socrata). Returns [] on failure."""
        url = f"{_SOCRATA_BASE}/{dataset_id}.json"
        try:
            resp = httpx.get(url, params=params, timeout=_TIMEOUT)
            resp.raise_for_status()
            data = resp.json()
            return data if isinstance(data, list) else []
        except (httpx.HTTPError, ValueError, TypeError, OSError):
            return []

    def _ods_fetch(dataset_id: str, params: dict) -> list[dict]:
        """Fetch from Vancouver Open Data (OpenDataSoft). Returns [] on failure."""
        url = f"{_ODS_BASE}/{dataset_id}/records"
        try:
            resp = httpx.get(url, params=params, timeout=_TIMEOUT)
            resp.raise_for_status()
            data = resp.json()
            if isinstance(data, dict) and "records" in data:
                return [
                    r.get("record", {}).get("fields", {})
                    for r in data["records"]
                ]
            return []
        except (httpx.HTTPError, ValueError, TypeError, KeyError, OSError):
            return []

    # ── Winnipeg: Building permits (annual construction investment) ─────
    # Column: total_declared_construction_value
    _wpg_permits_raw = _socrata_fetch("p5sy-gt7y", {
        "$select": "year, SUM(total_declared_construction_value) as total_value",
        "$group": "year",
        "$order": "year ASC",
        "$where": (
            "total_declared_construction_value IS NOT NULL "
            "AND year IS NOT NULL"
        ),
        "$limit": 5000,
    })
    wpg_permits_df = pd.DataFrame(_wpg_permits_raw)
    if not wpg_permits_df.empty:
        wpg_permits_df["year"] = pd.to_numeric(
            wpg_permits_df["year"], errors="coerce"
        )
        wpg_permits_df["total_value"] = pd.to_numeric(
            wpg_permits_df["total_value"], errors="coerce"
        )
        wpg_permits_df = wpg_permits_df.dropna(subset=["year", "total_value"])
        wpg_permits_df = wpg_permits_df[
            wpg_permits_df["year"] >= 2010
        ].sort_values("year")

    # ── Winnipeg: Business licences (total count) ───────────────────────
    _wpg_biz_raw = _socrata_fetch("d5k3-sfzx", {"$select": "count(*) as n"})
    wpg_biz_count = (
        int(_wpg_biz_raw[0]["n"])
        if _wpg_biz_raw and "n" in _wpg_biz_raw[0]
        else None
    )

    # ── Winnipeg: Assessment parcels (avg assessed property value) ──────
    # Column: total_assessed_value
    _wpg_assess_raw = _socrata_fetch("d4mq-wa44", {
        "$select": "AVG(total_assessed_value) as avg_value",
        "$where": "total_assessed_value > 0",
    })
    wpg_avg_assessment = None
    if _wpg_assess_raw and "avg_value" in _wpg_assess_raw[0]:
        try:
            wpg_avg_assessment = float(_wpg_assess_raw[0]["avg_value"])
        except (ValueError, TypeError):
            pass

    # ── Winnipeg: Population (historical + forecast) ──────────────────
    # Historical records use "city_of_winnipeg" (actual).
    # Forecast records (2024+) use "city_of_winnipeg_forecast_baseline".
    _wpg_pop_raw = _socrata_fetch("mhuw-u7yg", {
        "$order": "year ASC",
        "$limit": 100,
    })
    wpg_pop_df = pd.DataFrame(_wpg_pop_raw)
    if not wpg_pop_df.empty and "year" in wpg_pop_df.columns:
        wpg_pop_df["year"] = pd.to_datetime(
            wpg_pop_df["year"], errors="coerce"
        ).dt.year

        # Merge historical + forecast into a single "population" column
        _hist = pd.to_numeric(
            wpg_pop_df.get("city_of_winnipeg"), errors="coerce"
        )
        _fcast = pd.to_numeric(
            wpg_pop_df.get("city_of_winnipeg_forecast_baseline"), errors="coerce"
        )
        wpg_pop_df["population"] = _hist.combine_first(_fcast)

        wpg_pop_df = wpg_pop_df.dropna(
            subset=["year", "population"]
        ).sort_values("year")

    # ── Vancouver: Building permits (annual construction investment) ────
    _van_permits_raw = _ods_fetch("issued-building-permits", {
        "select": "issueyear, SUM(projectvalue) as total_value",
        "group_by": "issueyear",
        "order_by": "issueyear ASC",
        "limit": 50,
    })
    van_permits_df = pd.DataFrame(_van_permits_raw)
    if not van_permits_df.empty:
        van_permits_df = van_permits_df.rename(columns={"issueyear": "year"})
        van_permits_df["year"] = pd.to_numeric(
            van_permits_df["year"], errors="coerce"
        )
        van_permits_df["total_value"] = pd.to_numeric(
            van_permits_df["total_value"], errors="coerce"
        )
        van_permits_df = van_permits_df.dropna(
            subset=["year", "total_value"]
        ).sort_values("year")

    return (
        van_permits_df,
        wpg_avg_assessment,
        wpg_biz_count,
        wpg_permits_df,
        wpg_pop_df,
    )


@app.cell
def _():
    # ── Display constants ───────────────────────────────────────────────
    CITIES = ["Toronto", "Vancouver", "Montréal", "Winnipeg"]
    CITY_COLORS = {
        "Toronto": "#8B98A5",
        "Vancouver": "#4C6E91",
        "Montréal": "#5E8C6A",
        "Winnipeg": "#B23A2B",
    }
    return CITIES, CITY_COLORS


@app.cell
def _(
    CITY_COLORS,
    go,
    mo,
    pd,
    rent_df,
    statscan_ok,
    van_permits_df,
    wpg_avg_assessment,
    wpg_biz_count,
    wpg_permits_df,
    wpg_pop_df,
):
    # ── Chart helpers ───────────────────────────────────────────────────

    def _hbar(names, values, colors, fmt, title, x_range=None):
        """Horizontal bar chart for a single metric across cities."""
        fig = go.Figure(
            go.Bar(
                x=values,
                y=names,
                orientation="h",
                marker_color=colors,
                text=[fmt.format(v) for v in values],
                textposition="outside",
                textfont=dict(size=15),
            )
        )
        _range = x_range or ([0, max(values) * 1.35] if values else [0, 1])
        fig.update_layout(
            title=dict(
                text=f"<b>{title}</b>",
                font=dict(size=15),
                x=0.5,
                xanchor="center",
            ),
            template="plotly_white",
            height=260,
            margin=dict(t=45, b=15, l=100, r=80),
            xaxis=dict(visible=False, range=_range),
            yaxis=dict(tickfont=dict(size=14)),
            font=dict(family="Inter, system-ui, sans-serif"),
        )
        return fig

    def _sort_for_chart(df, value_col, ascending=True):
        """Sort df and return (names, values, colors) lists."""
        if df.empty:
            return [], [], []
        sorted_df = df.sort_values(value_col, ascending=ascending)
        names = sorted_df["City"].tolist()
        values = sorted_df[value_col].tolist()
        colors = [CITY_COLORS.get(c, "#999") for c in names]
        return names, values, colors

    # ══════════════════════════════════════════════════════════════════
    #  SLIDE 1 — Title / Hook
    # ══════════════════════════════════════════════════════════════════

    slide_title = mo.center(
        mo.md(
            """
<div style="padding: 60px 40px 40px;">
<h1 style="font-size: 2.8em; font-weight: 800; color: #1a1a2e; line-height: 1.2;">
Canadian companies are trapped<br>in expensive cities.
</h1>
<p style="font-size: 1.35em; color: #555; max-width: 750px; margin: 20px auto 0;">
Housing unaffordable. Office rents crushing.<br>
Commutes eating your people alive.
</p>
<p style="font-size: 1.5em; color: #B23A2B; font-weight: 700; margin-top: 30px;">
What if there was an arbitrage?
</p>
</div>
"""
        )
    )

    # ══════════════════════════════════════════════════════════════════
    #  SLIDE 2 — The Rent Gap (Live StatsCan / CMHC)
    # ══════════════════════════════════════════════════════════════════

    _slide2_parts = []

    if statscan_ok and not rent_df.empty:
        _rent_period = (
            rent_df["Period"].iloc[0][:4] if "Period" in rent_df.columns else ""
        )
        _rn, _rv, _rc = _sort_for_chart(rent_df, "Avg 2BR Rent", ascending=True)

        fig_rent = _hbar(
            _rn, _rv, _rc, "${:,.0f}/mo", f"Avg 2BR Rent ({_rent_period})"
        )

        _slide2_parts.append(
            mo.md(
                """
<h2 style="text-align:center; color:#1a1a2e; margin-bottom:0;">The Rent Gap</h2>
<p style="text-align:center; color:#888; font-size:0.9em; margin-top:4px;">
Live from Statistics Canada &mdash; CMHC Rental Market Survey
(<a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301"
   target="_blank" rel="noopener noreferrer">Table 34-10-0133</a>)
</p>
"""
            )
        )
        _slide2_parts.append(fig_rent)

        # Dynamic rent savings stats
        if "Winnipeg" in rent_df["City"].values:
            _wpg_rent = rent_df.loc[
                rent_df["City"] == "Winnipeg", "Avg 2BR Rent"
            ].iloc[0]

            # Compare against most expensive city
            _max_idx = rent_df["Avg 2BR Rent"].idxmax()
            _max_city = rent_df.loc[_max_idx, "City"]
            _max_rent = rent_df.loc[_max_idx, "Avg 2BR Rent"]
            _delta = _max_rent - _wpg_rent

            # Compare against Toronto specifically if it's not already max
            _tor_rent = None
            if "Toronto" in rent_df["City"].values:
                _tor_rent = rent_df.loc[
                    rent_df["City"] == "Toronto", "Avg 2BR Rent"
                ].iloc[0]
                _tor_delta = _tor_rent - _wpg_rent

            _stats = [
                mo.stat(
                    value=f"${_delta:,.0f}/mo",
                    label=f"Less than {_max_city}",
                    caption="Per employee household",
                    direction="decrease",
                    bordered=True,
                ),
            ]
            if _tor_rent is not None and _max_city != "Toronto":
                _stats.append(
                    mo.stat(
                        value=f"${_tor_delta:,.0f}/mo",
                        label="Less than Toronto",
                        caption="Per employee household",
                        direction="decrease",
                        bordered=True,
                    ),
                )
            _stats.append(
                mo.stat(
                    value=f"${_delta * 12:,.0f}/yr",
                    label="Annual savings per employee",
                    caption=f"vs {_max_city} — on housing alone",
                    direction="decrease",
                    bordered=True,
                ),
            )
            _slide2_parts.append(mo.center(mo.hstack(_stats, gap=1)))
    else:
        _slide2_parts.append(
            mo.md(
                '<h2 style="text-align:center; color:#1a1a2e;">The Rent Gap</h2>'
            )
        )
        _slide2_parts.append(
            mo.callout(
                mo.md(
                    "Statistics Canada API unavailable. "
                    "Verify network access to www150.statcan.gc.ca."
                ),
                kind="warn",
            )
        )

    slide_rent = mo.vstack(_slide2_parts)

    # ══════════════════════════════════════════════════════════════════
    #  SLIDE 3 — Not Just Affordable — Livable
    # ══════════════════════════════════════════════════════════════════

    _slide3_parts = [
        mo.md(
            """
<h2 style="text-align:center; color:#1a1a2e; margin-bottom:0;">
Not Just Affordable &mdash; Livable
</h2>
"""
        ),
    ]

    _slide3_charts = []

    # ── Sunshine hours ──────────────────────────────────────────────
    # From Environment & Climate Change Canada, Climate Normals 1991-2020.
    # Published reference data updated every 30 years — no live API exists.
    _sunshine_data = pd.DataFrame({
        "City": ["Toronto", "Vancouver", "Montréal", "Winnipeg"],
        "Sunshine (hrs/yr)": [2066, 1938, 2051, 2353],
    })
    _sun_sorted = _sunshine_data.sort_values("Sunshine (hrs/yr)", ascending=True)
    fig_sun = _hbar(
        _sun_sorted["City"].tolist(),
        _sun_sorted["Sunshine (hrs/yr)"].tolist(),
        [CITY_COLORS.get(c, "#999") for c in _sun_sorted["City"]],
        "{:,} hrs",
        "Annual Sunshine Hours",
        x_range=[0, 2700],
    )
    _slide3_charts.append(
        mo.vstack([
            fig_sun,
            mo.md(
                '<p style="color:#888; font-size:0.85em; text-align:center;">'
                "Source: Environment &amp; Climate Change Canada, "
                "Climate Normals 1991&ndash;2020</p>"
            ),
        ])
    )

    # ── Population forecast (live Socrata) ──────────────────────────
    if (
        not wpg_pop_df.empty
        and "population" in wpg_pop_df.columns
        and len(wpg_pop_df) > 3
    ):
        fig_pop = go.Figure(
            go.Scatter(
                x=wpg_pop_df["year"],
                y=wpg_pop_df["population"] / 1e6,
                mode="lines+markers",
                line=dict(color=CITY_COLORS["Winnipeg"], width=3),
                marker=dict(size=6),
                hovertemplate=(
                    "<b>%{x:.0f}</b><br>"
                    "Population: %{y:.2f}M<extra></extra>"
                ),
            )
        )
        fig_pop.update_layout(
            title=dict(
                text="<b>Winnipeg Population (Historical + Forecast)</b>",
                font=dict(size=15),
                x=0.5,
                xanchor="center",
            ),
            template="plotly_white",
            height=260,
            margin=dict(t=45, b=40, l=70, r=30),
            xaxis=dict(title="Year", tickformat="d"),
            yaxis=dict(title="Population (Millions)"),
            font=dict(family="Inter, system-ui, sans-serif", size=13),
        )
        _slide3_charts.append(
            mo.vstack([
                fig_pop,
                mo.md(
                    '<p style="color:#888; font-size:0.85em; text-align:center;">'
                    "Live from "
                    '<a href="https://data.winnipeg.ca/Makeready-Data/Population-of-Winnipeg/mhuw-u7yg"'
                    ' target="_blank" rel="noopener noreferrer">'
                    "City of Winnipeg Open Data</a> (mhuw-u7yg)</p>"
                ),
            ])
        )
    else:
        _slide3_charts.append(
            mo.callout(
                mo.md("Population forecast data unavailable."),
                kind="warn",
            )
        )

    _slide3_parts.append(mo.hstack(_slide3_charts, widths="equal"))

    _slide3_parts.append(
        mo.center(
            mo.md(
                """
<div style="margin-top: 8px;">
<span style="background:#FFF3E0; padding:8px 20px; border-radius:8px; font-size:1.1em;">
  Winnipeg: <strong>#1 sunniest major city in Canada</strong> at 2,353 hrs/year
</span>
</div>
"""
            )
        )
    )

    slide_livability = mo.vstack(_slide3_parts)

    # ══════════════════════════════════════════════════════════════════
    #  SLIDE 4 — Winnipeg Is Growing (Live Open Data)
    # ══════════════════════════════════════════════════════════════════

    _slide4_parts = [
        mo.md(
            """
<h2 style="text-align:center; color:#1a1a2e; margin-bottom:0;">Winnipeg Is Growing</h2>
<p style="text-align:center; color:#888; font-size:0.9em; margin-top:4px;">
Live from
<a href="https://data.winnipeg.ca" target="_blank" rel="noopener noreferrer">
City of Winnipeg Open Data</a>
&bull;
<a href="https://opendata.vancouver.ca" target="_blank" rel="noopener noreferrer">
City of Vancouver Open Data</a>
</p>
"""
        ),
    ]

    # ── Left: Building permits comparison chart ─────────────────────
    _left_content = []

    _has_wpg_permits = not wpg_permits_df.empty and len(wpg_permits_df) > 3
    _has_van_permits = not van_permits_df.empty and len(van_permits_df) > 3

    if _has_wpg_permits or _has_van_permits:
        fig_permits = go.Figure()

        if _has_wpg_permits:
            fig_permits.add_trace(
                go.Scatter(
                    x=wpg_permits_df["year"],
                    y=wpg_permits_df["total_value"] / 1e9,
                    mode="lines+markers",
                    name="Winnipeg",
                    line=dict(color=CITY_COLORS["Winnipeg"], width=3),
                    marker=dict(size=7),
                    hovertemplate=(
                        "<b>Winnipeg %{x:.0f}</b><br>"
                        "$%{y:.2f}B<extra></extra>"
                    ),
                )
            )

        if _has_van_permits:
            fig_permits.add_trace(
                go.Scatter(
                    x=van_permits_df["year"],
                    y=van_permits_df["total_value"] / 1e9,
                    mode="lines+markers",
                    name="Vancouver",
                    line=dict(color=CITY_COLORS["Vancouver"], width=3),
                    marker=dict(size=7),
                    hovertemplate=(
                        "<b>Vancouver %{x:.0f}</b><br>"
                        "$%{y:.2f}B<extra></extra>"
                    ),
                )
            )

        fig_permits.update_layout(
            title=dict(
                text="<b>Annual Construction Investment</b>",
                font=dict(size=15),
                x=0.5,
                xanchor="center",
            ),
            template="plotly_white",
            height=320,
            margin=dict(t=45, b=50, l=70, r=30),
            xaxis=dict(title="Year", tickformat="d"),
            yaxis=dict(title="Investment ($B)"),
            font=dict(family="Inter, system-ui, sans-serif", size=13),
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="center",
                x=0.5,
            ),
        )
        _left_content.append(fig_permits)

        _sources = []
        if _has_wpg_permits:
            _sources.append("Winnipeg: Building Permits (p5sy-gt7y)")
        if _has_van_permits:
            _sources.append("Vancouver: Issued Building Permits")
        _left_content.append(
            mo.md(
                '<p style="color:#888; font-size:0.85em;">'
                + " &middot; ".join(_sources)
                + "</p>"
            )
        )
    else:
        _left_content.append(
            mo.callout(
                mo.md("Building permit data unavailable."),
                kind="warn",
            )
        )

    # ── Right: Winnipeg stats ───────────────────────────────────────
    _right_stats = []

    if wpg_biz_count is not None:
        _right_stats.append(
            mo.stat(
                value=f"{wpg_biz_count:,}",
                label="Registered Business Licences",
                caption="City of Winnipeg (d5k3-sfzx)",
                bordered=True,
            )
        )

    if wpg_avg_assessment is not None:
        _right_stats.append(
            mo.stat(
                value=f"${wpg_avg_assessment:,.0f}",
                label="Avg Assessed Property Value",
                caption="City of Winnipeg (d4mq-wa44)",
                bordered=True,
            )
        )

    if not _right_stats:
        _right_stats.append(
            mo.callout(
                mo.md("Winnipeg Open Data unavailable."),
                kind="warn",
            )
        )

    _slide4_parts.append(
        mo.hstack(
            [
                mo.vstack(_left_content),
                mo.vstack(_right_stats, gap=1),
            ],
            widths=[0.6, 0.4],
        )
    )

    slide_growth = mo.vstack(_slide4_parts)

    # ══════════════════════════════════════════════════════════════════
    #  SLIDE 5 — Call to Action / Transition
    # ══════════════════════════════════════════════════════════════════

    slide_cta = mo.center(
        mo.md(
            """
<div style="padding: 60px 40px 40px;">
<h1 style="font-size: 2.4em; font-weight: 800; color: #1a1a2e; line-height: 1.25;">
What if we could give every company<br>a data-driven case to relocate?
</h1>
<p style="font-size: 1.6em; color: #B23A2B; font-weight: 700; margin-top: 25px;">
The Winnipeg Arbitrage
</p>
<p style="font-size: 1.05em; color: #777; margin-top: 15px;">
Smart City, Happy Living &mdash; powered by open data.
</p>
</div>
"""
        )
    )

    # ══════════════════════════════════════════════════════════════════
    #  CAROUSEL
    # ══════════════════════════════════════════════════════════════════

    mo.carousel(
        [slide_title, slide_rent, slide_livability, slide_growth, slide_cta]
    )
    return


if __name__ == "__main__":
    app.run()
