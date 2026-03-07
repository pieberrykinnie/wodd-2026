"use client";

import { motion } from "framer-motion";
import { useCompanyStore } from "@/store/useCompanyStore";
import { getCityById, getNeighborhoods, type Neighborhood } from "@/lib/api";
import PersonaTag from "@/components/ui/PersonaTag";
import { Car, Train, Clock } from "lucide-react";

const PERSONA_ZONE_IDS = ["exchange-district", "river-heights", "tuxedo", "st-vital"];

export default function CommutePage() {
    const { cityId } = useCompanyStore();
    const city = getCityById(cityId) ?? getCityById("toronto")!;
    const all = getNeighborhoods();
    const zones = PERSONA_ZONE_IDS.map((id) => all.find((n) => n.id === id)!).filter(Boolean);

    const commuteDelta = city.avgCommute - 20;
    const annualHoursRecovered = Math.round((commuteDelta * 2 * 240) / 60);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-6 md:p-8"
        >
            {/* Screen label */}
            <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-5"
                style={{ color: "#B99445", fontFamily: "var(--font-ibm-mono)" }}
            >
                Screen 6 — Commute Optimization
            </p>

            {/* Full-width two-panel card */}
            <div
                className="rounded-xl overflow-hidden"
                style={{
                    background: "#FFFFFF",
                    border: "1px solid #E8EDF2",
                    boxShadow: "0 4px 24px rgba(15,24,35,0.08)",
                }}
            >
                <div className="flex flex-col lg:flex-row min-h-[520px]">

                    {/* ── LEFT HALF: Bar charts ── */}
                    <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-100">
                        <div>
                            <p
                                className="text-[11px] font-semibold uppercase tracking-widest text-concrete-gray mb-2"
                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                            >
                                Commute Optimization
                            </p>
                            <h2
                                className="text-[34px] font-bold text-frost-white leading-tight mb-10"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                Time Is the<br />Hidden Benefit
                            </h2>

                            <div className="space-y-8">
                                {/* City bar */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-2xl leading-none" role="img" aria-label="stressed">😫</span>
                                            <span
                                                className="text-[15px] font-semibold text-frost-white"
                                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                                            >
                                                {city.name}
                                            </span>
                                        </div>
                                        <span
                                            className="text-[13px] font-semibold"
                                            style={{ color: "#B23A2B", fontFamily: "var(--font-ibm-mono)" }}
                                        >
                                            60–90 min
                                        </span>
                                    </div>
                                    <div className="h-10 rounded-md overflow-hidden" style={{ background: "#F1F4F7" }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "85%" }}
                                            transition={{ duration: 1.0, ease: "easeOut", delay: 0.3 }}
                                            className="h-full rounded-md flex items-center justify-end pr-4"
                                            style={{ background: "linear-gradient(90deg, #B23A2B 0%, #C4453A 100%)" }}
                                        >
                                            <span
                                                className="text-white text-[11px] font-semibold"
                                                style={{ fontFamily: "var(--font-ibm-mono)" }}
                                            >
                                                {city.avgCommute} min avg
                                            </span>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Winnipeg bar */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-2xl leading-none" role="img" aria-label="relaxed">😊</span>
                                            <span
                                                className="text-[15px] font-semibold text-frost-white"
                                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                                            >
                                                Winnipeg
                                            </span>
                                        </div>
                                        <span
                                            className="text-[13px] font-semibold"
                                            style={{ color: "#5E8C6A", fontFamily: "var(--font-ibm-mono)" }}
                                        >
                                            15–25 min
                                        </span>
                                    </div>
                                    <div className="h-10 rounded-md overflow-hidden" style={{ background: "#F1F4F7" }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "27%" }}
                                            transition={{ duration: 1.0, ease: "easeOut", delay: 0.5 }}
                                            className="h-full rounded-md flex items-center justify-end pr-4"
                                            style={{ background: "linear-gradient(90deg, #5E8C6A 0%, #6EA880 100%)" }}
                                        >
                                            <span
                                                className="text-white text-[11px] font-semibold"
                                                style={{ fontFamily: "var(--font-ibm-mono)" }}
                                            >
                                                20 min avg
                                            </span>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hours callout */}
                        <div
                            className="mt-8 p-5 rounded-xl flex items-center gap-4"
                            style={{ background: "#F7F9FB", border: "1px solid #E8EDF2" }}
                        >
                            <div
                                className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(185,148,69,0.12)" }}
                            >
                                <Clock size={20} style={{ color: "#B99445" }} />
                            </div>
                            <div>
                                <p
                                    className="text-[26px] font-bold leading-tight"
                                    style={{ color: "#B99445", fontFamily: "var(--font-ibm-mono)" }}
                                >
                                    {annualHoursRecovered} hrs
                                    <span
                                        className="text-[14px] text-concrete-gray font-normal ml-1.5"
                                        style={{ fontFamily: "var(--font-ibm-sans)" }}
                                    >
                                        /year recovered
                                    </span>
                                </p>
                                <p
                                    className="text-[12px] text-concrete-gray"
                                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                                >
                                    Per employee — worth $8K–$14K in hidden salary
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT HALF: Route cards ── */}
                    <div
                        className="flex-1 p-6 lg:p-8 flex flex-col"
                        style={{ background: "#F7F9FB" }}
                    >
                        <p
                            className="text-[11px] font-semibold uppercase tracking-widest text-concrete-gray mb-5"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            Neighbourhood Routes → Downtown Winnipeg
                        </p>
                        <div className="flex flex-col gap-3 flex-1 justify-center">
                            {zones.map((n) => <RouteCard key={n.id} n={n} />)}
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}

