"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { useCompanyStore } from "@/store/useCompanyStore";
import {
  getCityById,
  fetchImpact,
  fetchZones,
  type ImpactResponse,
  type ZoneSummary,
} from "@/lib/api";
import {
  buildFinanceRows,
  formatValue,
  formatDelta,
  type FinanceRow,
  type ValueType,
} from "@/lib/financeTable";
import { exportToExcel, exportToPDF, type ExportMeta } from "@/lib/exportFinance";
import {
  Upload,
  FileText,
  X,
  Loader2,
  MapPin,
  Download,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function BudgetSimulatorPage() {
  const store = useCompanyStore();
  const city = getCityById(store.cityId) ?? getCityById("toronto")!;

  const [employees, setEmployees] = useState<number>(store.employees ?? 50);
  const [avgSalary, setAvgSalary] = useState<number>(store.avgSalary ?? 87500);
  const [sqftPerEmployee, setSqftPerEmployee] = useState<number>(150);
  const [selectedZone, setSelectedZone] = useState<string>(store.selectedZoneId ?? "");
  const [zones, setZones] = useState<ZoneSummary[]>([]);

  const [csvEmployees, setCsvEmployees] = useState<number | null>(null);
  const [csvFile, setCsvFile] = useState<string | null>(null);

  const [impact, setImpact] = useState<ImpactResponse | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchZones().then((z) => {
      setZones(z);
      if (!selectedZone && store.selectedZoneId) setSelectedZone(store.selectedZoneId);
      else if (!selectedZone && z.length > 0) setSelectedZone(z[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveEmployees = csvEmployees ?? employees;

  const rows: FinanceRow[] = buildFinanceRows(
    { employees: effectiveEmployees, avgSalary, sqftPerEmployee },
    city,
    calculated ? impact : null,
  );

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    setCsvFile(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => setCsvEmployees(res.data.length),
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/vnd.ms-excel": [".csv"] },
    maxFiles: 1,
  });

  const handleCalculate = async () => {
    setCalculated(true);
    setLoadingImpact(true);
    store.setSelectedZoneId(selectedZone);
    const result = await fetchImpact(
      store.companyName || "Your Company",
      store.cityId,
      effectiveEmployees,
      avgSalary,
      selectedZone || "exchange-district",
      sqftPerEmployee,
    );
    setImpact(result);
    setLoadingImpact(false);
    setTimeout(
      () => tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      100,
    );
  };

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exportMeta: ExportMeta = {
    companyName: store.companyName || "Your Company",
    currentCityName: city.name,
    generatedDate: new Date().toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    employees: effectiveEmployees,
    avgSalary,
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-0">
      <div className="mb-7">
        <p
          className="text-[11px] font-semibold uppercase tracking-widest mb-1"
          style={{ color: "#8B98A5", fontFamily: "var(--font-ibm-sans)" }}
        >
          Budget Simulator
        </p>
        <h1
          className="text-2xl font-bold leading-tight mb-1"
          style={{ color: "#0F1823", fontFamily: "var(--font-ibm-sans)" }}
        >
          Relocation Financial Analysis
        </h1>
        <p className="text-sm" style={{ color: "#8B98A5", fontFamily: "var(--font-ibm-sans)" }}>
          Finance-grade line-item breakdown across six cost categories &mdash;{" "}
          <span style={{ color: "#4C6E91" }}>{city.name}</span> &rarr; Winnipeg, MB
        </p>
      </div>

      <div
        className="rounded-xl border mb-6"
        style={{ background: "rgba(241,244,247,0.9)", borderColor: "rgba(0,0,0,0.1)" }}
      >
        <div className="p-5 border-b" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
          <TabsPrimitive.Root defaultValue="inputs" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <TabsPrimitive.List
                className="flex gap-1 p-1 rounded-lg w-fit"
                style={{ background: "rgba(241,244,247,0.5)" }}
              >
                {[
                  { value: "inputs", label: "Manual Inputs" },
                  { value: "csv", label: "CSV Import" },
                ].map((t) => (
                  <TabsPrimitive.Trigger
                    key={t.value}
                    value={t.value}
                    className="px-4 py-1.5 rounded-md text-xs font-medium transition-all data-[state=active]:bg-[#4C6E91] data-[state=active]:text-white data-[state=inactive]:text-[#8B98A5]"
                    style={{ fontFamily: "var(--font-ibm-sans)" }}
                  >
                    {t.label}
                  </TabsPrimitive.Trigger>
                ))}
              </TabsPrimitive.List>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportToExcel(rows, exportMeta)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background: "rgba(94,140,106,0.15)",
                    color: "#5E8C6A",
                    border: "1px solid rgba(94,140,106,0.3)",
                    fontFamily: "var(--font-ibm-sans)",
                  }}
                >
                  <FileSpreadsheet size={13} />
                  Export Excel
                </button>
                <button
                  onClick={() => exportToPDF(rows, exportMeta)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background: "rgba(185,148,69,0.12)",
                    color: "#4C6E91",
                    border: "1px solid rgba(185,148,69,0.25)",
                    fontFamily: "var(--font-ibm-sans)",
                  }}
                >
                  <Download size={13} />
                  Export PDF
                </button>
              </div>
            </div>

            <TabsPrimitive.Content value="inputs" className="outline-none">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <NumericField
                  label="Employees Relocating"
                  value={employees}
                  min={1}
                  max={10000}
                  unit="people"
                  onChange={setEmployees}
                />
                <NumericField
                  label="Avg Annual Salary"
                  value={avgSalary}
                  min={30000}
                  max={500000}
                  unit="CAD"
                  prefix="$"
                  onChange={setAvgSalary}
                />
                <NumericField
                  label="Office Sqft / Employee"
                  value={sqftPerEmployee}
                  min={50}
                  max={500}
                  unit="sqft"
                  onChange={setSqftPerEmployee}
                />
                <div>
                  <label
                    className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider mb-2 block"
                    style={{ color: "#8B98A5", fontFamily: "var(--font-ibm-sans)" }}
                  >
                    <MapPin size={11} />
                    Winnipeg Zone
                  </label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      background: "rgba(241,244,247,0.8)",
                      color: "#0F1823",
                      border: "1px solid rgba(0,0,0,0.12)",
                      fontFamily: "var(--font-ibm-sans)",
                    }}
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </TabsPrimitive.Content>

            <TabsPrimitive.Content value="csv" className="outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
                  style={{
                    borderColor: isDragActive ? "#4C6E91" : "rgba(0,0,0,0.15)",
                    background: isDragActive ? "rgba(185,148,69,0.08)" : "rgba(241,244,247,0.3)",
                  }}
                >
                  <input {...getInputProps()} />
                  {csvFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText size={18} style={{ color: "#5E8C6A" }} />
                      <span className="text-sm" style={{ color: "#0F1823", fontFamily: "var(--font-ibm-sans)" }}>
                        {csvFile}
                        {csvEmployees !== null && (
                          <span style={{ color: "#4C6E91" }}> &middot; {csvEmployees} employees</span>
                        )}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setCsvFile(null); setCsvEmployees(null); }}
                        style={{ color: "#8B98A5" }}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto mb-2" style={{ color: "#8B98A5" }} />
                      <p className="text-sm font-medium mb-0.5" style={{ color: "#0F1823", fontFamily: "var(--font-ibm-sans)" }}>
                        {isDragActive ? "Drop your CSV here" : "Drop employee CSV"}
                      </p>
                      <p className="text-xs" style={{ color: "#8B98A5", fontFamily: "var(--font-ibm-sans)" }}>
                        Headers: name, salary, department
                      </p>
                    </>
                  )}
                </div>
                <div
                  className="rounded-lg p-4"
                  style={{ background: "rgba(241,244,247,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}
                >
                  <p className="text-xs mb-2" style={{ color: "#8B98A5", fontFamily: "var(--font-ibm-sans)" }}>
                    Expected CSV format:
                  </p>
                  <pre className="text-xs leading-relaxed" style={{ color: "#5E8C6A", fontFamily: "var(--font-ibm-mono)" }}>
                    {"name,salary,department\nJane Smith,95000,Engineering\nJohn Doe,82000,Marketing"}
                  </pre>
                </div>
              </div>
            </TabsPrimitive.Content>
          </TabsPrimitive.Root>
        </div>

        <div
          className="px-5 py-3 flex items-center justify-between gap-4"
          style={{ background: "#F1F4F7" }}
        >
          <p className="text-xs" style={{ color: "#8B98A5", fontFamily: "var(--font-ibm-sans)" }}>
            <span style={{ color: "#0F1823" }}>{effectiveEmployees.toLocaleString()}</span> employees &middot;{" "}
            <span style={{ color: "#0F1823" }}>${avgSalary.toLocaleString()}</span> avg salary &middot;{" "}
            <span style={{ color: "#0F1823" }}>{sqftPerEmployee}</span> sqft/person &middot;{" "}
            <span style={{ color: "#4C6E91" }}>{city.name}</span> &rarr; Winnipeg
          </p>
          <button
            onClick={handleCalculate}
            disabled={loadingImpact}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{
              background: "#4C6E91",
              color: "#F1F4F7",
              opacity: loadingImpact ? 0.6 : 1,
              fontFamily: "var(--font-ibm-sans)",
            }}
          >
            {loadingImpact ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Calculating...
              </>
            ) : (
              "Run Full Analysis"
            )}
          </button>
        </div>
      </div>

      <div ref={tableRef}>
        <FinanceTable
          rows={rows}
          cityName={city.name}
          collapsed={collapsed}
          onToggle={toggleCollapse}
          calculated={calculated}
          loading={loadingImpact}
        />
      </div>

      <p
        className="mt-4 text-[10.5px] leading-relaxed"
        style={{ color: "#4A5664", fontFamily: "var(--font-ibm-sans)" }}
      >
        * MEDITC shown as estimated benefit where applicable (Province of Manitoba Digital Media Tax Credit).
        All figures in CAD. Sources: Statistics Canada, CBRE 2025 Office Market Report, CREA 2025, JLL 2024, SHRM 2024.
      </p>
    </div>
  );
}

