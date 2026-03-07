/**
 * financeTable.ts — Finance-grade line-item model for the budget simulator.
 * Produces a structured list of rows across six cost categories.
 *
 * Sources & assumptions:
 *  - Office rent, home prices, commute times, tax rates: Statistics Canada / CBRE 2025
 *  - Winnipeg office rent baseline: $16/sqft/mo  (CBRE Winnipeg Office Market Report 2025)
 *  - Fit-out cost baseline: $80/sqft; Winnipeg ~30% lower (Jones Lang LaSalle 2024)
 *  - Relocation allowance estimate: $10,000 CAD/employee (industry benchmark)
 *  - Turnover cost model: 25% of avg salary per replacement hire (SHRM 2024)
 *  - MEDITC incentive: 40% labour tax credit on qualifying wages, est. 15% effective labour benefit
 *  - Recruitment cost savings: 15% of salary × delta in annual hires avoided
 */

import { type City } from "@/lib/api";
import { type ImpactResponse } from "@/lib/api";

// ── Row types ────────────────────────────────────────────────

export type RowKind =
  | "header"        // category section header
  | "data"          // normal line item
  | "subtotal"      // category subtotal/net
  | "summary"       // top-level financial summary line
  | "spacer";       // blank separator

export type ValueType = "currency" | "percent" | "number" | "minutes" | "hours" | "text" | "months";

export interface FinanceRow {
  id: string;
  kind: RowKind;
  label: string;
  currentCity: number | string | null;   // null = N/A or not applicable
  winnipeg: number | string | null;
  delta: number | null;                  // positive = savings/gain, negative = cost
  pct: number | null;                    // percentage change
  notes: string;
  valueType: ValueType;
  highlight?: "green" | "gold" | "red" | "none";
}

// ── Inputs ──────────────────────────────────────────────────

export interface FinanceInputs {
  employees: number;
  avgSalary: number;
  sqftPerEmployee: number;
}

// ── Constants ────────────────────────────────────────────────

const WPG_OFFICE_RENT = 16;          // $/sqft/mo
const WPG_FITOUT_COST = 56;          // $/sqft  (80 × 0.70)
const FITOUT_BASE_COST = 80;         // $/sqft  (industry avg for major cities)
const WPG_TAX_RATE = 0.439;
const WPG_HOME_PRICE = 363_000;
const WPG_1BR_RENT = 1_100;          // $/mo  (~Winnipeg 1BR avg 2025)
const WPG_COMMUTE = 20;              // minutes
const WPG_HOMEOWNERSHIP_RATE = 0.70; // baseline

const RELOCATION_COST_PER_PERSON = 10_000;   // CAD, one-time
const TURNOVER_COST_FACTOR = 0.25;           // 25% of salary per replacement
const MEDITC_LABOUR_BENEFIT_RATE = 0.15;     // effective 15% of labour cost
const RECRUITMENT_COST_FACTOR = 0.15;        // 15% of salary per new hire

// ── Row builder ──────────────────────────────────────────────

