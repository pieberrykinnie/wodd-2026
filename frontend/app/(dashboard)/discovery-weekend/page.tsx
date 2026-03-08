"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import { useCompanyStore } from "@/store/useCompanyStore";
import { getFestivals } from "@/lib/api";
import { Hotel, UtensilsCrossed, Map, Trees, Sparkles, Calendar, ChevronDown } from "lucide-react";

const ItineraryMap = dynamic(() => import("@/components/maps/ItineraryMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-river-slate rounded flex items-center justify-center">
            <p className="text-concrete-gray text-sm">Loading map…</p>
        </div>
    ),
});

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const DAY1_ITEMS = [
    {
        Icon: Hotel,
        order: 1,
        title: "Exchange District Hotel",
        note: "Fort Garry Hotel (built 1913) or Alt Hotel — from $189/night",
    },
    {
        Icon: UtensilsCrossed,
        order: 2,
        title: "529 Wellington dinner",
        note: "Winnipeg's premier steakhouse. Manitoba beef, heritage dining room. $80–$120/pp",
    },
    {
        Icon: Map,
        order: 3,
        title: "The Forks evening walk",
        note: "National Historic Site at the river confluence. River Walk, Market Hall.",
    },
];

const DAY2_ITEMS = [
    {
        Icon: Trees,
        order: 1,
        title: "Assiniboine Park",
        note: "400+ acre urban park. Zoo, conservatory, Leo Mol Sculpture Garden.",
    },
    {
        Icon: Map,
        order: 2,
        title: "Neighbourhood tour",
        note: "River Heights · Tuxedo · Osborne Village · The Exchange",
    },
    {
        Icon: Map,
        order: 3,
        title: "CMHR",
        note: "Canadian Museum for Human Rights — world's first museum dedicated to human rights.",
    },
    {
        Icon: Sparkles,
        order: 4,
        title: "Economic Development Winnipeg",
        note: "Free concierge: commercial previews, business introductions, zone briefings.",
    },
];

