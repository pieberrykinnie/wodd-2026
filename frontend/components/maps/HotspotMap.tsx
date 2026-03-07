"use client";

import { useState, useMemo } from "react";
import Map, { Marker, Popup, NavigationControl, Source, Layer } from "react-map-gl/mapbox";
import type { HeatmapLayer } from "mapbox-gl";
import { MAPBOX_TOKEN, MAPBOX_STYLE, WINNIPEG_CENTER } from "@/lib/mapConfig";
import { type ZoneSummary, type HeatmapDataResponse, type HeatmapPoint } from "@/lib/api";
import PersonaTag from "@/components/ui/PersonaTag";
import "mapbox-gl/dist/mapbox-gl.css";

type Category = "all" | "office" | "neighborhood" | "lifestyle";
type Signal = "composite" | "business" | "property" | "permits";

const CATEGORY_COLORS: Record<string, string> = {
    office: "#4C6E91",
    neighborhood: "#5E8C6A",
    lifestyle: "#C8A44D",
};

const CATEGORY_LABELS: Record<string, string> = {
    office: "Office Locations",
    neighborhood: "Neighbourhoods",
    lifestyle: "Lifestyle",
};

const SIGNAL_LABELS: Record<Signal, string> = {
    composite: "Overall Density",
    business: "Business Activity",
    property: "Property Value",
    permits: "Construction",
};

function signalWeight(p: HeatmapPoint, sig: Signal): number {
    if (sig === "composite") return p.weight;
    if (sig === "business") return p.business_count ?? 0;
    if (sig === "property") return p.property_value ?? 0;
    return p.permit_value ?? 0;
}

const HEATMAP_LAYER: HeatmapLayer = {
    id: "density-heat",
    type: "heatmap",
    paint: {
        "heatmap-weight": ["interpolate", ["linear"], ["get", "weight"], 0, 0, 1, 1],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 9, 0.6, 13, 1.8],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 9, 30, 13, 60],
        "heatmap-opacity": 0.78,
        "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(0,0,0,0)",
            0.2, "rgba(76,110,145,0.55)",
            0.5, "rgba(200,164,77,0.75)",
            0.8, "rgba(178,58,43,0.85)",
            1.0, "rgba(255,210,190,1)",
        ],
    },
};

