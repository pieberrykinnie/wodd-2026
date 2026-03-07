"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { formatCurrency } from "@/lib/calculations";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface SavingsChartProps {
    officeSavings: number;
    disposableIncrease: number;
    housingEquity: number;
}

export default function SavingsChart({
    officeSavings,
    disposableIncrease,
    housingEquity,
}: SavingsChartProps) {
    const data = {
        labels: ["Annual Office Savings", "Employee Disposable +", "Housing Equity Gain"],
        datasets: [
            {
                data: [officeSavings, disposableIncrease, housingEquity],
                backgroundColor: ["#B23A2B", "#C8A44D", "#5E8C6A"],
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const options = {
        indexAxis: "y" as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#2F3E4F",
                titleColor: "#F2F5F7",
                bodyColor: "#C8A44D",
                padding: 12,
                callbacks: {
                    label: (ctx: { parsed: { x: number } }) =>
                        ` ${formatCurrency(ctx.parsed.x)}`,
                },
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(255,255,255,0.05)" },
                ticks: {
                    color: "#8B98A5",
                    font: { family: "'IBM Plex Mono', monospace", size: 11 },
                    callback: (v: number | string) => formatCurrency(Number(v), true),
                },
                border: { color: "rgba(255,255,255,0.05)" },
            },
            y: {
                grid: { display: false },
                ticks: {
                    color: "#F2F5F7",
                    font: { family: "'IBM Plex Sans', sans-serif", size: 12 },
                },
                border: { color: "rgba(255,255,255,0.05)" },
            },
        },
    };

    return <Bar data={data} options={options as Parameters<typeof Bar>[0]["options"]} />;
}
