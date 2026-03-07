"use client";

interface SectionHeaderProps {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    centered?: boolean;
    className?: string;
}

export default function SectionHeader({
    eyebrow,
    title,
    subtitle,
    centered = false,
    className = "",
}: SectionHeaderProps) {
    return (
        <div className={["mb-6", centered ? "text-center" : "", className].join(" ")}>
            {eyebrow && (
                <p
                    className="text-[11px] font-semibold uppercase tracking-widest text-exchange-brick mb-2"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    {eyebrow}
                </p>
            )}
            <h2
                className="text-2xl md:text-3xl font-bold text-frost-white leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
            >
                {title}
            </h2>
            {subtitle && (
                <p
                    className="mt-2 text-[14px] text-concrete-gray leading-relaxed max-w-2xl"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}
