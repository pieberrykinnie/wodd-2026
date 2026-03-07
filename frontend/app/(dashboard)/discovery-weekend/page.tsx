"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import DataCard from "@/components/ui/DataCard";
import InsightBanner from "@/components/ui/InsightBanner";
import PillButton from "@/components/ui/PillButton";
import Link from "next/link";
import { useState } from "react";
import { useCompanyStore } from "@/store/useCompanyStore";
import { fetchDiscoveryWeekend, type DiscoveryWeekendResponse } from "@/lib/api";
import {
    Hotel,
    UtensilsCrossed,
    Map,
    Trees,
    Music,
    Sparkles,
    Loader2,
    Calendar,
} from "lucide-react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const ITINERARY = [
    {
        day: "Friday Evening",
        dayColor: "#4C6E91",
        items: [
            {
                icon: Hotel,
                label: "Arrive & Check In",
                detail: "The Fort Garry Hotel (built 1913) or Alt Hotel — both in the Exchange District",
                note: "From $189/night — comparable Marriott in Toronto runs $380+",
            },
            {
                icon: UtensilsCrossed,
                label: "Dinner at Deer + Almond",
                detail: "Winnipeg's most celebrated restaurant. Small plates, farm-to-table, extraordinary wine list.",
                note: "$65–$85/person — comparable meal in Toronto: $120–$150",
            },
            {
                icon: Music,
                label: "Jazz at the Exchange",
                detail: "Patent 5 Distillery or Forth Bar — craft cocktails in a century-old brick warehouse.",
                note: "The Exchange District at night looks like nothing else in Canada.",
            },
        ],
    },
    {
        day: "Saturday",
        dayColor: "#C8A44D",
        items: [
            {
                icon: UtensilsCrossed,
                label: "Breakfast at Stella's Café",
                detail: "Osborne Village location. Best breakfast in Winnipeg. Expect a 20-minute wait.",
                note: "Walk to the Red River trail after — 50km of connected paths",
            },
            {
                icon: Map,
                label: "Neighbourhood Drive",
                detail: "River Heights → Tuxedo → Wolseley → Osborne Village. With a local guide.",
                note: "$350K in River Heights. $1.1M for equivalent in Toronto.",
            },
            {
                icon: Trees,
                label: "Assiniboine Park",
                detail: "400+ acre urban park. Zoo, conservatory, Leo Mol Sculpture Garden.",
                note: "Zero admission for the park itself. Zoo tickets: $19 adults.",
            },
            {
                icon: UtensilsCrossed,
                label: "Dinner at 529 Wellington",
                detail: "Winnipeg's premier steakhouse. Manitoba beef, exceptional service, heritage room.",
                note: "$80–$120/person. No expense report regrets.",
            },
        ],
    },
    {
        day: "Sunday Morning",
        dayColor: "#5E8C6A",
        items: [
            {
                icon: Map,
                label: "Canadian Museum for Human Rights",
                detail: "World's first museum dedicated solely to human rights. Iconic architecture by Antoine Predock.",
                note: "Alone in any other city, this would be a top 5 tourist attraction.",
            },
            {
                icon: Map,
                label: "The Forks Market",
                detail: "National Historic Site at the river confluence. Market Hall, artisan vendors, River Walk.",
                note: "Then fly home with a different picture of Winnipeg in your mind.",
            },
        ],
    },
];

const WHY_VISIT = [
    {
        title: "You can't sell what you haven't seen",
        body: "HR leaders who have visited Winnipeg close relocations at 3× the rate of those who haven't. Personal experience converts skeptics.",
    },
    {
        title: "Your team needs a leader who believes",
        body: "If you're asking employees to uproot their lives, the most persuasive argument is your own genuine enthusiasm after seeing the city firsthand.",
    },
    {
        title: "The city will surprise you",
        body: "Every executive who visits expecting nothing leaves with a quiet conviction: 'This is actually a serious city.' That feeling doesn't come from a slide deck.",
    },
];

