"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useCompanyStore } from "@/store/useCompanyStore";
import {
    getNeighborhoods,
    fetchZones,
    fetchZoneDetail,
    type Neighborhood,
    type ZoneDetail,
} from "@/lib/api";
import { Car, Train } from "lucide-react";
import PersonaTag from "@/components/ui/PersonaTag";
import type { TransitStop, OfficeZone } from "@/components/maps/CommuteMap";

const CommuteMap = dynamic(() => import("@/components/maps/CommuteMap"), { ssr: false });

function commuteColor(mins: number): string {
    if (mins <= 15) return "#5E8C6A";
    if (mins <= 25) return "#B99445";
    return "#B23A2B";
}

export default function CommutePage() {
    const { selectedZoneId } = useCompanyStore();
    const effectiveZoneId = selectedZoneId ?? "exchange-district";

    const neighborhoods = getNeighborhoods();
    const [officeZone, setOfficeZone] = useState<OfficeZone | null>(null);
    const [zoneDetail, setZoneDetail] = useState<ZoneDetail | null>(null);
    const [activeId, setActiveId] = useState<string>(neighborhoods[0]?.id ?? "");
    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        let cancelled = false;
        async function load() {
            const [zones, detail] = await Promise.all([
                fetchZones(),
                fetchZoneDetail(effectiveZoneId),
            ]);
            if (cancelled) return;
            const found = zones.find((z) => z.id === effectiveZoneId);
            setOfficeZone(
                found
                    ? { id: found.id, name: found.name, lat: found.lat, lng: found.lng }
                    : { id: "exchange-district", name: "Exchange District", lat: 49.8992, lng: -97.1384 }
            );
            setZoneDetail(detail);
        }
        load();
        return () => { cancelled = true; };
    }, [effectiveZoneId]);

    function handleSelectNeighborhood(id: string) {
        setActiveId(id);
        cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    const transitStops: TransitStop[] = (zoneDetail?.nearby_transit_stops ?? []) as TransitStop[];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-6 md:p-8 flex flex-col"
            style={{ minHeight: "calc(100vh - 80px)" }}
        >
            {/* Screen label */}
            <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-5"
                style={{ color: "#B99445", fontFamily: "var(--font-ibm-mono)" }}
            >
                Screen 6 — Commute Optimization
            </p>

            {/* Two-panel card */}
            <div
                className="rounded-xl overflow-hidden flex-1"
                style={{
                    background: "#FFFFFF",
                    border: "1px solid #E8EDF2",
                    boxShadow: "0 4px 24px rgba(15,24,35,0.08)",
                    minHeight: 580,
                }}
            >
                <div className="flex flex-col lg:flex-row h-full" style={{ minHeight: 580 }}>

                    {/* ── LEFT: Map (60%) ── */}
                    <div className="flex flex-col lg:w-[60%] border-b lg:border-b-0 lg:border-r border-gray-100">
                        <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
                            <p
                                className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                                style={{ color: "#8A9AB0", fontFamily: "var(--font-ibm-sans)" }}
                            >
                                Live Commute Map
                            </p>
                            <h2
                                className="text-[22px] font-bold leading-tight"
                                style={{ color: "#0F1823", fontFamily: "var(--font-display)" }}
                            >
                                Routes to {officeZone?.name ?? "…"}
                            </h2>
                            {zoneDetail?.transit_stop_count != null && (
                                <p
                                    className="text-[12px] mt-0.5"
                                    style={{ color: "#8A9AB0", fontFamily: "var(--font-ibm-sans)" }}
                                >
                                    {zoneDetail.transit_stop_count} live transit stops within 500m
                                </p>
                            )}
                        </div>

                        {/* Map canvas */}
                        <div className="flex-1" style={{ minHeight: 400 }}>
                            {officeZone ? (
                                <CommuteMap
                                    officeZone={officeZone}
                                    neighborhoods={neighborhoods}
                                    transitStops={transitStops}
                                    activeNeighborhoodId={activeId}
                                    onSelectNeighborhood={handleSelectNeighborhood}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 400 }}>
                                    <div
                                        className="w-6 h-6 rounded-full border-2 animate-spin"
                                        style={{ borderColor: "#B99445", borderTopColor: "transparent" }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: Route cards (40%) ── */}
                    <div className="flex flex-col lg:w-[40%]" style={{ background: "#F7F9FB" }}>
                        <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
                            <p
                                className="text-[11px] font-semibold uppercase tracking-widest"
                                style={{ color: "#8A9AB0", fontFamily: "var(--font-ibm-sans)" }}
                            >
                                Neighbourhood Routes → {officeZone?.name ?? "Downtown"}
                            </p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                            {neighborhoods.map((n) => (
                                <RouteCard
                                    key={n.id}
                                    n={n}
                                    isActive={n.id === activeId}
                                    setRef={(el) => { cardRefs.current[n.id] = el; }}
                                    onClick={() => setActiveId(n.id)}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}

function RouteCard({
    n,
    isActive,
    setRef,
    onClick,
}: {
    n: Neighborhood;
    isActive: boolean;
    setRef: (el: HTMLDivElement | null) => void;
    onClick: () => void;
}) {
    const color = commuteColor(n.commuteMins);
    return (
        <div
            ref={setRef}
            onClick={onClick}
            className="rounded-lg p-4 cursor-pointer transition-all"
            style={{
                background: "#FFFFFF",
                border: isActive ? `2px solid ${color}` : "1px solid #E8EDF2",
                boxShadow: isActive ? `0 2px 12px ${color}22` : "0 1px 4px rgba(15,24,35,0.04)",
            }}
        >
            <div className="flex items-start justify-between mb-2.5">
                <div className="flex flex-col gap-1">
                    <p
                        className="text-[14px] font-semibold"
                        style={{ color: "#0F1823", fontFamily: "var(--font-ibm-sans)" }}
                    >
                        {n.name}
                    </p>
                    <PersonaTag persona={n.persona} />
                </div>
                <span
                    className="text-[15px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ml-3"
                    style={{
                        background: color + "18",
                        color,
                        fontFamily: "var(--font-ibm-mono)",
                    }}
                >
                    {n.commuteMins} min
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold"
                    style={{
                        background: "rgba(47,62,79,0.08)",
                        color: "#2F3E4F",
                        fontFamily: "var(--font-ibm-mono)",
                    }}
                >
                    <Car size={9} />
                    {n.commuteMins} min drive
                </span>
                {n.transitRoutes.slice(0, 2).map((r) => (
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
                <span
                    className="text-[10px] ml-auto"
                    style={{ color: "#8A9AB0", fontFamily: "var(--font-ibm-sans)" }}
                >
                    Walk {n.walkScore}/100
                </span>
            </div>
        </div>
    );
}
