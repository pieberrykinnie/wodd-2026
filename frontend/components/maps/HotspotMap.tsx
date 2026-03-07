"use client";

import { useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import { MAPBOX_TOKEN, MAPBOX_STYLE, WINNIPEG_CENTER } from "@/lib/mapConfig";
import { getHotspots, type OfficeHotspot, type NeighborhoodHotspot, type LifestyleHotspot } from "@/lib/api";
import PersonaTag from "@/components/ui/PersonaTag";
import "mapbox-gl/dist/mapbox-gl.css";

type Category = "all" | "office" | "neighborhood" | "lifestyle";

type AnyHotspot = (OfficeHotspot | NeighborhoodHotspot | LifestyleHotspot) & {
    _category: "office" | "neighborhood" | "lifestyle";
};

const CATEGORY_COLORS: Record<string, string> = {
    office: "#B23A2B",
    neighborhood: "#C8A44D",
    lifestyle: "#4C6E91",
};

const CATEGORY_LABELS: Record<string, string> = {
    office: "Office Locations",
    neighborhood: "Neighbourhoods",
    lifestyle: "Lifestyle",
};

export default function HotspotMap() {
    const [category, setCategory] = useState<Category>("all");
    const [popup, setPopup] = useState<AnyHotspot | null>(null);
    const hotspots = getHotspots();

    const all: AnyHotspot[] = [
        ...hotspots.office.map((h) => ({ ...h, _category: "office" as const })),
        ...hotspots.neighborhood.map((h) => ({ ...h, _category: "neighborhood" as const })),
        ...hotspots.lifestyle.map((h) => ({ ...h, _category: "lifestyle" as const })),
    ];

    const visible =
        category === "all" ? all : all.filter((h) => h._category === category);

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden">
            {/* Filter bar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                {(["all", "office", "neighborhood", "lifestyle"] as Category[]).map((c) => (
                    <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
                        style={{
                            fontFamily: "var(--font-ibm-sans)",
                            background:
                                category === c
                                    ? c === "all"
                                        ? "#B23A2B"
                                        : CATEGORY_COLORS[c]
                                    : "rgba(28,42,57,0.9)",
                            color: category === c ? "#fff" : "#8B98A5",
                            borderColor: category === c
                                ? c === "all" ? "#B23A2B" : CATEGORY_COLORS[c]
                                : "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(8px)",
                        }}
                    >
                        {c === "all" ? "All Hotspots" : CATEGORY_LABELS[c]}
                    </button>
                ))}
            </div>

            <Map
                initialViewState={{
                    longitude: WINNIPEG_CENTER[0],
                    latitude: WINNIPEG_CENTER[1],
                    zoom: 11.5,
                }}
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle={MAPBOX_STYLE}
                style={{ width: "100%", height: "100%" }}
                attributionControl={false}
            >
                <NavigationControl position="top-right" showCompass={false} />

                {visible.map((spot) => {
                    const color = CATEGORY_COLORS[spot._category];
                    return (
                        <Marker
                            key={spot.id}
                            longitude={spot.lng}
                            latitude={spot.lat}
                            anchor="bottom"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                setPopup(spot);
                            }}
                        >
                            <div className="relative cursor-pointer group">
                                {/* Pulse ring */}
                                <span
                                    className="absolute -inset-2 rounded-full animate-ping opacity-30"
                                    style={{ background: color, animationDuration: "2.5s" }}
                                />
                                {/* Marker */}
                                <div
                                    className="relative w-5 h-5 rounded-full border-2 border-white shadow-xl transition-transform group-hover:scale-125"
                                    style={{ background: color }}
                                />
                                {/* Label */}
                                <div
                                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ color, fontFamily: "var(--font-ibm-sans)" }}
                                >
                                    {spot.name}
                                </div>
                            </div>
                        </Marker>
                    );
                })}

                {popup && (
                    <Popup
                        longitude={popup.lng}
                        latitude={popup.lat}
                        anchor="top"
                        closeOnClick
                        onClose={() => setPopup(null)}
                        maxWidth="260px"
                    >
                        <HotspotPopup spot={popup} />
                    </Popup>
                )}
            </Map>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 bg-prairie-blue/90 backdrop-blur rounded-xl p-3 border border-white/10">
                {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                    <div key={cat} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                        <span
                            className="text-[11px] text-frost-white/80"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            {CATEGORY_LABELS[cat]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HotspotPopup({ spot }: { spot: AnyHotspot }) {
    return (
        <div style={{ fontFamily: "var(--font-ibm-sans)" }}>
            <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-frost-white text-sm">{spot.name}</p>
                <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                        background: CATEGORY_COLORS[spot._category] + "25",
                        color: CATEGORY_COLORS[spot._category],
                    }}
                >
                    {spot._category}
                </span>
            </div>
            <p className="text-[12px] text-concrete-gray mb-3 leading-snug">{spot.description}</p>

            {spot._category === "office" && (
                <div className="space-y-1 text-[12px]">
                    <Row label="Office Rent" value={`$${(spot as OfficeHotspot).officeRent}/sqft/mo`} color="#C8A44D" />
                    <Row label="Vacancy" value={(spot as OfficeHotspot).vacancyRate} color="#5E8C6A" />
                    <Row label="Transit Score" value={`${(spot as OfficeHotspot).transitScore}/100`} color="#4C6E91" />
                </div>
            )}

            {spot._category === "neighborhood" && (
                <div className="space-y-1 text-[12px]">
                    <Row label="Avg Home" value={`$${((spot as NeighborhoodHotspot).avgHomePrice / 1000).toFixed(0)}K`} color="#C8A44D" />
                    <Row label="2BR Rent" value={`$${(spot as NeighborhoodHotspot).avgRent2br}/mo`} color="#C8A44D" />
                    <Row label="Commute" value={`${(spot as NeighborhoodHotspot).commuteToCore} min`} color="#5E8C6A" />
                </div>
            )}

            {spot._category === "lifestyle" && (
                <div className="space-y-1 text-[12px]">
                    <Row label="Type" value={(spot as LifestyleHotspot).type} color="#4C6E91" />
                    <Row label="Visitors/yr" value={(spot as LifestyleHotspot).visitorsPerYear} color="#C8A44D" />
                </div>
            )}

            <div className="mt-3 flex flex-wrap gap-1">
                {spot.highlights.slice(0, 2).map((h) => (
                    <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-concrete-gray">
                        {h}
                    </span>
                ))}
            </div>
        </div>
    );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="flex justify-between gap-4">
            <span className="text-concrete-gray">{label}</span>
            <span style={{ fontFamily: "var(--font-ibm-mono)", color }}>{value}</span>
        </div>
    );
}