export function buildFinanceRows(
  inputs: FinanceInputs,
  city: City,
  impact?: ImpactResponse | null,
): FinanceRow[] {
  const { employees, avgSalary, sqftPerEmployee } = inputs;
  const totalSqft = employees * sqftPerEmployee;

  // ── 1. REAL ESTATE ─────────────────────────────────────────
  const currentAnnualOfficeRent = city.officeSqft * totalSqft * 12;
  const wpgAnnualOfficeRent = WPG_OFFICE_RENT * totalSqft * 12;
  const officeSavings = currentAnnualOfficeRent - wpgAnnualOfficeRent;

  const currentFitout = FITOUT_BASE_COST * totalSqft;
  const wpgFitout = WPG_FITOUT_COST * totalSqft;
  const fitoutSavings = currentFitout - wpgFitout;

  const realEstateSavings = officeSavings + fitoutSavings;

  // ── 2. COMPENSATION & TAX ──────────────────────────────────
  const currentTakeHome = avgSalary * (1 - city.taxRate);
  const wpgTakeHome = avgSalary * (1 - WPG_TAX_RATE);
  const takeHomeDeltaPerEmployee = wpgTakeHome - currentTakeHome;
  const totalTakeHomeDelta = takeHomeDeltaPerEmployee * employees;

  // Cost-of-living-adjusted compensation requirement
  const wpgSalary = city.costIndex > 0 ? avgSalary * (62 / city.costIndex) : avgSalary;
  const colAdjustmentPerEmployee = avgSalary - wpgSalary;
  const totalColAdjustment = colAdjustmentPerEmployee * employees;

  const compensationSavings = totalColAdjustment; // company saves on equivalent salaries

  // ── 3. HOUSING & COST OF LIVING ────────────────────────────
  const city1brRent = city.monthlyRent2br * 0.77; // estimate 1BR from 2BR
  const rentSavingsPerEmployee = (city1brRent - WPG_1BR_RENT) * 12;
  const totalRentSavings = rentSavingsPerEmployee * employees;

  const homeEquityGainPerEmployee = city.homePrice - WPG_HOME_PRICE;
  const totalHomeEquity = homeEquityGainPerEmployee * employees;

  const wpgHomeOwnershipRate = impact?.projected_homeownership_rate ?? WPG_HOMEOWNERSHIP_RATE;

  // ── 4. WORKFORCE & RETENTION ──────────────────────────────
  const commuteDeltaMinutes = city.avgCommute - WPG_COMMUTE;
  const annualCommuteHoursRecovered =
    (commuteDeltaMinutes * 2 * 240) / 60; // per employee per year
  const totalCommuteHours = annualCommuteHoursRecovered * employees;

  // Retention
  const retentionWithout = impact?.retention_risk_without_lifestyle ?? 0.72;
  const retentionWith = impact?.retention_risk_with_lifestyle ?? 0.72;
  const attritionImprovement = retentionWith - retentionWithout; // positive = improved retention
  const hiresAvoided = Math.abs(attritionImprovement) * employees;
  const turnoverSavings = hiresAvoided * avgSalary * TURNOVER_COST_FACTOR;

  const workforceSavings = turnoverSavings;

  // ── 5. HIDDEN COSTS & INCENTIVES ──────────────────────────
  const relocationCost = -(employees * RELOCATION_COST_PER_PERSON); // one-time outlay

  // MEDITC: available to qualifying companies; 40% tax credit on eligible wages
  const meditcBenefit = avgSalary * employees * MEDITC_LABOUR_BENEFIT_RATE;

  // Recruitment savings: fewer hires needed due to better retention
  const recruitmentSavings = hiresAvoided * avgSalary * RECRUITMENT_COST_FACTOR;

  // Infrastructure: build-out cost saving on leased / new space
  const infraSavingsOneTime = fitoutSavings; // already counted above; surfaced again for transparency

  const netHiddenBenefit = meditcBenefit + recruitmentSavings; // relocation cost is separate

  // Payback period: one-time costs / annual net savings
  const annualSavingsForPayback =
    (impact?.total_annual_savings ?? officeSavings + compensationSavings) + turnoverSavings + meditcBenefit + recruitmentSavings;
  const oneTimeCosts = Math.abs(relocationCost);
  const paybackMonths = annualSavingsForPayback > 0
    ? Math.round((oneTimeCosts / annualSavingsForPayback) * 12)
    : null;

  // ── 6. FINANCIAL SUMMARY ──────────────────────────────────
  const annualOfficeSavings = impact?.annual_office_savings ?? officeSavings;
  const annualSalaryAdj = impact?.annual_salary_adjustment ?? compensationSavings;
  const totalAnnual = impact?.total_annual_savings ?? (officeSavings + compensationSavings);
  const fiveYearGross = impact?.five_year_projection ?? totalAnnual * 5;
  const fiveYearNet = fiveYearGross + (turnoverSavings + meditcBenefit + recruitmentSavings) * 5 + relocationCost;
  const roi = oneTimeCosts > 0 ? ((fiveYearNet / oneTimeCosts) * 100) : null;

  // ── Row assembly ──────────────────────────────────────────
  const rows: FinanceRow[] = [

    // ═══════════════════════════════════════════════════════
    // 1. REAL ESTATE
    // ═══════════════════════════════════════════════════════
    {
      id: "re-header",
      kind: "header",
      label: "1 — REAL ESTATE",
      currentCity: null, winnipeg: null, delta: null, pct: null,
      notes: "All rent figures in CAD/sqft/month",
      valueType: "text", highlight: "none",
    },
    {
      id: "re-rent-sqft",
      kind: "data",
      label: "Office Rent",
      currentCity: city.officeSqft,
      winnipeg: WPG_OFFICE_RENT,
      delta: city.officeSqft - WPG_OFFICE_RENT,
      pct: ((city.officeSqft - WPG_OFFICE_RENT) / city.officeSqft) * 100,
      notes: "$/sqft/mo — CBRE 2025",
      valueType: "number",
      highlight: "none",
    },
    {
      id: "re-rent-total",
      kind: "data",
      label: "Total Annual Office Rent",
      currentCity: currentAnnualOfficeRent,
      winnipeg: wpgAnnualOfficeRent,
      delta: officeSavings,
      pct: (officeSavings / currentAnnualOfficeRent) * 100,
      notes: `${employees} employees × ${sqftPerEmployee} sqft/person`,
      valueType: "currency",
      highlight: officeSavings > 0 ? "green" : "none",
    },
    {
      id: "re-fitout",
      kind: "data",
      label: "Office Fit-Out / Build-Out Cost",
      currentCity: currentFitout,
      winnipeg: wpgFitout,
      delta: fitoutSavings,
      pct: (fitoutSavings / currentFitout) * 100,
      notes: "$80/sqft base → Winnipeg $56/sqft (~30% lower; JLL 2024)",
      valueType: "currency",
      highlight: fitoutSavings > 0 ? "green" : "none",
    },
    {
      id: "re-subtotal",
      kind: "subtotal",
      label: "Real Estate Subtotal",
      currentCity: null,
      winnipeg: null,
      delta: realEstateSavings,
      pct: null,
      notes: "Annual recurring savings + one-time fit-out delta",
      valueType: "currency",
      highlight: realEstateSavings > 0 ? "gold" : "red",
    },

    // ═══════════════════════════════════════════════════════
    // 2. COMPENSATION & TAX
    // ═══════════════════════════════════════════════════════
    {
      id: "ct-header",
      kind: "header",
      label: "2 — COMPENSATION & TAX",
      currentCity: null, winnipeg: null, delta: null, pct: null,
      notes: "Provincial marginal rates for $80K–$100K income bracket",
      valueType: "text", highlight: "none",
    },
    {
      id: "ct-tax-rate",
      kind: "data",
      label: "Provincial Tax Rate (marginal)",
      currentCity: city.taxRate * 100,
      winnipeg: WPG_TAX_RATE * 100,
      delta: (city.taxRate - WPG_TAX_RATE) * 100,
      pct: null,
      notes: "Includes federal + provincial combined marginal rate",
      valueType: "percent",
      highlight: "none",
    },
    {
      id: "ct-avg-salary",
      kind: "data",
      label: "Avg Annual Gross Salary",
      currentCity: avgSalary,
      winnipeg: avgSalary,
      delta: 0,
      pct: 0,
      notes: "As entered — no change assumed",
      valueType: "currency",
      highlight: "none",
    },
    {
      id: "ct-takehome",
      kind: "data",
      label: "Avg Employee Take-Home / yr",
      currentCity: currentTakeHome,
      winnipeg: wpgTakeHome,
      delta: takeHomeDeltaPerEmployee,
      pct: (takeHomeDeltaPerEmployee / currentTakeHome) * 100,
      notes: "After-tax income per employee",
      valueType: "currency",
      highlight: takeHomeDeltaPerEmployee > 0 ? "green" : "none",
    },
    {
      id: "ct-takehome-total",
      kind: "data",
      label: "Total Workforce Take-Home Increase",
      currentCity: currentTakeHome * employees,
      winnipeg: wpgTakeHome * employees,
      delta: totalTakeHomeDelta,
      pct: (totalTakeHomeDelta / (currentTakeHome * employees)) * 100,
      notes: `${employees} employees`,
      valueType: "currency",
      highlight: totalTakeHomeDelta > 0 ? "green" : "none",
    },
    {
      id: "ct-col-adj",
      kind: "data",
      label: "Cost-of-Living Salary Adjustment (Company)",
      currentCity: avgSalary * employees,
      winnipeg: wpgSalary * employees,
      delta: totalColAdjustment,
      pct: colAdjustmentPerEmployee > 0 ? (colAdjustmentPerEmployee / avgSalary) * 100 : 0,
      notes: `Equivalent purchasing power at Winnipeg CoL index (${city.costIndex} → 62)`,
      valueType: "currency",
      highlight: totalColAdjustment > 0 ? "gold" : "none",
    },
    {
      id: "ct-subtotal",
      kind: "subtotal",
      label: "Compensation & Tax Subtotal",
      currentCity: null,
      winnipeg: null,
      delta: compensationSavings,
      pct: null,
      notes: "Annual company savings from equivalent-purchasing-power salary",
      valueType: "currency",
      highlight: compensationSavings > 0 ? "gold" : "red",
    },

    // ═══════════════════════════════════════════════════════
    // 3. HOUSING & COST OF LIVING
    // ═══════════════════════════════════════════════════════
    {
      id: "hcl-header",
      kind: "header",
      label: "3 — HOUSING & COST OF LIVING",
      currentCity: null, winnipeg: null, delta: null, pct: null,
      notes: "Employee-facing financials — key talent attraction metrics",
      valueType: "text", highlight: "none",
    },
    {
      id: "hcl-1br",
      kind: "data",
      label: "Avg 1BR Monthly Rent",
      currentCity: Math.round(city1brRent),
      winnipeg: WPG_1BR_RENT,
      delta: Math.round(city1brRent) - WPG_1BR_RENT,
      pct: ((city1brRent - WPG_1BR_RENT) / city1brRent) * 100,
      notes: "$/mo — per employee",
      valueType: "currency",
      highlight: "none",
    },
    {
      id: "hcl-rent-annual",
      kind: "data",
      label: "Annual Rental Savings (Workforce)",
      currentCity: Math.round(city1brRent) * 12 * employees,
      winnipeg: WPG_1BR_RENT * 12 * employees,
      delta: totalRentSavings,
      pct: (totalRentSavings / (city1brRent * 12 * employees)) * 100,
      notes: "Employee-side benefit (talent retention signal)",
      valueType: "currency",
      highlight: totalRentSavings > 0 ? "green" : "none",
    },
    {
      id: "hcl-home-price",
      kind: "data",
      label: "Avg Home Price",
      currentCity: city.homePrice,
      winnipeg: WPG_HOME_PRICE,
      delta: city.homePrice - WPG_HOME_PRICE,
      pct: ((city.homePrice - WPG_HOME_PRICE) / city.homePrice) * 100,
      notes: "Benchmark purchase price (CREA 2025)",
      valueType: "currency",
      highlight: "none",
    },
    {
      id: "hcl-equity",
      kind: "data",
      label: "Housing Equity Arbitrage (per Employee)",
      currentCity: null,
      winnipeg: WPG_HOME_PRICE,
      delta: homeEquityGainPerEmployee,
      pct: null,
      notes: "Capital freed up from lower purchase price",
      valueType: "currency",
      highlight: homeEquityGainPerEmployee > 0 ? "gold" : "none",
    },
    {
      id: "hcl-ownership",
      kind: "data",
      label: "Projected Homeownership Rate",
      currentCity: null,
      winnipeg: Math.round(wpgHomeOwnershipRate * 100),
      delta: null,
      pct: null,
      notes: impact ? "Via impact model" : "Winnipeg baseline 70%",
      valueType: "percent",
      highlight: "none",
    },
    {
      id: "hcl-subtotal",
      kind: "subtotal",
      label: "Housing & CoL Workforce Benefit",
      currentCity: null,
      winnipeg: null,
      delta: totalRentSavings,
      pct: null,
      notes: "Annual employee-side savings (retention & attraction value)",
      valueType: "currency",
      highlight: totalRentSavings > 0 ? "gold" : "red",
    },

    // ═══════════════════════════════════════════════════════
    // 4. WORKFORCE & RETENTION
    // ═══════════════════════════════════════════════════════
    {
      id: "wr-header",
      kind: "header",
      label: "4 — WORKFORCE & RETENTION",
      currentCity: null, winnipeg: null, delta: null, pct: null,
      notes: "Attrition modelling and commute quality metrics",
      valueType: "text", highlight: "none",
    },
    {
      id: "wr-commute",
      kind: "data",
      label: "Avg Daily Commute",
      currentCity: city.avgCommute,
      winnipeg: WPG_COMMUTE,
      delta: -(commuteDeltaMinutes),
      pct: commuteDeltaMinutes > 0 ? -((commuteDeltaMinutes / city.avgCommute) * 100) : 0,
      notes: "Minutes one-way (TransLink / Metrolinx / Stats Can)",
      valueType: "minutes",
      highlight: commuteDeltaMinutes > 0 ? "green" : "none",
    },
    {
      id: "wr-commute-hours",
      kind: "data",
      label: "Commute Hours Recovered / yr (Workforce)",
      currentCity: null,
      winnipeg: null,
      delta: totalCommuteHours,
      pct: null,
      notes: `${Math.round(annualCommuteHoursRecovered)} hrs/employee × ${employees} people`,
      valueType: "hours",
      highlight: totalCommuteHours > 0 ? "green" : "none",
    },
    {
      id: "wr-retention-without",
      kind: "data",
      label: "Est. Annual Retention Rate (Current City)",
      currentCity: Math.round(retentionWithout * 100),
      winnipeg: null,
      delta: null,
      pct: null,
      notes: impact ? "Via impact model" : "Industry heuristic baseline 72%",
      valueType: "percent",
      highlight: "none",
    },
    {
      id: "wr-retention-with",
      kind: "data",
      label: "Est. Annual Retention Rate (Winnipeg)",
      currentCity: null,
      winnipeg: Math.round(retentionWith * 100),
      delta: Math.round((retentionWith - retentionWithout) * 100),
      pct: null,
      notes: impact ? "Lifestyle-adjusted via impact model" : "Baseline estimate",
      valueType: "percent",
      highlight: retentionWith > retentionWithout ? "green" : "none",
    },
    {
      id: "wr-turnover-cost",
      kind: "data",
      label: "Turnover Replacement Cost / hire",
      currentCity: Math.round(avgSalary * TURNOVER_COST_FACTOR),
      winnipeg: Math.round(avgSalary * TURNOVER_COST_FACTOR),
      delta: 0,
      pct: 0,
      notes: "25% of avg salary (SHRM 2024 benchmark)",
      valueType: "currency",
      highlight: "none",
    },
    {
      id: "wr-attrition-savings",
      kind: "data",
      label: "Annual Attrition Cost Reduction",
      currentCity: null,
      winnipeg: null,
      delta: turnoverSavings,
      pct: null,
      notes: `~${hiresAvoided.toFixed(1)} fewer replacement hires/yr`,
      valueType: "currency",
      highlight: turnoverSavings > 0 ? "gold" : "none",
    },
    {
      id: "wr-subtotal",
      kind: "subtotal",
      label: "Workforce & Retention Subtotal",
      currentCity: null,
      winnipeg: null,
      delta: workforceSavings,
      pct: null,
      notes: "Annual company savings from improved retention",
      valueType: "currency",
      highlight: workforceSavings > 0 ? "gold" : "red",
    },

    // ═══════════════════════════════════════════════════════
    // 5. HIDDEN COSTS & INCENTIVES
    // ═══════════════════════════════════════════════════════
    {
      id: "hci-header",
      kind: "header",
      label: "5 — HIDDEN COSTS & INCENTIVES",
      currentCity: null, winnipeg: null, delta: null, pct: null,
      notes: "One-time transition costs netted against government incentives",
      valueType: "text", highlight: "none",
    },
    {
      id: "hci-relocation",
      kind: "data",
      label: "One-Time Relocation Allowance",
      currentCity: null,
      winnipeg: relocationCost,
      delta: relocationCost,
      pct: null,
      notes: "$10,000/employee industry benchmark; one-time",
      valueType: "currency",
      highlight: "red",
    },
    {
      id: "hci-meditc",
      kind: "data",
      label: "MEDITC / Manitoba Digital Media Tax Credit*",
      currentCity: null,
      winnipeg: meditcBenefit,
      delta: meditcBenefit,
      pct: null,
      notes: "* If applicable. 40% labour credit on qualifying wages; ~15% effective benefit",
      valueType: "currency",
      highlight: "gold",
    },
    {
      id: "hci-recruitment",
      kind: "data",
      label: "Recruitment Cost Savings",
      currentCity: null,
      winnipeg: recruitmentSavings,
      delta: recruitmentSavings,
      pct: null,
      notes: "15% of salary × hires avoided from retention improvement",
      valueType: "currency",
      highlight: recruitmentSavings > 0 ? "green" : "none",
    },
    {
      id: "hci-infra",
      kind: "data",
      label: "Infrastructure / Fit-Out Savings (one-time)",
      currentCity: currentFitout,
      winnipeg: wpgFitout,
      delta: infraSavingsOneTime,
      pct: (infraSavingsOneTime / currentFitout) * 100,
      notes: "Lower build-out cost vs. major city rates",
      valueType: "currency",
      highlight: infraSavingsOneTime > 0 ? "green" : "none",
    },
    {
      id: "hci-payback",
      kind: "data",
      label: "Estimated Payback Period",
      currentCity: null,
      winnipeg: paybackMonths,
      delta: null,
      pct: null,
      notes: "Months until cumulative savings cover relocation cost",
      valueType: "months",
      highlight: paybackMonths !== null && paybackMonths <= 18 ? "gold" : "none",
    },
    {
      id: "hci-subtotal",
      kind: "subtotal",
      label: "Hidden Costs & Incentives Net",
      currentCity: null,
      winnipeg: null,
      delta: netHiddenBenefit + relocationCost,
      pct: null,
      notes: "Net of one-time relocation cost + recurring incentive/savings benefit",
      valueType: "currency",
      highlight: (netHiddenBenefit + relocationCost) >= 0 ? "gold" : "red",
    },

    // ═══════════════════════════════════════════════════════
    // 6. FINANCIAL SUMMARY
    // ═══════════════════════════════════════════════════════
    {
      id: "fs-header",
      kind: "header",
      label: "6 — FINANCIAL SUMMARY",
      currentCity: null, winnipeg: null, delta: null, pct: null,
      notes: "Combined company + employee financial benefit",
      valueType: "text", highlight: "none",
    },
    {
      id: "fs-office-savings",
      kind: "summary",
      label: "Annual Office & Real Estate Savings",
      currentCity: null,
      winnipeg: null,
      delta: annualOfficeSavings,
      pct: null,
      notes: "Recurring annual benefit",
      valueType: "currency",
      highlight: "gold",
    },
    {
      id: "fs-workforce-savings",
      kind: "summary",
      label: "Annual Workforce Savings",
      currentCity: null,
      winnipeg: null,
      delta: annualSalaryAdj + turnoverSavings,
      pct: null,
      notes: "CoL salary adjustment + attrition cost reduction",
      valueType: "currency",
      highlight: "gold",
    },
    {
      id: "fs-total-annual",
      kind: "summary",
      label: "Total Annual Savings",
      currentCity: null,
      winnipeg: null,
      delta: totalAnnual + turnoverSavings + meditcBenefit + recruitmentSavings,
      pct: null,
      notes: "All recurring annual benefits",
      valueType: "currency",
      highlight: "gold",
    },
    {
      id: "fs-5yr",
      kind: "summary",
      label: "5-Year Gross Projection",
      currentCity: null,
      winnipeg: null,
      delta: fiveYearGross + (turnoverSavings + meditcBenefit + recruitmentSavings) * 5,
      pct: null,
      notes: "Before one-time transition costs",
      valueType: "currency",
      highlight: "gold",
    },
    {
      id: "fs-5yr-net",
      kind: "summary",
      label: "5-Year Net Benefit (After Transition Costs)",
      currentCity: null,
      winnipeg: null,
      delta: fiveYearNet,
      pct: null,
      notes: "Net of relocation allowance",
      valueType: "currency",
      highlight: fiveYearNet > 0 ? "gold" : "red",
    },
    {
      id: "fs-roi",
      kind: "summary",
      label: "5-Year ROI on Relocation Investment",
      currentCity: null,
      winnipeg: null,
      delta: roi,
      pct: roi,
      notes: "Return on relocation cost over 5 years",
      valueType: "percent",
      highlight: roi !== null && roi > 0 ? "gold" : "red",
    },
  ];

  return rows;
}

