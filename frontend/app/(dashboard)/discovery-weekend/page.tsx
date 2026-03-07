"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PillButton from "@/components/ui/PillButton";
import { useCompanyStore } from "@/store/useCompanyStore";
import { fetchDiscoveryWeekend, getFestivals, type DiscoveryWeekendResponse } from "@/lib/api";
import { Hotel, UtensilsCrossed, Map, Trees, Sparkles, Loader2, Calendar, ChevronDown } from "lucide-react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const DAY1_ITEMS = [
    {
        Icon: Hotel,
        title: "Exchange District hotel",
        note: "Fort Garry Hotel (built 1913) or Alt Hotel — from $189/night",
    },
    {
        Icon: UtensilsCrossed,
        title: "529 Wellington dinner",
        note: "Winnipeg’s premier steakhouse. Manitoba beef, heritage dining room. $80–$120/pp",
    },
    {
        Icon: Map,
        title: "The Forks evening walk",
        note: "National Historic Site at the river confluence. River Walk, Market Hall.",
    },
];

const DAY2_ITEMS = [
    {
        Icon: Trees,
        title: "Assiniboine Park",
        note: "400+ acre urban park. Zoo, conservatory, Leo Mol Sculpture Garden.",
    },
    {
        Icon: Map,
        title: "Neighbourhood tour",
        note: "River Heights · Tuxedo · Osborne Village · The Exchange",
    },
    {
        Icon: Map,
        title: "CMHR",
        note: "Canadian Museum for Human Rights — world’s first museum dedicated to human rights.",
    },
    {
        Icon: Sparkles,
        title: "Economic Development Winnipeg",
        note: "Free concierge: commercial previews, business introductions, zone briefings.",
    },
];

