"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, X } from "lucide-react";
import { MAPBOX_TOKEN } from "@/lib/mapConfig";

export interface CityResult {
    label: string;
    coords: [number, number];
}

interface CitySearchInputProps {
    value: string;
    onSelect: (result: CityResult) => void;
    onClear?: () => void;
    placeholder?: string;
    required?: boolean;
}

interface MapboxFeature {
    id: string;
    place_name: string;
    center: [number, number];
}

export default function CitySearchInput({
    value,
    onSelect,
    onClear,
    placeholder = "e.g. Regina, SK",
    required,
}: CitySearchInputProps) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Keep query in sync with external `value` (e.g. on reset)
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Close on outside click
    useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const search = useCallback(async (q: string) => {
        if (q.trim().length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }
        setIsLoading(true);
        try {
            const encoded = encodeURIComponent(q.trim());
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?types=place&country=ca&limit=5&access_token=${MAPBOX_TOKEN}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Geocoding request failed");
            const data = await res.json();
            setSuggestions(data.features ?? []);
            setIsOpen((data.features ?? []).length > 0);
            setActiveIndex(-1);
        } catch {
            setSuggestions([]);
            setIsOpen(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setQuery(q);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(q), 300);
    };

    const handleSelect = (feature: MapboxFeature) => {
        setQuery(feature.place_name);
        setSuggestions([]);
        setIsOpen(false);
        setActiveIndex(-1);
        onSelect({ label: feature.place_name, coords: feature.center });
    };

    const handleClear = () => {
        setQuery("");
        setSuggestions([]);
        setIsOpen(false);
        onClear?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                handleSelect(suggestions[activeIndex]);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative flex items-center">
                <MapPin
                    size={15}
                    className="absolute left-3 pointer-events-none"
                    style={{ color: "#8B98A5" }}
                />
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    required={required}
                    autoComplete="off"
                    className="w-full bg-river-slate border border-white/10 rounded px-4 py-3 pl-9 text-frost-white text-sm outline-none focus:border-cool-blue/60 transition-colors placeholder:text-concrete-gray/50"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                />
                {isLoading && (
                    <div
                        className="absolute right-3 w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: "#8B98A5", borderTopColor: "transparent" }}
                    />
                )}
                {!isLoading && query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 text-concrete-gray/60 hover:text-concrete-gray transition-colors"
                        tabIndex={-1}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <ul
                    className="absolute z-50 w-full mt-1 rounded border overflow-hidden shadow-xl"
                    style={{
                        background: "#FFFFFF",
                        borderColor: "rgba(0,0,0,0.12)",
                    }}
                >
                    {suggestions.map((feature, idx) => (
                        <li key={feature.id}>
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault(); // prevent input blur before click registers
                                    handleSelect(feature);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2"
                                style={{
                                    fontFamily: "var(--font-ibm-sans)",
                                    background:
                                        idx === activeIndex
                                            ? "rgba(185,148,69,0.15)"
                                            : "transparent",
                                    color: idx === activeIndex ? "#4C6E91" : "#0F1823",
                                    borderBottom:
                                        idx < suggestions.length - 1
                                            ? "1px solid rgba(0,0,0,0.08)"
                                            : "none",
                                }}
                            >
                                <MapPin size={12} style={{ color: "#8B98A5", flexShrink: 0 }} />
                                <span className="truncate">{feature.place_name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
