"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import DataCard from "@/components/ui/DataCard";
import InsightBanner from "@/components/ui/InsightBanner";
import MetricTile from "@/components/ui/MetricTile";
import { getFestivals } from "@/lib/api";
import { Sun, Snowflake, Leaf, Cloud } from "lucide-react";

const SEASONS = [
    {
        id: "summer",
        label: "Summer",
        icon: Sun,
        color: "#C8A44D",
        months: "June – August",
        description:
            "Winnipeg summers are spectacular. Warm, dry, and sunny — with more sunshine hours than Vancouver or Toronto. Patios at The Forks, lake weekends at Whiteshell Provincial Park, and a festival nearly every weekend.",
        facts: [
            "Avg summer high: 27°C",
            "2,353 sunshine hours per year",
            "Whiteshell Provincial Park: 45 min away",
            "Festival season runs June–August",
        ],
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    },
    {
        id: "fall",
        label: "Autumn",
        icon: Leaf,
        color: "#D89C3D",
        months: "September – October",
        description:
            "Winnipeg's autumn is brief and beautiful. Crisp, golden, and brilliant. The trees along the Assiniboine River turn vivid amber and red. Comfortable temperatures and clear blue skies.",
        facts: [
            "Avg fall temp: 12°C",
            "River trail golf and cycling",
            "Harvest festivals and markets",
            "One of Canada's clearest autumns",
        ],
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    },
    {
        id: "winter",
        label: "Winter",
        icon: Snowflake,
        color: "#4C6E91",
        months: "November – March",
        description:
            "Yes, Winnipeg winters are cold. They're also brilliant. The city is fully adapted — underground tunnels, warm community spaces, the world's longest naturally frozen skating rink, and Festival du Voyageur. Winnipeggers don't fear winter; they own it.",
        facts: [
            "World's longest skating rink on the Red River",
            "Festival du Voyageur (February)",
            "Nuit Blanche all-night arts festival",
            "Block heater culture makes cold cars a myth",
        ],
        imageUrl: "https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=800&q=80",
    },
    {
        id: "spring",
        label: "Spring",
        icon: Cloud,
        color: "#5E8C6A",
        months: "April – May",
        description:
            "Spring in Winnipeg arrives fast and dramatically. Snow melts to green within weeks. River walks reopen, patios emerge, and the city collectively exhales. Spring is earned — which makes it sweeter.",
        facts: [
            "Temperature swings from -5°C to +20°C",
            "Red River flooding (dramatic but managed)",
            "Bird migration through Winnipeg corridor",
            "Community leagues host outdoor events",
        ],
        imageUrl: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&q=80",
    },
];

const CITY_SUNSHINE: { city: string; hours: number; color: string }[] = [
    { city: "Vancouver", hours: 1938, color: "#4C6E91" },
    { city: "Toronto", hours: 2066, color: "#8B98A5" },
    { city: "Montréal", hours: 2051, color: "#5E8C6A" },
    { city: "Winnipeg", hours: 2353, color: "#B23A2B" },
];

