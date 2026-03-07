"use client";

type Persona = "Urban Creative" | "Young Family" | "Tech Executive" | "Young Professional";

const PERSONA_STYLES: Record<Persona, { bg: string; text: string; dot: string }> = {
    "Urban Creative": { bg: "rgba(216,156,61,0.15)", text: "#D89C3D", dot: "#D89C3D" },
    "Young Family": { bg: "rgba(94,140,106,0.15)", text: "#5E8C6A", dot: "#5E8C6A" },
    "Tech Executive": { bg: "rgba(178,58,43,0.15)", text: "#B23A2B", dot: "#B23A2B" },
    "Young Professional": { bg: "rgba(76,110,145,0.15)", text: "#4C6E91", dot: "#4C6E91" },
};

interface PersonaTagProps {
    persona: string;
    dot?: boolean;
}

export default function PersonaTag({ persona, dot = true }: PersonaTagProps) {
    const style = PERSONA_STYLES[persona as Persona] ?? {
        bg: "rgba(139,152,165,0.15)",
        text: "#8B98A5",
        dot: "#8B98A5",
    };

    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
                background: style.bg,
                color: style.text,
                fontFamily: "var(--font-ibm-sans)",
            }}
        >
            {dot && (
                <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: style.dot }}
                />
            )}
            {persona}
        </span>
    );
}
