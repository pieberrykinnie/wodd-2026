"use client";

import { useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import { MAPBOX_TOKEN, MAPBOX_STYLE, CITY_COORDS, WINNIPEG_CENTER } from "@/lib/mapConfig";
import { getCityById } from "@/lib/api";
import "mapbox-gl/dist/mapbox-gl.css";

interface MirrorMapProps {
    cityId: string;
}

export default function MirrorMap({ cityId }: MirrorMapProps) {
    const city = getCityById(cityId) ?? getCityById("toronto")!;
    const winnipeg = getCityById("winnipeg")!;
    const cityCoords = CITY_COORDS[cityId] ?? CITY_COORDS.toronto;

    const [originPopup, setOriginPopup] = useState(false);
    const [wpgPopup, setWpgPopup] = useState(false);

    const commonMapProps = {
        mapboxAccessToken: MAPBOX_TOKEN,
        mapStyle: MAPBOX_STYLE,
        attributionControl: false,
        style: { width: "100%", height: "100%" },
    };

    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            {/* Origin City Map */}
            <div className="relative rounded-xl overflow-hidden border border-concrete-gray/20">
                <div
                    className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                    style={{
                        background: "#8B98A5",
                        color: "#fff",
                        fontFamily: "var(--font-ibm-sans)",
                    }}
                >
                    {city.name}, {city.province}
                </div>
                <Map
                    initialViewState={{
                        longitude: cityCoords[0],
                        latitude: cityCoords[1],
                        zoom: 10,
                    }}
                    {...commonMapProps}
                >
                    <NavigationControl position="bottom-right" showCompass={false} />
                    <Marker
                        longitude={cityCoords[0]}
                        latitude={cityCoords[1]}
                        anchor="center"
                        onClick={() => setOriginPopup(true)}
                    >
                        <div className="relative cursor-pointer">
                            <span
                                className="absolute inset-0 rounded-full animate-ping opacity-50"
                                style={{ background: city.color }}
                            />
                            <div
                                className="relative w-5 h-5 rounded-full border-2 border-white shadow-lg"
                                style={{ background: city.color }}
                            />
                        </div>
                    </Marker>
                    {originPopup && (
                        <Popup
                            longitude={cityCoords[0]}
                            latitude={cityCoords[1]}
                            anchor="top"
                            closeOnClick
                            onClose={() => setOriginPopup(false)}
                        >
                            <div style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                <p className="font-semibold text-frost-white text-sm mb-2">{city.name}</p>
                                <div className="space-y-1 text-[12px]">
                                    <Row label="Office Rent" value={`$${city.officeSqft}/sqft/mo`} color="#C8A44D" />
                                    <Row label="Avg Home" value={`$${(city.homePrice / 1000).toFixed(0)}K`} color="#C8A44D" />
                                    <Row label="Avg Commute" value={`${city.avgCommute} min`} color="#8B98A5" />
                                    <Row label="Cost Index" value={`${city.costIndex}`} color={city.color} />
                                </div>
                            </div>
                        </Popup>
                    )}
                </Map>
            </div>

            {/* Winnipeg Map */}
            <div className="relative rounded-xl overflow-hidden border border-exchange-brick/30">
                <div
                    className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                    style={{
                        background: "#B23A2B",
                        color: "#fff",
                        fontFamily: "var(--font-ibm-sans)",
                    }}
                >
                    Winnipeg, MB
                </div>
                <Map
                    initialViewState={{
                        longitude: WINNIPEG_CENTER[0],
                        latitude: WINNIPEG_CENTER[1],
                        zoom: 10,
                    }}
                    {...commonMapProps}
                >
                    <NavigationControl position="bottom-right" showCompass={false} />
                    <Marker
                        longitude={WINNIPEG_CENTER[0]}
                        latitude={WINNIPEG_CENTER[1]}
                        anchor="center"
                        onClick={() => setWpgPopup(true)}
                    >
                        <div className="relative cursor-pointer">
                            <span className="absolute inset-0 rounded-full animate-ping opacity-70" style={{ background: "#B23A2B" }} />
                            <div className="relative w-5 h-5 rounded-full border-2 border-white shadow-lg" style={{ background: "#B23A2B" }} />
                        </div>
                    </Marker>
                    {wpgPopup && (
                        <Popup
                            longitude={WINNIPEG_CENTER[0]}
                            latitude={WINNIPEG_CENTER[1]}
                            anchor="top"
                            closeOnClick
                            onClose={() => setWpgPopup(false)}
                        >
                            <div style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                <p className="font-semibold text-frost-white text-sm mb-2">Winnipeg, MB</p>
                                <div className="space-y-1 text-[12px]">
                                    <Row label="Office Rent" value="$16/sqft/mo" color="#C8A44D" />
                                    <Row label="Avg Home" value="$350K" color="#C8A44D" />
                                    <Row label="Avg Commute" value="20 min" color="#5E8C6A" />
                                    <Row label="Cost Index" value="88" color="#B23A2B" />
                                </div>
                            </div>
                        </Popup>
                    )}
                </Map>
            </div>
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
