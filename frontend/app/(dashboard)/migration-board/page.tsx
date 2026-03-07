"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import SectionHeader from "@/components/ui/SectionHeader";
import PillButton from "@/components/ui/PillButton";
import DataCard from "@/components/ui/DataCard";
import InsightBanner from "@/components/ui/InsightBanner";
import { CheckCircle2, Circle, Download, Calendar, MapPin, Plane } from "lucide-react";
import { useState } from "react";

const BUSINESS_PHASES = [
    {
        month: "Month 1",
        title: "Foundation",
        color: "#C8A44D",
        tasks: [
            "Incorporate Manitoba subsidiary or register as extra-provincial company",
            "Sign lease for Winnipeg office space (Exchange District or True North Square)",
            "Set up Manitoba payroll tax accounts",
            "Engage Winnipeg commercial real estate broker",
            "Brief legal counsel on Manitoba employment law",
        ],
    },
    {
        month: "Month 2–3",
        title: "Transition",
        color: "#4C6E91",
        tasks: [
            "Begin phased employee relocation (first cohort leads)",
            "Set up Manitoba Health registration for employees",
            "Onboard local HR and legal support",
            "Launch Winnipeg hiring for local roles",
            "Coordinate IT infrastructure transfer",
        ],
    },
    {
        month: "Month 4",
        title: "Launch",
        color: "#5E8C6A",
        tasks: [
            "Official Winnipeg office launch event",
            "Final employee cohort moves",
            "Activate Manitoba provincial grants (if eligible)",
            "Close or wind down origin city lease",
            "Produce Year 1 savings report",
        ],
    },
];

const EMPLOYEE_CHECKLIST = [
    {
        category: "Winter Readiness",
        color: "#4C6E91",
        items: [
            { label: "Install block heater on vehicle", done: false },
            { label: "Source winter clothing package (parka, boots, mitts)", done: false },
            { label: "Plug-in parking at office or home", done: false },
            { label: "CAA Manitoba membership", done: false },
        ],
    },
    {
        category: "Provincial Switches",
        color: "#C8A44D",
        items: [
            { label: "Health card: switch to Manitoba Health (90-day wait waived for new residents)", done: false },
            { label: "Driver's licence: province-to-province exchange", done: false },
            { label: "Vehicle plates: Ontario/BC → Manitoba Public Insurance (MPI)", done: false },
            { label: "Update federal address for Canada Revenue Agency", done: false },
        ],
    },
    {
        category: "Local Services",
        color: "#5E8C6A",
        items: [
            { label: "Manitoba Hydro connection (typically under $120/mo avg)", done: false },
            { label: "Winnipeg Public Library card (free)", done: false },
            { label: "Register with neighbourhood community league", done: false },
            { label: "Find family doctor (College of Physicians directory)", done: false },
        ],
    },
];

const DISCOVERY_ITINERARY = [
    {
        day: "Day 1",
        title: "The Urban Core",
        color: "#B23A2B",
        items: [
            { time: "Morning", label: "Check in to The Fort Garry Hotel (Exchange District)" },
            { time: "Afternoon", label: "Walking tour of Exchange District heritage buildings" },
            { time: "Late Afternoon", label: "Canadian Museum for Human Rights + The Forks Market" },
            { time: "Evening", label: "Dinner at 529 Wellington or Deer + Almond" },
            { time: "Night", label: "Cocktails at Patent 5 Distillery" },
        ],
    },
    {
        day: "Day 2",
        title: "Neighbourhoods & Nature",
        color: "#5E8C6A",
        items: [
            { time: "Morning", label: "Breakfast in Osborne Village (Stella's Café)" },
            { time: "Late Morning", label: "Drive-through residential neighbourhoods: River Heights, Tuxedo, Wolseley" },
            { time: "Afternoon", label: "Assiniboine Park + Zoo + Leo Mol Sculpture Garden" },
            { time: "Late Afternoon", label: "True North Square & office district preview" },
            { time: "Evening", label: "Dinner at Clementine or Mise" },
        ],
    },
];

