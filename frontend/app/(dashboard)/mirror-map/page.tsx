"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCompanyStore } from "@/store/useCompanyStore";
import { getCityById } from "@/lib/api";
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
