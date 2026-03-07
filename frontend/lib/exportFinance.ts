/**
 * exportFinance.ts — Client-side Excel (.xlsx) and PDF export for the budget simulator.
 * Both exports are generated entirely in the browser — no server required.
 *
 * Dependencies:
 *  - xlsx (SheetJS):     npm install xlsx
 *  - jspdf:              npm install jspdf
 *  - jspdf-autotable:    npm install jspdf-autotable
 */

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  type FinanceRow,
  formatValue,
  formatDelta,
} from "@/lib/financeTable";

// ── Shared metadata ──────────────────────────────────────────

export interface ExportMeta {
  companyName: string;
  currentCityName: string;
  generatedDate: string; // ISO string
  employees: number;
  avgSalary: number;
}

// ── Category order (matches header row ids) ─────────────────

const CATEGORIES: Array<{ headerId: string; label: string }> = [
  { headerId: "re-header",  label: "Real Estate" },
  { headerId: "ct-header",  label: "Compensation & Tax" },
  { headerId: "hcl-header", label: "Housing & Cost of Living" },
  { headerId: "wr-header",  label: "Workforce & Retention" },
  { headerId: "hci-header", label: "Hidden Costs & Incentives" },
  { headerId: "fs-header",  label: "Financial Summary" },
];

// ── Helper: split rows into category buckets ─────────────────

function splitByCategory(rows: FinanceRow[]): Map<string, FinanceRow[]> {
  const map = new Map<string, FinanceRow[]>();
  let currentCat = "Uncategorised";

  for (const row of rows) {
    if (row.kind === "header") {
      const cat = CATEGORIES.find((c) => c.headerId === row.id);
      currentCat = cat ? cat.label : row.label;
      map.set(currentCat, []);
    } else {
      const bucket = map.get(currentCat) ?? [];
      bucket.push(row);
      map.set(currentCat, bucket);
    }
  }

  return map;
}

// ── Excel export ─────────────────────────────────────────────

