"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useCompanyStore } from "@/store/useCompanyStore";
import PillButton from "@/components/ui/PillButton";
import { Building2, Users, Briefcase, MapPin, DollarSign } from "lucide-react";

const CanadaMap = dynamic(() => import("@/components/maps/CanadaMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-river-slate rounded-xl flex items-center justify-center">
            <p className="text-concrete-gray text-sm" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                Loading map…
            </p>
        </div>
    ),
});

const INDUSTRIES = [
    "Technology",
    "Financial Services",
    "Consulting",
    "Healthcare",
    "Legal",
    "Engineering",
    "Media & Creative",
    "Government",
    "Non-Profit",
    "Other",
];

const SALARY_BANDS = [
    "Under $50K",
    "$50K–$75K",
    "$75K–$100K",
    "$100K–$150K",
    "$150K+",
];

const SALARY_MIDPOINTS: Record<string, number> = {
    "Under $50K": 40000,
    "$50K–$75K": 62500,
    "$75K–$100K": 87500,
    "$100K–$150K": 125000,
    "$150K+": 175000,
};

const SUPPORTED_CITIES: { id: string; label: string }[] = [
    { id: "toronto", label: "Toronto" },
    { id: "vancouver", label: "Vancouver" },
    { id: "montreal", label: "Montréal" },
];

const COST_INDEX_MAP: Record<string, number> = {
    toronto: 142,
    vancouver: 156,
    montreal: 118,
    winnipeg: 88,
};