function FinanceTable({
  rows,
  cityName,
  collapsed,
  onToggle,
  calculated,
  loading,
}: {
  rows: FinanceRow[];
  cityName: string;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  calculated: boolean;
  loading: boolean;
}) {
  let currentHeaderId = "";
  const renderedRows: React.ReactNode[] = [];

  for (const row of rows) {
    if (row.kind === "header") {
      currentHeaderId = row.id;
      renderedRows.push(
        <CategoryHeaderRow
          key={row.id}
          row={row}
          isCollapsed={collapsed.has(row.id)}
          onToggle={() => onToggle(row.id)}
        />,
      );
      continue;
    }
    if (collapsed.has(currentHeaderId)) continue;

    if (row.kind === "subtotal") {
      renderedRows.push(<SubtotalRow key={row.id} row={row} />);
    } else if (row.kind === "summary") {
      renderedRows.push(
        <SummaryRow key={row.id} row={row} calculated={calculated} loading={loading} />,
      );
    } else {
      renderedRows.push(
        <DataRow key={row.id} row={row} cityName={cityName} calculated={calculated} loading={loading} />,
      );
    }
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.1)" }}>
      <table className="w-full border-collapse" style={{ fontFamily: "var(--font-ibm-sans)" }}>
        <thead>
          <tr style={{ background: "#F1F4F7" }}>
            {([
              { label: "Line Item", align: "left" as const, w: "35%", gold: true },
              { label: cityName, align: "right" as const, w: "13%" },
              { label: "Winnipeg", align: "right" as const, w: "13%" },
              { label: "Delta", align: "right" as const, w: "12%" },
              { label: "Chg %", align: "right" as const, w: "8%" },
              { label: "Notes", align: "left" as const, w: "auto", hide: true },
            ]).map((col) => (
              <th
                key={col.label}
                className={"px-4 py-3 text-[10.5px] font-semibold uppercase tracking-wider" + (col.hide ? " hidden md:table-cell" : "")}
                style={{
                  color: col.gold ? "#4C6E91" : "#8B98A5",
                  textAlign: col.align,
                  width: col.w,
                  borderBottom: "1px solid rgba(185,148,69,0.2)",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderedRows}</tbody>
      </table>
    </div>
  );
}

function CategoryHeaderRow({
  row,
  isCollapsed,
  onToggle,
}: {
  row: FinanceRow;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <tr
      onClick={onToggle}
      className="cursor-pointer select-none"
      style={{
        background: "#F7F9FB",
        borderTop: "1px solid rgba(185,148,69,0.2)",
        borderBottom: "1px solid rgba(185,148,69,0.12)",
      }}
    >
      <td colSpan={6} className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <ChevronDown size={13} style={{ color: "#4C6E91" }} />
          ) : (
            <ChevronUp size={13} style={{ color: "#4C6E91" }} />
          )}
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "#4C6E91" }}
          >
            {row.label}
          </span>
          {row.notes && (
            <span className="text-[10px] ml-2 hidden md:inline" style={{ color: "#4A5664" }}>
              {row.notes}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

function DataRow({
  row,
  cityName,
  calculated,
  loading,
}: {
  row: FinanceRow;
  cityName: string;
  calculated: boolean;
  loading: boolean;
}) {
  void cityName;
  const isBackendRow =
    row.notes.includes("impact model") || row.notes.includes("Via impact model");
  const showPending = isBackendRow && !calculated;
  const showLoading = isBackendRow && calculated && loading;

  return (
    <tr
      className="transition-colors hover:bg-gray-50"
      style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
    >
      <td className="px-4 py-2.5 pl-8 text-[12.5px]" style={{ color: "#0F1823" }}>
        {row.label}
      </td>
      <MonoCell value={row.currentCity} type={row.valueType} muted />
      <MonoCell value={row.winnipeg} type={row.valueType} muted />
      <td
        className="text-right px-4 py-2.5 text-[12.5px]"
        style={{ color: getDeltaColor(row.delta, row.highlight), fontFamily: "var(--font-ibm-mono)" }}
      >
        {showPending ? (
          <span className="text-[11px]" style={{ color: "#4A5664", fontStyle: "italic" }}>{"—"}</span>
        ) : showLoading ? (
          <Loader2 size={11} className="inline animate-spin" style={{ color: "#5E6B78" }} />
        ) : (
          formatDelta(row.delta, row.valueType)
        )}
      </td>
      <td
        className="text-right px-4 py-2.5 text-[11.5px]"
        style={{ color: "#4A5664", fontFamily: "var(--font-ibm-mono)" }}
      >
        {row.pct !== null ? (row.pct > 0 ? "+" : "") + row.pct.toFixed(1) + "%" : "—"}
      </td>
      <td className="px-4 py-2.5 text-[10.5px] hidden md:table-cell" style={{ color: "#4A5664" }}>
        {row.notes}
      </td>
    </tr>
  );
}

function SubtotalRow({ row }: { row: FinanceRow }) {
  return (
    <tr
      style={{
        background: "#F7F9FB",
        borderTop: "1px solid rgba(185,148,69,0.2)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
      }}
    >
      <td
        colSpan={3}
        className="px-4 pl-8 py-2.5 text-[12px] font-semibold"
        style={{ color: "#0F1823" }}
      >
        {row.label}
      </td>
      <td
        className="text-right px-4 py-2.5 text-[13px] font-semibold"
        style={{ color: getDeltaColor(row.delta, row.highlight), fontFamily: "var(--font-ibm-mono)" }}
      >
        {formatDelta(row.delta, row.valueType)}
      </td>
      <td className="px-4 py-2.5" />
      <td className="px-4 py-2.5 text-[10.5px] hidden md:table-cell" style={{ color: "#4A5664" }}>
        {row.notes}
      </td>
    </tr>
  );
}

function SummaryRow({
  row,
  calculated,
  loading,
}: {
  row: FinanceRow;
  calculated: boolean;
  loading: boolean;
}) {
  const isTopLine =
    row.id === "fs-total-annual" || row.id === "fs-5yr-net" || row.id === "fs-roi";

  return (
    <tr
      style={{
        background: isTopLine ? "rgba(185,148,69,0.07)" : "rgba(241,244,247,0.9)",
        borderTop: isTopLine
          ? "1px solid rgba(185,148,69,0.18)"
          : "1px solid rgba(0,0,0,0.07)",
      }}
    >
      <td
        colSpan={3}
        className="px-4 py-3 text-[13px] font-semibold"
        style={{ color: isTopLine ? "#0F1823" : "#4A5664" }}
      >
        {row.label}
      </td>
      <td
        className="text-right px-4 py-3 font-bold"
        style={{
          fontSize: isTopLine ? "15px" : "13px",
          color: getDeltaColor(row.delta, row.highlight),
          fontFamily: "var(--font-ibm-mono)",
        }}
      >
        {!calculated ? (
          <span className="text-[11px]" style={{ color: "#4A5664", fontStyle: "italic" }}>
            Run analysis
          </span>
        ) : loading ? (
          <Loader2 size={13} className="inline animate-spin" style={{ color: "#5E6B78" }} />
        ) : (
          formatDelta(row.delta, row.valueType)
        )}
      </td>
      <td className="px-4 py-3" />
      <td className="px-4 py-3 text-[10.5px] hidden md:table-cell" style={{ color: "#4A5664" }}>
        {row.notes}
      </td>
    </tr>
  );
}

function MonoCell({
  value,
  type,
  muted = false,
}: {
  value: number | string | null;
  type: ValueType;
  muted?: boolean;
}) {
  return (
    <td
      className="text-right px-4 py-2.5 text-[12.5px]"
      style={{ color: muted ? "#64748B" : "#0F1823", fontFamily: "var(--font-ibm-mono)" }}
    >
      {formatValue(value, type)}
    </td>
  );
}

function getDeltaColor(
  delta: number | null,
  hint?: "green" | "gold" | "red" | "none",
): string {
  if (hint === "red") return "#4C6E91";
  if (hint === "gold") return "#4C6E91";
  if (hint === "green") return "#5E8C6A";
  if (delta === null) return "#8B98A5";
  if (delta > 0) return "#5E8C6A";
  if (delta < 0) return "#4C6E91";
  return "#8B98A5";
}

function NumericField({
  label,
  value,
  min,
  max,
  unit,
  prefix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  prefix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label
        className="text-[11px] font-semibold uppercase tracking-wider mb-2 block"
        style={{ color: "#8B98A5", fontFamily: "var(--font-ibm-sans)" }}
      >
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
            style={{ color: "#8B98A5", fontFamily: "var(--font-ibm-mono)" }}
          >
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={value.toLocaleString()}
          onChange={(e) => {
            const raw = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
            if (!isNaN(raw)) onChange(Math.max(min, Math.min(max, raw)));
          }}
          className="w-full rounded-lg py-2 text-sm outline-none"
          style={{
            paddingLeft: prefix ? "1.5rem" : "0.75rem",
            paddingRight: "0.75rem",
            background: "rgba(241,244,247,0.8)",
            color: "#0F1823",
            border: "1px solid rgba(0,0,0,0.12)",
            fontFamily: "var(--font-ibm-mono)",
          }}
        />
      </div>
      <p className="text-[10px] mt-0.5" style={{ color: "#4A5664", fontFamily: "var(--font-ibm-sans)" }}>
        {unit}
      </p>
    </div>
  );
}