export function exportToExcel(rows: FinanceRow[], meta: ExportMeta): void {
  const wb = XLSX.utils.book_new();

  // ── Cover / Summary sheet ──────────────────────────────────
  const coverData: (string | number | null)[][] = [
    ["BUDGET SIMULATOR — RELOCATION FINANCIAL ANALYSIS"],
    [],
    ["Company", meta.companyName],
    ["Current City", meta.currentCityName],
    ["Relocating to", "Winnipeg, MB"],
    ["Employees", meta.employees],
    ["Avg Annual Salary", meta.avgSalary],
    ["Report Generated", meta.generatedDate],
    [],
    ["LINE ITEM", "CURRENT CITY", "WINNIPEG", "DELTA", "% CHANGE", "NOTES"],
  ];

  const financialSummaryRows = rows.filter(
    (r) => r.kind === "summary" || r.kind === "subtotal",
  );
  for (const row of financialSummaryRows) {
    coverData.push([
      row.label,
      typeof row.currentCity === "number" ? formatValue(row.currentCity, row.valueType) : (row.currentCity ?? "—"),
      typeof row.winnipeg === "number" ? formatValue(row.winnipeg, row.valueType) : (row.winnipeg ?? "—"),
      formatDelta(row.delta, row.valueType),
      row.pct !== null ? `${row.pct.toFixed(1)}%` : "—",
      row.notes,
    ]);
  }

  const coverWS = XLSX.utils.aoa_to_sheet(coverData);
  coverWS["!cols"] = [{ wch: 44 }, { wch: 20 }, { wch: 20 }, { wch: 16 }, { wch: 12 }, { wch: 52 }];
  XLSX.utils.book_append_sheet(wb, coverWS, "Summary");

  // ── One sheet per category ─────────────────────────────────
  const categoryMap = splitByCategory(rows);

  for (const { label } of CATEGORIES) {
    const catRows = categoryMap.get(label) ?? [];
    if (catRows.length === 0) continue;

    const sheetData: (string | number | null)[][] = [
      [`${label.toUpperCase()} — RELOCATION ANALYSIS`],
      [`Company: ${meta.companyName}  |  ${meta.currentCityName} → Winnipeg  |  ${meta.generatedDate}`],
      [],
      ["LINE ITEM", "CURRENT CITY", "WINNIPEG", "DELTA", "% CHANGE", "NOTES"],
    ];

    for (const row of catRows) {
      const isSub = row.kind === "subtotal";
      sheetData.push([
        isSub ? `  SUBTOTAL: ${row.label}` : row.label,
        typeof row.currentCity === "number" ? formatValue(row.currentCity, row.valueType) : (row.currentCity ?? "—"),
        typeof row.winnipeg === "number" ? formatValue(row.winnipeg, row.valueType) : (row.winnipeg ?? "—"),
        formatDelta(row.delta, row.valueType),
        row.pct !== null ? `${row.pct.toFixed(1)}%` : "—",
        row.notes,
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [{ wch: 44 }, { wch: 20 }, { wch: 20 }, { wch: 16 }, { wch: 12 }, { wch: 52 }];
    // Short sheet name (Excel limit: 31 chars)
    const sheetName = label.slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  // ── Download ───────────────────────────────────────────────
  const safeCompany = meta.companyName.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${safeCompany}_Winnipeg_Budget_Analysis.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ── PDF export ────────────────────────────────────────────────

// Colour palette matching the app's dark theme adapted for print
const PDF_COLORS = {
  coverBg: [30, 42, 56] as [number, number, number],    // dark navy
  coverText: [242, 245, 247] as [number, number, number], // frost-white
  headerBg: [42, 57, 73] as [number, number, number],   // river-slate
  headerText: [200, 164, 77] as [number, number, number], // prairie-gold
  subtotalBg: [36, 49, 63] as [number, number, number],
  subtotalText: [200, 164, 77] as [number, number, number],
  summaryBg: [200, 164, 77] as [number, number, number],
  summaryText: [20, 20, 20] as [number, number, number],
  rowEven: [26, 36, 48] as [number, number, number],
  rowOdd: [22, 30, 40] as [number, number, number],
  rowText: [210, 218, 225] as [number, number, number],
  positive: [94, 140, 106] as [number, number, number],  // lake-green
  negative: [178, 58, 43] as [number, number, number],   // exchange-brick
  neutral: [131, 152, 165] as [number, number, number],  // concrete-gray
  border: [50, 68, 85] as [number, number, number],
};

export function exportToPDF(rows: FinanceRow[], meta: ExportMeta): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ── Cover Page ─────────────────────────────────────────────
  doc.setFillColor(...PDF_COLORS.coverBg);
  doc.rect(0, 0, pageW, pageH, "F");

  // Title
  doc.setTextColor(...PDF_COLORS.headerText);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("BUDGET SIMULATOR", pageW / 2, 44, { align: "center" });

  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_COLORS.coverText);
  doc.text("Relocation Financial Analysis", pageW / 2, 54, { align: "center" });

  // Divider
  doc.setDrawColor(...PDF_COLORS.headerText);
  doc.setLineWidth(0.5);
  doc.line(40, 60, pageW - 40, 60);

  // Meta block
  const metaLines: [string, string][] = [
    ["Company", meta.companyName],
    ["Current City", meta.currentCityName],
    ["Relocating to", "Winnipeg, MB"],
    ["Employees", String(meta.employees)],
    ["Avg Annual Salary", `$${meta.avgSalary.toLocaleString()}`],
    ["Report Date", meta.generatedDate],
  ];

  const col1x = 60;
  const col2x = 135;
  let y = 74;
  doc.setFontSize(10);
  for (const [label, value] of metaLines) {
    doc.setTextColor(...PDF_COLORS.neutral);
    doc.setFont("helvetica", "normal");
    doc.text(label, col1x, y);
    doc.setTextColor(...PDF_COLORS.coverText);
    doc.setFont("helvetica", "bold");
    doc.text(value, col2x, y);
    y += 9;
  }

  // Summary KPIs
  const summaryRows = rows.filter((r) => r.kind === "summary");
  if (summaryRows.length > 0) {
    y += 6;
    doc.line(40, y, pageW - 40, y);
    y += 8;
    doc.setTextColor(...PDF_COLORS.headerText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("KEY FINANCIALS", pageW / 2, y, { align: "center" });
    y += 8;

    const kpiCols = Math.min(3, summaryRows.length);
    const kpiW = (pageW - 80) / kpiCols;
    summaryRows.slice(0, 6).forEach((row, i) => {
      const kx = 40 + (i % kpiCols) * kpiW;
      const ky = y + Math.floor(i / kpiCols) * 24;
      doc.setFillColor(...PDF_COLORS.headerBg);
      doc.roundedRect(kx, ky - 6, kpiW - 4, 20, 2, 2, "F");
      doc.setTextColor(...PDF_COLORS.headerText);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      const deltaStr = formatDelta(row.delta, row.valueType);
      doc.text(deltaStr, kx + (kpiW - 4) / 2, ky + 4, { align: "center" });
      doc.setTextColor(...PDF_COLORS.neutral);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(row.label, kx + (kpiW - 4) / 2, ky + 10, { align: "center", maxWidth: kpiW - 8 });
    });
  }

  // Footer note
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.neutral);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Sources: Statistics Canada, CBRE 2025 Office Market Report, CREA 2025, JLL 2024, SHRM 2024, Province of Manitoba.",
    pageW / 2,
    pageH - 10,
    { align: "center" },
  );

  // ── Category pages ─────────────────────────────────────────
  const categoryMap = splitByCategory(rows);

  for (const { label } of CATEGORIES) {
    const catRows = categoryMap.get(label) ?? [];
    if (catRows.length === 0) continue;

    doc.addPage();

    // Page background
    doc.setFillColor(...PDF_COLORS.coverBg);
    doc.rect(0, 0, pageW, pageH, "F");

    // Section header bar
    doc.setFillColor(...PDF_COLORS.headerBg);
    doc.rect(0, 0, pageW, 16, "F");
    doc.setTextColor(...PDF_COLORS.headerText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(label.toUpperCase(), 14, 10);
    doc.setTextColor(...PDF_COLORS.neutral);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`${meta.companyName}  ·  ${meta.currentCityName} → Winnipeg  ·  ${meta.generatedDate}`, pageW - 14, 10, { align: "right" });

    // Build table body
    const tableBody: (string | { content: string; styles: { textColor: [number, number, number]; fontStyle?: string } })[][] = [];
    for (const row of catRows) {
      const isSub = row.kind === "subtotal";
      const deltaStr = formatDelta(row.delta, row.valueType);
      const pctStr = row.pct !== null ? `${row.pct.toFixed(1)}%` : "—";

      const deltaColor: [number, number, number] =
        row.delta === null ? PDF_COLORS.neutral
        : row.delta > 0 ? PDF_COLORS.positive
        : row.delta < 0 ? PDF_COLORS.negative
        : PDF_COLORS.neutral;

      tableBody.push([
        {
          content: isSub ? `  ${row.label}` : row.label,
          styles: { textColor: isSub ? PDF_COLORS.headerText : PDF_COLORS.rowText, fontStyle: isSub ? "bold" : "normal" },
        },
        {
          content: typeof row.currentCity === "number" ? formatValue(row.currentCity, row.valueType) : (row.currentCity ?? "—") as string,
          styles: { textColor: PDF_COLORS.rowText },
        },
        {
          content: typeof row.winnipeg === "number" ? formatValue(row.winnipeg, row.valueType) : (row.winnipeg ?? "—") as string,
          styles: { textColor: PDF_COLORS.rowText },
        },
        {
          content: deltaStr,
          styles: { textColor: deltaColor, fontStyle: isSub ? "bold" : "normal" },
        },
        {
          content: pctStr,
          styles: { textColor: PDF_COLORS.neutral },
        },
        {
          content: row.notes,
          styles: { textColor: PDF_COLORS.neutral },
        },
      ]);
    }

    autoTable(doc, {
      startY: 20,
      head: [["LINE ITEM", meta.currentCityName.toUpperCase(), "WINNIPEG", "DELTA", "CHG %", "NOTES"]],
      body: tableBody,
      theme: "plain",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 },
        overflow: "linebreak",
        textColor: PDF_COLORS.rowText,
        fillColor: PDF_COLORS.rowEven,
        lineColor: PDF_COLORS.border,
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: PDF_COLORS.headerBg,
        textColor: PDF_COLORS.headerText,
        fontStyle: "bold",
        fontSize: 8.5,
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: PDF_COLORS.rowOdd,
      },
      columnStyles: {
        0: { cellWidth: 64 },
        1: { cellWidth: 34, halign: "right" },
        2: { cellWidth: 34, halign: "right" },
        3: { cellWidth: 28, halign: "right" },
        4: { cellWidth: 20, halign: "right" },
        5: { cellWidth: "auto" },
      },
      didParseCell: (data) => {
        // Highlight subtotal rows
        const rowData = catRows[data.row.index];
        if (rowData?.kind === "subtotal") {
          data.cell.styles.fillColor = PDF_COLORS.subtotalBg;
          data.cell.styles.lineWidth = { top: 0.5, bottom: 0, left: 0, right: 0 };
          data.cell.styles.lineColor = PDF_COLORS.headerText;
        }
      },
    });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(...PDF_COLORS.neutral);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Page ${doc.getNumberOfPages()} — Sources: Statistics Canada, CBRE 2025, CREA 2025, JLL 2024, SHRM 2024, Province of Manitoba.`,
      pageW / 2,
      pageH - 6,
      { align: "center" },
    );
  }

  // ── Download ───────────────────────────────────────────────
  const safeCompany = meta.companyName.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`${safeCompany}_Winnipeg_Budget_Analysis.pdf`);
}
