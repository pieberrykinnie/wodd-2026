"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCompanyStore } from "@/store/useCompanyStore";
import { getCityById, fetchCostComparison, type CostComparisonResponse } from "@/lib/api";
import MetricTile from "@/components/ui/MetricTile";
import PillButton from "@/components/ui/PillButton";
import InsightBanner from "@/components/ui/InsightBanner";
import SectionHeader from "@/components/ui/SectionHeader";
import { formatCurrency } from "@/lib/calculations";

const MirrorMap = dynamic(() => import("@/components/maps/MirrorMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-river-slate rounded-xl flex items-center justify-center">
            <p className="text-concrete-gray text-sm">Loading maps…</p>
        </div>
    ),
});

export default function MirrorMapPage() {
    const { cityId, city, employees, avgSalary, companyName } = useCompanyStore();
    const originCity = getCityById(cityId) ?? getCityById("toronto")!;
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

            {/* Maps */}
            <div className="h-72 md:h-96">
                <MirrorMap cityId={cityId} />
            </div>

            {/* Metric comparison grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricTile
                    label="Office Rent Savings"
                    value={`−${officeSavingsPct}%`}
                    sub={`${city}: $${apiOrigin?.office_rent_per_sqft ?? originCity.officeSqft}/sqft/mo → Winnipeg: $${apiWpg?.office_rent_per_sqft ?? 16}/sqft/mo`}
                    accent="brick"
                />
                <MetricTile
                    label="Home Price Delta"
                    value={homePriceDelta}
                    sub={`${city}: ${formatCurrency(apiOrigin?.avg_housing_price ?? originCity.homePrice, true)} → Winnipeg: $350K`}
                    delta="avg per employee"
                    deltaPositive={true}
                    accent="gold"
                />
                <MetricTile
                    label="Commute Recovered"
                    value={`${commuteDelta} min`}
                    sub={`${city}: ${apiOrigin?.avg_commute_minutes ?? originCity.avgCommute} min avg → Winnipeg: ${apiWpg?.avg_commute_minutes ?? 20} min avg`}
                    delta="per day"
                    deltaPositive={true}
                    accent="green"
                />
            </div>

            {/* Detailed comparison table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ComparisonCard
                    title={city}
                    color={originCity.color}
                    rows={[
                        { label: "Cost of Living Index", value: `${apiOrigin?.cost_of_living_index ?? originCity.costIndex}`, mono: true },
                        { label: "Average Home Price", value: formatCurrency(apiOrigin?.avg_housing_price ?? originCity.homePrice, true), mono: true },
                        { label: "Office Rent", value: `$${apiOrigin?.office_rent_per_sqft ?? originCity.officeSqft}/sqft/mo`, mono: true },
                        { label: "Avg Commute", value: `${apiOrigin?.avg_commute_minutes ?? originCity.avgCommute} min`, mono: true },
                        { label: "1BR Monthly Rent", value: `$${(apiOrigin?.avg_monthly_rent_1br ?? originCity.monthlyRent2br).toLocaleString()}/mo`, mono: true },
                        { label: "Provincial Tax Rate", value: `${((apiOrigin?.provincial_tax_rate ?? originCity.taxRate) * 100).toFixed(1)}%`, mono: true },
                    ]}
                />
                <ComparisonCard
                    title="Winnipeg, MB"
                    color="#B23A2B"
                    highlight
                    rows={[
                        { label: "Cost of Living Index", value: `${apiWpg?.cost_of_living_index ?? 88}`, mono: true, win: true },
                        { label: "Average Home Price", value: formatCurrency(apiWpg?.avg_housing_price ?? 350000, true), mono: true, win: true },
                        { label: "Office Rent", value: `$${apiWpg?.office_rent_per_sqft ?? 16}/sqft/mo`, mono: true, win: true },
                        { label: "Avg Commute", value: `${apiWpg?.avg_commute_minutes ?? 20} min`, mono: true, win: true },
                        { label: "1BR Monthly Rent", value: `$${(apiWpg?.avg_monthly_rent_1br ?? 1450).toLocaleString()}/mo`, mono: true, win: true },
                        { label: "Provincial Tax Rate", value: `${((apiWpg?.provincial_tax_rate ?? 0.439) * 100).toFixed(1)}%`, mono: true, win: true },
                    ]}
                />
            </div>

            {/* Insight */}
            <InsightBanner variant="highlight">
                With <strong style={{ color: "#C8A44D" }}>{employees} employees</strong> relocating from {city}, your company
                saves approximately{" "}
                <strong style={{ color: "#C8A44D" }}>
                    {formatCurrency(annualOfficeSavings)}
                </strong>{" "}
                in annual office rent alone — before payroll, tax, and quality-of-life gains are calculated.
            </InsightBanner>
        </div>
    );
}