export default function HotspotMap({
    zones,
    heatmapData,
    onSelectZone,
}: {
    zones?: ZoneSummary[];
    heatmapData?: HeatmapDataResponse | null;
    onSelectZone?: (id: string) => void;
}) {
    const [category, setCategory] = useState<Category>("all");
    const [signal, setSignal] = useState<Signal>("composite");
    const [zonePopup, setZonePopup] = useState<ZoneSummary | null>(null);
    const [hotspotPopup, setHotspotPopup] = useState<HeatmapPoint | null>(null);
    const [hotspotParentZone, setHotspotParentZone] = useState<ZoneSummary | null>(null);
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    const visibleZones = useMemo(() => {
        if (!zones?.length) return [];
        return category === "all" ? zones : zones.filter((z) => z.category === category);
    }, [zones, category]);

    const heatmapGeoJSON = useMemo(() => {
        if (!heatmapData?.points.length) return null;
        return {
            type: "FeatureCollection" as const,
            features: heatmapData.points.map((p) => ({
                type: "Feature" as const,
                geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
                properties: {
                    weight:
                        signal === "composite" ? p.weight
                            : signal === "business" ? (p.business_count ?? 0)
                                : signal === "property" ? (p.property_value ?? 0)
                                    : (p.permit_value ?? 0),
                },
            })),
        };
    }, [heatmapData, signal]);

    const categoryCounts = useMemo(() => {
        if (!zones?.length) return {} as Record<string, number>;
        return zones.reduce((acc, z) => {
            acc[z.category] = (acc[z.category] ?? 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [zones]);

    // Map each heatmap point name (uppercase) → its parent zone
    const pointToZone = useMemo(() => {
        const map: Record<string, ZoneSummary> = {};
        for (const z of zones ?? []) {
            for (const n of z.neighbourhood_names ?? []) {
                map[n.toUpperCase()] = z;
            }
        }
        return map;
    }, [zones]);

    // For a zone popup: the heatmap points that belong to it
    const zonePoints = useMemo(() => {
        if (!zonePopup || !heatmapData) return [];
        const names = new Set((zonePopup.neighbourhood_names ?? []).map((n) => n.toUpperCase()));
        return heatmapData.points.filter((p) => names.has(p.name.toUpperCase()));
    }, [zonePopup, heatmapData]);

    return (
        <div className="relative w-full h-full rounded overflow-hidden">
            {/* Category filter bar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                {(["all", "office", "neighborhood", "lifestyle"] as Category[]).map((c) => {
                    const count = c === "all" ? (zones?.length ?? 0) : (categoryCounts[c] ?? 0);
                    return (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className="px-3 py-1.5 rounded text-xs font-semibold transition-all border flex items-center gap-1.5"
                            style={{
                                fontFamily: "var(--font-ibm-sans)",
                                background: category === c ? (c === "all" ? "#4C6E91" : CATEGORY_COLORS[c]) : "#F1F4F7",
                                color: category === c ? "#fff" : "#64748B",
                                borderColor: category === c ? (c === "all" ? "#4C6E91" : CATEGORY_COLORS[c]) : "rgba(0,0,0,0.12)",
                            }}
                        >
                            {c === "all" ? "All Zones" : CATEGORY_LABELS[c]}
                            <span className="opacity-60 text-[10px]">({count})</span>
                        </button>
                    );
                })}
            </div>

            <Map
                initialViewState={{ longitude: WINNIPEG_CENTER[0], latitude: WINNIPEG_CENTER[1], zoom: 11.5 }}
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle={MAPBOX_STYLE}
                style={{ width: "100%", height: "100%" }}
                attributionControl={false}
                onLoad={() => setMapLoaded(true)}
            >
                <NavigationControl position="top-right" showCompass={false} />

                {/* Density heatmap layer */}
                {mapLoaded && heatmapGeoJSON && (
                    <Source id="heatmap-source" type="geojson" data={heatmapGeoJSON}>
                        <Layer {...HEATMAP_LAYER} />
                    </Source>
                )}

                {/* Neighbourhood hotspot markers — sized + colored by current signal */}
                {mapLoaded && heatmapData?.points.map((pt) => {
                    const w = signalWeight(pt, signal);
                    const size = 5 + Math.round(w * 11);
                    const color = w < 0.25 ? "#4C6E91" : w < 0.55 ? "#C8A44D" : "#B23A2B";
                    const parentZone = pointToZone[pt.name.toUpperCase()];
                    const isInSelectedZone = parentZone?.id === selectedZoneId;
                    return (
                        <Marker
                            key={`heat-${pt.name}`}
                            longitude={pt.lng}
                            latitude={pt.lat}
                            anchor="center"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                setHotspotPopup(pt);
                                setHotspotParentZone(parentZone ?? null);
                                setZonePopup(null);
                            }}
                        >
                            <div
                                className="cursor-pointer shadow-md transition-transform hover:scale-150"
                                style={{
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    background: color,
                                    opacity: 0.35 + w * 0.65,
                                    transform: "rotate(45deg)",
                                    borderRadius: "2px",
                                    outline: isInSelectedZone ? `2px solid white` : `1px solid rgba(255,255,255,0.5)`,
                                    outlineOffset: "1px",
                                }}
                                title={pt.name}
                            />
                        </Marker>
                    );
                })}

                {/* Zone markers */}
                {mapLoaded && visibleZones.map((zone) => {
                    const color = CATEGORY_COLORS[zone.category] ?? "#4C6E91";
                    const isSelected = selectedZoneId === zone.id;
                    return (
                        <Marker
                            key={zone.id}
                            longitude={zone.lng}
                            latitude={zone.lat}
                            anchor="bottom"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                setZonePopup(zone);
                                setSelectedZoneId(zone.id);
                                onSelectZone?.(zone.id);
                            }}
                        >
                            <div className="relative cursor-pointer group">
                                <span
                                    className="absolute -inset-2 rounded-full animate-ping opacity-30"
                                    style={{ background: color, animationDuration: "2.5s" }}
                                />
                                <div
                                    className="relative rounded-full border-2 border-white shadow-xl transition-transform group-hover:scale-125"
                                    style={{
                                        background: color,
                                        width: isSelected ? "22px" : "18px",
                                        height: isSelected ? "22px" : "18px",
                                        boxShadow: isSelected ? `0 0 0 3px ${color}55` : undefined,
                                    }}
                                />
                                <div
                                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ color, fontFamily: "var(--font-ibm-sans)" }}
                                >
                                    {zone.name}
                                </div>
                            </div>
                        </Marker>
                    );
                })}

                {mapLoaded && zonePopup && (
                    <Popup
                        longitude={zonePopup.lng}
                        latitude={zonePopup.lat}
                        anchor="top"
                        closeOnClick
                        onClose={() => setZonePopup(null)}
                        maxWidth="300px"
                    >
                        <ZonePopup zone={zonePopup} zonePoints={zonePoints} signal={signal} />
                    </Popup>
                )}

                {mapLoaded && hotspotPopup && (
                    <Popup
                        longitude={hotspotPopup.lng}
                        latitude={hotspotPopup.lat}
                        anchor="top"
                        closeOnClick
                        onClose={() => { setHotspotPopup(null); setHotspotParentZone(null); }}
                        maxWidth="260px"
                    >
                        <NeighbourhoodPopup
                            point={hotspotPopup}
                            signal={signal}
                            parentZone={hotspotParentZone}
                            onSelectZone={(z) => {
                                setSelectedZoneId(z.id);
                                onSelectZone?.(z.id);
                                setHotspotPopup(null);
                                setHotspotParentZone(null);
                            }}
                        />
                    </Popup>
                )}
            </Map>

            {/* Bottom-left: signal selector + legend */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                {/* Signal selector */}
                <div className="bg-white/95 backdrop-blur rounded p-2.5 border border-black/10 shadow">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                        Density Signal
                    </p>
                    <div className="flex flex-col gap-0.5">
                        {(["composite", "business", "property", "permits"] as Signal[]).map((s) => (
                            <button
                                key={s}
                                onClick={() => setSignal(s)}
                                className="flex items-center gap-2 px-2 py-1 rounded text-[11px] font-medium transition-all text-left"
                                style={{
                                    fontFamily: "var(--font-ibm-sans)",
                                    background: signal === s ? "#4C6E91" : "transparent",
                                    color: signal === s ? "#fff" : "#64748B",
                                }}
                            >
                                {SIGNAL_LABELS[s]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Zone type legend */}
                <div className="bg-white/95 backdrop-blur rounded p-2.5 border border-black/10 shadow">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5" style={{ fontFamily: "var(--font-ibm-sans)" }}>Zone Types</p>
                    {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                        <div key={cat} className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                            <span className="text-[11px] text-slate-600" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                {CATEGORY_LABELS[cat]}
                            </span>
                        </div>
                    ))}
                    <div className="mt-1.5 pt-1.5 border-t border-black/10">
                        <p className="text-[10px] text-slate-400" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                            {heatmapData ? `${heatmapData.points.length} neighbourhoods` : "Loading density…"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Selected zone badge */}
            {selectedZoneId && (
                <div className="absolute bottom-4 right-4 bg-exchange-brick/90 backdrop-blur rounded px-3 py-2 border border-exchange-brick/40">
                    <p className="text-[11px] text-white font-semibold" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                        Zone selected for analysis
                    </p>
                </div>
            )}
        </div>
    );
}