export default function FourSeasonsPage() {
    const festivals = getFestivals();

    return (
        <div className="p-6 md:p-8 flex flex-col gap-8">
            <SectionHeader
                eyebrow="Life in Winnipeg"
                title="Four Seasons, Zero Apologies"
                subtitle="Winnipeg doesn't hide its weather. It turns it into culture. Every season has a reason to stay."
            />

            {/* Sunshine comparison */}
            <div>
                <p
                    className="text-[11px] uppercase tracking-widest text-concrete-gray font-semibold mb-4"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    Sunshine Hours per Year — The Number That Surprises Everyone
                </p>
                <div className="space-y-3">
                    {CITY_SUNSHINE.sort((a, b) => a.hours - b.hours).map((c) => (
                        <div key={c.city}>
                            <div className="flex justify-between mb-1.5">
                                <p
                                    className={`text-[13px] ${c.city === "Winnipeg" ? "font-semibold text-frost-white" : "text-concrete-gray"}`}
                                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                                >
                                    {c.city}
                                </p>
                                <p
                                    className="text-[13px] font-semibold"
                                    style={{ fontFamily: "var(--font-ibm-mono)", color: c.color }}
                                >
                                    {c.hours.toLocaleString()} hrs
                                </p>
                            </div>
                            <div className="h-2.5 bg-river-slate rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${(c.hours / 2500) * 100}%`,
                                        background: c.color,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <InsightBanner variant="highlight" className="mt-4">
                    Winnipeg receives <strong style={{ color: "#C8A44D" }}>2,353 sunshine hours per year</strong> —
                    more than any other major Canadian city, including Vancouver. The &quot;cold dark city&quot; narrative
                    is statistically backwards.
                </InsightBanner>
            </div>

            {/* Season cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SEASONS.map((season) => {
                    const Icon = season.icon;
                    return (
                        <DataCard key={season.id}>
                            <div className="flex items-start gap-3 mb-3">
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: season.color + "22" }}
                                >
                                    <Icon size={18} style={{ color: season.color }} />
                                </div>
                                <div>
                                    <p
                                        className="text-sm font-semibold text-frost-white"
                                        style={{ fontFamily: "var(--font-display)" }}
                                    >
                                        {season.label}
                                    </p>
                                    <p
                                        className="text-[11px] text-concrete-gray"
                                        style={{ fontFamily: "var(--font-ibm-mono)" }}
                                    >
                                        {season.months}
                                    </p>
                                </div>
                            </div>
                            <p
                                className="text-[13px] text-frost-white/80 leading-relaxed mb-3"
                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                            >
                                {season.description}
                            </p>
                            <ul className="space-y-1.5">
                                {season.facts.map((fact) => (
                                    <li key={fact} className="flex items-start gap-2">
                                        <div
                                            className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                                            style={{ background: season.color }}
                                        />
                                        <p className="text-[12px] text-concrete-gray" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                            {fact}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </DataCard>
                    );
                })}
            </div>

            {/* Festival grid */}
            <div>
                <p
                    className="text-[11px] uppercase tracking-widest text-concrete-gray font-semibold mb-4"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    Festivals & Events — The Cultural Calendar
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {festivals.map((f) => (
                        <DataCard key={f.id} hover>
                            <div className="text-2xl mb-2">{f.emoji}</div>
                            <p
                                className="text-[13px] font-semibold text-frost-white mb-1 leading-snug"
                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                            >
                                {f.name}
                            </p>
                            <p
                                className="text-[11px] text-exchange-brick font-semibold mb-1"
                                style={{ fontFamily: "var(--font-ibm-mono)" }}
                            >
                                {f.month}
                            </p>
                            <p
                                className="text-[11px] text-concrete-gray line-clamp-2"
                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                            >
                                {f.attendance} attendees
                            </p>
                        </DataCard>
                    ))}
                </div>
            </div>

            {/* Cost of entertainment */}
            <DataCard>
                <p
                    className="text-[11px] uppercase tracking-widest text-concrete-gray font-semibold mb-4"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    Entertainment Cost Comparison — Same Night Out
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { city: "Toronto", dinner: 90, concert: 85, hockey: 220, color: "#8B98A5" },
                        { city: "Vancouver", dinner: 95, concert: 90, hockey: 240, color: "#4C6E91" },
                        { city: "Winnipeg", dinner: 55, concert: 45, hockey: 75, color: "#B23A2B" },
                    ].map((c) => (
                        <div key={c.city} className="bg-prairie-blue/50 rounded-xl p-4">
                            <p
                                className="text-sm font-semibold mb-3"
                                style={{ color: c.color, fontFamily: "var(--font-ibm-sans)" }}
                            >
                                {c.city}
                            </p>
                            <div className="space-y-2 text-[12px]">
                                <div className="flex justify-between">
                                    <span className="text-concrete-gray">Dinner for 2</span>
                                    <span style={{ fontFamily: "var(--font-ibm-mono)", color: c.color }}>${c.dinner}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-concrete-gray">Concert ticket</span>
                                    <span style={{ fontFamily: "var(--font-ibm-mono)", color: c.color }}>${c.concert}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-concrete-gray">NHL game (avg)</span>
                                    <span style={{ fontFamily: "var(--font-ibm-mono)", color: c.color }}>${c.hockey}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </DataCard>
        </div>
    );
}
