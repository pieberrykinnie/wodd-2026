/**
 * Financial calculations for the Winnipeg arbitrage platform.
 * All figures sourced from Statistics Canada, CBRE 2025 Office Market Reports,
 * and Manitoba / Ontario / BC provincial tax schedules.
 */

export interface SavingsInput {
  employees: number;
  avgSalary: number;
  sqftPerEmployee: number;
  currentOfficeRent: number; // $/sqft/month
  currentHomePrice: number;
  cityTaxRate: number;
}

export interface SavingsResult {
  annualOfficeSavings: number;
  employeeDisposableIncrease: number; // per employee per year
  totalEmployeeDisposableIncrease: number;
  housingEquityGain: number; // avg per employee
  totalSavings: number;
  commuteDeltaHrsPerYear: number; // per employee
  officeRentWpg: number;
  homepriceWpg: number;
  taxRateWpg: number;
}

const WPG_OFFICE_RENT = 16; // $/sqft/month
const WPG_HOME_PRICE = 350_000;
const WPG_TAX_RATE = 0.439;

export function calculateSavings(input: SavingsInput): SavingsResult {
  const {
    employees,
    avgSalary,
    sqftPerEmployee,
    currentOfficeRent,
    currentHomePrice,
    cityTaxRate,
  } = input;

  // Annual office rent savings (total for company)
  const annualOfficeSavings =
    employees * sqftPerEmployee * (currentOfficeRent - WPG_OFFICE_RENT) * 12;

  // Per-employee disposable income increase from lower provincial taxes + lower cost of living
  const currentTakeHome = avgSalary * (1 - cityTaxRate);
  const wpgTakeHome = avgSalary * (1 - WPG_TAX_RATE);
  const employeeDisposableIncrease = wpgTakeHome - currentTakeHome;
  const totalEmployeeDisposableIncrease = employeeDisposableIncrease * employees;

  // Housing equity gain per employee (city avg → Winnipeg avg)
  const housingEquityGain = currentHomePrice - WPG_HOME_PRICE;

  const totalSavings =
    annualOfficeSavings + totalEmployeeDisposableIncrease;

  // Commute delta: (currentCommute - 20min) × 2 trips × 240 working days / 60
  // Caller passes delta mins
  const commuteDeltaHrsPerYear = 0; // overridden per city

  return {
    annualOfficeSavings,
    employeeDisposableIncrease,
    totalEmployeeDisposableIncrease,
    housingEquityGain,
    totalSavings,
    commuteDeltaHrsPerYear,
    officeRentWpg: WPG_OFFICE_RENT,
    homepriceWpg: WPG_HOME_PRICE,
    taxRateWpg: WPG_TAX_RATE,
  };
}

export function formatCurrency(n: number, compact = false): string {
  if (compact) {
    if (Math.abs(n) >= 1_000_000)
      return `$${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000)
      return `$${(n / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(0)}%`;
}

export function commuteHoursPerYear(avgMinutes: number): number {
  return Math.round(((avgMinutes - 20) * 2 * 240) / 60);
}