function ZonePopup({ zone, zonePoints, signal }: { zone: ZoneSummary; zonePoints: HeatmapPoint[]; signal: Signal }) {
    const color = CATEGORY_COLORS[zone.category] ?? "#4C6E91";

    const rows: { label: string; value: string; rowColor: string }[] = [];
    if (zone.category === "office" && zone.office_vibe)
        rows.push({ label: "Vibe", value: zone.office_vibe, rowColor: color });
    if (zone.active_business_count != null)
        rows.push({ label: zone.category === "office" ? "Active Businesses" : "Businesses nearby", value: zone.active_business_count.toLocaleString(), rowColor: "#49575E" });
    if (zone.avg_property_value != null)
        rows.push({ label: "Avg Property Value", value: `$${(zone.avg_property_value / 1000).toFixed(0)}K`, rowColor: "#4C6E91" });
    if (zone.recent_construction_value != null && zone.recent_construction_value > 0)
        rows.push({ label: "Recent Construction", value: `$${(zone.recent_construction_value / 1_000_000).toFixed(1)}M`, rowColor: "#C8A44D" });

    // Aggregated signal bars from constituent neighbourhood points
    const aggBusiness = zonePoints.length ? zonePoints.reduce((s, p) => s + (p.business_count ?? 0), 0) / zonePoints.length : null;
    const aggProperty = zonePoints.length ? zonePoints.reduce((s, p) => s + (p.property_value ?? 0), 0) / zonePoints.length : null;
    const aggPermit = zonePoints.length ? zonePoints.reduce((s, p) => s + (p.permit_value ?? 0), 0) / zonePoints.length : null;

    return (
        <div style={{ fontFamily: "var(--font-ibm-sans)" }}>
            <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-frost-white text-sm leading-snug">{zone.name}</p>
                <PersonaTag persona={zone.persona_label ?? zone.persona} />
            </div>
            <p className="text-[12px] text-concrete-gray mb-3 leading-snug">{zone.description}</p>
            {rows.length > 0 && (
                <div className="space-y-1 text-[12px] mb-3">
                    {rows.map((r) => <Row key={r.label} label={r.label} value={r.value} color={r.rowColor} />)}
                </div>
            )}
            {zonePoints.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Neighbourhood Density Signals</p>
                    <div className="space-y-1.5">
                        <SignalRow label="Business Activity" value={aggBusiness ?? 0} color="#4C6E91" active={signal === "business" || signal === "composite"} />
                        <SignalRow label="Property Value" value={aggProperty ?? 0} color="#C8A44D" active={signal === "property" || signal === "composite"} />
                        <SignalRow label="Construction" value={aggPermit ?? 0} color="#B23A2B" active={signal === "permits" || signal === "composite"} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">avg across {zonePoints.length} neighbourhood{zonePoints.length > 1 ? "s" : ""}</p>
                </div>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
                {zone.highlights.slice(0, 3).map((h) => (
                    <span key={h} className="text-[10px] px-2 py-0.5 rounded bg-white/8 text-concrete-gray">{h}</span>
                ))}
            </div>
            <p className="text-[10px] text-exchange-brick font-medium mt-2">Click marker to select for analysis →</p>
        </div>
    );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="flex justify-between gap-6">
            <span className="text-concrete-gray">{label}</span>
            <span style={{ fontFamily: "var(--font-ibm-mono)", color }}>{value}</span>
        </div>
    );
}

