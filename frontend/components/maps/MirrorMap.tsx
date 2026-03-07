"use client";

import { useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import { MAPBOX_TOKEN, MAPBOX_STYLE, CITY_COORDS, WINNIPEG_CENTER } from "@/lib/mapConfig";
import { getCityById } from "@/lib/api";
import "mapbox-gl/dist/mapbox-gl.css";

interface CityApiData {
    office_rent_per_sqft: number;
    avg_housing_price: number;
    avg_commute_minutes: number;
    avg_monthly_rent_1br?: number;
    provincial_tax_rate?: number;
    cost_of_living_index?: number;
}

interface MirrorMapProps {
    cityId: string;
    cityCoords?: [number, number];
    cityDisplayName?: string;
    originData?: CityApiData | null;
    winnipegData?: CityApiData | null;
}

export default function MirrorMap({ cityId, cityCoords: propCoords, cityDisplayName, originData, winnipegData }: MirrorMapProps) {
    const city = getCityById(cityId);
    const winnipeg = getCityById("winnipeg")!;
    const cityCoords = propCoords ?? CITY_COORDS[cityId] ?? CITY_COORDS.toronto;
    const cityLabel = cityDisplayName ?? city?.name ?? cityId;

    // Resolve popup values: prefer API data, fall back to static JSON
    const oRent = originData?.office_rent_per_sqft ?? city?.officeSqft;
    const oHome = originData?.avg_housing_price ?? city?.homePrice;
    const oCommute = originData?.avg_commute_minutes ?? city?.avgCommute;
    const oIndex = originData?.cost_of_living_index;

    const wRent = winnipegData?.office_rent_per_sqft ?? 16;
    const wHome = winnipegData?.avg_housing_price ?? winnipeg.homePrice;
    const wCommute = winnipegData?.avg_commute_minutes ?? 20;
    const wIndex = winnipegData?.cost_of_living_index;

    const [originPopup, setOriginPopup] = useState(false);
    const [wpgPopup, setWpgPopup] = useState(false);
    const [originLoaded, setOriginLoaded] = useState(false);
    const [wpgLoaded, setWpgLoaded] = useState(false);

    const commonMapProps = {
        mapboxAccessToken: MAPBOX_TOKEN,
        mapStyle: MAPBOX_STYLE,
        attributionControl: false,
        style: { width: "100%", height: "100%" },
    };

    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            {/* Origin City Map */}
            <div className="relative rounded overflow-hidden border border-concrete-gray/20">
                <div
                    className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded text-[12px] font-semibold"
                    style={{
                        background: "rgba(100,116,139,0.15)",
                        color: "#0F1823",
                        fontFamily: "var(--font-ibm-sans)",
                    }}
                >
                    {cityLabel}
                </div>
                <Map
                    initialViewState={{
                        longitude: cityCoords[0],
                        latitude: cityCoords[1],
                        zoom: 10,
                    }}
                    {...commonMapProps}
                    onLoad={() => setOriginLoaded(true)}
                >
                    <NavigationControl position="bottom-right" showCompass={false} />
                    {originLoaded && <Marker
                        longitude={cityCoords[0]}
                        latitude={cityCoords[1]}
                        anchor="center"
                        onClick={() => setOriginPopup(true)}
                    >
                        <div className="relative cursor-pointer">
                            <span
                                className="absolute inset-0 rounded-full animate-ping opacity-50"
                                style={{ background: city?.color ?? "#49575E" }}
                            />
                            <div
                                className="relative w-5 h-5 rounded-full border-2 border-white shadow-lg"
                                style={{ background: city?.color ?? "#49575E" }}
                            />
                        </div>
                    </Marker>}
                    {originLoaded && originPopup && (
                        <Popup
                            longitude={cityCoords[0]}
                            latitude={cityCoords[1]}
                            anchor="top"
                            closeOnClick
                            onClose={() => setOriginPopup(false)}
                        >
                            <div style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                <p className="font-semibold text-frost-white text-sm mb-2">{cityLabel}</p>
                                <div className="space-y-1 text-[12px]">
                                    <Row label="Office Rent" value={oRent != null ? `$${oRent}/sqft/mo` : "—"} color="#4C6E91" />
                                    <Row label="Avg Home" value={oHome != null ? `$${(oHome / 1000).toFixed(0)}K` : "—"} color="#4C6E91" />
                                    <Row label="Avg Commute" value={oCommute != null ? `${oCommute} min` : "—"} color="#49575E" />
                                    {oIndex != null && <Row label="CoL Index" value={String(oIndex)} color={city?.color ?? "#8B98A5"} />}
                                </div>
                            </div>
                        </Popup>
                    )}
                </Map>
            </div>

            {/* Winnipeg Map */}
            <div className="relative rounded overflow-hidden border border-exchange-brick/30">
                <div
                    className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded text-[12px] font-semibold"
                    style={{
                        background: "#4C6E91",
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
                    onLoad={() => setWpgLoaded(true)}
                >
                    <NavigationControl position="bottom-right" showCompass={false} />
                    {wpgLoaded && <Marker
                        longitude={WINNIPEG_CENTER[0]}
                        latitude={WINNIPEG_CENTER[1]}
                        anchor="center"
                        onClick={() => setWpgPopup(true)}
                    >
                        <div className="relative cursor-pointer">
                            <span className="absolute inset-0 rounded-full animate-ping opacity-70" style={{ background: "#4C6E91" }} />
                            <div className="relative w-5 h-5 rounded-full border-2 border-white shadow-lg" style={{ background: "#4C6E91" }} />
                        </div>
                    </Marker>}
                    {wpgLoaded && wpgPopup && (
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
                                    <Row label="Office Rent" value={`$${wRent}/sqft/mo`} color="#C8A44D" />
                                    <Row label="Avg Home" value={`$${(wHome / 1000).toFixed(0)}K`} color="#C8A44D" />
                                    <Row label="Avg Commute" value={`${wCommute} min`} color="#5E8C6A" />
                                    {wIndex != null && <Row label="CoL Index" value={String(wIndex)} color="#B23A2B" />}
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
