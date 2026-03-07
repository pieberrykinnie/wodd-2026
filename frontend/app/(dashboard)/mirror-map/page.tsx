"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCompanyStore } from "@/store/useCompanyStore";
import { getCities, getCityById, fetchCostComparison, type CostComparisonResponse } from "@/lib/api";
import MetricTile from "@/components/ui/MetricTile";
import PillButton from "@/components/ui/PillButton";
import InsightBanner from "@/components/ui/InsightBanner";
import SectionHeader from "@/components/ui/SectionHeader";
import SourceTooltip from "@/components/ui/SourceTooltip";
import { formatCurrency } from "@/lib/calculations";

const MirrorMap = dynamic(() => import("@/components/maps/MirrorMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-river-slate rounded flex items-center justify-center">
            <p className="text-concrete-gray text-sm">Loading maps…</p>
        </div>
    ),
});

export default function MirrorMapPage() {
    const { cityId, city, cityCoords, employees, avgSalary, companyName } = useCompanyStore();
    const cities = getCities();
    const originCity =
        getCityById(cityId) ??
        cities.find((c) => city?.split(",")[0].trim().toLowerCase() === c.id) ??
        getCityById("toronto")!;
    const winnipeg = getCityById("winnipeg")!;

    const [comparison, setComparison] = useState<CostComparisonResponse | null>(null);

    useEffect(() => {
        fetchCostComparison(
            companyName || "Your Company",
            cityId,
            employees,
            avgSalary
        ).then(setComparison);
    }, [companyName, cityId, employees, avgSalary]);

    // Use API data when available, fall back to local JSON calculations
    const officeSavingsPct = comparison
        ? Math.round(
            ((comparison.current_city.office_rent_per_sqft - comparison.winnipeg.office_rent_per_sqft) /
                comparison.current_city.office_rent_per_sqft) *
            100
        )
        : Math.round(((originCity.officeSqft - winnipeg.officeSqft) / originCity.officeSqft) * 100);

    const homePriceDelta = comparison
        ? formatCurrency(comparison.current_city.avg_housing_price - comparison.winnipeg.avg_housing_price, true)
        : formatCurrency(originCity.homePrice - winnipeg.homePrice, true);

    const commuteDelta = comparison
        ? comparison.savings.commute_time_saved_minutes
        : originCity.avgCommute - winnipeg.avgCommute;

    const annualOfficeSavings = comparison
        ? comparison.savings.annual_office_rent_savings
        : (originCity.officeSqft - 16) * 150 * employees * 12;

    const apiOrigin = comparison?.current_city;
    const apiWpg = comparison?.winnipeg;

    return (
        <div className="p-6 md:p-8 flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
            <div className="flex items-start justify-between flex-wrap gap-4">
                <SectionHeader
                    eyebrow="Side-by-Side Comparison"
                    title={`${city} vs Winnipeg`}
                    subtitle="Same radius. Same business profile. Radically different costs."
                />
                <Link href="/hotspot-map">
                    <PillButton icon>Explore Winnipeg</PillButton>
                </Link>
            </div>

            {/* Metric comparison grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricTile
                    label="Office Rent Savings"
                    value={`−${officeSavingsPct}%`}
                    sub={`${city}: $${apiOrigin?.office_rent_per_sqft ?? originCity.officeSqft}/sqft/mo → Winnipeg: $${apiWpg?.office_rent_per_sqft ?? 16}/sqft/mo`}
                    accent="brick"
                    source={{ label: "CBRE Canada — Office Market Reports", url: "https://www.cbre.ca", year: "Q4 2024", table: "Q4 2024 Canada Office Report" }}
                />
                <MetricTile
                    label="Home Price Delta"
                    value={homePriceDelta}
                    sub={`${city}: ${formatCurrency(apiOrigin?.avg_housing_price ?? originCity.homePrice, true)} → Winnipeg: $350K`}
                    delta="avg per employee"
                    deltaPositive={true}
                    accent="gold"
                    source={{ label: "CREA — Canadian Real Estate Association", url: "https://www.crea.ca", year: "2024 Average", table: "CREA National Stats" }}
                />
                <MetricTile
                    label="Commute Recovered"
                    value={`${commuteDelta} min`}
                    sub={`${city}: ${apiOrigin?.avg_commute_minutes ?? originCity.avgCommute} min avg → Winnipeg: ${apiWpg?.avg_commute_minutes ?? 20} min avg`}
                    delta="per day"
                    deltaPositive={true}
                    accent="green"
                    source={{ label: "Statistics Canada — Journey to Work", url: "https://www.statcan.gc.ca", year: "2021 Census", table: "98-400-X2021079" }}
                />
            </div>

            {/* Maps */}
            <div className="h-72 md:h-96">
                <MirrorMap
                    cityId={cityId}
                    cityCoords={cityCoords ?? undefined}
                    cityDisplayName={city}
                    originData={apiOrigin ?? null}
                    winnipegData={apiWpg ?? null}
                />
            </div>

            {/* Detailed comparison table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ComparisonCard
                    title={city}
                    color={originCity.color}
                    rows={[
                        { label: "Cost of Living Index", value: `${originCity.costIndex}`, mono: true, source: { label: "Statistics Canada — Cost of Living Index", url: "https://www.statcan.gc.ca", year: "2024", table: "Cat. 62-001-X" } },
                        { label: "Average Home Price", value: formatCurrency(apiOrigin?.avg_housing_price ?? originCity.homePrice, true), mono: true, source: { label: "CREA — Canadian Real Estate Association", url: "https://www.crea.ca", year: "2024 Average", table: "CREA National Stats" } },
                        { label: "Office Rent", value: `$${apiOrigin?.office_rent_per_sqft ?? originCity.officeSqft}/sqft/mo`, mono: true, source: { label: "CBRE Canada — Office Market Reports", url: "https://www.cbre.ca", year: "Q4 2024", table: "Q4 2024 Canada Office Report" } },
                        { label: "Avg Commute", value: `${apiOrigin?.avg_commute_minutes ?? originCity.avgCommute} min`, mono: true, source: { label: "Statistics Canada — Journey to Work", url: "https://www.statcan.gc.ca", year: "2021 Census", table: "98-400-X2021079" } },
                        { label: "1BR Monthly Rent", value: `$${(apiOrigin?.avg_monthly_rent_1br ?? originCity.monthlyRent2br).toLocaleString()}/mo`, mono: true, source: { label: "CREA — Canadian Real Estate Association", url: "https://www.crea.ca", year: "2024 Average", table: "CREA National Stats" } },
                        { label: "Provincial Tax Rate", value: `${((apiOrigin?.provincial_tax_rate ?? originCity.taxRate) * 100).toFixed(1)}%`, mono: true, source: { label: "Canada Revenue Agency", url: "https://www.canada.ca/en/revenue-agency.html", year: "2024" } },
                    ]}
                />
                <ComparisonCard
                    title="Winnipeg, MB"
                    color="#4C6E91"
                    highlight
                    rows={[
                        { label: "Cost of Living Index", value: `${winnipeg.costIndex}`, mono: true, win: true, source: { label: "Statistics Canada — Cost of Living Index", url: "https://www.statcan.gc.ca", year: "2024", table: "Cat. 62-001-X" } },
                        { label: "Average Home Price", value: formatCurrency(apiWpg?.avg_housing_price ?? 350000, true), mono: true, win: true, source: { label: "CREA — Canadian Real Estate Association", url: "https://www.crea.ca", year: "2024 Average", table: "CREA National Stats" } },
                        { label: "Office Rent", value: `$${apiWpg?.office_rent_per_sqft ?? 16}/sqft/mo`, mono: true, win: true, source: { label: "CBRE Canada — Office Market Reports", url: "https://www.cbre.ca", year: "Q4 2024", table: "Q4 2024 Canada Office Report" } },
                        { label: "Avg Commute", value: `${apiWpg?.avg_commute_minutes ?? 20} min`, mono: true, win: true, source: { label: "Statistics Canada — Journey to Work", url: "https://www.statcan.gc.ca", year: "2021 Census", table: "98-400-X2021079" } },
                        { label: "1BR Monthly Rent", value: `$${(apiWpg?.avg_monthly_rent_1br ?? 1450).toLocaleString()}/mo`, mono: true, win: true, source: { label: "CREA — Canadian Real Estate Association", url: "https://www.crea.ca", year: "2024 Average", table: "CREA National Stats" } },
                        { label: "Provincial Tax Rate", value: `${((apiWpg?.provincial_tax_rate ?? 0.439) * 100).toFixed(1)}%`, mono: true, win: true, source: { label: "Canada Revenue Agency", url: "https://www.canada.ca/en/revenue-agency.html", year: "2024" } },
                    ]}
                />
            </div>

            {/* Insight */}
            <InsightBanner variant="highlight">
                With <strong style={{ color: "#4C6E91" }}>{employees} employees</strong> relocating from {city}, your company
                saves approximately{" "}
                <strong style={{ color: "#4C6E91" }}>
                    {formatCurrency(annualOfficeSavings)}
                </strong>{" "}
                in annual office rent alone — before payroll, tax, and quality-of-life gains are calculated.
            </InsightBanner>
        </div>
    );
}