export default function DiscoveryWeekendPage() {
    const { selectedZoneId } = useCompanyStore();
    const [travelMonth, setTravelMonth] = useState(new Date().getMonth() + 1);
    const [aiItinerary, setAiItinerary] = useState<DiscoveryWeekendResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const generateItinerary = async () => {
        setLoading(true);
        const result = await fetchDiscoveryWeekend(
            selectedZoneId ?? "exchange-district",
            travelMonth
        );
        setAiItinerary(result);
        setLoading(false);
    };

    return (
        <div className="p-6 md:p-8 flex flex-col gap-8">
            {/* Hero */}
            <div
                className="rounded-2xl p-8 md:p-10 grain relative overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #1C2A39 0%, #24384C 60%, #2F3E4F 100%)",
                    border: "1px solid rgba(178,58,43,0.25)",
                }}
            >
                <p
                    className="text-[11px] font-semibold uppercase tracking-widest text-exchange-brick mb-3"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    Executive Preview Program
                </p>
                <h1
                    className="text-3xl md:text-4xl font-bold text-frost-white leading-tight mb-4 max-w-xl"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    The Winnipeg Discovery Weekend
                </h1>
                <p
                    className="text-[15px] text-concrete-gray leading-relaxed max-w-xl mb-6"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    Before you ask your team to make a life decision, make the trip yourself. 48 hours. A curated
                    itinerary designed for executives. An experience that earns the conversation.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link href="/migration-board">
                        <PillButton icon>Plan Your Visit</PillButton>
                    </Link>
                    <PillButton variant="ghost">
                        Request Concierge Support
                    </PillButton>
                </div>

                {/* Stats strip */}
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
                    {[
                        { value: "48hrs", label: "Itinerary length" },
                        { value: "3×", label: "Higher conversion rate" },
                        { value: "$0", label: "EDW concierge fee" },
                    ].map((s) => (
                        <div key={s.label}>
                            <p
                                className="text-2xl font-semibold text-exchange-brick"
                                style={{ fontFamily: "var(--font-ibm-mono)" }}
                            >
                                {s.value}
                            </p>
                            <p
                                className="text-[12px] text-concrete-gray mt-0.5"
                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                            >
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Itinerary Generator */}
            <DataCard>
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label
                            className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-concrete-gray mb-2"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            <Calendar size={12} /> Travel Month
                        </label>
                        <select
                            value={travelMonth}
                            onChange={(e) => setTravelMonth(Number(e.target.value))}
                            className="w-full rounded-lg px-3 py-2 text-sm text-frost-white border border-white/10 outline-none"
                            style={{ background: "rgba(47,62,79,0.8)", fontFamily: "var(--font-ibm-sans)" }}
                        >
                            {MONTHS.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <PillButton onClick={generateItinerary} icon>
                        {loading ? (
                            <><Loader2 size={14} className="animate-spin" /> Generating…</>
                        ) : (
                            <><Sparkles size={14} /> {aiItinerary ? "Regenerate Itinerary" : "Generate Personalized Itinerary"}</>
                        )}
                    </PillButton>
                    <p className="text-[12px] text-concrete-gray w-full md:w-auto" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                        AI-generated itinerary tailored to your selected zone &amp; travel month.
                    </p>
                </div>

                {/* AI Itinerary output */}
                {aiItinerary && (
                    <div className="mt-6 border-t border-white/8 pt-5">
                        <p className="text-[11px] uppercase tracking-widest text-concrete-gray font-semibold mb-4" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                            AI Itinerary — {MONTHS[aiItinerary.travel_month - 1]} · {aiItinerary.zone_name}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {aiItinerary.itinerary.map((day, di) => {
                                const color = ["#B23A2B", "#4C6E91", "#5E8C6A"][di % 3];
                                return (
                                    <div
                                        key={day.day}
                                        className="rounded-lg p-4 border border-white/8"
                                        style={{ background: color + "10" }}
                                    >
                                        <p className="text-[11px] font-semibold mb-3" style={{ color, fontFamily: "var(--font-ibm-mono)" }}>
                                            {day.day}
                                        </p>
                                        <div className="space-y-2.5">
                                            {day.activities.map((act, ai) => (
                                                <div key={ai} className="flex gap-2.5">
                                                    <span className="text-[11px] font-semibold w-20 flex-shrink-0 mt-0.5" style={{ color, fontFamily: "var(--font-ibm-mono)" }}>
                                                        {act.time}
                                                    </span>
                                                    <div>
                                                        <p className="text-[13px] text-frost-white leading-snug" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                                            {act.activity}
                                                        </p>
                                                        {act.location && (
                                                            <p className="text-[11px] text-concrete-gray mt-0.5" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                                                📍 {act.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {aiItinerary.seasonal_events.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <p className="text-[11px] text-concrete-gray w-full" style={{ fontFamily: "var(--font-ibm-sans)" }}>Seasonal events this month:</p>
                                {aiItinerary.seasonal_events.map((ev) => (
                                    <span key={ev} className="text-[11px] px-2.5 py-1 rounded-full border border-prairie-gold/30 bg-prairie-gold/10 text-prairie-gold" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                        {ev}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </DataCard>

            {/* Why visit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {WHY_VISIT.map((item, i) => (
                    <DataCard key={i}>
                        <div
                            className="w-7 h-7 rounded-full bg-exchange-brick/15 flex items-center justify-center text-exchange-brick text-sm font-bold mb-3"
                            style={{ fontFamily: "var(--font-ibm-mono)" }}
                        >
                            {i + 1}
                        </div>
                        <h3
                            className="text-[14px] font-semibold text-frost-white mb-2 leading-snug"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            {item.title}
                        </h3>
                        <p
                            className="text-[13px] text-concrete-gray leading-relaxed"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            {item.body}
                        </p>
                    </DataCard>
                ))}
            </div>

            {/* Itinerary */}
            <SectionHeader eyebrow="Sample Itinerary" title="48 Hours in Winnipeg" />

            <div className="space-y-6">
                {ITINERARY.map((section) => (
                    <div key={section.day}>
                        <div
                            className="inline-flex px-3 py-1 rounded-full text-[11px] font-semibold mb-4"
                            style={{
                                background: section.dayColor + "22",
                                color: section.dayColor,
                                fontFamily: "var(--font-ibm-mono)",
                            }}
                        >
                            {section.day}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <DataCard key={item.label} hover>
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ background: section.dayColor + "18" }}
                                            >
                                                <Icon size={16} style={{ color: section.dayColor }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className="text-[14px] font-semibold text-frost-white mb-1"
                                                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                                                >
                                                    {item.label}
                                                </p>
                                                <p
                                                    className="text-[12px] text-frost-white/75 leading-snug mb-2"
                                                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                                                >
                                                    {item.detail}
                                                </p>
                                                {item.note && (
                                                    <p
                                                        className="text-[11px] italic"
                                                        style={{
                                                            color: section.dayColor,
                                                            fontFamily: "var(--font-ibm-sans)",
                                                        }}
                                                    >
                                                        {item.note}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </DataCard>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <InsightBanner variant="insight">
                Economic Development Winnipeg offers free concierge services for qualifying executive visits —
                including curated neighbourhood tours, commercial real estate previews, and introductions to local
                business leaders and founders. Contact them before you book.
            </InsightBanner>
        </div>
    );
}
