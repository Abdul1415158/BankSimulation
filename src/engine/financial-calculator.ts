/**
 * BANKVERSE Financial Calculator
 *
 * All financial formulas for the banking simulation.
 * This module runs server-side only — the client never performs these calculations.
 */

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ===== INCOME STATEMENT =====

export function calcNetInterestIncome(interestIncome: number, interestExpense: number): number {
  return interestIncome - interestExpense;
}

export function calcTotalRevenue(nii: number, feeIncome: number, investmentIncome: number): number {
  return nii + feeIncome + investmentIncome;
}

export function calcNetProfit(
  totalRevenue: number,
  totalExpenses: number,
  creditLosses: number,
  taxRate: number = 0.25
): number {
  const preTax = totalRevenue - totalExpenses - creditLosses;
  const tax = preTax > 0 ? preTax * taxRate : 0;
  return preTax - tax;
}

// ===== BALANCE SHEET =====

export function calcTotalAssets(
  cash: number,
  loans: number,
  investments: number,
  otherAssets: number = 0
): number {
  return cash + loans + investments + otherAssets;
}

export function calcTotalEquity(totalAssets: number, totalLiabilities: number): number {
  return totalAssets - totalLiabilities;
}

/** Assert accounting identity: Assets = Liabilities + Equity */
export function assertAccountingIdentity(
  assets: number,
  liabilities: number,
  equity: number,
  tolerance: number = 0.01
): boolean {
  return Math.abs(assets - (liabilities + equity)) <= tolerance;
}

// ===== KEY RATIOS =====

export function calcLiquidityRatio(liquidAssets: number, totalDeposits: number): number {
  if (totalDeposits === 0) return 1;
  return liquidAssets / totalDeposits;
}

export function calcCapitalAdequacy(equity: number, riskWeightedAssets: number): number {
  if (riskWeightedAssets === 0) return 1;
  return equity / riskWeightedAssets;
}

export function calcNPLRatio(npl: number, totalLoans: number): number {
  if (totalLoans === 0) return 0;
  return npl / totalLoans;
}

export function calcNetInterestMargin(nii: number, avgEarningAssets: number): number {
  if (avgEarningAssets === 0) return 0;
  return nii / avgEarningAssets;
}

export function calcROA(netProfit: number, avgTotalAssets: number): number {
  if (avgTotalAssets === 0) return 0;
  return netProfit / avgTotalAssets;
}

export function calcROE(netProfit: number, avgEquity: number): number {
  if (avgEquity === 0) return 0;
  return netProfit / avgEquity;
}

export const calcCapitalAdequacyRatio = calcCapitalAdequacy;
export const calcNplRatio = calcNPLRatio;
export const calcRoe = calcROE;
export const calcRoa = calcROA;

export function calcCostToIncome(expenses: number, revenue: number): number {
  if (revenue === 0) return 1;
  return expenses / revenue;
}

// ===== INTEREST CALCULATIONS =====

/** Quarterly interest on a loan or deposit */
export function quarterlyInterest(principal: number, annualRate: number): number {
  return principal * (annualRate / 4);
}

// ===== RISK WEIGHTS (simplified Basel) =====

export function calcRiskWeightedAssets(
  cash: number,
  govBonds: number,
  mortgages: number,
  retailLoans: number,
  corporateLoans: number,
  otherAssets: number
): number {
  return (
    cash * 0.0 +
    govBonds * 0.0 +
    mortgages * 0.35 +
    retailLoans * 0.75 +
    corporateLoans * 1.0 +
    otherAssets * 1.0
  );
}

// ===== LOAN DEFAULT PROBABILITY =====

export function calcBaseDefaultProb(creditScore: number, loanType: string): number {
  // Higher credit score = lower default probability
  const scoreComponent = Math.max(0, (850 - creditScore) / 850) * 0.15;
  const typeMultiplier: Record<string, number> = {
    personal: 1.2,
    business: 1.3,
    mortgage: 0.6,
    vehicle: 0.9,
    corporate: 1.0,
  };
  return scoreComponent * (typeMultiplier[loanType] || 1.0);
}

export function calcAdjustedDefault(
  baseProb: number,
  gdpGrowth: number,
  unemployment: number,
  quartersOverdue: number
): number {
  // Economic multiplier: worse economy = higher defaults
  const econMultiplier = 1 + (unemployment - 5) * 0.1 - gdpGrowth * 0.05;
  const overdueMultiplier = 1 + quartersOverdue * 0.15;
  return clamp(baseProb * Math.max(0.1, econMultiplier) * overdueMultiplier, 0, 1);
}

// ===== WORKFORCE COSTS =====

export function calcHumanQuarterlyCost(
  annualSalary: number,
  trainingCostPerYear: number = 0,
  benefitsRate: number = 0.25
): number {
  const salary = annualSalary / 4;
  const training = trainingCostPerYear / 4;
  const benefits = salary * benefitsRate;
  return salary + training + benefits;
}

export function calcAIQuarterlyCost(
  operatingCost: number,
  maintenanceCost: number,
  supervisionHours: number = 0,
  supervisorHourlyRate: number = 50
): number {
  return operatingCost + maintenanceCost + supervisionHours * supervisorHourlyRate;
}

// ===== CUSTOMER SATISFACTION =====

export function calcCustomerSatisfaction(
  waitingTimeFactor: number,
  accuracyFactor: number,
  complaintResolution: number,
  digitalAvailability: number,
  interactionQuality: number
): number {
  const weights = { wait: 0.2, accuracy: 0.2, complaints: 0.2, digital: 0.15, interaction: 0.25 };
  const score =
    waitingTimeFactor * weights.wait +
    accuracyFactor * weights.accuracy +
    complaintResolution * weights.complaints +
    digitalAvailability * weights.digital +
    interactionQuality * weights.interaction;
  return clamp(score, 0, 100);
}
