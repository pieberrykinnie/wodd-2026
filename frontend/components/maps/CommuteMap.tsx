"use client";

import { useState, useMemo } from "react";
import Map, { Marker, Popup, NavigationControl, Source, Layer } from "react-map-gl/mapbox";
import type { LineLayer } from "mapbox-gl";
import { MAPBOX_TOKEN, MAPBOX_STYLE, WINNIPEG_CENTER } from "@/lib/mapConfig";
import type { Neighborhood } from "@/lib/api";
import { Car, Train } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

export interface TransitStop {
    stop_number: string;
    name: string;
    distance_m: number;
    routes: string[];
    lat?: number;
    lng?: number;
}

export interface OfficeZone {
    id: string;
    name: string;
    lat: number;
    lng: number;
}

function commuteColor(mins: number): string {
    if (mins <= 15) return "#5E8C6A";
    if (mins <= 25) return "#B99445";
    return "#B23A2B";
}

export default function CommuteMap({
    officeZone,
    neighborhoods,
    transitStops,
    activeNeighborhoodId,
    onSelectNeighborhood,
}: {
    officeZone: OfficeZone;
    neighborhoods: Neighborhood[];
    transitStops: TransitStop[];
    activeNeighborhoodId: string | null;
    onSelectNeighborhood: (id: string) => void;
}) {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [popupN, setPopupN] = useState<Neighborhood | null>(null);
    const [stopPopup, setStopPopup] = useState<TransitStop | null>(null);

    const routesGeoJSON = useMemo(() => ({
        type: "FeatureCollection" as const,
        features: neighborhoods.map((n) => ({
            type: "Feature" as const,
            geometry: {
                type: "LineString" as const,
                // coords is [lng, lat] per neighborhoods.json
                coordinates: [
                    [n.coords[0], n.coords[1]],
                    [officeZone.lng, officeZone.lat],
                ],
            },
            properties: {
                id: n.id,
                color: commuteColor(n.commuteMins),
                isActive: n.id === activeNeighborhoodId,
            },
        })),
    }), [neighborhoods, officeZone, activeNeighborhoodId]);

    const glowLayer: LineLayer = {
        id: "commute-lines-glow",
        type: "line",
        filter: ["==", ["get", "isActive"], true],
        paint: {
            "line-color": ["get", "color"],
            "line-width": 10,
            "line-opacity": 0.12,
            "line-blur": 4,
        },
    };

    const lineLayer: LineLayer = {
        id: "commute-lines",
        type: "line",
        paint: {
            "line-color": ["get", "color"],
            "line-width": ["case", ["==", ["get", "isActive"], true], 3, 1.5],
            "line-opacity": ["case", ["==", ["get", "isActive"], true], 0.9, 0.4],
            "line-dasharray": [3, 2],
        },
    };

    const stopsWithCoords = transitStops.filter((s) => s.lat != null && s.lng != null);

    return (
        <div className="relative w-full h-full rounded overflow-hidden">
            <Map
                initialViewState={{
                    longitude: WINNIPEG_CENTER[0],
                    latitude: WINNIPEG_CENTER[1] - 0.015,
                    zoom: 11.2,
                }}
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle={MAPBOX_STYLE}
                style={{ width: "100%", height: "100%" }}
                attributionControl={false}
                onLoad={() => setMapLoaded(true)}
            >
                <NavigationControl position="top-right" showCompass={false} />

                {/* Dashed route lines */}
                {mapLoaded && (
                    <Source id="commute-routes" type="geojson" data={routesGeoJSON}>
                        <Layer {...glowLayer} />
                        <Layer {...lineLayer} />
                    </Source>
                )}

                {/* Neighborhood origin markers */}
                {mapLoaded && neighborhoods.map((n) => {
                    const color = commuteColor(n.commuteMins);
                    const isActive = n.id === activeNeighborhoodId;
                    return (
                        <Marker
                            key={n.id}
                            longitude={n.coords[0]}
                            latitude={n.coords[1]}
                            anchor="center"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                onSelectNeighborhood(n.id);
                                setPopupN(n);
                                setStopPopup(null);
                            }}
                        >
                            <div className="relative cursor-pointer group">
                                {isActive && (
                                    <span
                                        className="absolute -inset-2 rounded-full animate-ping opacity-30"
                                        style={{ background: color, animationDuration: "2.5s" }}
                                    />
                                )}
                                <div
                                    className="relative rounded-full border-2 border-white shadow-xl transition-transform group-hover:scale-125"
                                    style={{
                                        background: color,
                                        width: isActive ? "20px" : "14px",
                                        height: isActive ? "20px" : "14px",
                                        boxShadow: isActive ? `0 0 0 3px ${color}44` : undefined,
                                    }}
                                />
                            </div>
                        </Marker>
                    );
                })}

                {/* Office destination marker */}
                {mapLoaded && (
                    <Marker longitude={officeZone.lng} latitude={officeZone.lat} anchor="bottom">
                        <div className="flex flex-col items-center gap-0.5">
                            <div
                                className="w-7 h-7 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-sm"
                                style={{ background: "#B99445" }}
                            >
                                🏢
                            </div>
                            <div
                                className="px-2 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow"
                                style={{ background: "#B99445", fontFamily: "var(--font-ibm-mono)" }}
                            >
                                {officeZone.name}
                            </div>
                        </div>
                    </Marker>
                )}

                {/* Live transit stop markers */}
                {mapLoaded && stopsWithCoords.map((stop, i) => (
                    <Marker
                        key={`stop-${stop.stop_number}-${i}`}
                        longitude={stop.lng!}
                        latitude={stop.lat!}
                        anchor="center"
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            setStopPopup(stop);
                            setPopupN(null);
                        }}
                    >
                        <div
                            className="cursor-pointer rounded-full border border-white shadow transition-transform hover:scale-125"
                            style={{ width: "9px", height: "9px", background: "#4C9E9E" }}
                            title={stop.name}
                        />
                    </Marker>
                ))}

                {/* Neighborhood popup */}
                {popupN && (
                    <Popup
                        longitude={popupN.coords[0]}
                        latitude={popupN.coords[1]}
                        anchor="top"
                        closeOnClick
                        onClose={() => setPopupN(null)}
                        maxWidth="240px"
                    >
                        <div style={{ fontFamily: "var(--font-ibm-sans)", padding: "4px 2px" }}>
                            <p className="font-semibold text-sm text-slate-800 mb-1.5">{popupN.name}</p>
                            <div className="flex flex-wrap gap-1.5 mb-1.5">
                                <span
                                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded"
                                    style={{
                                        background: commuteColor(popupN.commuteMins) + "22",
                                        color: commuteColor(popupN.commuteMins),
                                    }}
                                >
                                    <Car size={9} />
                                    {popupN.commuteMins} min
                                </span>
                                <span className="text-[11px] text-slate-500 self-center">
                                    Walk {popupN.walkScore}/100
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {popupN.transitRoutes.map((r) => (
                                    <span
                                        key={r}
                                        className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
                                        style={{ background: "rgba(94,140,106,0.12)", color: "#5E8C6A" }}
                                    >
                                        <Train size={8} />
                                        Route {r}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Popup>
                )}

                {/* Transit stop popup */}
                {stopPopup && stopPopup.lng != null && stopPopup.lat != null && (
                    <Popup
                        longitude={stopPopup.lng}
                        latitude={stopPopup.lat}
                        anchor="top"
                        closeOnClick
                        onClose={() => setStopPopup(null)}
                        maxWidth="220px"
                    >
                        <div style={{ fontFamily: "var(--font-ibm-sans)", padding: "4px 2px" }}>
                            <p className="font-semibold text-xs text-slate-800 mb-0.5">{stopPopup.name}</p>
                            <p className="text-[11px] text-slate-500 mb-1.5">
                                Stop #{stopPopup.stop_number} · {Math.round(stopPopup.distance_m)}m away
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {stopPopup.routes.map((r) => (
                                    <span
                                        key={r}
                                        className="text-[10px] px-1.5 py-0.5 rounded"
                                        style={{ background: "rgba(76,158,158,0.12)", color: "#4C9E9E" }}
                                    >
                                        Route {r}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>

            {/* Bottom-left legend */}
            <div
                className="absolute bottom-4 left-4 rounded-lg p-3 border border-black/10 shadow"
                style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", fontFamily: "var(--font-ibm-sans)" }}
            >
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Drive Time
                </p>
                {[
                    { label: "≤ 15 min", color: "#5E8C6A" },
                    { label: "16–25 min", color: "#B99445" },
                    { label: "> 25 min", color: "#B23A2B" },
                ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-2 mb-1">
                        <div style={{ width: "16px", borderTop: `2px dashed ${color}` }} />
                        <span className="text-[11px] text-slate-600">{label}</span>
                    </div>
                ))}
                {stopsWithCoords.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-black/10">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "#4C9E9E" }} />
                        <span className="text-[11px] text-slate-500">{stopsWithCoords.length} transit stops</span>
                    </div>
                )}
            </div>
        </div>
    );
}
