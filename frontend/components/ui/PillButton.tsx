"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface PillButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    variant?: "primary" | "secondary" | "ghost";
    icon?: boolean;
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit";
}

export default function PillButton({
    children,
    onClick,
    variant = "primary",
    icon = false,
    disabled = false,
    className = "",
    type = "button",
}: PillButtonProps) {
    const base =
        "inline-flex items-center gap-2 rounded font-semibold text-sm px-6 py-3 transition-all duration-200 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-exchange-brick focus-visible:ring-offset-2 focus-visible:ring-offset-prairie-blue disabled:opacity-40 disabled:cursor-not-allowed";

    const variants = {
        primary:
            "bg-exchange-brick text-white hover:bg-[#A07A2F] active:scale-[0.97] shadow-lg shadow-exchange-brick/20",
        secondary:
            "bg-river-slate text-frost-white border border-river-slate-l hover:bg-river-slate-l active:scale-[0.97]",
        ghost:
            "bg-transparent text-concrete-gray border border-concrete-gray/30 hover:border-frost-white/40 hover:text-frost-white active:scale-[0.97]",
    };

    return (
        <motion.button
            whileHover={disabled ? {} : { y: -1 }}
            whileTap={disabled ? {} : { scale: 0.97 }}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={[base, variants[variant], className].join(" ")}
            style={{ fontFamily: "var(--font-ibm-sans)" }}
        >
            {children}
            {icon && <ArrowRight size={16} />}
        </motion.button>
    );
}
