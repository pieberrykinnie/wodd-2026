"use client";

import { useState } from "react";
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
    ease: "easeInOut",
    duration: 0.25,
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-prairie-blue grain">
            <TopNav onMenuToggle={() => setSidebarCollapsed((v) => !v)} />
            <Sidebar collapsed={sidebarCollapsed} />

            {/* Main content, offset by sidebar width */}
            <main
                className="pt-16 min-h-screen transition-all duration-300 ease-in-out"
                style={{ marginLeft: sidebarCollapsed ? "56px" : "224px" }}
            >
                <motion.div
                    key={typeof window !== "undefined" ? window.location.pathname : "page"}
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