const SEASONAL_EVENTS = [
    { name: "Festival du Voyageur", when: "February", tagColor: "#4C6E91" },
    { name: "Jazz Winnipeg Festival", when: "June", tagColor: "#C8A44D" },
    { name: "Fringe Theatre Festival", when: "July", tagColor: "#5E8C6A" },
    { name: "Folklorama", when: "August", tagColor: "#D89C3D" },
    { name: "Nuit Blanche", when: "February", tagColor: "#B23A2B" },
];

export default function MigrationBoardPage() {
    return (
        <div className="p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <SectionHeader
                    eyebrow="Migration Planner"
                    title="Your Relocation Roadmap"
                    subtitle="Three integrated tracks to move your company, your people, and your leaders."
                />
                <PillButton
                    onClick={() => window.print()}
                    variant="secondary"
                    icon
                >
                    <Download size={14} />
                    Export Plan
                </PillButton>
            </div>

            <TabsPrimitive.Root defaultValue="business" className="flex flex-col gap-5">
                <TabsPrimitive.List className="flex gap-1 bg-river-slate/50 p-1 rounded-xl w-fit flex-wrap">
                    {[
                        { value: "business", label: "Business Track" },
                        { value: "employee", label: "Employee Track" },
                        { value: "discovery", label: "Discovery Track" },
                    ].map((t) => (
                        <TabsPrimitive.Trigger
                            key={t.value}
                            value={t.value}
                            className="px-5 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-exchange-brick data-[state=active]:text-white data-[state=inactive]:text-concrete-gray data-[state=inactive]:hover:text-frost-white"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            {t.label}
                        </TabsPrimitive.Trigger>
                    ))}
                </TabsPrimitive.List>

                {/* Business Track */}
                <TabsPrimitive.Content value="business" className="outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {BUSINESS_PHASES.map((phase) => (
                            <DataCard key={phase.month}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div
                                        className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                        style={{
                                            background: phase.color + "22",
                                            color: phase.color,
                                            fontFamily: "var(--font-ibm-mono)",
                                        }}
                                    >
                                        {phase.month}
                                    </div>
                                    <h3
                                        className="text-sm font-semibold text-frost-white"
                                        style={{ fontFamily: "var(--font-ibm-sans)" }}
                                    >
                                        {phase.title}
                                    </h3>
                                </div>
                                <ul className="space-y-2.5">
                                    {phase.tasks.map((task) => (
                                        <li key={task} className="flex items-start gap-2">
                                            <div
                                                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                                style={{ background: phase.color }}
                                            />
                                            <p
                                                className="text-[13px] text-frost-white/80 leading-snug"
                                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                                            >
                                                {task}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </DataCard>
                        ))}
                    </div>

                    <div className="mt-4">
                        <InsightBanner variant="insight">
                            Manitoba&apos;s Business Immigration Program and the{" "}
                            <strong style={{ color: "#D89C3D" }}>Manitoba Start Program</strong> offer navigated pathways for
                            companies registering from other provinces. Economic Development Winnipeg provides free concierge
                            onboarding for qualifying relocations.
                        </InsightBanner>
                    </div>
                </TabsPrimitive.Content>

                {/* Employee Track */}
                <TabsPrimitive.Content value="employee" className="outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {EMPLOYEE_CHECKLIST.map((section) => (
                            <ChecklistSection key={section.category} section={section} />
                        ))}
                    </div>

                    <div className="mt-4">
                        <InsightBanner variant="tip">
                            Manitoba offers a <strong style={{ color: "#4C6E91" }}>3-month health card wait period waiver</strong>{" "}
                            for employees transferring from other Canadian provinces. All utility hookups in Winnipeg can
                            typically be arranged within 48 hours.
                        </InsightBanner>
                    </div>
                </TabsPrimitive.Content>

                {/* Discovery Track */}
                <TabsPrimitive.Content value="discovery" className="outline-none">
                    <div className="mb-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Plane size={16} className="text-exchange-brick" />
                            <h3
                                className="text-base font-semibold text-frost-white"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                Executive Winnipeg Discovery Weekend
                            </h3>
                        </div>
                        <p
                            className="text-[13px] text-concrete-gray max-w-xl mb-5"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            Before any decision is final, we recommend your executive team spend two days experiencing
                            Winnipeg firsthand. This curated itinerary is designed for leaders, not tourists.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                        {DISCOVERY_ITINERARY.map((day) => (
                            <DataCard key={day.day}>
                                <div
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-4"
                                    style={{
                                        background: day.color + "22",
                                        color: day.color,
                                        fontFamily: "var(--font-ibm-mono)",
                                    }}
                                >
                                    <Calendar size={11} />
                                    {day.day} — {day.title}
                                </div>
                                <ul className="space-y-3">
                                    {day.items.map((item) => (
                                        <li key={item.label} className="flex items-start gap-2.5">
                                            <span
                                                className="text-[11px] font-semibold w-20 flex-shrink-0 mt-0.5"
                                                style={{ color: day.color, fontFamily: "var(--font-ibm-mono)" }}
                                            >
                                                {item.time}
                                            </span>
                                            <p
                                                className="text-[13px] text-frost-white/85 leading-snug"
                                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                                            >
                                                {item.label}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </DataCard>
                        ))}
                    </div>

                    {/* Seasonal events */}
                    <DataCard>
                        <p
                            className="text-[11px] uppercase tracking-widest text-concrete-gray font-semibold mb-3"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            Seasonal Overlay — Plan Around
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {SEASONAL_EVENTS.map((ev) => (
                                <div
                                    key={ev.name}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px]"
                                    style={{
                                        borderColor: ev.tagColor + "33",
                                        background: ev.tagColor + "11",
                                        fontFamily: "var(--font-ibm-sans)",
                                    }}
                                >
                                    <span style={{ color: ev.tagColor }} className="font-semibold">{ev.when}</span>
                                    <span className="text-concrete-gray">·</span>
                                    <span className="text-frost-white/80">{ev.name}</span>
                                </div>
                            ))}
                        </div>
                    </DataCard>

                    <div className="mt-4">
                        <InsightBanner variant="insight">
                            Economic Development Winnipeg offers complimentary concierge services for executive discovery
                            visits, including neighbourhood tours, commercial real estate previews, and introductions to
                            local business leaders.
                        </InsightBanner>
                    </div>
                </TabsPrimitive.Content>
            </TabsPrimitive.Root>
        </div>
    );
}

