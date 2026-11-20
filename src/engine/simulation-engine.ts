/**
 * BANKVERSE 15-Step Quarterly Simulation Engine Orchestrator
 *
 * Implements the comprehensive quarterly tick connecting:
 * - Macroeconomy & benchmark rates
 * - Customer deposit elasticity & interest expense
 * - Loan underwriting, yields, repayments & defaults
 * - Human vs AI workforce productivity, operating costs & turnover
 * - Treasury cash management & regulatory reserves
 * - Crisis events & mitigation decisions
 * - Double-entry financial statements & Basel III ratios
 */

import { Mulberry32 } from "./prng";
import {
  calcNetInterestIncome,
  calcTotalRevenue,
  calcNetProfit,
  calcTotalAssets,
  calcTotalEquity,
  calcCapitalAdequacyRatio,
  calcLiquidityRatio,
  calcNplRatio,
  calcRoe,
  calcRoa,
  clamp,
} from "./financial-calculator";
import {
  calculateDepartmentWorkforce,
  checkQuarterlyTurnover,
  Employee,
  AIAgent,
  VacancyEvent,
} from "./workforce-engine";
import {
  simulateDepositFlows,
  processLoanPortfolioQuarter,
} from "./customer-engine";
import {
  checkQuarterlyCrisis,
  CrisisEvent,
} from "./crisis-engine";
import {
  advanceMacroEconomy,
  updateCompetitorBanks,
  EconomicState,
  CompetitorBank,
} from "./economic-engine";

export interface SimulationStateInput {
  bankId: string;
  quarter: number;
  year: number;
  cash: number;
  loans: number;
  deposits: number;
  investments: number;
  equity: number;
  reputation: number;
  customerSatisfaction: number;
  macro: EconomicState;
  competitors: CompetitorBank[];
  employees: Employee[];
  aiAgents: AIAgent[];
  activeCrises: CrisisEvent[];
  // User quarterly decisions:
  decisions: {
    retailDepositRate: number; // e.g. 0.035
    commercialDepositRate: number;
    retailLendingRate: number; // e.g. 0.075
    corporateLendingRate: number;
    investmentAllocation: number; // amount into government bonds
    dividendPayoutRatio: number; // 0.0 - 0.5
    selectedCrisisOptionId?: string;
  };
}

export interface SimulationStepResult {
  nextQuarter: number;
  nextYear: number;
  cash: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalDeposits: number;
  totalLoans: number;
  investments: number;
  netInterestIncome: number;
  interestIncome: number;
  interestExpense: number;
  nonInterestIncome: number;
  operatingExpenses: number;
  creditLosses: number;
  netProfit: number;
  capitalAdequacyRatio: number;
  liquidityRatio: number;
  nplRatio: number;
  roe: number;
  roa: number;
  reputation: number;
  customerSatisfaction: number;
  resignedEmployees: Employee[];
  newVacancies: VacancyEvent[];
  activeCrisis: CrisisEvent | null;
  updatedMacro: EconomicState;
  updatedCompetitors: CompetitorBank[];
}

