"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useCompanyStore } from "@/store/useCompanyStore";
import { Check } from "lucide-react";

const WIZARD_STEPS = [
    { id: 1, href: "/onboarding", label: "Company Profile" },
    { id: 2, href: "/budget-simulator", label: "Budget Simulator" },
];

export default function StepNav() {
    const pathname = usePathname();
    const { hasOnboarded } = useCompanyStore();

    const visibleSteps = WIZARD_STEPS.filter((s) => s.id === 1 || hasOnboarded);

    const currentIdx = WIZARD_STEPS.findIndex(
        (s) => pathname === s.href || pathname.startsWith(s.href + "/")
    );

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6"
            style={{ background: "#FFFFFF", borderBottom: "1px solid #E8EDF2" }}
        >
            {/* Wordmark */}
            <Link href="/onboarding" className="flex-shrink-0 no-underline">
                <Image
                    src="/logo-transparent-bg.png"
                    alt="Winnipeg Relocation"
                    width={120}
                    height={32}
                    className="h-8 w-auto object-contain"
                    priority
                />
            </Link>

            {/* Step indicators */}
            <div className="flex items-center gap-1 mx-auto">
                {visibleSteps.map((step, idx) => {
                    const stepIdx = WIZARD_STEPS.indexOf(step);
                    const isActive = stepIdx === currentIdx;
                    const isDone = stepIdx < currentIdx;
                    const isClickable = isDone || isActive;

                    const indicator = (
                        <div className="flex items-center gap-2.5">
                            {/* Circle */}
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all duration-300"
                                style={{
                                    background: isActive
                                        ? "#B23A2B"
                                        : isDone
                                            ? "rgba(178,58,43,0.1)"
                                            : "#F1F4F7",
                                    color: isActive ? "#fff" : isDone ? "#B23A2B" : "#94A3B8",
                                    boxShadow: isActive ? "0 0 0 3px rgba(178,58,43,0.15)" : "none",
                                }}
                            >
                                {isDone ? <Check size={11} strokeWidth={2.5} /> : step.id}
                            </div>
                            {/* Label */}
                            <span
                                className="text-[13px] font-medium hidden sm:block transition-colors duration-300"
                                style={{
                                    fontFamily: "var(--font-ibm-sans)",
                                    color: isActive
                                        ? "#0F1823"
                                        : isDone
                                            ? "#64748B"
                                            : "#94A3B8",
                                }}
                            >
                                {step.label}
                            </span>
                        </div>
                    );

                    return (
                        <div key={step.id} className="flex items-center">
                            {idx > 0 && (
                                <div
                                    className="relative mx-4 h-px overflow-hidden rounded-full"
                                    style={{ width: "64px", background: "#E8EDF2" }}
                                >
                                    <motion.div
                                        className="absolute inset-y-0 left-0 rounded-full"
                                        style={{ background: "#B23A2B" }}
                                        initial={false}
                                        animate={{ width: isDone ? "100%" : "0%" }}
                                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                                    />
                                </div>
                            )}
                            {isClickable ? (
                                <Link href={step.href} className="no-underline">
                                    {indicator}
                                </Link>
                            ) : (
                                <div>{indicator}</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Right spacer to keep steps centred */}
            <div className="flex-shrink-0" style={{ width: "148px" }} />
        </nav>
    );
}