export default function DiscoveryWeekendPage() {
    const { selectedZoneId } = useCompanyStore();
    const [travelMonth, setTravelMonth] = useState(new Date().getMonth() + 1);
    const [aiItinerary, setAiItinerary] = useState<DiscoveryWeekendResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const monthName = MONTHS[travelMonth - 1];
    const monthFestivals = getFestivals().filter((f) => f.month === monthName);

    const generateItinerary = async () => {
        setLoading(true);
        const result = await fetchDiscoveryWeekend(
            selectedZoneId ?? "exchange-district",
            travelMonth
        );
        setAiItinerary(result);
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-6 md:p-8 flex flex-col gap-8"
        >
            {/* Screen label */}
            <p
                className="text-[10px] font-semibold uppercase tracking-widest -mb-4"
                style={{ color: "#B99445", fontFamily: "var(--font-ibm-mono)" }}
            >
                Screen 8 — Discovery Weekend
            </p>

            {/* Editorial header */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <p
                        className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                        style={{ color: "#B99445", fontFamily: "var(--font-ibm-sans)" }}
                    >
                        Executive Preview Program
                    </p>
                    <h1
                        className="text-[38px] md:text-[44px] font-bold text-frost-white leading-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        The Winnipeg<br />Discovery Weekend
                    </h1>
                    <p
                        className="text-[15px] text-concrete-gray mt-3 max-w-lg"
                        style={{ fontFamily: "var(--font-ibm-sans)" }}
                    >
                        Before you ask your team to make a life decision, make the trip yourself. 48 hours.
                        A curated itinerary designed for executives.
                    </p>
                </div>

                {/* Month picker */}
                <div className="flex flex-col gap-1.5">
                    <label
                        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest"
                        style={{ color: "#8B98A5", fontFamily: "var(--font-ibm-sans)" }}
                    >
                        <Calendar size={11} /> Travel Month
                    </label>
                    <div className="relative">
                        <select
                            value={travelMonth}
                            onChange={(e) => {
                                setTravelMonth(Number(e.target.value));
                                setAiItinerary(null);
                            }}
                            className="appearance-none rounded px-4 py-2.5 pr-8 text-sm border outline-none"
                            style={{
                                background: "#1C2A39",
                                borderColor: "rgba(185,148,69,0.35)",
                                color: "#C8A44D",
                                fontFamily: "var(--font-ibm-mono)",
                                fontSize: "13px",
                            }}
                        >
                            {MONTHS.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <ChevronDown
                            size={12}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "#B99445" }}
                        />
                    </div>
                </div>
            </div>

            {/* Two-column editorial layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

                {/* LEFT: Itinerary card */}
                <div
                    className="rounded-xl overflow-hidden"
                    style={{ border: "1px solid rgba(185,148,69,0.25)" }}
                >
                    {/* Card header bar */}
                    <div
                        className="px-6 py-4"
                        style={{
                            background: "linear-gradient(90deg, #1C2A39 0%, #2F3E4F 100%)",
                            borderBottom: "1px solid rgba(185,148,69,0.15)",
                        }}
                    >
                        <p
                            className="text-[11px] uppercase tracking-widest font-semibold"
                            style={{ color: "#B99445", fontFamily: "var(--font-ibm-mono)" }}
                        >
                            48-Hour Curated Itinerary
                        </p>
                    </div>

                    {/* Day 1 section — amber border */}
                    <div
                        className="px-6 py-5 border-l-4"
                        style={{ background: "#2F3E4F", borderLeftColor: "#B99445" }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <span
                                className="text-[13px] font-bold"
                                style={{ color: "#B99445", fontFamily: "var(--font-ibm-mono)" }}
                            >
                                Day 1
                            </span>
                            {/* Seasonal event badge — dynamic */}
                            {monthFestivals.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 justify-end">
                                    {monthFestivals.map((f) => (
                                        <span
                                            key={f.id}
                                            className="text-[10px] font-semibold px-3 py-1.5 rounded-full"
                                            style={{
                                                background: "rgba(185,148,69,0.12)",
                                                color: "#C8A44D",
                                                border: "1px solid rgba(185,148,69,0.3)",
                                                fontFamily: "var(--font-ibm-sans)",
                                            }}
                                            title={f.description}
                                        >
                                            {f.emoji} {f.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span
                                    className="text-[10px] font-semibold px-3 py-1.5 rounded-full"
                                    style={{
                                        background: "rgba(94,140,106,0.1)",
                                        color: "#5E8C6A",
                                        border: "1px solid rgba(94,140,106,0.25)",
                                        fontFamily: "var(--font-ibm-sans)",
                                    }}
                                >
                                    🏙️ {monthName}: City Exploration
                                </span>
                            )}
                        </div>
                        <div className="space-y-4">
                            {DAY1_ITEMS.map((item) => (
                                <div key={item.title} className="flex items-start gap-3">
                                    <div
                                        className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                                        style={{ background: "rgba(185,148,69,0.1)" }}
                                    >
                                        <item.Icon size={14} style={{ color: "#B99445" }} />
                                    </div>
                                    <div>
                                        <p
                                            className="text-[13px] font-semibold"
                                            style={{ color: "#FFFFFF", fontFamily: "var(--font-ibm-sans)" }}
                                        >
                                            {item.title}
                                        </p>
                                        <p
                                            className="text-[11px] mt-0.5"
                                            style={{ color: "rgba(200,164,77,0.65)", fontFamily: "var(--font-ibm-sans)" }}
                                        >
                                            {item.note}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Day 2 section — green border */}
                    <div
                        className="px-6 py-5 border-l-4"
                        style={{ background: "#243342", borderLeftColor: "#5E8C6A" }}
                    >
                        <span
                            className="block text-[13px] font-bold mb-5"
                            style={{ color: "#5E8C6A", fontFamily: "var(--font-ibm-mono)" }}
                        >
                            Day 2
                        </span>
                        <div className="space-y-4">
                            {DAY2_ITEMS.map((item) => (
                                <div key={item.title} className="flex items-start gap-3">
                                    <div
                                        className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                                        style={{ background: "rgba(94,140,106,0.1)" }}
                                    >
                                        <item.Icon size={14} style={{ color: "#5E8C6A" }} />
                                    </div>
                                    <div>
                                        <p
                                            className="text-[13px] font-semibold"
                                            style={{ color: "#FFFFFF", fontFamily: "var(--font-ibm-sans)" }}
                                        >
                                            {item.title}
                                        </p>
                                        <p
                                            className="text-[11px] mt-0.5"
                                            style={{ color: "rgba(94,140,106,0.65)", fontFamily: "var(--font-ibm-sans)" }}
                                        >
                                            {item.note}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="p-5" style={{ background: "#1C2A39", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <PillButton onClick={generateItinerary} icon>
                            {loading ? (
                                <><Loader2 size={14} className="animate-spin" /> Generating…</>
                            ) : (
                                "Generate My Discovery Weekend"
                            )}
                        </PillButton>
                    </div>
                </div>

                {/* RIGHT: Decorative route map */}
                <div
                    className="rounded-xl overflow-hidden relative"
                    style={{
                        background: "#1C2A39",
                        border: "1px solid rgba(255,255,255,0.08)",
                        minHeight: 400,
                    }}
                >
                    <WinnipegRouteMap />
                </div>

            </div>

            {/* AI Generator */}
            <div
                className="rounded-xl overflow-hidden"
                style={{ background: "#F7F9FB", border: "1px solid #E8EDF2" }}
            >
                <div className="p-5 border-b border-gray-100 flex flex-wrap items-center gap-4">
                    <p className="text-[13px] text-concrete-gray flex-1" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                        AI-generated itinerary tailored to your selected zone &amp; travel month —{" "}
                        <span style={{ color: "#B99445" }}>{monthName}</span>
                        {selectedZoneId && (
                            <span style={{ color: "#8B98A5" }}> · {selectedZoneId.replace(/-/g, " ")}</span>
                        )}
                    </p>
                </div>

                {aiItinerary && (
                    <div className="p-5">
                        <p
                            className="text-[11px] uppercase tracking-widest text-concrete-gray font-semibold mb-4"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            AI Itinerary — {MONTHS[aiItinerary.travel_month - 1]} · {aiItinerary.zone_name}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {aiItinerary.itinerary.map((day, di) => {
                                const color = ["#B23A2B", "#4C6E91", "#5E8C6A"][di % 3];
                                return (
                                    <div
                                        key={day.day}
                                        className="rounded-lg p-4 border border-white/8"
                                        style={{ background: color + "10" }}
                                    >
                                        <p className="text-[11px] font-semibold mb-3" style={{ color, fontFamily: "var(--font-ibm-mono)" }}>
                                            {day.day}
                                        </p>
                                        <div className="space-y-2.5">
                                            {day.activities.map((act, ai) => (
                                                <div key={ai} className="flex gap-2.5">
                                                    <span className="text-[11px] font-semibold w-20 flex-shrink-0 mt-0.5" style={{ color, fontFamily: "var(--font-ibm-mono)" }}>
                                                        {act.time}
                                                    </span>
                                                    <div>
                                                        <p className="text-[13px] text-frost-white leading-snug" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                                            {act.activity}
                                                        </p>
                                                        {act.location && (
                                                            <p className="text-[11px] text-concrete-gray mt-0.5" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                                                📍 {act.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {aiItinerary.seasonal_events.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                <p className="text-[11px] text-concrete-gray w-full" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                    Seasonal events this month:
                                </p>
                                {aiItinerary.seasonal_events.map((ev) => (
                                    <span
                                        key={ev}
                                        className="text-[11px] px-2.5 py-1 rounded border"
                                        style={{
                                            borderColor: "rgba(185,148,69,0.3)",
                                            background: "rgba(185,148,69,0.08)",
                                            color: "#B99445",
                                            fontFamily: "var(--font-ibm-sans)",
                                        }}
                                    >
                                        {ev}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ── Decorative SVG route map ─────────────────────────────────────
function WinnipegRouteMap() {
    const stops = [
        { id: "hotel", label: ["Exchange District", "Hotel"], x: 54, y: 30, day: 1, color: "#B99445" },
        { id: "wellington", label: ["529 Wellington"], x: 50, y: 44, day: 1, color: "#B99445" },
        { id: "forks", label: ["The Forks"], x: 61, y: 52, day: 1, color: "#B99445" },
        { id: "assiniboine", label: ["Assiniboine", "Park"], x: 28, y: 62, day: 2, color: "#5E8C6A" },
        { id: "cmhr", label: ["CMHR"], x: 60, y: 60, day: 2, color: "#5E8C6A" },
    ];

    const d1 = stops.filter((s) => s.day === 1);
    const d2 = stops.filter((s) => s.day === 2);

    return (
        <div className="absolute inset-0">
            {/* Map header */}
            <div className="absolute top-4 left-4 right-4 z-10">
                <p
                    className="text-[10px] uppercase tracking-widest font-semibold"
                    style={{ color: "rgba(185,148,69,0.6)", fontFamily: "var(--font-ibm-mono)" }}
                >
                    Route Map · Winnipeg
                </p>
            </div>

            <svg
                width="100%"
                height="100%"
                viewBox="0 0 200 280"
                fill="none"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: "absolute", inset: 0 }}
            >
                {/* Grid */}
                {[20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260].map((y) => (
                    <line key={`h${y}`} x1="0" y1={y} x2="200" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                ))}
                {[25, 50, 75, 100, 125, 150, 175].map((x) => (
                    <line key={`v${x}`} x1={x} y1="0" x2={x} y2="280" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                ))}

                {/* Stylized river (Red River running south-to-north) */}
                <path
                    d="M 100 280 Q 112 240 118 200 Q 122 170 120 140 Q 118 110 114 80 Q 110 50 108 20"
                    stroke="rgba(76,110,145,0.30)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    fill="none"
                />
                <path
                    d="M 100 280 Q 112 240 118 200 Q 122 170 120 140 Q 118 110 114 80 Q 110 50 108 20"
                    stroke="rgba(76,110,145,0.18)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Day 1 route line */}
                {d1.slice(1).map((stop, i) => {
                    const prev = d1[i];
                    return (
                        <line
                            key={`d1-${i}`}
                            x1={prev.x * 2}
                            y1={prev.y * 2.6}
                            x2={stop.x * 2}
                            y2={stop.y * 2.6}
                            stroke="#B99445"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            opacity="0.65"
                        />
                    );
                })}

                {/* Day 2 route line */}
                {d2.slice(1).map((stop, i) => {
                    const prev = d2[i];
                    return (
                        <line
                            key={`d2 - ${ i }`}
                            x1={prev.x * 2}
                            y1={prev.y * 2.6}
                            x2={stop.x * 2}
                            y2={stop.y * 2.6}
                            stroke="#5E8C6A"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            opacity="0.65"
                        />
                    );
                })}

                {/* Stop markers + labels */}
                {stops.map((stop) => (
                    <g key={stop.id}>
                        <circle cx={stop.x * 2} cy={stop.y * 2.6} r="9" fill={stop.color} opacity="0.12" />
                        <circle cx={stop.x * 2} cy={stop.y * 2.6} r="4" fill={stop.color} />
                        {stop.label.map((line, li) => (
                            <text
                                key={li}
                                x={stop.x * 2 + 9}
                                y={stop.y * 2.6 + (li * 9) - (stop.label.length > 1 ? 3 : 0)}
                                fill={stop.color}
                                fontSize="7"
                                fontFamily="IBM Plex Mono, monospace"
                                fontWeight="500"
                                opacity="0.88"
                            >
                                {line}
                            </text>
                        ))}
                    </g>
                ))}

                {/* Legend */}
                <rect x="10" y="254" width="10" height="2" fill="#B99445" rx="1" />
                <text x="24" y="258" fill="rgba(185,148,69,0.65)" fontSize="6.5" fontFamily="IBM Plex Mono, monospace">Day 1</text>
                <rect x="10" y="266" width="10" height="2" fill="#5E8C6A" rx="1" />
                <text x="24" y="270" fill="rgba(94,140,106,0.65)" fontSize="6.5" fontFamily="IBM Plex Mono, monospace">Day 2</text>
            </svg>
        </div>
    );
}
