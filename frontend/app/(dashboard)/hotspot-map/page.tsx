"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCompanyStore } from "@/store/useCompanyStore";
import { fetchZones, type ZoneSummary } from "@/lib/api";
import SectionHeader from "@/components/ui/SectionHeader";
import PillButton from "@/components/ui/PillButton";
import InsightBanner from "@/components/ui/InsightBanner";

const HotspotMap = dynamic(() => import("@/components/maps/HotspotMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-river-slate rounded-xl flex items-center justify-center">
            <p className="text-concrete-gray text-sm">Loading Winnipeg map…</p>
        </div>
    ),
});

export default function HotspotMapPage() {
    const { setSelectedZoneId } = useCompanyStore();
    const [zones, setZones] = useState<ZoneSummary[]>([]);

    useEffect(() => {
        fetchZones().then(setZones);
    }, []);

    return (
        <div className="p-6 md:p-8 flex flex-col gap-5 h-[calc(100vh-4rem)]">
            <div className="flex items-start justify-between flex-wrap gap-4 flex-shrink-0">
                <SectionHeader
                    eyebrow="Winnipeg Opportunity Map"
                    title="Where to Land"
                    subtitle="Office districts, neighbourhoods, and lifestyle zones — filtered for your team."
                />
                <Link href="/budget-simulator">
                    <PillButton icon>Calculate Savings</PillButton>
                </Link>
            </div>

            {/* Full map */}
            <div className="flex-1 min-h-0">
                <HotspotMap zones={zones} onSelectZone={setSelectedZoneId} />
            </div>

            {/* Bottom stats bar */}
            <div className="flex-shrink-0">
                <InsightBanner variant="insight">
                    {zones.length > 0
                        ? <>Showing <strong style={{ color: "#D89C3D" }}>{zones.length} Winnipeg zones</strong> powered by live Socrata open data. Click any zone to select it for your analysis.</>
                        : <>Winnipeg has <strong style={{ color: "#D89C3D" }}>4 primary office districts</strong> with vacancy rates between 5–11%, average rent of{" "}
                            <strong style={{ color: "#C8A44D" }}>$16–$22/sqft/month</strong> — compared to{" "}
                            <strong style={{ color: "#8B98A5" }}>$42–$48/sqft</strong> in Toronto and Vancouver. Class A space is available at a fraction of the cost.</>
                    }
                </InsightBanner>
            </div>
        </div>
    );
}

