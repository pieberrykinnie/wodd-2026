"use client";

interface DataCardProps {
    children: React.ReactNode;
    className?: string;
    padding?: "sm" | "md" | "lg";
    hover?: boolean;
}

export default function DataCard({
    children,
    className = "",
    padding = "md",
    hover = false,
}: DataCardProps) {
    const paddings = { sm: "p-4", md: "p-5", lg: "p-6" };

    return (
        <div
            className={[
                "bg-river-slate rounded-xl border border-white/5 relative overflow-hidden",
                paddings[padding],
                hover
                    ? "transition-all duration-200 hover:border-cool-blue/30 hover:shadow-lg hover:shadow-black/20 cursor-pointer"
                    : "",
                className,
            ].join(" ")}
        >
            {children}
        </div>
    );
}