// ── Formatting helpers ────────────────────────────────────────

export function formatValue(val: number | string | null, type: ValueType): string {
  if (val === null) return "—";
  if (typeof val === "string") return val;
  const n = val as number;
  switch (type) {
    case "currency":
      if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
      if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
      return `$${n.toFixed(0)}`;
    case "percent":
      return `${n.toFixed(1)}%`;
    case "minutes":
      return `${Math.round(Math.abs(n))} min`;
    case "hours":
      return `${Math.round(Math.abs(n)).toLocaleString()} hrs`;
    case "months":
      return `${Math.round(n)} mo`;
    case "number":
      return n.toFixed(n < 100 ? 2 : 0);
    default:
      return String(n);
  }
}

export function formatDelta(delta: number | null, type: ValueType): string {
  if (delta === null) return "—";
  const sign = delta > 0 ? "+" : "";
  switch (type) {
    case "currency":
      if (Math.abs(delta) >= 1_000_000) return `${sign}$${(delta / 1_000_000).toFixed(2)}M`;
      if (Math.abs(delta) >= 1_000) return `${sign}$${(delta / 1_000).toFixed(1)}K`;
      return `${sign}$${delta.toFixed(0)}`;
    case "percent":
      return `${sign}${delta.toFixed(1)}pp`;
    case "minutes":
      return `${sign}${Math.round(delta)} min`;
    case "hours":
      return `${sign}${Math.round(delta).toLocaleString()} hrs`;
    case "months":
      return `${sign}${Math.round(delta)} mo`;
    default:
      return `${sign}${delta.toFixed(1)}`;
  }
}
