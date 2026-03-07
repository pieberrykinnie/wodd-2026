"use client";

import { motion } from "framer-motion";
import SourceTooltip from "@/components/ui/SourceTooltip";

interface SourceInfo {
    label: string;
    url?: string;
    year?: string;
    table?: string;
}

interface MetricTileProps {
    label: string;
    value: string;
    delta?: string;
    deltaPositive?: boolean;
    sub?: string;
    accent?: "gold" | "brick" | "green" | "blue";
    large?: boolean;
    source?: SourceInfo;
}

const accentColors = {
    gold: "#4C6E91",
    brick: "#4C6E91",
    green: "#49575E",
    blue: "#1D507A",
};

export default function MetricTile({
    label,
    value,
    delta,
    deltaPositive = true,
    sub,
    accent = "gold",
    large = false,
    source,
}: MetricTileProps) {
    const color = accentColors[accent];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="bg-river-slate rounded p-5 border border-black/5 relative overflow-hidden"
        >
            {/* Accent line */}
            <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-sm"
                style={{ background: color }}
            />

            <p
                className="text-[11px] font-semibold uppercase tracking-widest text-concrete-gray mb-3 flex items-center"
                style={{ fontFamily: "var(--font-ibm-sans)" }}
            >
                {label}
                {source && (
                    <SourceTooltip
                        source={source.label}
                        url={source.url}
                        year={source.year}
                        table={source.table}
                    />
                )}
            </p>

            <p
                className={large ? "text-4xl" : "text-[1.9rem]"}
                style={{
                    fontFamily: "var(--font-ibm-mono)",
                    color,
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                }}
            >
                {value}
            </p>

            {delta && (
                <span
                    className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded"
                    style={{
                        fontFamily: "var(--font-ibm-mono)",
                        color: deltaPositive ? "#4C6E91" : "#49575E",
                        background: deltaPositive
                            ? "rgba(185,148,69,0.12)"
                            : "rgba(73,87,94,0.12)",
                    }}
                >
                    {delta}
                </span>
            )}

            {sub && (
                <p
                    className="mt-2 text-[12px] text-concrete-gray leading-snug"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    {sub}
                </p>
            )}
        </motion.div>
    );
}
