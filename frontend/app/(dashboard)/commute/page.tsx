"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useCompanyStore } from "@/store/useCompanyStore";
import { getCityById } from "@/lib/api";
import { getNeighborhoods } from "@/lib/api";
import SectionHeader from "@/components/ui/SectionHeader";
import MetricTile from "@/components/ui/MetricTile";
import DataCard from "@/components/ui/DataCard";
import InsightBanner from "@/components/ui/InsightBanner";
import PersonaTag from "@/components/ui/PersonaTag";
import { Clock, Car, Bike, ArrowRight } from "lucide-react";

const CommuteChart = dynamic(
    () => import("@/components/charts/CommuteChart"),
    { ssr: false }
);

type ChartMode = "avg" | "over60" | "hours";

const MODE_LABELS: Record<ChartMode, string> = {
    avg: "Average Commute",
    over60: "% Over 60 Minutes",
    hours: "Annual Hours Lost",
};

export default function CommutePage() {
    const { cityId } = useCompanyStore();
    const city = getCityById(cityId) ?? getCityById("toronto")!;
    const neighborhoods = getNeighborhoods();
    const [mode, setMode] = useState<ChartMode>("avg");

    const commuteDelta = city.avgCommute - 20;
    const annualHoursRecovered = Math.round((commuteDelta * 2 * 240) / 60);

    return (
        <div className="p-6 md:p-8 flex flex-col gap-6">
            <SectionHeader
                eyebrow="Commute Optimization"
                title="Time Is the Hidden Benefit"
                subtitle={`Your employees currently average ${city.avgCommute} minutes each way. In Winnipeg it's 20 minutes. That's ${annualHoursRecovered} hours per person per year.`}
            />

            {/* Key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricTile
                    label={`${city.name} Avg Commute`}
                    value={`${city.avgCommute} min`}
                    accent="blue"
                />
                <MetricTile
                    label="Winnipeg Avg Commute"
                    value="20 min"
                    accent="brick"
                />
                <MetricTile
                    label="Time Saved / Day"
                    value={`${commuteDelta} min`}
                    delta="each way"
                    accent="gold"
                />
                <MetricTile
                    label="Hours/Year Recovered"
                    value={`${annualHoursRecovered} hrs`}
                    sub="Per employee, both directions"
                    accent="green"
                />
            </div>

            {/* Chart + Controls */}
            <DataCard className="!p-6">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                    <p
                        className="text-sm font-semibold text-frost-white"
                        style={{ fontFamily: "var(--font-ibm-sans)" }}
                    >
                        {MODE_LABELS[mode]}
                    </p>
                    <div className="flex gap-1">
                        {(Object.keys(MODE_LABELS) as ChartMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className="px-3 py-1 rounded-full text-xs font-medium transition-all border"
                                style={{
                                    fontFamily: "var(--font-ibm-sans)",
                                    background: mode === m ? "#B23A2B" : "rgba(47,62,79,0.8)",
                                    color: mode === m ? "#fff" : "#8B98A5",
                                    borderColor: mode === m ? "#B23A2B" : "rgba(255,255,255,0.08)",
                                }}
                            >
                                {MODE_LABELS[m]}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-52">
                    <CommuteChart mode={mode} />
                </div>
            </DataCard>

            {/* Neighbourhood route cards */}
            <div>
                <p
                    className="text-[11px] uppercase tracking-widest text-concrete-gray font-semibold mb-3"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    Neighbourhood Route Times → Downtown Winnipeg
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {neighborhoods.map((n) => (
                        <RouteCard
                            key={n.id}
                            name={n.name}
                            mins={n.commuteMins}
                            persona={n.persona}
                            homePrice={n.avgHomePrice}
                            transitRoutes={n.transitRoutes}
                        />
                    ))}
                </div>
            </div>

            {/* Visual commute timeline */}
            <DataCard>
                <p
                    className="text-[11px] uppercase tracking-widest text-concrete-gray font-semibold mb-4"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    Average Morning vs Winnipeg
                </p>
                <CommuteTimeline
                    cityName={city.name}
                    cityMins={city.avgCommute}
                    wpgMins={20}
                />
            </DataCard>

            <InsightBanner variant="highlight">
                At <strong style={{ color: "#C8A44D" }}>20 minutes average commute</strong>, Winnipeg employees have
                statistically lower stress levels, higher sleep quality, and rate their work-life balance significantly
                higher than Toronto or Vancouver counterparts. The "hidden salary" of commute time is worth{" "}
                <strong style={{ color: "#C8A44D" }}>$8,000–$14,000/year</strong> when valued at average hourly rates.
            </InsightBanner>
        </div>
    );
}

function RouteCard({
    name,
    mins,
    persona,
    homePrice,
    transitRoutes,
}: {
    name: string;
    mins: number;
    persona: string;
    homePrice: number;
    transitRoutes: string[];
}) {
    const barPct = Math.min(100, (mins / 80) * 100);

    return (
        <DataCard hover>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="text-[14px] font-semibold text-frost-white mb-1" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                        {name}
                    </p>
                    <PersonaTag persona={persona} />
                </div>
                <div className="text-right">
                    <p
                        className="text-2xl font-semibold text-prairie-gold"
                        style={{ fontFamily: "var(--font-ibm-mono)" }}
                    >
                        {mins}
                    </p>
                    <p className="text-[11px] text-concrete-gray" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                        min
                    </p>
                </div>
            </div>

            {/* Bar */}
            <div className="h-1.5 bg-river-slate-l rounded-full mb-3 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${barPct}%`, background: "#B23A2B" }}
                />
            </div>

            <div className="flex items-center justify-between text-[12px] text-concrete-gray">
                <span style={{ fontFamily: "var(--font-ibm-mono)" }}>
                    ${(homePrice / 1000).toFixed(0)}K avg home
                </span>
                <div className="flex gap-1">
                    {transitRoutes.slice(0, 2).map((r) => (
                        <span
                            key={r}
                            className="px-1.5 py-0.5 rounded bg-river-slate text-concrete-gray text-[10px]"
                            style={{ fontFamily: "var(--font-ibm-mono)" }}
                        >
                            {r}
                        </span>
                    ))}
                </div>
            </div>
        </DataCard>
    );
}

function CommuteTimeline({
    cityName,
    cityMins,
    wpgMins,
}: {
    cityName: string;
    cityMins: number;
    wpgMins: number;
}) {
    const max = Math.max(cityMins, 90);

    return (
        <div className="space-y-4">
            <div>
                <div className="flex justify-between mb-1.5">
                    <p className="text-[12px] text-concrete-gray" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                        {cityName}
                    </p>
                    <p className="text-[12px] font-semibold text-concrete-gray" style={{ fontFamily: "var(--font-ibm-mono)" }}>
                        {cityMins} min
                    </p>
                </div>
                <div className="h-3 bg-river-slate/80 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(cityMins / max) * 100}%`, background: "#8B98A5" }}
                    />
                </div>
            </div>
            <div>
                <div className="flex justify-between mb-1.5">
                    <p className="text-[12px] text-exchange-brick font-semibold" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                        Winnipeg
                    </p>
                    <p className="text-[12px] font-semibold text-exchange-brick" style={{ fontFamily: "var(--font-ibm-mono)" }}>
                        {wpgMins} min
                    </p>
                </div>
                <div className="h-3 bg-river-slate/80 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(wpgMins / max) * 100}%`, background: "#B23A2B" }}
                    />
                </div>
            </div>
            <p className="text-[12px] text-concrete-gray/70 mt-1" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                ↑ Both bars show average one-way commute time
            </p>
        </div>
    );
}
