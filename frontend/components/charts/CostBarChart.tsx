"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface CostBarChartProps {
    metric: "costIndex" | "officeSqft" | "homePrice" | "avgCommute";
    highlightCity?: string;
}

const CITY_COLORS: Record<string, string> = {
    toronto: "#8B98A5",
    vancouver: "#4C6E91",
    montreal: "#5E8C6A",
    winnipeg: "#B23A2B",
};

const METRICS: Record<
    string,
    {
        label: string;
        format: (v: number) => string;
        data: Record<string, number>;
    }
> = {
    costIndex: {
        label: "Cost of Living Index",
        format: (v) => `${v}`,
        data: { toronto: 142, vancouver: 156, montreal: 118, winnipeg: 88 },
    },
    officeSqft: {
        label: "Office Rent ($/sqft/mo)",
        format: (v) => `$${v}`,
        data: { toronto: 42, vancouver: 48, montreal: 28, winnipeg: 16 },
    },
    homePrice: {
        label: "Avg Home Price ($K)",
        format: (v) => `$${(v / 1000).toFixed(0)}K`,
        data: { toronto: 1100, vancouver: 1400, montreal: 650, winnipeg: 350 },
    },
    avgCommute: {
        label: "Avg Commute (min)",
        format: (v) => `${v} min`,
        data: { toronto: 75, vancouver: 62, montreal: 52, winnipeg: 20 },
    },
};

export default function CostBarChart({
    metric = "costIndex",
    highlightCity = "winnipeg",
}: CostBarChartProps) {
    const m = METRICS[metric];
    const cities = Object.keys(m.data);

    const data = {
        labels: cities.map((c) => c.charAt(0).toUpperCase() + c.slice(1)),
        datasets: [
            {
                label: m.label,
                data: cities.map((c) => m.data[c]),
                backgroundColor: cities.map((c) =>
                    c === highlightCity
                        ? CITY_COLORS[c]
                        : CITY_COLORS[c] + "99"
                ),
                borderColor: cities.map((c) =>
                    c === highlightCity ? CITY_COLORS[c] : "transparent"
                ),
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#2F3E4F",
                titleColor: "#F2F5F7",
                bodyColor: "#C8A44D",
                padding: 10,
                borderColor: "rgba(255,255,255,0.1)",
                borderWidth: 1,
                callbacks: {
                    label: (ctx: { parsed: { y: number } }) => ` ${m.format(ctx.parsed.y)}`,
                },
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(255,255,255,0.04)" },
                ticks: {
                    color: "#8B98A5",
                    font: { family: "'IBM Plex Sans', sans-serif", size: 12 },
                },
                border: { color: "rgba(255,255,255,0.04)" },
            },
            y: {
                grid: { color: "rgba(255,255,255,0.06)" },
                ticks: {
                    color: "#8B98A5",
                    font: { family: "'IBM Plex Mono', monospace", size: 11 },
                    callback: (v: number | string) => m.format(Number(v)),
                },
                border: { color: "rgba(255,255,255,0.04)" },
            },
        },
    };

    return <Bar data={data} options={options as Parameters<typeof Bar>[0]["options"]} />;
}
