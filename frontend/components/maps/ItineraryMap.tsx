"use client";

import { useState, useMemo } from "react";
import Map, { Marker, Popup, NavigationControl, Source, Layer } from "react-map-gl/mapbox";
import type { LineLayer } from "mapbox-gl";
import { MAPBOX_TOKEN, MAPBOX_STYLE, WINNIPEG_CENTER } from "@/lib/mapConfig";
import "mapbox-gl/dist/mapbox-gl.css";

interface ItineraryStop {
    id: string;
    day: 1 | 2;
    order: number;
    label: string;
    note: string;
    lat: number;
    lng: number;
}

const STOPS: ItineraryStop[] = [
    // Day 1 — amber
    {
        id: "hotel",
        day: 1,
        order: 1,
        label: "Exchange District Hotel",
        note: "Fort Garry Hotel (built 1913) or Alt Hotel — from $189/night",
        lat: 49.8921,
        lng: -97.1372,
    },
    {
        id: "wellington",
        day: 1,
        order: 2,
        label: "529 Wellington",
        note: "Winnipeg's premier steakhouse. Manitoba beef, heritage dining room. $80–$120/pp",
        lat: 49.8889,
        lng: -97.1447,
    },
    {
        id: "forks",
        day: 1,
        order: 3,
        label: "The Forks",
        note: "National Historic Site at the river confluence. River Walk, Market Hall.",
        lat: 49.8882,
        lng: -97.1313,
    },
    // Day 2 — green
    {
        id: "assiniboine",
        day: 2,
        order: 1,
        label: "Assiniboine Park",
        note: "400+ acre urban park. Zoo, conservatory, Leo Mol Sculpture Garden.",
        lat: 49.8771,
        lng: -97.2148,
    },
    {
        id: "neighbourhood",
        day: 2,
        order: 2,
        label: "Neighbourhood Tour",
        note: "River Heights · Tuxedo · Osborne Village · The Exchange",
        lat: 49.8805,
        lng: -97.1550,
    },
    {
        id: "cmhr",
        day: 2,
        order: 3,
        label: "Canadian Museum for Human Rights",
        note: "World's first museum dedicated to human rights. The Forks precinct.",
        lat: 49.8894,
        lng: -97.1317,
    },
];

const DAY_COLORS: Record<number, string> = {
    1: "#B99445",
    2: "#5E8C6A",
};

const DAY1_LINE_LAYER: LineLayer = {
    id: "day1-route",
    type: "line",
    paint: {
        "line-color": "#B99445",
        "line-width": 2,
        "line-dasharray": [3, 2],
        "line-opacity": 0.7,
    },
};

const DAY2_LINE_LAYER: LineLayer = {
    id: "day2-route",
    type: "line",
    paint: {
        "line-color": "#5E8C6A",
        "line-width": 2,
        "line-dasharray": [3, 2],
        "line-opacity": 0.7,
    },
};

function makeLineGeoJSON(stops: ItineraryStop[]) {
    return {
        type: "FeatureCollection" as const,
        features: [
            {
                type: "Feature" as const,
                geometry: {
                    type: "LineString" as const,
                    coordinates: stops.map((s) => [s.lng, s.lat]),
                },
                properties: {},
            },
        ],
    };
}

export default function ItineraryMap() {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [popup, setPopup] = useState<ItineraryStop | null>(null);

    const day1Stops = useMemo(() => STOPS.filter((s) => s.day === 1).sort((a, b) => a.order - b.order), []);
    const day2Stops = useMemo(() => STOPS.filter((s) => s.day === 2).sort((a, b) => a.order - b.order), []);

    const day1Line = useMemo(() => makeLineGeoJSON(day1Stops), [day1Stops]);
    const day2Line = useMemo(() => makeLineGeoJSON(day2Stops), [day2Stops]);

    return (
        <div className="relative w-full h-full rounded overflow-hidden">
            <Map
                initialViewState={{
                    longitude: WINNIPEG_CENTER[0],
                    latitude: WINNIPEG_CENTER[1],
                    zoom: 12.5,
                }}
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle={MAPBOX_STYLE}
                style={{ width: "100%", height: "100%" }}
                attributionControl={false}
                onLoad={() => setMapLoaded(true)}
            >
                <NavigationControl position="top-right" showCompass={false} />

                {/* Route lines */}
                {mapLoaded && (
                    <>
                        <Source id="day1-line" type="geojson" data={day1Line}>
                            <Layer {...DAY1_LINE_LAYER} />
                        </Source>
                        <Source id="day2-line" type="geojson" data={day2Line}>
                            <Layer {...DAY2_LINE_LAYER} />
                        </Source>
                    </>
                )}

                {/* Stop markers */}
                {mapLoaded && STOPS.map((stop) => {
                    const color = DAY_COLORS[stop.day];
                    return (
                        <Marker
                            key={stop.id}
                            longitude={stop.lng}
                            latitude={stop.lat}
                            anchor="center"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                setPopup(popup?.id === stop.id ? null : stop);
                            }}
                        >
                            <div
                                className="cursor-pointer flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110 select-none"
                                style={{
                                    width: 30,
                                    height: 30,
                                    background: color,
                                    fontFamily: "var(--font-ibm-mono)",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#FFFFFF",
                                }}
                                title={stop.label}
                            >
                                {stop.order}
                            </div>
                        </Marker>
                    );
                })}

                {/* Popup */}
                {mapLoaded && popup && (
                    <Popup
                        longitude={popup.lng}
                        latitude={popup.lat}
                        anchor="bottom"
                        offset={20}
                        closeOnClick={false}
                        onClose={() => setPopup(null)}
                        maxWidth="260px"
                    >
                        <div style={{ fontFamily: "var(--font-ibm-sans)" }}>
                            <p
                                className="text-[10px] font-bold uppercase tracking-widest mb-1"
                                style={{ color: DAY_COLORS[popup.day] }}
                            >
                                Day {popup.day} · Stop {popup.order}
                            </p>
                            <p className="text-[13px] font-semibold text-frost-white leading-snug mb-1">
                                {popup.label}
                            </p>
                            <p className="text-[11px] text-concrete-gray leading-relaxed">
                                {popup.note}
                            </p>
                        </div>
                    </Popup>
                )}
            </Map>

            {/* Map legend */}
            <div
                className="absolute bottom-4 right-4 rounded-lg px-3 py-2.5 flex flex-col gap-1.5 shadow"
                style={{ background: "rgba(255,255,255,0.95)", border: "1px solid #E8EDF2" }}
            >
                {[1, 2].map((day) => (
                    <div key={day} className="flex items-center gap-2">
                        <div
                            className="w-4 h-0.5 rounded-full"
                            style={{ background: DAY_COLORS[day], opacity: 0.8 }}
                        />
                        <span
                            className="text-[10px] font-semibold uppercase tracking-wider"
                            style={{ color: DAY_COLORS[day], fontFamily: "var(--font-ibm-mono)" }}
                        >
                            Day {day}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
