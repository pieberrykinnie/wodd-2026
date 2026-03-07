"use client";

import { Info, TrendingUp, AlertCircle, Lightbulb } from "lucide-react";

type BannerVariant = "insight" | "tip" | "warning" | "highlight";

const VARIANTS: Record<BannerVariant, {
    bg: string;
    border: string;
    text: string;
    icon: React.ElementType;
}> = {
    insight: { bg: "rgba(216,156,61,0.08)", border: "rgba(216,156,61,0.25)", text: "#D89C3D", icon: Lightbulb },
    tip: { bg: "rgba(76,110,145,0.1)", border: "rgba(76,110,145,0.25)", text: "#4C6E91", icon: Info },
    highlight: { bg: "rgba(200,164,77,0.1)", border: "rgba(200,164,77,0.25)", text: "#C8A44D", icon: TrendingUp },
    warning: { bg: "rgba(178,58,43,0.08)", border: "rgba(178,58,43,0.25)", text: "#B23A2B", icon: AlertCircle },
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
            className={["flex items-start gap-3 rounded-xl p-4 border", className].join(" ")}
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
