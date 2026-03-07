"use client";

import { Info, TrendingUp, AlertCircle, Lightbulb } from "lucide-react";

type BannerVariant = "insight" | "tip" | "warning" | "highlight";

const VARIANTS: Record<BannerVariant, {
    bg: string;
    border: string;
    text: string;
    icon: React.ElementType;
}> = {
    insight: { bg: "rgba(185,148,69,0.08)", border: "rgba(185,148,69,0.25)", text: "#4C6E91", icon: Lightbulb },
    tip: { bg: "rgba(73,87,94,0.1)", border: "rgba(73,87,94,0.25)", text: "#49575E", icon: Info },
    highlight: { bg: "rgba(185,148,69,0.1)", border: "rgba(185,148,69,0.25)", text: "#4C6E91", icon: TrendingUp },
    warning: { bg: "rgba(185,148,69,0.08)", border: "rgba(185,148,69,0.25)", text: "#4C6E91", icon: AlertCircle },
};

interface InsightBannerProps {
    children: React.ReactNode;
    variant?: BannerVariant;
    className?: string;
}

export default function InsightBanner({
    children,
    variant = "insight",
    className = "",
}: InsightBannerProps) {
    const v = VARIANTS[variant];
    const Icon = v.icon;

    return (
        <div
            className={["flex items-start gap-3 rounded p-4 border", className].join(" ")}
            style={{ background: v.bg, borderColor: v.border }}
        >
            <Icon
                size={16}
                className="flex-shrink-0 mt-0.5"
                style={{ color: v.text }}
            />
            <p
                className="text-[13px] leading-relaxed text-frost-white/90"
                style={{ fontFamily: "var(--font-ibm-sans)" }}
            >
                {children}
            </p>
        </div>
    );
}
