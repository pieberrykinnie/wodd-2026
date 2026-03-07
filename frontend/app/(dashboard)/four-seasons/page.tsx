"use client";

import { motion } from "framer-motion";
import { getFestivals } from "@/lib/api";
import DataCard from "@/components/ui/DataCard";

const GRID_SEASONS = [
    {
        season: "summer",
        label: "Summer · Whiteshell Lakes",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    },
    {
        season: "winter",
        label: "Winter · Festival du Voyageur",
        imageUrl: "https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=1200&q=80",
    },
    {
        season: "autumn",
        label: "Autumn · Assiniboine Park",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
    },
    {
        season: "spring",
        label: "Spring · The Forks",
        imageUrl: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&q=80",
    },
];

const STAT_STRIP = [
    { value: "2,353 sunshine hours", sub: "More than Vancouver" },
    { value: "4 major festivals/year", sub: "Celebrating every season" },
    { value: "Whiteshell: 90 min away", sub: "Provincial park escape" },
    { value: "Avg. concert ticket: $45", sub: "vs $140 Toronto" },
];

export default function FourSeasonsPage() {
    const festivals = getFestivals();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            {/* Screen label */}
            <div className="px-6 pt-6">
                <p
                    className="text-[10px] font-semibold uppercase tracking-widest mb-4"
                    style={{ color: "#B99445", fontFamily: "var(--font-ibm-mono)" }}
                >
                    Screen 7 — Four Seasons Living
                </p>
            </div>

            {/* Full-bleed 2×2 photography grid */}
            <div className="grid grid-cols-2 grid-rows-2" style={{ height: "clamp(440px, 58vh, 620px)" }}>
                {GRID_SEASONS.map((s) => (
                    <div key={s.season} className="relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={s.imageUrl}
                            alt={s.label}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Dark gradient overlay */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "linear-gradient(to top, rgba(10,15,24,0.92) 0%, rgba(10,15,24,0.35) 55%, rgba(10,15,24,0.1) 100%)",
                            }}
                        />
                        {/* Headline — Fraunces (var(--font-display)) Bold */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                            <p
                                className="text-white font-bold leading-tight"
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "clamp(15px, 2vw, 24px)",
                                    textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                                }}
                            >
                                {s.label}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stat strip */}
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ background: "#2F3E4F" }}>
                {STAT_STRIP.map((stat, i) => (
                    <div
                        key={i}
                        className="px-6 py-5 border-r border-white/10 last:border-r-0"
                    >
                        <p
                            className="text-[14px] font-semibold leading-snug"
                            style={{ color: "#C8A44D", fontFamily: "var(--font-ibm-mono)" }}
                        >
                            {stat.value}
                        </p>
                        <p
                            className="text-[12px] mt-1"
                            style={{ color: "rgba(200,164,77,0.55)", fontFamily: "var(--font-ibm-sans)" }}
                        >
                            {stat.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* Festival grid */}
            <div className="px-6 md:px-8 pt-8 pb-4">
                <p
                    className="text-[11px] uppercase tracking-widest text-concrete-gray font-semibold mb-4"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    Festivals &amp; Events — The Cultural Calendar
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
                                className="text-[11px] font-semibold mb-1"
                                style={{ color: "#B99445", fontFamily: "var(--font-ibm-mono)" }}
                            >
                                {f.month}
                            </p>
                            <p className="text-[11px] text-concrete-gray" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                {f.attendance} attendees
                            </p>
                        </DataCard>
                    ))}
                </div>
            </div>

            {/* Entertainment cost comparison */}
            <div className="px-6 md:px-8 pb-8">
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
                            <div key={c.city} className="rounded-lg p-4" style={{ background: "#F7F9FB" }}>
                                <p
                                    className="text-sm font-semibold mb-3"
                                    style={{ color: c.color, fontFamily: "var(--font-ibm-sans)" }}
                                >
                                    {c.city}
                                </p>
                                <div className="space-y-2 text-[12px]">
                                    {[
                                        ["Dinner for 2", c.dinner],
                                        ["Concert ticket", c.concert],
                                        ["NHL game (avg)", c.hockey],
                                    ].map(([label, val]) => (
                                        <div key={String(label)} className="flex justify-between">
                                            <span className="text-concrete-gray">{label}</span>
                                            <span style={{ fontFamily: "var(--font-ibm-mono)", color: c.color }}>${val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </DataCard>
            </div>
        </motion.div>
    );
}
