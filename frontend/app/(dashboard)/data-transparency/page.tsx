"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import DataCard from "@/components/ui/DataCard";
import InsightBanner from "@/components/ui/InsightBanner";
import { ExternalLink, Database, BarChart3, Building2, Globe, MapPin, TrendingUp } from "lucide-react";
import { fetchDataOverview, type DataOverviewResponse } from "@/lib/api";

const SOURCES = [
    {
        id: "stats-can-cost",
        icon: BarChart3,
        color: "#4C6E91",
        title: "Statistics Canada — Cost of Living Index",
        description: "City-level cost index data used for the core comparison engine.",
        table: "Cat. 62-001-X",
        url: "https://www.statcan.gc.ca",
        metrics: ["Cost of Living Index", "Consumer Price Index by City"],
        year: "2024",
    },
    {
        id: "cbre-office",
        icon: Building2,
        color: "#4C6E91",
        title: "CBRE Canada — Office Market Reports",
        description: "Commercial office rent per sqft, vacancy rates, and absorption data.",
        table: "Q4 2024 Canada Office Report",
        url: "https://www.cbre.ca",
        metrics: ["Office Rent $/sqft/mo", "Vacancy Rate %", "Class A / B Supply"],
        year: "Q4 2024",
    },
    {
        id: "crea-home",
        icon: MapPin,
        color: "#4C6E91",
        title: "CREA — Canadian Real Estate Association",
        description: "Average residential sale prices by city and Metropolitan Statistical Area.",
        table: "CREA National Stats",
        url: "https://www.crea.ca",
        metrics: ["Average Home Sale Price", "Median Sale Price", "Days on Market"],
        year: "2024 Average",
    },
    {
        id: "census-commute",
        icon: Database,
        color: "#5E8C6A",
        title: "Statistics Canada — Journey to Work",
        description: "Commute times, mode share, and origin-destination data from the 2021 National Household Survey.",
        table: "98-400-X2021079",
        url: "https://www.statcan.gc.ca",
        metrics: ["Average Commute Duration", "Mode Share", "Census Metropolitan Area data"],
        year: "2021 Census",
    },
    {
        id: "env-canada-sunshine",
        icon: Globe,
        color: "#4C6E91",
        title: "Environment & Climate Change Canada",
        description: "30-year sunshine hours averages and climate normals for Canadian cities.",
        table: "Canadian Climate Normals 1991–2020",
        url: "https://climate.weather.gc.ca",
        metrics: ["Annual Sunshine Hours", "Climate Normals", "Temperature Averages"],
        year: "30-yr average (1991–2020)",
    },
    {
        id: "edw-winnipeg",
        icon: Building2,
        color: "#4C6E91",
        title: "Economic Development Winnipeg",
        description: "Neighbourhood profiles, business incentives, and local economic data.",
        table: "2024 Economic Indicators",
        url: "https://economicdevelopmentwinnipeg.com",
        metrics: ["Neighbourhood Profiles", "Business Incentives", "Growth Sectors"],
        year: "2024",
    },
    {
        id: "mapbox",
        icon: MapPin,
        color: "#8B98A5",
        title: "Mapbox GL JS",
        description: "Interactive maps rendered via Mapbox dark-v11 base tiles.",
        table: "Mapbox Tiling Service",
        url: "https://www.mapbox.com",
        metrics: ["Base Map Tiles", "Geocoding API", "Custom Styling"],
        year: "Live",
    },
    {
        id: "tourism-winnipeg",
        icon: Globe,
        color: "#5E8C6A",
        title: "Tourism Winnipeg / Festival Organizers",
        description: "Festival attendance figures and event data from official Tourism Winnipeg records.",
        table: "Annual Tourism Report 2023",
        url: "https://tourismwinnipeg.com",
        metrics: ["Festival Attendance", "Cultural Event Data", "Visitor Statistics"],
        year: "2023",
    },
];

