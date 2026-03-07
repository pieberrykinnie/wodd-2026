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

const COMMUTE_DATA = {
    labels: ["Toronto", "Vancouver", "Montréal", "Winnipeg"],
    avgMins: [75, 62, 52, 20],
    pctOver60: [52, 38, 29, 4],
    annualHoursLost: [250, 207, 173, 67],
    colors: ["#8B98A5", "#4C6E91", "#5E8C6A", "#B23A2B"],
};

type ChartMode = "avg" | "over60" | "hours";

interface CommuteChartProps {
    mode?: ChartMode;
}

const MODE_CONFIG: Record<ChartMode, {
    label: string;
    key: keyof Omit<typeof COMMUTE_DATA, "labels" | "colors">;
    format: (v: number) => string;
}> = {
    avg: { label: "Average Commute (minutes)", key: "avgMins", format: (v) => `${v} min` },
    over60: { label: "% Commuters Over 60 Min", key: "pctOver60", format: (v) => `${v}%` },
    hours: { label: "Annual Hours Lost to Commute", key: "annualHoursLost", format: (v) => `${v} hrs` },
};

export default function CommuteChart({ mode = "avg" }: CommuteChartProps) {
    const config = MODE_CONFIG[mode];
    const values = COMMUTE_DATA[config.key] as number[];

    const data = {
        labels: COMMUTE_DATA.labels,
        datasets: [
            {
                label: config.label,
                data: values,
                backgroundColor: COMMUTE_DATA.colors.map((c, i) =>
                    COMMUTE_DATA.labels[i] === "Winnipeg" ? c : c + "99"
                ),
                borderColor: COMMUTE_DATA.colors.map((c, i) =>
                    COMMUTE_DATA.labels[i] === "Winnipeg" ? c : "transparent"
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
                callbacks: {
                    label: (ctx: { parsed: { y: number } }) => ` ${config.format(ctx.parsed.y)}`,
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
                    callback: (v: number | string) => config.format(Number(v)),
                },
                border: { color: "rgba(255,255,255,0.04)" },
            },
        },
    };

    return <Bar data={data} options={options as Parameters<typeof Bar>[0]["options"]} />;
}
