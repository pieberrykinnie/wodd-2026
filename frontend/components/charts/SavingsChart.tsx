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
                backgroundColor: ["#B99445", "#1D507A", "#49575E"],
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
                backgroundColor: "#FFFFFF",
                titleColor: "#0F1823",
                bodyColor: "#4C6E91",
                padding: 12,
                callbacks: {
                    label: (ctx: { parsed: { x: number } }) =>
                        ` ${formatCurrency(ctx.parsed.x)}`,
                },
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(0,0,0,0.06)" },
                ticks: {
                    color: "#64748B",
                    font: { family: "'IBM Plex Mono', monospace", size: 11 },
                    callback: (v: number | string) => formatCurrency(Number(v), true),
                },
                border: { color: "rgba(0,0,0,0.06)" },
            },
            y: {
                grid: { display: false },
                ticks: {
                    color: "#0F1823",
                    font: { family: "'IBM Plex Sans', sans-serif", size: 12 },
                },
                border: { color: "rgba(0,0,0,0.06)" },
            },
        },
    };

    return <Bar data={data} options={options as Parameters<typeof Bar>[0]["options"]} />;
}