export default function OnboardingPage() {
    const router = useRouter();
    const store = useCompanyStore();

    const [form, setForm] = useState({
        companyName: store.companyName || "",
        cityId: store.cityId || "toronto",
        industry: store.industry || "",
        employees: store.employees || 50,
        salaryBand: store.salaryBand || "$75K–$100K",
    });

    const set = (k: string, v: string | number) =>
        setForm((f) => ({ ...f, [k]: v }));

    const cityName = SUPPORTED_CITIES.find((c) => c.id === form.cityId)?.label ?? "Toronto";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        store.setProfile({
            companyName: form.companyName,
            city: cityName,
            cityId: form.cityId,
            industry: form.industry,
            employees: Number(form.employees),
            salaryBand: form.salaryBand,
            avgSalary: SALARY_MIDPOINTS[form.salaryBand] ?? 87500,
        });
        store.setHasOnboarded(true);
        router.push("/mirror-map");
    };

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* ── Left: Form (2/3) ── */}
            <div className="w-full lg:w-[58%] overflow-y-auto px-8 py-10 flex flex-col">
                {/* Hero text */}
                <div className="mb-10">
                    <p
                        className="text-[11px] font-semibold uppercase tracking-widest text-exchange-brick mb-3"
                        style={{ fontFamily: "var(--font-ibm-sans)" }}
                    >
                        Winnipeg Relocation Intelligence
                    </p>
                    <h1
                        className="text-4xl md:text-[2.75rem] font-bold text-frost-white leading-tight mb-4"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        The Winnipeg Arbitrage
                    </h1>
                    <p
                        className="text-[15px] text-concrete-gray leading-relaxed max-w-lg"
                        style={{ fontFamily: "var(--font-ibm-sans)" }}
                    >
                        You&apos;re not just moving to Winnipeg. You&apos;re escaping a city that&apos;s
                        quietly draining your company and your people.
                    </p>
                </div>

                {/* Onboarding form */}
                <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
                    {/* Company Name */}
                    <FormGroup label="Company Name" icon={<Building2 size={15} />}>
                        <input
                            type="text"
                            value={form.companyName}
                            onChange={(e) => set("companyName", e.target.value)}
                            placeholder="e.g. Acme Technologies Inc."
                            className="w-full bg-river-slate border border-white/10 rounded-lg px-4 py-3 text-frost-white text-sm outline-none focus:border-cool-blue/60 transition-colors placeholder:text-concrete-gray/50"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                            required
                        />
                    </FormGroup>

                    {/* Current City */}
                    <FormGroup label="Current City" icon={<MapPin size={15} />}>
                        <div className="flex gap-2">
                            {SUPPORTED_CITIES.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => set("cityId", c.id)}
                                    className="flex-1 py-3 rounded-lg text-sm font-medium border transition-all"
                                    style={{
                                        fontFamily: "var(--font-ibm-sans)",
                                        background:
                                            form.cityId === c.id ? "#B23A2B" : "rgba(47,62,79,0.8)",
                                        color: form.cityId === c.id ? "#fff" : "#8B98A5",
                                        borderColor:
                                            form.cityId === c.id ? "#B23A2B" : "rgba(255,255,255,0.08)",
                                    }}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </FormGroup>

                    {/* Industry */}
                    <FormGroup label="Industry" icon={<Briefcase size={15} />}>
                        <select
                            value={form.industry}
                            onChange={(e) => set("industry", e.target.value)}
                            className="w-full bg-river-slate border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-cool-blue/60 transition-colors appearance-none"
                            style={{
                                fontFamily: "var(--font-ibm-sans)",
                                color: form.industry ? "#F2F5F7" : "#8B98A5",
                            }}
                        >
                            <option value="" disabled>
                                Select your industry
                            </option>
                            {INDUSTRIES.map((i) => (
                                <option key={i} value={i}>
                                    {i}
                                </option>
                            ))}
                        </select>
                    </FormGroup>

                    {/* Employees */}
                    <FormGroup label="Employees Relocating" icon={<Users size={15} />}>
                        <div className="flex gap-2">
                            {[10, 25, 50, 100, 250].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => set("employees", n)}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all"
                                    style={{
                                        fontFamily: "var(--font-ibm-mono)",
                                        background:
                                            form.employees === n ? "rgba(178,58,43,0.25)" : "rgba(47,62,79,0.6)",
                                        color: form.employees === n ? "#B23A2B" : "#8B98A5",
                                        borderColor:
                                            form.employees === n ? "#B23A2B" : "rgba(255,255,255,0.08)",
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            min={1}
                            max={10000}
                            value={form.employees}
                            onChange={(e) => set("employees", parseInt(e.target.value) || 1)}
                            className="mt-2 w-full bg-river-slate border border-white/10 rounded-lg px-4 py-2 text-frost-white text-sm outline-none focus:border-cool-blue/60"
                            style={{ fontFamily: "var(--font-ibm-mono)" }}
                            placeholder="Or enter exact number"
                        />
                    </FormGroup>

                    {/* Salary Band */}
                    <FormGroup label="Average Salary Band" icon={<DollarSign size={15} />}>
                        <div className="grid grid-cols-2 gap-2">
                            {SALARY_BANDS.map((b) => (
                                <button
                                    key={b}
                                    type="button"
                                    onClick={() => set("salaryBand", b)}
                                    className="py-2.5 px-3 rounded-lg text-sm border transition-all text-left"
                                    style={{
                                        fontFamily: "var(--font-ibm-sans)",
                                        background:
                                            form.salaryBand === b ? "rgba(200,164,77,0.15)" : "rgba(47,62,79,0.6)",
                                        color: form.salaryBand === b ? "#C8A44D" : "#8B98A5",
                                        borderColor:
                                            form.salaryBand === b ? "#C8A44D" : "rgba(255,255,255,0.08)",
                                    }}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    </FormGroup>

                    {/* CTA */}
                    <div className="pt-2">
                        <PillButton type="submit" icon>
                            Show Me the Arbitrage
                        </PillButton>
                    </div>
                </form>

                {/* Cost index teaser */}
                <div className="mt-8 max-w-lg">
                    <div className="flex items-center gap-4 p-4 bg-river-slate rounded-xl border border-white/5">
                        <div className="text-center flex-1">
                            <p
                                className="text-2xl font-semibold"
                                style={{ fontFamily: "var(--font-ibm-mono)", color: "#8B98A5" }}
                            >
                                {COST_INDEX_MAP[form.cityId] ?? 142}
                            </p>
                            <p
                                className="text-[11px] text-concrete-gray mt-0.5"
                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                            >
                                {cityName}: Cost Index
                            </p>
                        </div>
                        <div
                            className="text-concrete-gray text-lg font-bold"
                            style={{ fontFamily: "var(--font-ibm-mono)" }}
                        >
                            →
                        </div>
                        <div className="text-center flex-1">
                            <p
                                className="text-2xl font-semibold"
                                style={{ fontFamily: "var(--font-ibm-mono)", color: "#B23A2B" }}
                            >
                                88
                            </p>
                            <p
                                className="text-[11px] text-concrete-gray mt-0.5"
                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                            >
                                Winnipeg: Cost Index
                            </p>
                        </div>
                        <div
                            className="text-right flex-1 border-l border-white/10 pl-4"
                        >
                            <p
                                className="text-[22px] font-semibold"
                                style={{
                                    fontFamily: "var(--font-ibm-mono)",
                                    color: "#C8A44D",
                                }}
                            >
                                −{Math.round((1 - 88 / (COST_INDEX_MAP[form.cityId] ?? 142)) * 100)}%
                            </p>
                            <p
                                className="text-[11px] text-concrete-gray mt-0.5"
                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                            >
                                Cost reduction
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right: Canada Map (1/3) ── */}
            <div className="hidden lg:block flex-1 p-4">
                <CanadaMap activeCity={form.cityId} />
            </div>
        </div>
    );
}

function FormGroup({
    label,
    icon,
    children,
}: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label
                className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-concrete-gray mb-2"
                style={{ fontFamily: "var(--font-ibm-sans)" }}
            >
                <span className="text-concrete-gray/60">{icon}</span>
                {label}
            </label>
            {children}
        </div>
    );
}
