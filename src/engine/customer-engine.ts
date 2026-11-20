/**
 * BANKVERSE Customer & Credit Engine
 *
 * Simulates retail & commercial customer behavior, deposit elasticity,
 * loan origination, credit scoring, and default probabilities.
 */

import { clamp } from "./financial-calculator";
import { Mulberry32 } from "./prng";

export interface Customer {
  id: string;
  name: string;
  category: "individual" | "small_business" | "medium_business" | "corporate";
  credit_score: number; // 300 - 850
  risk_category: "prime" | "near_prime" | "subprime" | "high_risk";
  total_deposits: number;
  total_loans: number;
  satisfaction_score: number; // 0 - 100
  loyalty_years: number;
}

export interface LoanApplication {
  id: string;
  customerId: string;
  customerName: string;
  category: "retail" | "mortgage" | "sme" | "corporate";
  requestedAmount: number;
  creditScore: number;
  offeredRate: number;
  termMonths: number;
  collateralValue: number;
  aiRecommendation?: "approve" | "review" | "reject";
  aiConfidence?: number;
}

export interface DepositRatePolicy {
  retailDepositRate: number; // e.g. 0.035 (3.5%)
  commercialDepositRate: number;
  savingsRate: number;
  marketBenchmarkRate: number;
}

/**
 * Calculate deposit inflows / outflows based on bank rates vs market benchmark
 */
export function simulateDepositFlows(
  currentDeposits: number,
  ratePolicy: DepositRatePolicy,
  bankReputation: number, // 0 - 100
  customerSatisfaction: number, // 0 - 100
  prng: Mulberry32
): {
  newDepositsTotal: number;
  netFlow: number;
  interestExpenseQuarter: number;
} {
  const rateSpread = ratePolicy.retailDepositRate - ratePolicy.marketBenchmarkRate;
  
  // Rate elasticity: +1% spread attracts ~8% deposit growth
  const elasticityFactor = rateSpread * 8.0;

  // Reputation & satisfaction impact
  const satisfactionImpact = (customerSatisfaction - 70) * 0.002;
  const reputationImpact = (bankReputation - 70) * 0.002;

  // Random macro fluctuation (+- 2%)
  const macroNoise = prng.range(-0.02, 0.02);

  const growthRate = clamp(elasticityFactor + satisfactionImpact + reputationImpact + macroNoise, -0.25, 0.25);
  const netFlow = currentDeposits * growthRate;
  const newDepositsTotal = Math.max(1000000, currentDeposits + netFlow);

  // Quarterly interest expense on average deposit balance
  const avgDeposits = (currentDeposits + newDepositsTotal) / 2;
  const blendedRate = (ratePolicy.retailDepositRate + ratePolicy.savingsRate) / 2;
  const interestExpenseQuarter = (avgDeposits * blendedRate) / 4;

  return {
    newDepositsTotal,
    netFlow,
    interestExpenseQuarter,
  };
}

/**
 * Generate quarterly loan applications based on market demand and lending rates
 */
export function generateLoanApplications(
  bankType: string,
  lendingRateSpread: number, // Our loan rate vs market (lower attracts more volume)
  gdpGrowthRate: number,
  prng: Mulberry32
): LoanApplication[] {
  const applications: LoanApplication[] = [];
  
  // Base volume modified by economic growth and rate competitiveness
  const baseCount = Math.round(15 + gdpGrowthRate * 200 - lendingRateSpread * 50);
  const count = clamp(baseCount, 5, 40);

  const categories: ("retail" | "mortgage" | "sme" | "corporate")[] = 
    bankType === "retail" 
      ? ["retail", "retail", "mortgage", "mortgage", "sme"]
      : bankType === "corporate"
      ? ["sme", "corporate", "corporate", "corporate"]
      : ["retail", "mortgage", "sme", "corporate"];

  for (let i = 0; i < count; i++) {
    const category = prng.pick(categories);
    const score = Math.round(prng.range(540, 810));
    
    let requestedAmount = 0;
    let collateral = 0;
    let termMonths = 12;

    switch (category) {
      case "retail":
        requestedAmount = Math.round(prng.range(5000, 35000) / 1000) * 1000;
        collateral = requestedAmount * prng.range(0, 0.5);
        termMonths = prng.pick([12, 24, 36, 48]);
        break;
      case "mortgage":
        requestedAmount = Math.round(prng.range(150000, 750000) / 5000) * 5000;
        collateral = requestedAmount * prng.range(1.1, 1.4);
        termMonths = prng.pick([180, 240, 360]);
        break;
      case "sme":
        requestedAmount = Math.round(prng.range(50000, 500000) / 10000) * 10000;
        collateral = requestedAmount * prng.range(0.6, 1.2);
        termMonths = prng.pick([36, 60, 84]);
        break;
      case "corporate":
        requestedAmount = Math.round(prng.range(1000000, 8000000) / 100000) * 100000;
        collateral = requestedAmount * prng.range(0.8, 1.5);
        termMonths = prng.pick([60, 120]);
        break;
    }

    // AI Underwriting recommendation simulation
    // Note: AI is conservative on credit score, but fast
    let aiRecommendation: "approve" | "review" | "reject" = "review";
    let aiConfidence = 0.85;

    if (score >= 720 && collateral >= requestedAmount * 0.8) {
      aiRecommendation = "approve";
      aiConfidence = 0.95;
    } else if (score < 600 || (category === "corporate" && collateral < requestedAmount * 0.5)) {
      aiRecommendation = "reject";
      aiConfidence = 0.91;
    } else {
      aiRecommendation = "review"; // Human expertise needed for edge cases!
      aiConfidence = 0.72;
    }

    applications.push({
      id: `appl-${Date.now()}-${i}`,
      customerId: `cust-${1000 + i}`,
      customerName: `Borrower #${1000 + i} (${category.toUpperCase()})`,
      category,
      requestedAmount,
      creditScore: score,
      offeredRate: 0.075 + (category === "corporate" ? -0.015 : 0.02),
      termMonths,
      collateralValue: Math.round(collateral),
      aiRecommendation,
      aiConfidence,
    });
  }

  return applications;
}

/**
 * Calculate quarterly loan portfolio repayment, interest income, and default write-offs
 */
export function processLoanPortfolioQuarter(
  totalLoanBook: number,
  averageLendingRate: number,
  unemploymentRate: number, // e.g. 0.05
  creditLossProvisionsCurrent: number,
  prng: Mulberry32
): {
  interestIncomeQuarter: number;
  principalRepayments: number;
  defaultLosses: number;
  updatedLoanBook: number;
  newNplAmount: number;
} {
  // Quarterly interest income
  const interestIncomeQuarter = (totalLoanBook * averageLendingRate) / 4;

  // Regular principal amortization (~4-6% of portfolio paid down quarterly)
  const principalRepayments = totalLoanBook * prng.range(0.04, 0.06);

  // Baseline default rate based on macro unemployment and stress
  let quarterlyDefaultRate = 0.004; // 0.4% per quarter = ~1.6% annual
  if (unemploymentRate > 0.06) {
    quarterlyDefaultRate += (unemploymentRate - 0.06) * 0.15;
  }

  const defaultLosses = totalLoanBook * quarterlyDefaultRate;
  const newNplAmount = defaultLosses * 1.5; // NPL is loans in arrears

  const updatedLoanBook = Math.max(0, totalLoanBook - principalRepayments - defaultLosses);

  return {
    interestIncomeQuarter,
    principalRepayments,
    defaultLosses,
    updatedLoanBook,
    newNplAmount,
  };
}