export function executeQuarterSimulation(
  input: SimulationStateInput,
  seed?: number
): SimulationStepResult {
  const prng = new Mulberry32(seed ?? (Date.now() ^ (input.quarter * 1000 + input.year)));

  // 1. Advance Macroeconomy
  const updatedMacro = advanceMacroEconomy(input.macro, prng);

  // 2. Workforce Calculations (Human Salaries + AI Costs + Synergy)
  let totalSalaries = 0;
  let totalAiCost = 0;
  let totalOperationalRisk = 0;
  let workforceCsImpact = 0;

  // Group by department
  const depts = ["cs", "credit", "cash", "risk", "fraud", "treasury", "compliance", "hr", "digital", "it"];
  for (const dId of depts) {
    const dEmps = input.employees.filter((e) => e.department_id === dId || e.department_id === `dept-${dId}`);
    const dAi = input.aiAgents.filter((a) => a.department_id === dId || a.department_id === `dept-${dId}`);
    const m = calculateDepartmentWorkforce(dId, dId, dEmps, dAi);
    totalSalaries += m.humanSalaryCost;
    totalAiCost += m.aiOperatingCost;
    totalOperationalRisk += m.operationalRisk;
    workforceCsImpact += m.customerSatisfactionImpact;
  }
  totalOperationalRisk /= depts.length;

  // Check employee resignations
  const salaryBenchmark = 1.0; // Assume competitive baseline
  const { resignedEmployees, vacancies: newVacancies } = checkQuarterlyTurnover(
    input.employees,
    salaryBenchmark,
    prng
  );

  // 3. Customer Deposit Movements
  const depositSim = simulateDepositFlows(
    input.deposits,
    {
      retailDepositRate: input.decisions.retailDepositRate,
      commercialDepositRate: input.decisions.commercialDepositRate,
      savingsRate: input.decisions.retailDepositRate * 0.8,
      marketBenchmarkRate: updatedMacro.benchmark_interest_rate,
    },
    input.reputation,
    input.customerSatisfaction,
    prng
  );

  // 4. Loan Portfolio (Interest Income, Principal Paydowns, Defaults)
  const avgLendingRate = (input.decisions.retailLendingRate + input.decisions.corporateLendingRate) / 2;
  const loanSim = processLoanPortfolioQuarter(
    input.loans,
    avgLendingRate,
    updatedMacro.unemployment_rate,
    input.loans * 0.01,
    prng
  );

  // 5. Treasury & Investments (Government bonds earn benchmark rate + 0.5%)
  const bondYieldQuarter = (input.investments * (updatedMacro.benchmark_interest_rate + 0.005)) / 4;

  // 6. Fee Income (Processing, accounts, wire fees: ~0.15% of deposits quarterly)
  const feeIncome = depositSim.newDepositsTotal * 0.0015;

  // 7. Crisis Evaluation & Resolution
  let currentCrisis: CrisisEvent | null = input.activeCrises.find((c) => !c.resolved) || null;
  let crisisCashPenalty = 0;
  let crisisDepositDrain = 0;
  let crisisReputationDelta = 0;

  if (currentCrisis) {
    // Resolve existing crisis if user made a choice
    const chosen = currentCrisis.options.find((o) => o.id === input.decisions.selectedCrisisOptionId) || currentCrisis.options[0];
    currentCrisis.resolved = true;
    currentCrisis.chosenOptionId = chosen.id;
    crisisCashPenalty += chosen.cost;
    crisisReputationDelta += chosen.reputationDelta;

    // Remaining unmitigated impact
    const unmitigated = 1.0 - chosen.mitigationPct;
    if (currentCrisis.financialImpact.immediateCashPenalty) {
      crisisCashPenalty += currentCrisis.financialImpact.immediateCashPenalty * unmitigated;
    }
    if (currentCrisis.financialImpact.depositWithdrawalPct) {
      crisisDepositDrain += depositSim.newDepositsTotal * currentCrisis.financialImpact.depositWithdrawalPct * unmitigated;
    }
  } else {
    // Check if new crisis occurs
    const carBaseline = calcCapitalAdequacyRatio(input.equity, input.loans * 0.75 + input.investments * 0.2);
    currentCrisis = checkQuarterlyCrisis(
      input.quarter,
      input.activeCrises,
      carBaseline,
      totalOperationalRisk,
      prng
    );
  }

  // 8. Calculate Financial Results
  const totalInterestIncome = loanSim.interestIncomeQuarter + bondYieldQuarter;
  const totalInterestExpense = depositSim.interestExpenseQuarter;
  const nii = calcNetInterestIncome(totalInterestIncome, totalInterestExpense);
  const totalRevenue = calcTotalRevenue(nii, feeIncome, 0);

  const totalOpex = totalSalaries + totalAiCost + 250000; // general branch overhead
  const creditLosses = loanSim.defaultLosses;
  const netProfit = calcNetProfit(totalRevenue, totalOpex + crisisCashPenalty, creditLosses, 0.25);

  // 9. Update Balance Sheet & Double-Entry Accounting
  const endDeposits = Math.max(1000000, depositSim.newDepositsTotal - crisisDepositDrain);
  const endLoans = Math.max(0, loanSim.updatedLoanBook);
  const endInvestments = Math.max(0, input.investments);

  // Retained earnings addition (net of dividends)
  const dividend = netProfit > 0 ? netProfit * input.decisions.dividendPayoutRatio : 0;
  const retainedEarnings = netProfit - dividend;
  const endEquity = Math.max(100000, input.equity + retainedEarnings);

  // Cash balances = Liabilities + Equity - Loans - Investments (ensuring balance sheet balancing identity)
  const totalLiabilities = endDeposits;
  const endTotalAssets = totalLiabilities + endEquity;
  const endCash = Math.max(500000, endTotalAssets - endLoans - endInvestments);

  // 10. Regulatory & Performance Ratios
  const riskWeightedAssets = endLoans * 0.75 + endInvestments * 0.20 + endCash * 0.0;
  const car = calcCapitalAdequacyRatio(endEquity, riskWeightedAssets);
  const liquidityRatio = calcLiquidityRatio(endCash + endInvestments * 0.8, endDeposits);
  const nplRatio = calcNplRatio(loanSim.newNplAmount, Math.max(1, endLoans));
  const roe = calcRoe(netProfit * 4, endEquity); // Annualized
  const roa = calcRoa(netProfit * 4, endTotalAssets);

  // 11. Customer Satisfaction & Bank Reputation
  const nextSat = clamp(
    input.customerSatisfaction + (workforceCsImpact / 10) + (netProfit > 0 ? 1 : -2) + crisisReputationDelta,
    20,
    100
  );
  const nextRep = clamp(
    input.reputation + (car >= 0.12 ? 1 : -3) + (nplRatio < 0.03 ? 1 : -2) + crisisReputationDelta,
    20,
    100
  );

  // 12. Update Competitor Banks
  const updatedCompetitors = updateCompetitorBanks(
    input.competitors,
    updatedMacro,
    avgLendingRate,
    input.decisions.retailDepositRate,
    prng
  );

  return {
    nextQuarter: (input.quarter % 4) + 1,
    nextYear: input.quarter === 4 ? input.year + 1 : input.year,
    cash: Math.round(endCash),
    totalAssets: Math.round(endTotalAssets),
    totalLiabilities: Math.round(totalLiabilities),
    totalEquity: Math.round(endEquity),
    totalDeposits: Math.round(endDeposits),
    totalLoans: Math.round(endLoans),
    investments: Math.round(endInvestments),
    netInterestIncome: Math.round(nii),
    interestIncome: Math.round(totalInterestIncome),
    interestExpense: Math.round(totalInterestExpense),
    nonInterestIncome: Math.round(feeIncome),
    operatingExpenses: Math.round(totalOpex + crisisCashPenalty),
    creditLosses: Math.round(creditLosses),
    netProfit: Math.round(netProfit),
    capitalAdequacyRatio: car,
    liquidityRatio,
    nplRatio,
    roe,
    roa,
    reputation: Math.round(nextRep),
    customerSatisfaction: Math.round(nextSat),
    resignedEmployees,
    newVacancies,
    activeCrisis: currentCrisis,
    updatedMacro,
    updatedCompetitors,
  };
}
