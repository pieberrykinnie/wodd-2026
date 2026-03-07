"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useCompanyStore } from "@/store/useCompanyStore";
import CitySearchInput, { type CityResult } from "@/components/ui/CitySearchInput";
import { getCities } from "@/lib/api";
import PillButton from "@/components/ui/PillButton";
import { Building2, Users, Briefcase, MapPin, DollarSign } from "lucide-react";
import Select, { StylesConfig } from "react-select";

const CanadaMap = dynamic(() => import("@/components/maps/CanadaMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-river-slate rounded flex items-center justify-center">
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

const INDUSTRY_OPTIONS = INDUSTRIES.map((i) => ({ value: i, label: i }));

type IndustryOption = { value: string; label: string };

const industrySelectStyles: StylesConfig<IndustryOption> = {
    control: (base, state) => ({
        ...base,
        backgroundColor: "#F1F4F7",
        border: `1px solid ${state.isFocused ? "rgba(185,148,69,0.45)" : "#E8EDF2"}`,
        borderRadius: "0.25rem",
        padding: "6px 4px",
        boxShadow: state.isFocused ? "0 0 0 3px rgba(185,148,69,0.12)" : "none",
        fontFamily: "var(--font-ibm-sans)",
        fontSize: "0.875rem",
        cursor: "pointer",
        transition: "border-color 0.15s",
        "&:hover": {
            borderColor: "rgba(185,148,69,0.4)",
        },
    }),
    placeholder: (base) => ({
        ...base,
        color: "rgba(100,116,139,0.55)",
        fontFamily: "var(--font-ibm-sans)",
        fontSize: "0.875rem",
    }),
    singleValue: (base) => ({
        ...base,
        color: "#0F1823",
        fontFamily: "var(--font-ibm-sans)",
        fontSize: "0.875rem",
    }),
    input: (base) => ({
        ...base,
        color: "#0F1823",
        fontFamily: "var(--font-ibm-sans)",
        fontSize: "0.875rem",
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: "#F1F4F7",
        border: "1px solid #E8EDF2",
        borderRadius: "0.375rem",
        boxShadow: "0 4px 16px rgba(15,24,35,0.08)",
        overflow: "hidden",
        zIndex: 10,
    }),
    menuList: (base) => ({
        ...base,
        padding: "4px",
        maxHeight: "220px",
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? "rgba(185,148,69,0.14)"
            : state.isFocused
                ? "rgba(185,148,69,0.08)"
                : "transparent",
        color: state.isSelected ? "#4C6E91" : "#0F1823",
        fontFamily: "var(--font-ibm-sans)",
        fontSize: "0.875rem",
        borderRadius: "0.25rem",
        padding: "8px 12px",
        cursor: "pointer",
        fontWeight: state.isSelected ? 600 : 400,
        "&:active": {
            backgroundColor: "rgba(185,148,69,0.18)",
        },
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? "#4C6E91" : "#64748B",
        transition: "color 0.15s, transform 0.2s",
        transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
        padding: "0 8px",
        "&:hover": { color: "#4C6E91" },
    }),
};

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



export default function OnboardingPage() {
    const router = useRouter();
    const store = useCompanyStore();

    const [form, setForm] = useState({
        companyName: store.companyName || "",
        currentCity: store.city || "",
        currentCityCoords: store.cityCoords as [number, number] | null,
        industry: store.industry || "",
        employees: store.employees || 50,
        salaryBand: store.salaryBand || "$75K–$100K",
    });
    // Sync form from persisted store after localStorage hydrates
    useEffect(() => {
        const s = useCompanyStore.getState();
        if (!s.companyName && !s.industry) return;
        setForm((f) => ({
            ...f,
            companyName: s.companyName || f.companyName,
            currentCity: s.city || f.currentCity,
            currentCityCoords: s.cityCoords || f.currentCityCoords,
            industry: s.industry || f.industry,
            employees: s.employees || f.employees,
            salaryBand: s.salaryBand || f.salaryBand,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const set = (k: string, v: string | number) =>
        setForm((f) => ({ ...f, [k]: v }));
    const handleCitySelect = (result: CityResult) =>
        setForm((f) => ({ ...f, currentCity: result.label, currentCityCoords: result.coords }));
    const handleCityClear = () =>
        setForm((f) => ({ ...f, currentCity: "", currentCityCoords: null }));

    const cityName = form.currentCity.split(",")[0].trim() || "Toronto";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const label = form.currentCity.trim() || "Toronto";
        const firstWord = label.split(",")[0].trim().toLowerCase();
        const knownCity = getCities().find((c) => c.id === firstWord || c.name.toLowerCase() === firstWord);
        const derivedCityId = knownCity ? knownCity.id : firstWord.replace(/[^a-z0-9]/g, "-");
        store.setProfile({
            companyName: form.companyName,
            city: label,
            cityId: derivedCityId,
            cityCoords: form.currentCityCoords,
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
            <div className="w-[30%] overflow-y-auto px-8 py-10 flex flex-col">
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
                        WinLocation
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
                            className="w-full bg-river-slate border border-river-slate-l rounded px-4 py-3 text-frost-white text-sm outline-none focus:border-exchange-brick/40 transition-colors placeholder:text-concrete-gray/50"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                            required
                        />
                    </FormGroup>

                    {/* Current City */}
                    <FormGroup label="Current City" icon={<MapPin size={15} />}>
                        <CitySearchInput
                            value={form.currentCity}
                            onSelect={handleCitySelect}
                            onClear={handleCityClear}
                            placeholder="e.g. Toronto, ON"
                            required
                        />
                    </FormGroup>

                    {/* Industry */}
                    <FormGroup label="Industry" icon={<Briefcase size={15} />}>
                        <Select<IndustryOption>
                            options={INDUSTRY_OPTIONS}
                            value={form.industry ? { value: form.industry, label: form.industry } : null}
                            onChange={(opt) => set("industry", opt?.value ?? "")}
                            placeholder="Select your industry"
                            styles={industrySelectStyles}
                            isSearchable
                            instanceId="industry-select"
                        />
                    </FormGroup>

                    {/* Employees */}
                    <FormGroup label="Employees Relocating" icon={<Users size={15} />}>
                        <div className="flex gap-2">
                            {[10, 25, 50, 100, 250].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => set("employees", n)}
                                    className="flex-1 py-2.5 rounded text-sm font-semibold border transition-all"
                                    style={{
                                        fontFamily: "var(--font-ibm-mono)",
                                        background:
                                            form.employees === n ? "rgba(178,58,43,0.1)" : "#F1F4F7",
                                        color: form.employees === n ? "#B23A2B" : "#64748B",
                                        borderColor:
                                            form.employees === n ? "#B23A2B" : "#E2E8F0",
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
                            className="mt-2 w-full bg-river-slate border border-river-slate-l rounded px-4 py-2 text-frost-white text-sm outline-none focus:border-exchange-brick/40"
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
                                    className="py-2.5 px-3 rounded text-sm border transition-all text-left"
                                    style={{
                                        fontFamily: "var(--font-ibm-sans)",
                                        background:
                                            form.salaryBand === b ? "rgba(178,58,43,0.08)" : "#F1F4F7",
                                        color: form.salaryBand === b ? "#B23A2B" : "#64748B",
                                        borderColor:
                                            form.salaryBand === b ? "#B23A2B" : "#E2E8F0",
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

                {/* Cost index explainer */}
                <div className="mt-8 max-w-lg p-4 bg-river-slate rounded border border-black/5">
                    <p
                        className="text-[11px] font-semibold uppercase tracking-widest text-exchange-brick mb-2"
                        style={{ fontFamily: "var(--font-ibm-sans)" }}
                    >
                        About the Cost Index
                    </p>
                    <p
                        className="text-[13px] text-concrete-gray leading-relaxed"
                        style={{ fontFamily: "var(--font-ibm-sans)" }}
                    >
                        The <span className="text-frost-white font-medium">Cost Index</span> is a composite score from{" "}
                        <span className="text-frost-white font-medium">1 to 10</span> that aggregates office lease rates,
                        residential rent, transit costs, and municipal tax burden into a single comparable number.
                        A <span className="text-frost-white font-medium">lower score means lower cost of business</span>.
                        Winnipeg consistently scores among the lowest of any major Canadian city.
                    </p>
                </div>
            </div>

            {/* ── Right: Canada Map (1/3) ── */}
            <div className="hidden lg:block flex-1 p-4">
                <CanadaMap flyToCoords={form.currentCityCoords ?? undefined} />
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