function ChecklistSection({
    section,
}: {
    section: (typeof EMPLOYEE_CHECKLIST)[0];
}) {
    const [items, setItems] = useState(section.items);

    return (
        <DataCard>
            <div className="flex items-center gap-2 mb-4">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: section.color }}
                />
                <p
                    className="text-sm font-semibold text-frost-white"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    {section.category}
                </p>
            </div>
            <ul className="space-y-2.5">
                {items.map((item, i) => (
                    <li
                        key={item.label}
                        className="flex items-start gap-2.5 cursor-pointer group"
                        onClick={() => {
                            const next = [...items];
                            next[i] = { ...item, done: !item.done };
                            setItems(next);
                        }}
                    >
                        {item.done ? (
                            <CheckCircle2
                                size={16}
                                className="flex-shrink-0 mt-0.5"
                                style={{ color: section.color }}
                            />
                        ) : (
                            <Circle
                                size={16}
                                className="flex-shrink-0 mt-0.5 text-concrete-gray/40 group-hover:text-concrete-gray transition-colors"
                            />
                        )}
                        <p
                            className={[
                                "text-[13px] leading-snug transition-colors",
                                item.done ? "line-through text-concrete-gray/50" : "text-frost-white/85",
                            ].join(" ")}
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            {item.label}
                        </p>
                    </li>
                ))}
            </ul>
        </DataCard>
    );
}
