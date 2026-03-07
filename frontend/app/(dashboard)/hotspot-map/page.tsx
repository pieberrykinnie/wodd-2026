"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCompanyStore } from "@/store/useCompanyStore";
import { fetchZones, fetchHeatmapData, type ZoneSummary, type HeatmapDataResponse } from "@/lib/api";
import SectionHeader from "@/components/ui/SectionHeader";
import PillButton from "@/components/ui/PillButton";
import InsightBanner from "@/components/ui/InsightBanner";

const HotspotMap = dynamic(() => import("@/components/maps/HotspotMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-river-slate rounded flex items-center justify-center">
            <p className="text-concrete-gray text-sm">Loading Winnipeg map…</p>
        </div>
    ),
});

export default function HotspotMapPage() {
    const { setSelectedZoneId } = useCompanyStore();
    const [zones, setZones] = useState<ZoneSummary[]>([]);
    const [heatmapData, setHeatmapData] = useState<HeatmapDataResponse | null>(null);

    useEffect(() => {
        fetchZones().then(setZones);
        fetchHeatmapData().then(setHeatmapData);
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
                <HotspotMap zones={zones} heatmapData={heatmapData} onSelectZone={setSelectedZoneId} />
            </div>

            {/* Bottom stats bar */}
            <div className="flex-shrink-0">
                <InsightBanner variant="insight">
                    {zones.length > 0
                        ? `${zones.length} active zones loaded — density driven by ${heatmapData?.points.length ?? 0} neighbourhoods of live Socrata data.`
                        : "Explore Winnipeg's key districts — click any zone to select it for cost analysis."
                    }
                </InsightBanner>
            </div>
        </div>
    );
}