// ── SVG mini dark map thumbnail ──────────────────────────────────
function MapThumbnail({ commuteMins }: { commuteMins: number }) {
    const isShort = commuteMins < 15;
    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 64 84"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", background: "#1C2A39" }}
        >
            {/* Grid lines */}
            {[14, 28, 42, 56, 70].map((y) => (
                <line key={`h${y}`} x1="0" y1={y} x2="64" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            {[16, 32, 48].map((x) => (
                <line key={`v${x}`} x1={x} y1="0" x2={x} y2="84" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            {/* Dashed route */}
            <line
                x1="18" y1="68"
                x2="46" y2="16"
                stroke={isShort ? "#5E8C6A" : "#B99445"}
                strokeWidth="1.5"
                strokeDasharray="3 2.5"
                opacity="0.75"
            />
            {/* Downtown dot (destination) */}
            <circle cx="46" cy="16" r="4.5" fill="#1C2A39" stroke="#5E8C6A" strokeWidth="1.5" />
            <circle cx="46" cy="16" r="2" fill="#5E8C6A" />
            {/* Neighbourhood dot (origin) */}
            <circle cx="18" cy="68" r="4.5" fill="#B99445" opacity="0.9" />
            <circle cx="18" cy="68" r="8" stroke="#B99445" strokeWidth="0.75" opacity="0.2" />
        </svg>
    );
}

// ── Route card ───────────────────────────────────────────────────
function RouteCard({ n }: { n: Neighborhood }) {
    return (
        <div
            className="rounded-lg overflow-hidden flex"
            style={{
                background: "#FFFFFF",
                border: "1px solid #E8EDF2",
                boxShadow: "0 1px 6px rgba(15,24,35,0.05)",
                minHeight: 88,
            }}
        >
            {/* Map thumbnail */}
            <div className="w-16 flex-shrink-0">
                <MapThumbnail commuteMins={n.commuteMins} />
            </div>
            <div className="w-px bg-gray-100 flex-shrink-0" />

            {/* Content */}
            <div className="flex-1 px-4 py-3 flex flex-col justify-center gap-2">
                <p
                    className="text-[13px] font-semibold text-frost-white"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    {n.name}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                    <PersonaTag persona={n.persona} />
                    {/* Drive time chip */}
                    <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                            background: "rgba(47,62,79,0.08)",
                            color: "#2F3E4F",
                            fontFamily: "var(--font-ibm-mono)",
                        }}
                    >
                        <Car size={9} />
                        {n.commuteMins} min
                    </span>
                    {/* Transit chip */}
                    {n.transitRoutes.slice(0, 1).map((r) => (
                        <span
                            key={r}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold"
                            style={{
                                background: "rgba(94,140,106,0.12)",
                                color: "#5E8C6A",
                                fontFamily: "var(--font-ibm-mono)",
                            }}
                        >
                            <Train size={9} />
                            Route {r}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
