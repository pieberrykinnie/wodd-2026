"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import { MAPBOX_TOKEN, MAPBOX_STYLE, CITY_COORDS } from "@/lib/mapConfig";
import { getCities, type City } from "@/lib/api";
import "mapbox-gl/dist/mapbox-gl.css";

interface CanadaMapProps {
    activeCity?: string;
    flyToCoords?: [number, number];
}

const CITIES_TO_SHOW = ["toronto", "vancouver", "montreal", "calgary", "ottawa", "winnipeg"];

export default function CanadaMap({ activeCity = "toronto", flyToCoords }: CanadaMapProps) {
    const cities = getCities();
    const [mapLoaded, setMapLoaded] = useState(false);
    const [popup, setPopup] = useState<City | null>(null);
    const [viewState, setViewState] = useState({
        longitude: -95,
        latitude: 55,
        zoom: 3.2,
    });

    // Fly to custom coords (geocoded) or fall back to known city
    useEffect(() => {
        if (flyToCoords) {
            setViewState((v) => ({
                ...v,
                longitude: flyToCoords[0],
                latitude: flyToCoords[1],
                zoom: 8,
            }));
            return;
        }
        const coords = CITY_COORDS[activeCity];
        if (coords) {
            setViewState((v) => ({
                ...v,
                longitude: coords[0],
                latitude: coords[1],
                zoom: 6,
            }));
        }
    }, [activeCity, flyToCoords]);

    return (
        <div className="relative w-full h-full rounded overflow-hidden">
            <Map
                {...viewState}
                onMove={(e) => setViewState(e.viewState)}
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle={MAPBOX_STYLE}
                style={{ width: "100%", height: "100%" }}
                attributionControl={false}
                onLoad={() => setMapLoaded(true)}
            >
                <NavigationControl position="top-right" showCompass={false} />

                {mapLoaded && cities
                    .filter((c) => CITIES_TO_SHOW.includes(c.id))
                    .map((city) => {
                        const isActive = city.id === activeCity;
                        const isWpg = city.id === "winnipeg";

                        return (
                            <Marker
                                key={city.id}
                                longitude={city.coords[0]}
                                latitude={city.coords[1]}
                                anchor="center"
                                onClick={(e) => {
                                    e.originalEvent.stopPropagation();
                                    setPopup(city);
                                }}
                            >
                                <div
                                    className="relative cursor-pointer"
                                    style={{
                                        transform: isActive ? "scale(1.3)" : "scale(1)",
                                        transition: "transform 0.3s ease",
                                    }}
                                >
                                    {/* Pulse ring for active/winnipeg */}
                                    {(isActive || isWpg) && (
                                        <span
                                            className="absolute inset-0 rounded-full animate-ping"
                                            style={{
                                                background: city.color + "55",
                                                animationDuration: isWpg ? "1.5s" : "2s",
                                            }}
                                        />
                                    )}
                                    {/* Pin dot */}
                                    <div
                                        className="relative w-4 h-4 rounded-full border-2 border-white shadow-lg"
                                        style={{ background: city.color }}
                                    />
                                    {/* Cost chip — hide on the static marker when a geocoded pin overrides it */}
                                    {isActive && !flyToCoords && (
                                        <div
                                            className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold text-white border border-white/20 shadow"
                                            style={{ background: city.color, fontFamily: "var(--font-ibm-mono)" }}
                                        >
                                            {`Index ${city.costIndex}`}
                                        </div>
                                    )}
                                </div>
                            </Marker>
                        );
                    })}

                {/* Custom geocoded location pin */}
                {mapLoaded && flyToCoords && (() => {
                    const activeData = cities.find((c) => c.id === activeCity);
                    return (
                        <Marker longitude={flyToCoords[0]} latitude={flyToCoords[1]} anchor="bottom">
                            <div className="relative flex flex-col items-center">
                                {activeData && (
                                    <div
                                        className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold text-white border border-white/20 shadow"
                                        style={{ background: activeData.color, fontFamily: "var(--font-ibm-mono)" }}
                                    >
                                        {`Index ${activeData.costIndex}`}
                                    </div>
                                )}
                                <div className="w-4 h-4 rounded-full bg-exchange-brick border-2 border-white shadow-lg" />
                                <div className="w-0.5 h-3 bg-exchange-brick" />
                            </div>
                        </Marker>
                    );
                })()}

                {mapLoaded && popup && (
                    <Popup
                        longitude={popup.coords[0]}
                        latitude={popup.coords[1]}
                        anchor="top"
                        closeOnClick
                        onClose={() => setPopup(null)}
                    >
                        <div style={{ fontFamily: "var(--font-ibm-sans)" }}>
                            <p className="font-semibold text-frost-white text-sm">
                                {popup.name}, {popup.province}
                            </p>
                            <div className="mt-2 space-y-1 text-[12px]">
                                <div className="flex justify-between gap-6">
                                    <span className="text-concrete-gray">Cost Index</span>
                                    <span style={{ fontFamily: "var(--font-ibm-mono)", color: popup.color }}>
                                        {popup.costIndex}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-6">
                                    <span className="text-concrete-gray">Office Rent</span>
                                    <span style={{ fontFamily: "var(--font-ibm-mono)", color: "#4C6E91" }}>
                                        ${popup.officeSqft}/sqft
                                    </span>
                                </div>
                                <div className="flex justify-between gap-6">
                                    <span className="text-concrete-gray">Avg Home</span>
                                    <span style={{ fontFamily: "var(--font-ibm-mono)", color: "#4C6E91" }}>
                                        ${(popup.homePrice / 1000).toFixed(0)}K
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
}