function NeighbourhoodPopup({ point, signal, parentZone, onSelectZone }: {
    point: HeatmapPoint;
    signal: Signal;
    parentZone: ZoneSummary | null;
    onSelectZone: (z: ZoneSummary) => void;
}) {
    const w = signalWeight(point, signal);
    const barColor = w < 0.25 ? "#4C6E91" : w < 0.55 ? "#C8A44D" : "#B23A2B";
    return (
        <div style={{ fontFamily: "var(--font-ibm-sans)" }}>
            <p className="font-semibold text-frost-white text-sm mb-2 leading-snug">{point.name}</p>
            {parentZone && (
                <p className="text-[11px] text-concrete-gray mb-2">
                    Part of <span style={{ color: CATEGORY_COLORS[parentZone.category] }}>{parentZone.name}</span> zone
                </p>
            )}
            <div className="space-y-1.5 text-[12px] mb-3">
                <SignalRow label="Business Activity" value={point.business_count ?? 0} color="#4C6E91" active={signal === "business" || signal === "composite"} />
                <SignalRow label="Property Value" value={point.property_value ?? 0} color="#C8A44D" active={signal === "property" || signal === "composite"} />
                <SignalRow label="Construction" value={point.permit_value ?? 0} color="#B23A2B" active={signal === "permits" || signal === "composite"} />
            </div>
            <div className="rounded overflow-hidden h-1.5 bg-black/10 w-full">
                <div className="h-full rounded transition-all" style={{ width: `${Math.round(w * 100)}%`, background: barColor }} />
            </div>
            <p className="text-[10px] text-concrete-gray mt-1 mb-3">
                {SIGNAL_LABELS[signal]}: <span style={{ color: barColor, fontFamily: "var(--font-ibm-mono)" }}>{Math.round(w * 100)}</span>/100
            </p>
            {parentZone && (
                <button
                    onClick={() => onSelectZone(parentZone)}
                    className="w-full text-[11px] font-semibold px-3 py-1.5 rounded transition-all"
                    style={{ background: CATEGORY_COLORS[parentZone.category], color: "#fff", fontFamily: "var(--font-ibm-sans)" }}
                >
                    → Select {parentZone.name} for analysis
                </button>
            )}
        </div>
    );
}

function SignalRow({ label, value, color, active }: { label: string; value: number; color: string; active: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 flex-shrink-0">
                <div className="h-1 rounded bg-black/10 overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${Math.round(value * 100)}%`, background: active ? color : "#94a3b8" }} />
                </div>
            </div>
            <span className="text-concrete-gray flex-1">{label}</span>
            <span style={{ fontFamily: "var(--font-ibm-mono)", color: active ? color : "#94a3b8", fontSize: "11px" }}>
                {Math.round(value * 100)}
            </span>
        </div>
    );
}

