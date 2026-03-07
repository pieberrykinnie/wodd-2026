"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { useCompanyStore } from "@/store/useCompanyStore";
import { getCityById } from "@/lib/api";
import { calculateSavings, formatCurrency, commuteHoursPerYear } from "@/lib/calculations";
import MetricTile from "@/components/ui/MetricTile";
import PillButton from "@/components/ui/PillButton";
import SectionHeader from "@/components/ui/SectionHeader";
import InsightBanner from "@/components/ui/InsightBanner";
import { Upload, FileText, X } from "lucide-react";
import dynamic from "next/dynamic";

const SavingsChart = dynamic(
    () => import("@/components/charts/SavingsChart"),
    { ssr: false }
);

export default function BudgetSimulatorPage() {
    const store = useCompanyStore();
    const city = getCityById(store.cityId) ?? getCityById("toronto")!;

    const [employees, setEmployees] = useState(store.employees ?? 50);
    const [avgSalary, setAvgSalary] = useState(store.avgSalary ?? 87500);
    const [sqftPerEmployee, setSqftPerEmployee] = useState(150);
    const [csvEmployees, setCsvEmployees] = useState<number | null>(null);
    const [csvFile, setCsvFile] = useState<string | null>(null);
    const [calculated, setCalculated] = useState(false);

    const effectiveEmployees = csvEmployees ?? employees;

    const result = calculateSavings({
        employees: effectiveEmployees,
        avgSalary,
        sqftPerEmployee,
        currentOfficeRent: city.officeSqft,
        currentHomePrice: city.homePrice,
        cityTaxRate: city.taxRate,
    });

    const commuteHrs = commuteHoursPerYear(city.avgCommute) * effectiveEmployees;

    // CSV drop handler
    const onDrop = useCallback((files: File[]) => {
        const file = files[0];
        if (!file) return;
        setCsvFile(file.name);
        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (res) => {
                setCsvEmployees(res.data.length);
            },
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "text/csv": [".csv"], "application/vnd.ms-excel": [".csv"] },
        maxFiles: 1,
    });

    // SALARY_BAND_MAP
    const SALARY_SLICES = [40000, 62500, 87500, 125000, 175000];

    return (
        <div className="p-6 md:p-8 flex flex-col gap-6">
            <SectionHeader
                eyebrow="Budget Simulator"
                title="Calculate Your Savings"
                subtitle="Adjust the parameters to model your specific relocation scenario."
            />

            <TabsPrimitive.Root defaultValue="interactive" className="flex flex-col gap-6">
                {/* Tab triggers */}
                <TabsPrimitive.List className="flex gap-1 bg-river-slate/50 p-1 rounded-xl w-fit">
                    {[
                        { value: "interactive", label: "Interactive Sliders" },
                        { value: "csv", label: "CSV Import" },
                    ].map((t) => (
                        <TabsPrimitive.Trigger
                            key={t.value}
                            value={t.value}
                            className="px-5 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-exchange-brick data-[state=active]:text-white data-[state=inactive]:text-concrete-gray data-[state=inactive]:hover:text-frost-white"
                            style={{ fontFamily: "var(--font-ibm-sans)" }}
                        >
                            {t.label}
                        </TabsPrimitive.Trigger>
                    ))}
                </TabsPrimitive.List>

                {/* Interactive tab */}
                <TabsPrimitive.Content value="interactive" className="outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <SliderField
                                label="Employees Relocating"
                                value={employees}
                                min={5}
                                max={500}
                                step={5}
                                format={(v) => `${v} people`}
                                onChange={setEmployees}
                            />
                            <SliderField
                                label="Average Annual Salary"
                                value={avgSalary}
                                min={40000}
                                max={200000}
                                step={2500}
                                format={(v) => formatCurrency(v, true)}
                                markers={SALARY_SLICES}
                                onChange={setAvgSalary}
                            />
                            <SliderField
                                label="Office Space per Employee"
                                value={sqftPerEmployee}
                                min={50}
                                max={300}
                                step={10}
                                format={(v) => `${v} sqft/person`}
                                onChange={setSqftPerEmployee}
                            />
                            <div className="pt-2">
                                <PillButton onClick={() => setCalculated(true)} icon>
                                    Calculate My Savings
                                </PillButton>
                            </div>
                        </div>

                        {/* Live preview */}
                        <div className="bg-river-slate/50 rounded-xl p-5 border border-white/5 space-y-3">
                            <p
                                className="text-[11px] uppercase tracking-widest text-concrete-gray font-semibold"
                                style={{ fontFamily: "var(--font-ibm-sans)" }}
                            >
                                Live Projection
                            </p>
                            <LiveRow label="Total Sqft" value={`${(sqftPerEmployee * employees).toLocaleString()} sqft`} />
                            <LiveRow
                                label={`Current Rent (${city.name})`}
                                value={formatCurrency(sqftPerEmployee * employees * city.officeSqft * 12)}
                                color="#8B98A5"
                            />
                            <LiveRow
                                label="Winnipeg Rent"
                                value={formatCurrency(sqftPerEmployee * employees * 16 * 12)}
                                color="#5E8C6A"
                            />
                            <div className="h-px bg-white/8 my-2" />
                            <LiveRow
                                label="Annual Office Savings"
                                value={formatCurrency(result.annualOfficeSavings)}
                                color="#C8A44D"
                                large
                            />
                            <LiveRow
                                label="Tax Savings per Employee/yr"
                                value={formatCurrency(result.employeeDisposableIncrease)}
                                color="#C8A44D"
                            />
                        </div>
                    </div>
                </TabsPrimitive.Content>

                {/* CSV tab */}
                <TabsPrimitive.Content value="csv" className="outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div
                                {...getRootProps()}
                                className={[
                                    "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                                    isDragActive
                                        ? "border-exchange-brick bg-exchange-brick/10"
                                        : "border-white/15 hover:border-cool-blue/50 hover:bg-river-slate/30",
                                ].join(" ")}
                            >
                                <input {...getInputProps()} />
                                {csvFile ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <FileText size={20} className="text-lake-green" />
                                        <span className="text-frost-white text-sm" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                            {csvFile}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCsvFile(null);
                                                setCsvEmployees(null);
                                            }}
                                            className="text-concrete-gray hover:text-exchange-brick"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={28} className="mx-auto text-concrete-gray mb-3" />
                                        <p className="text-sm text-frost-white font-medium mb-1" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                            {isDragActive ? "Drop your CSV here" : "Drop your employee CSV"}
                                        </p>
                                        <p className="text-xs text-concrete-gray" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                            Each row = one employee. Headers: name, salary, department
                                        </p>
                                    </>
                                )}
                            </div>

                            {csvEmployees !== null && (
                                <InsightBanner variant="tip">
                                    Parsed <strong style={{ color: "#4C6E91" }}>{csvEmployees} employees</strong> from CSV.
                                    Calculations below reflect your full workforce.
                                </InsightBanner>
                            )}

                            <PillButton onClick={() => setCalculated(true)} icon>
                                Calculate My Savings
                            </PillButton>
                        </div>

                        <div className="bg-river-slate/50 rounded-xl p-5 border border-white/5">
                            <p className="text-xs text-concrete-gray mb-3" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                                Expected CSV format:
                            </p>
                            <pre
                                className="text-[12px] text-lake-green leading-relaxed"
                                style={{ fontFamily: "var(--font-ibm-mono)" }}
                            >
                                {`name,salary,department
Jane Smith,95000,Engineering
John Doe,82000,Marketing
...`}
                            </pre>
                        </div>
                    </div>
                </TabsPrimitive.Content>
            </TabsPrimitive.Root>

            {/* Results */}
            {calculated && (
                <>
                    <div className="h-px bg-white/8" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MetricTile
                            label="Annual Office Savings"
                            value={formatCurrency(result.annualOfficeSavings, true)}
                            sub="Rent delta vs Winnipeg"
                            accent="brick"
                        />
                        <MetricTile
                            label="Employee Disposable +"
                            value={formatCurrency(result.totalEmployeeDisposableIncrease, true)}
                            sub={`${formatCurrency(result.employeeDisposableIncrease, true)}/person/yr`}
                            accent="gold"
                        />
                        <MetricTile
                            label="Housing Equity Gain"
                            value={formatCurrency(result.housingEquityGain, true)}
                            sub="Per employee, avg home vs avg home"
                            accent="green"
                        />
                        <MetricTile
                            label="Commute Hours Recovered"
                            value={`${commuteHrs.toLocaleString()} hrs`}
                            sub={`${Math.round(commuteHrs / effectiveEmployees)} hrs/employee/yr`}
                            accent="blue"
                        />
                    </div>

                    <div className="h-52">
                        <SavingsChart
                            officeSavings={result.annualOfficeSavings}
                            disposableIncrease={result.totalEmployeeDisposableIncrease}
                            housingEquity={result.housingEquityGain}
                        />
                    </div>

                    <InsightBanner variant="highlight">
                        Over 5 years, this relocation generates approximately{" "}
                        <strong style={{ color: "#C8A44D" }}>
                            {formatCurrency(result.totalSavings * 5, true)}
                        </strong>{" "}
                        in combined company + employee financial benefit — before considering recruitment advantages
                        and talent retention from improved quality of life.
                    </InsightBanner>
                </>
            )}
        </div>
    );
}

