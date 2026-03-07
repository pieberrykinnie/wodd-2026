"use client";

import { Info, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface SourceTooltipProps {
    source: string;
    url?: string;
    year?: string;
    table?: string;
    size?: number;
}

export default function SourceTooltip({ source, url, year, table, size = 11 }: SourceTooltipProps) {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);

    const updateCoords = () => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        setCoords({
            top: rect.top + window.scrollY - 8,
            left: rect.left + rect.width / 2 + window.scrollX,
        });
    };

    const handleEnter = () => {
        updateCoords();
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return;
        const onScroll = () => setOpen(false);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [open]);

    const tooltip = open ? (
        <div
            style={{
                position: "absolute",
                top: coords.top,
                left: coords.left,
                transform: "translate(-50%, -100%)",
                minWidth: 200,
                maxWidth: 260,
                zIndex: 9999,
                pointerEvents: "none",
            }}
        >
            {/* Arrow */}
            <div
                className="absolute top-full left-1/2"
                style={{
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: "5px solid rgba(15,24,35,0.95)",
                }}
            />
            <div
                className="rounded px-3 py-2.5 shadow-lg"
                style={{
                    background: "rgba(15,24,35,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                <p
                    className="text-[11px] font-semibold text-white/90 leading-snug mb-0.5"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    {source}
                </p>
                {(year || table) && (
                    <p
                        className="text-[10px] text-white/50 leading-snug"
                        style={{ fontFamily: "var(--font-ibm-mono)" }}
                    >
                        {[table, year].filter(Boolean).join(" · ")}
                    </p>
                )}
                {url && (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-sky-400 hover:text-sky-300"
                        style={{ fontFamily: "var(--font-ibm-sans)", pointerEvents: "auto" }}
                    >
                        View source <ExternalLink size={9} />
                    </a>
                )}
            </div>
        </div>
    ) : null;

    return (
        <span className="relative inline-flex items-center ml-1 align-middle">
            <button
                ref={btnRef}
                type="button"
                onMouseEnter={handleEnter}
                onMouseLeave={() => setOpen(false)}
                onFocus={handleEnter}
                onBlur={() => setOpen(false)}
                className="text-concrete-gray/50 hover:text-concrete-gray transition-colors focus:outline-none"
                aria-label={`Source: ${source}`}
            >
                <Info size={size} aria-hidden />
            </button>

            {typeof document !== "undefined" && createPortal(tooltip, document.body)}
        </span>
    );
}