export default function DiscoveryWeekendPage() {
    const { selectedZoneId } = useCompanyStore();
    const [travelMonth, setTravelMonth] = useState(new Date().getMonth() + 1);

    const monthName = MONTHS[travelMonth - 1];
    const monthFestivals = getFestivals().filter((f) => f.month === monthName);

    void selectedZoneId; // available for future personalization

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-6 md:p-8 flex flex-col gap-5 h-[calc(100vh-4rem)]"
        >
            {/* Header row */}
            <div className="flex-shrink-0 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p
                        className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                        style={{ color: "#B99445", fontFamily: "var(--font-ibm-mono)" }}
                    >
                        Screen 8 — Discovery Weekend
                    </p>
                    <h1
                        className="text-[28px] md:text-[34px] font-bold leading-tight"
                        style={{ color: "#0F1823", fontFamily: "var(--font-display)" }}
                    >
                        The Winnipeg Discovery Weekend
                    </h1>
                    <p
                        className="text-[13px] text-concrete-gray mt-1"
                        style={{ fontFamily: "var(--font-ibm-sans)" }}
                    >
                        48 hours. A curated itinerary designed for executives. Click any stop on the map.
                    </p>
                </div>

                {/* Month picker */}
                <div className="flex flex-col gap-1.5">
                    <label
                        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-concrete-gray"
                        style={{ fontFamily: "var(--font-ibm-sans)" }}
                    >
                        <Calendar size={11} /> Travel Month
                    </label>
                    <div className="relative">
                        <select
                            value={travelMonth}
                            onChange={(e) => setTravelMonth(Number(e.target.value))}
                            className="appearance-none rounded px-4 py-2.5 pr-8 text-sm border outline-none"
                            style={{
                                background: "#F1F4F7",
                                borderColor: "#E8EDF2",
                                color: "#0F1823",
                                fontFamily: "var(--font-ibm-sans)",
                                fontSize: "13px",
                            }}
                        >
                            {MONTHS.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <ChevronDown
                            size={12}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-concrete-gray"
                        />
                    </div>
                </div>
            </div>

            {/* Map + overlay panel */}
            <div className="flex-1 min-h-0 relative">
                <ItineraryMap />

                {/* Floating itinerary panel */}
                <div
                    className="absolute top-4 left-4 bottom-4 w-72 z-10 rounded-xl overflow-y-auto shadow-lg"
                    style={{ background: "#FFFFFF", border: "1px solid #E8EDF2" }}
                >
                    {/* Panel header */}
                    <div
                        className="px-4 py-3 sticky top-0 z-10"
                        style={{ background: "#F7F9FB", borderBottom: "1px solid #E8EDF2" }}
                    >
                        <p
                            className="text-[11px] font-semibold uppercase tracking-widest"
                            style={{ color: "#B99445", fontFamily: "var(--font-ibm-mono)" }}
                        >
                            48-Hour Itinerary
                        </p>
                        <p
                            className="text-[11px] text-concrete-gray mt-0.5"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            Executive Preview Program · {monthName}
                        </p>
                    </div>

                    {/* Day 1 */}
                    <div className="px-4 py-4 border-l-4" style={{ borderLeftColor: "#B99445" }}>
                        <div className="flex items-center justify-between mb-3">
                            <span
                                className="text-[12px] font-bold"
                                style={{ color: "#B99445", fontFamily: "var(--font-ibm-mono)" }}
                            >
                                Day 1
                            </span>
                            {monthFestivals.length > 0 ? (
                                <div className="flex flex-wrap gap-1 justify-end">
                                    {monthFestivals.slice(0, 2).map((f) => (
                                        <span
                                            key={f.id}
                                            className="text-[9px] font-semibold px-2 py-1 rounded-full"
                                            style={{
                                                background: "rgba(185,148,69,0.10)",
                                                color: "#B99445",
                                                border: "1px solid rgba(185,148,69,0.25)",
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
                                    className="text-[9px] font-semibold px-2 py-1 rounded-full"
                                    style={{
                                        background: "rgba(94,140,106,0.08)",
                                        color: "#5E8C6A",
                                        border: "1px solid rgba(94,140,106,0.2)",
                                        fontFamily: "var(--font-ibm-sans)",
                                    }}
                                >
                                    City Exploration
                                </span>
                            )}
                        </div>
                        <div className="space-y-3">
                            {DAY1_ITEMS.map((item) => (
                                <div key={item.title} className="flex items-start gap-2.5">
                                    <div
                                        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold border-2"
                                        style={{
                                            background: "rgba(185,148,69,0.08)",
                                            borderColor: "#B99445",
                                            color: "#B99445",
                                            fontFamily: "var(--font-ibm-mono)",
                                        }}
                                    >
                                        {item.order}
                                    </div>
                                    <div>
                                        <p
                                            className="text-[12px] font-semibold"
                                            style={{ color: "#0F1823", fontFamily: "var(--font-ibm-sans)" }}
                                        >
                                            {item.title}
                                        </p>
                                        <p
                                            className="text-[10px] mt-0.5 text-concrete-gray leading-relaxed"
                                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                                        >
                                            {item.note}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: "#E8EDF2" }} />

                    {/* Day 2 */}
                    <div className="px-4 py-4 border-l-4" style={{ borderLeftColor: "#5E8C6A" }}>
                        <span
                            className="block text-[12px] font-bold mb-3"
                            style={{ color: "#5E8C6A", fontFamily: "var(--font-ibm-mono)" }}
                        >
                            Day 2
                        </span>
                        <div className="space-y-3">
                            {DAY2_ITEMS.map((item) => (
                                <div key={item.title} className="flex items-start gap-2.5">
                                    <div
                                        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold border-2"
                                        style={{
                                            background: "rgba(94,140,106,0.08)",
                                            borderColor: "#5E8C6A",
                                            color: "#5E8C6A",
                                            fontFamily: "var(--font-ibm-mono)",
                                        }}
                                    >
                                        {item.order}
                                    </div>
                                    <div>
                                        <p
                                            className="text-[12px] font-semibold"
                                            style={{ color: "#0F1823", fontFamily: "var(--font-ibm-sans)" }}
                                        >
                                            {item.title}
                                        </p>
                                        <p
                                            className="text-[10px] mt-0.5 text-concrete-gray leading-relaxed"
                                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                                        >
                                            {item.note}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer note */}
                    <div
                        className="px-4 py-3 text-center"
                        style={{ borderTop: "1px solid #E8EDF2", background: "#F7F9FB" }}
                    >
                        <p
                            className="text-[10px] text-concrete-gray leading-relaxed"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            Click any numbered stop on the map to see details.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