function SliderField({
    label,
    value,
    min,
    max,
    step,
    format,
    markers,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    format: (v: number) => string;
    markers?: number[];
    onChange: (v: number) => void;
}) {
    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <label
                    className="text-[12px] font-semibold uppercase tracking-wider text-concrete-gray"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                >
                    {label}
                </label>
                <span
                    className="text-sm font-semibold text-prairie-gold"
                    style={{ fontFamily: "var(--font-ibm-mono)" }}
                >
                    {format(value)}
                </span>
            </div>
            <SliderPrimitive.Root
                min={min}
                max={max}
                step={step}
                value={[value]}
                onValueChange={([v]) => onChange(v)}
            >
                <SliderPrimitive.Track>
                    <SliderPrimitive.Range />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb aria-label={label} />
            </SliderPrimitive.Root>
        </div>
    );
}

function LiveRow({
    label,
    value,
    color = "#F2F5F7",
    large = false,
}: {
    label: string;
    value: string;
    color?: string;
    large?: boolean;
}) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[13px] text-concrete-gray" style={{ fontFamily: "var(--font-ibm-sans)" }}>
                {label}
            </span>
            <span
                className={large ? "text-lg font-semibold" : "text-[13px]"}
                style={{ fontFamily: "var(--font-ibm-mono)", color }}
            >
                {value}
            </span>
        </div>
    );
}
