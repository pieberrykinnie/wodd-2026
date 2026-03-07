"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const PAGE_LABELS: Record<string, string> = {
    "mirror-map": "City Comparison",
    "hotspot-map": "Winnipeg Hotspots",
    "migration-board": "Migration Planner",
    commute: "Commute Analysis",
    "four-seasons": "Life in Winnipeg",
    "discovery-weekend": "Discovery Weekend",
    "data-transparency": "Data Sources",
};

export default function ExploreNav() {
    const pathname = usePathname();
    const segment = pathname.split("/").filter(Boolean)[0] ?? "";
    const label = PAGE_LABELS[segment] ?? "";

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-prairie-blue border-b border-river-slate flex items-center px-6">
            <Link href="/onboarding" className="flex items-center gap-2 no-underline group">
                <ArrowLeft
                    size={14}
                    style={{ color: "#49575E" }}
                    className="group-hover:text-frost-white transition-colors"
                />
                <Image
                    src="/logo-transparent-bg.png"
                    alt="Winnipeg Relocation"
                    width={110}
                    height={28}
                    className="h-7 w-auto object-contain"
                />
            </Link>

            {label && (
                <div className="ml-auto flex items-center gap-3">
                    <div className="w-px h-4 bg-river-slate" />
                    <span
                        className="text-[13px]"
                        style={{ fontFamily: "var(--font-ibm-sans)", color: "#49575E" }}
                    >
                        {label}
                    </span>
                </div>
            )}
        </nav>
    );
}