const METHODOLOGY_NOTES = [
    {
        title: "Office Rent Comparison",
        body: "Office rent figures represent Class B average asking rates for office space in primary business districts. Winnipeg Exchange District vs. Toronto/Vancouver downtown core. Source: CBRE Q4 2024.",
    },
    {
        title: "Salary & Disposable Income",
        body: "Tax rate calculations use 2024 provincial + federal marginal rates at the entered salary band midpoint. Includes provincial income tax, CPP, and EI. Does not account for individual deductions.",
    },
    {
        title: "Average Home Price",
        body: "All home prices represent city-wide residential average sale price, not specific neighbourhood. Winnipeg $350K is the 2024 annual average. Source: CREA.",
    },
    {
        title: "Commute Data",
        body: "Average commute times from Statistics Canada 2021 National Household Survey Journey to Work data. Represents one-way commute duration for employed full-time workers in each CMA.",
    },
];

export default function DataTransparencyPage() {
    const [overview, setOverview] = useState<DataOverviewResponse | null>(null);

    useEffect(() => {
        fetchDataOverview().then(setOverview);
    }, []);

    const latestPop = overview?.population_trend?.at(-1);

    return (
        <div className="p-6 md:p-8 flex flex-col gap-8">
            {/* Header */}
            <div className="max-w-2xl">
                <SectionHeader
                    eyebrow="Data Transparency"
                    title="Every Figure Is Sourced"
                    subtitle="This platform makes claims with numbers attached. Here is where every number comes from. Open data, public records, and government statistics — no editorial inflation."
                />
                <InsightBanner variant="insight">
                    We believe persuasion built on real data is both more ethical and more effective. Every city comparison,
                    cost figure, and lifestyle claim in this platform can be independently verified from the sources below.
                </InsightBanner>
            </div>

            {/* Live Socrata stats */}
            {overview && (
                <div>
                    <SectionHeader eyebrow="Live Data" title="Real-Time Winnipeg Metrics" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <DataCard>
                            <div className="flex items-center gap-3 mb-2">
                                <Building2 size={16} className="text-electric-blue" />
                                <span className="text-[11px] uppercase tracking-widest text-concrete-gray" style={{ fontFamily: "var(--font-ibm-mono)" }}>Active Businesses</span>
                            </div>
                            <p className="text-[28px] font-bold text-frost-white" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                {overview.total_active_businesses.toLocaleString()}
                            </p>
                            <p className="text-[11px] text-concrete-gray mt-1" style={{ fontFamily: "var(--font-ibm-sans)" }}>Registered businesses in Winnipeg</p>
                        </DataCard>

                        <DataCard>
                            <div className="flex items-center gap-3 mb-2">
                                <BarChart3 size={16} className="text-electric-blue" />
                                <span className="text-[11px] uppercase tracking-widest text-concrete-gray" style={{ fontFamily: "var(--font-ibm-mono)" }}>Permits YTD</span>
                            </div>
                            <p className="text-[28px] font-bold text-frost-white" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                {overview.total_permits_ytd.toLocaleString()}
                            </p>
                            <p className="text-[11px] text-concrete-gray mt-1" style={{ fontFamily: "var(--font-ibm-sans)" }}>Building permits issued year-to-date</p>
                        </DataCard>

                        {latestPop && (
                            <DataCard>
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingUp size={16} className="text-electric-blue" />
                                    <span className="text-[11px] uppercase tracking-widest text-concrete-gray" style={{ fontFamily: "var(--font-ibm-mono)" }}>Population ({latestPop.year})</span>
                                </div>
                                <p className="text-[28px] font-bold text-frost-white" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                    {latestPop.population.toLocaleString()}
                                </p>
                                <p className="text-[11px] text-concrete-gray mt-1" style={{ fontFamily: "var(--font-ibm-sans)" }}>Latest census estimate</p>
                            </DataCard>
                        )}
                    </div>
                </div>
            )}

            {/* Source cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SOURCES.map((source) => {
                    const Icon = source.icon;
                    return (
                        <DataCard key={source.id} hover>
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                                    style={{ background: source.color + "20" }}
                                >
                                    <Icon size={18} style={{ color: source.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <p
                                            className="text-[14px] font-semibold text-frost-white leading-snug"
                                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                                        >
                                            {source.title}
                                        </p>
                                        <ExternalLink size={13} className="flex-shrink-0 text-concrete-gray/50 mt-0.5" />
                                    </div>
                                    <p
                                        className="text-[12px] text-concrete-gray leading-snug mb-3"
                                        style={{ fontFamily: "var(--font-ibm-sans)" }}
                                    >
                                        {source.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {source.metrics.map((m) => (
                                            <span
                                                key={m}
                                                className="text-[10px] px-2 py-0.5 rounded border"
                                                style={{
                                                    fontFamily: "var(--font-ibm-sans)",
                                                    color: source.color,
                                                    borderColor: source.color + "30",
                                                    background: source.color + "10",
                                                }}
                                            >
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="text-[11px] text-concrete-gray/60"
                                            style={{ fontFamily: "var(--font-ibm-mono)" }}
                                        >
                                            {source.table} · {source.year}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </DataCard>
                    );
                })}
            </div>

            {/* Methodology */}
            <div>
                <SectionHeader
                    eyebrow="Methodology"
                    title="How We Calculate"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {METHODOLOGY_NOTES.map((note) => (
                        <DataCard key={note.title}>
                            <p
                                className="text-[13px] font-semibold text-frost-white mb-2"
                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                            >
                                {note.title}
                            </p>
                            <p
                                className="text-[12px] text-concrete-gray leading-relaxed"
                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                            >
                                {note.body}
                            </p>
                        </DataCard>
                    ))}
                </div>
            </div>

            {/* Screen 9 — Data Transparency Footer */}
            <div
                className="-mx-6 md:-mx-8 -mb-4"
                style={{ background: "#F1F4F7" }}
            >
                <div className="px-6 md:px-8 py-10 flex flex-col md:flex-row md:items-end gap-8">
                    {/* Left: heading + badges + tagline */}
                    <div className="flex-1">
                        <p
                            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                            style={{ color: "#4C6E91", fontFamily: "var(--font-ibm-mono)" }}
                        >
                            Screen 9 — Data Transparency
                        </p>
                        <h2
                            className="font-bold mb-6 leading-tight"
                            style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#0F1823" }}
                        >
                            Powered by Open Data
                        </h2>

                        {/* 5 source pill badges */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {[
                                "Winnipeg Open Data",
                                "Statistics Canada",
                                "Manitoba Hydro",
                                "GTFS Transit",
                                "MLS Listings",
                            ].map((src) => (
                                <span
                                    key={src}
                                    className="px-3 py-1.5 rounded-full text-[12px] font-semibold"
                                    style={{
                                        background: "rgba(76,110,145,0.08)",
                                        color: "#4C6E91",
                                        border: "1px solid rgba(76,110,145,0.25)",
                                        fontFamily: "var(--font-ibm-sans)",
                                        letterSpacing: "0.01em",
                                    }}
                                >
                                    {src}
                                </span>
                            ))}
                        </div>

                        {/* Tagline */}
                        <p
                            className="text-[16px] italic"
                            style={{ color: "#64748B", fontFamily: "var(--font-ibm-sans)" }}
                        >
                            Every figure is sourced. Every recommendation is defensible.
                        </p>
                    </div>

                    {/* Right: WRI logo lockup */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div
                            className="px-4 py-2 rounded"
                            style={{ background: "rgba(76,110,145,0.06)", border: "1px solid rgba(76,110,145,0.18)" }}
                        >
                            <p
                                className="text-[18px] font-bold leading-none tracking-tight"
                                style={{ color: "#4C6E91", fontFamily: "var(--font-display)" }}
                            >
                                WRI
                            </p>
                            <p
                                className="text-[9px] uppercase tracking-widest mt-0.5"
                                style={{ color: "rgba(76,110,145,0.6)", fontFamily: "var(--font-ibm-mono)" }}
                            >
                                Winnipeg Relocation Intelligence
                            </p>
                        </div>
                        <p
                            className="text-[10px]"
                            style={{ color: "rgba(100,116,139,0.55)", fontFamily: "var(--font-ibm-mono)" }}
                        >
                            wodd-2026 · open data
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
