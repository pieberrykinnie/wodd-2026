"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompanyStore } from "@/store/useCompanyStore";
import { ChevronRight, Menu } from "lucide-react";

interface TopNavProps {
    onMenuToggle: () => void;
}

export default function TopNav({ onMenuToggle }: TopNavProps) {
    const pathname = usePathname();
    const { companyName, city } = useCompanyStore();

    // Build breadcrumb from pathname
    const segment = pathname.split("/").filter(Boolean)[0] ?? "onboarding";
    const PAGE_LABELS: Record<string, string> = {
        onboarding: "Company Profile",
        "mirror-map": "City Comparison",
        "hotspot-map": "Winnipeg Hotspots",
        "budget-simulator": "Budget Simulator",
        "migration-board": "Migration Planner",
        commute: "Commute Analysis",
        "four-seasons": "Life in Winnipeg",
        "discovery-weekend": "Discovery Weekend",
        "data-transparency": "Data Sources",
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-prairie-blue border-b border-river-slate flex items-center px-4 gap-4">
            {/* Menu toggle */}
            <button
                onClick={onMenuToggle}
                className="p-2 rounded hover:bg-river-slate transition-colors text-concrete-gray hover:text-frost-white"
                aria-label="Toggle sidebar"
            >
                <Menu size={18} />
            </button>

            {/* Logo */}
            <Link
                href="/onboarding"
                className="flex items-center gap-2.5 no-underline"
            >
                <Image
                    src="/logo-transparent-bg.png"
                    alt="Winnipeg Relocation Intelligence"
                    width={32}
                    height={32}
                    className="rounded-md"
                />
                <span
                    className="text-frost-white font-semibold text-sm tracking-wide hidden sm:block"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    Winnipeg Relocation Intelligence
                </span>
            </Link>

            {/* Divider */}
            <div className="hidden md:block w-px h-6 bg-river-slate" />

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-1.5 text-sm">
                {companyName && (
                    <>
                        <span className="text-concrete-gray font-medium">{companyName}</span>
                        <ChevronRight size={12} className="text-concrete-gray/50" />
                    </>
                )}
                {city && city !== "Toronto" && (
                    <>
                        <span className="text-concrete-gray">{city}</span>
                        <ChevronRight size={12} className="text-concrete-gray/50" />
                    </>
                )}
                <span className="text-frost-white font-medium">
                    {PAGE_LABELS[segment] ?? segment}
                </span>
            </div>

            {/* Right spacer / badge */}
            <div className="ml-auto flex items-center gap-3">
                <div
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded border border-exchange-brick/30 text-xs"
                    style={{ fontFamily: "var(--font-ibm-mono)" }}
                >
                    <span className="w-1.5 h-1.5 rounded bg-exchange-brick animate-pulse" />
                    <span className="text-exchange-brick font-medium">LIVE ANALYSIS</span>
                </div>
            </div>
        </nav>
    );
}
