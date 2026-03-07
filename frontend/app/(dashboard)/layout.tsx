"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import TopNav from "@/components/layout/TopNav";
import Sidebar from "@/components/layout/Sidebar";

const pageVariants = {
    initial: { opacity: 0, y: 8 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -8 },
};

const pageTransition = {
    type: "tween" as const,
    ease: "easeInOut" as const,
    duration: 0.25,
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

    const sidebarWidth = sidebarCollapsed ? 56 : 224;

    return (
        <div className="min-h-screen bg-prairie-blue">
            <TopNav onMenuToggle={() => setSidebarCollapsed((c) => !c)} />
            <Sidebar collapsed={sidebarCollapsed} />
            <main
                className="pt-16 min-h-screen transition-all duration-300 ease-in-out"
                style={{ paddingLeft: sidebarWidth }}
            >
                <motion.div
                    key={pathname}
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    className="min-h-[calc(100vh-4rem)]"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