function ComparisonCard({
    title,
    color,
    rows,
    highlight = false,
}: {
    title: string;
    color: string;
    rows: { label: string; value: string; mono?: boolean; win?: boolean }[];
    highlight?: boolean;
}) {
    return (
        <div
            className="rounded-xl border overflow-hidden"
            style={{
                background: highlight ? "rgba(178,58,43,0.07)" : "rgba(47,62,79,0.7)",
                borderColor: highlight ? "#B23A2B" : "rgba(255,255,255,0.06)",
            }}
        >
            <div
                className="px-5 py-3 border-b"
                style={{
                    borderColor: highlight ? "rgba(178,58,43,0.3)" : "rgba(255,255,255,0.06)",
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
                            className="text-[13px] text-concrete-gray"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            {row.label}
                        </span>
                        <span
                            className="text-[13px] font-medium"
                            style={{
                                fontFamily: row.mono ? "var(--font-ibm-mono)" : "var(--font-ibm-sans)",
                                color: row.win ? "#C8A44D" : "#F2F5F7",
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


const MirrorMap = dynamic(() => import("@/components/maps/MirrorMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-river-slate rounded-xl flex items-center justify-center">
            <p className="text-concrete-gray text-sm">Loading maps…</p>
        </div>
    ),
});

export default function MirrorMapPage() {
    const { cityId, city, employees, avgSalary } = useCompanyStore();
    const originCity = getCityById(cityId) ?? getCityById("toronto")!;
    const winnipeg = getCityById("winnipeg")!;

    const officeSavingsPct = Math.round(
        ((originCity.officeSqft - winnipeg.officeSqft) / originCity.officeSqft) * 100
    );
    const homePriceDelta = formatCurrency(originCity.homePrice - winnipeg.homePrice, true);
    const commuteDelta = originCity.avgCommute - winnipeg.avgCommute;

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

            {/* Maps */}
            <div className="h-72 md:h-96">
                <MirrorMap cityId={cityId} />
            </div>

            {/* Metric comparison grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricTile
                    label="Office Rent Savings"
                    value={`−${officeSavingsPct}%`}
                    sub={`${city}: $${originCity.officeSqft}/sqft/mo → Winnipeg: $16/sqft/mo`}
                    accent="brick"
                />
                <MetricTile
                    label="Home Price Delta"
                    value={homePriceDelta}
                    sub={`${city}: ${formatCurrency(originCity.homePrice, true)} → Winnipeg: $350K`}
                    delta="avg per employee"
                    deltaPositive={true}
                    accent="gold"
                />
                <MetricTile
                    label="Commute Recovered"
                    value={`${commuteDelta} min`}
                    sub={`${city}: ${originCity.avgCommute} min avg → Winnipeg: 20 min avg`}
                    delta="per day"
                    deltaPositive={true}
                    accent="green"
                />
            </div>

            {/* Detailed comparison table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ComparisonCard
                    title={city}
                    color={originCity.color}
                    rows={[
                        { label: "Cost of Living Index", value: `${originCity.costIndex}`, mono: true },
                        { label: "Average Home Price", value: formatCurrency(originCity.homePrice, true), mono: true },
                        { label: "Office Rent", value: `$${originCity.officeSqft}/sqft/mo`, mono: true },
                        { label: "Avg Commute", value: `${originCity.avgCommute} min`, mono: true },
                        { label: "2BR Monthly Rent", value: `$${originCity.monthlyRent2br}/mo`, mono: true },
                        { label: "Sunshine Hours/yr", value: `${originCity.sunshineHours}`, mono: true },
                    ]}
                />
                <ComparisonCard
                    title="Winnipeg, MB"
                    color="#B23A2B"
                    highlight
                    rows={[
                        { label: "Cost of Living Index", value: "88", mono: true, win: true },
                        { label: "Average Home Price", value: "$350K", mono: true, win: true },
                        { label: "Office Rent", value: "$16/sqft/mo", mono: true, win: true },
                        { label: "Avg Commute", value: "20 min", mono: true, win: true },
                        { label: "2BR Monthly Rent", value: "$1,450/mo", mono: true, win: true },
                        { label: "Sunshine Hours/yr", value: "2,353", mono: true, win: true },
                    ]}
                />
            </div>

            {/* Insight */}
            <InsightBanner variant="highlight">
                With <strong style={{ color: "#C8A44D" }}>{employees} employees</strong> relocating from {city}, your company
                saves approximately{" "}
                <strong style={{ color: "#C8A44D" }}>
                    {formatCurrency((originCity.officeSqft - 16) * 150 * employees * 12)}
                </strong>{" "}
                in annual office rent alone — before payroll, tax, and quality-of-life gains are calculated.
            </InsightBanner>
        </div>
    );
}

function ComparisonCard({
    title,
    color,
    rows,
    highlight = false,
}: {
    title: string;
    color: string;
    rows: { label: string; value: string; mono?: boolean; win?: boolean }[];
    highlight?: boolean;
}) {
    return (
        <div
            className="rounded-xl border overflow-hidden"
            style={{
                background: highlight ? "rgba(178,58,43,0.07)" : "rgba(47,62,79,0.7)",
                borderColor: highlight ? "#B23A2B" : "rgba(255,255,255,0.06)",
            }}
        >
            <div
                className="px-5 py-3 border-b"
                style={{
                    borderColor: highlight ? "rgba(178,58,43,0.3)" : "rgba(255,255,255,0.06)",
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
                            className="text-[13px] text-concrete-gray"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            {row.label}
                        </span>
                        <span
                            className="text-[13px] font-medium"
                            style={{
                                fontFamily: row.mono ? "var(--font-ibm-mono)" : "var(--font-ibm-sans)",
                                color: row.win ? "#C8A44D" : "#F2F5F7",
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
