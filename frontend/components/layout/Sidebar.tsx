"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2,
    Map,
    MapPin,
    Calculator,
    ClipboardList,
    Train,
    Sun,
    Compass,
    Database,
    CheckCircle2,
    Circle,
} from "lucide-react";

const PAGES = [
    { id: 1, href: "/onboarding", label: "Company Profile", icon: Building2 },
    { id: 2, href: "/mirror-map", label: "City Comparison", icon: Map },
    { id: 3, href: "/hotspot-map", label: "Hotspot Map", icon: MapPin },
    { id: 4, href: "/budget-simulator", label: "Budget Simulator", icon: Calculator },
    { id: 5, href: "/migration-board", label: "Migration Planner", icon: ClipboardList },
    { id: 6, href: "/commute", label: "Commute Analysis", icon: Train },
    { id: 7, href: "/four-seasons", label: "Life in Winnipeg", icon: Sun },
    { id: 8, href: "/discovery-weekend", label: "Discovery Weekend", icon: Compass },
    { id: 9, href: "/data-transparency", label: "Data Sources", icon: Database },
];

interface SidebarProps {
    collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
    const pathname = usePathname();

    const currentIndex = PAGES.findIndex((p) => p.href === `/${pathname.split("/")[1]}`);

    return (
        <aside
            className="fixed left-0 top-16 bottom-0 z-40 flex flex-col border-r border-river-slate bg-prairie-blue transition-all duration-300 ease-in-out overflow-hidden"
            style={{ width: collapsed ? "56px" : "224px" }}
        >
            {/* Progress label */}
            <AnimatePresence initial={false}>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="px-4 pt-6 pb-3"
                    >
                        <p
                            className="text-[10px] font-semibold uppercase tracking-widest text-concrete-gray"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            Relocation Plan
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Nav items */}
            <nav className="flex flex-col gap-0.5 px-2 flex-1 pt-4">
                {PAGES.map((page, idx) => {
                    const Icon = page.icon;
                    const isActive = pathname === page.href || pathname.startsWith(page.href + "/");
                    const isCompleted = idx < currentIndex;

                    return (
                        <Link
                            key={page.id}
                            href={page.href}
                            className={[
                                "group relative flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-all duration-150 no-underline",
                                isActive
                                    ? "bg-exchange-brick/15 text-frost-white"
                                    : isCompleted
                                        ? "text-concrete-gray hover:bg-river-slate/60 hover:text-frost-white"
                                        : "text-concrete-gray/60 hover:bg-river-slate/40 hover:text-concrete-gray",
                            ].join(" ")}
                        >
                            {/* Active indicator bar */}
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-exchange-brick" />
                            )}

                            {/* Step number / icon */}
                            <div
                                className={[
                                    "relative flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold transition-colors",
                                    isActive
                                        ? "bg-exchange-brick text-white"
                                        : isCompleted
                                            ? "bg-river-slate text-lake-green"
                                            : "bg-river-slate/50 text-concrete-gray",
                                ].join(" ")}
                                style={{ fontFamily: "var(--font-ibm-mono)" }}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 size={14} />
                                ) : isActive ? (
                                    <Icon size={14} />
                                ) : (
                                    <span>{page.id}</span>
                                )}
                            </div>

                            {/* Label */}
                            <AnimatePresence initial={false}>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -4 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -4 }}
                                        transition={{ duration: 0.15 }}
                                        className="text-[13px] font-medium whitespace-nowrap overflow-hidden"
                                        style={{ fontFamily: "var(--font-ibm-sans)" }}
                                    >
                                        {page.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom brand mark */}
            <AnimatePresence initial={false}>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-4 pb-6 pt-4 border-t border-river-slate/50 mt-auto"
                    >
                        <p className="text-[11px] text-concrete-gray/60 leading-relaxed" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                            Powered by open data.
                            <br />
                            Every figure is sourced.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </aside>
    );
}
