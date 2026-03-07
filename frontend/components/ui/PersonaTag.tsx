"use client";

type Persona = "Urban Creative" | "Young Family" | "Tech Executive" | "Young Professional";

const PERSONA_STYLES: Record<Persona, { bg: string; text: string; dot: string }> = {
    "Urban Creative": { bg: "rgba(185,148,69,0.15)", text: "#4C6E91", dot: "#4C6E91" },
    "Young Family": { bg: "rgba(73,87,94,0.15)", text: "#49575E", dot: "#49575E" },
    "Tech Executive": { bg: "rgba(185,148,69,0.15)", text: "#4C6E91", dot: "#4C6E91" },
    "Young Professional": { bg: "rgba(73,87,94,0.15)", text: "#49575E", dot: "#49575E" },
};

interface PersonaTagProps {
    persona: string;
    dot?: boolean;
}

export default function PersonaTag({ persona, dot = true }: PersonaTagProps) {
    const style = PERSONA_STYLES[persona as Persona] ?? {
        bg: "rgba(73,87,94,0.15)",
        text: "#49575E",
        dot: "#49575E",
    };

    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold"
            style={{
                background: style.bg,
                color: style.text,
                fontFamily: "var(--font-ibm-sans)",
            }}
        >
            {dot && (
                <span
                    className="w-1.5 h-1.5 rounded"
                    style={{ background: style.dot }}
                />
            )}
            {persona}
        </span>
    );
}