interface SourceInfo {
    label: string;
    url?: string;
    year?: string;
    table?: string;
}

function ComparisonCard({
    title,
    color,
    rows,
    highlight = false,
}: {
    title: string;
    color: string;
    rows: { label: string; value: string; mono?: boolean; win?: boolean; source?: SourceInfo }[];
    highlight?: boolean;
}) {
    return (
        <div
            className="rounded border overflow-hidden"
            style={{
                background: highlight ? "rgba(185,148,69,0.07)" : "rgba(241,244,247,0.7)",
                borderColor: highlight ? "#4C6E91" : "rgba(0,0,0,0.1)",
            }}
        >
            <div
                className="px-5 py-3 border-b"
                style={{
                    borderColor: highlight ? "rgba(185,148,69,0.3)" : "rgba(0,0,0,0.1)",
                    background: color + "22",
                }}
            >
                <p
                    className="text-sm font-semibold"
                    style={{ color, fontFamily: "var(--font-ibm-sans)" }}
                >
                    {title}
                </p>
            </div>
            <div className="p-4 space-y-2.5">
                {rows.map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                        <span
                            className="inline-flex items-center text-[13px] text-concrete-gray"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            {row.label}
                            {row.source && (
                                <SourceTooltip
                                    source={row.source.label}
                                    url={row.source.url}
                                    year={row.source.year}
                                    table={row.source.table}
                                    size={10}
                                />
                            )}
                        </span>
                        <span
                            className="text-[13px] font-medium"
                            style={{
                                fontFamily: row.mono ? "var(--font-ibm-mono)" : "var(--font-ibm-sans)",
                                color: row.win ? "#4C6E91" : "#0F1823",
                            }}
                        >
                            {row.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}


