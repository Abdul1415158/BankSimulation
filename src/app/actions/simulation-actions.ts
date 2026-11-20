"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { executeQuarterSimulation, SimulationStateInput } from "@/engine/simulation-engine";

export async function advanceQuarterAction(bankId: string, decisions?: {
  retailDepositRate?: number;
  commercialDepositRate?: number;
  retailLendingRate?: number;
  corporateLendingRate?: number;
  investmentAllocation?: number;
  dividendPayoutRatio?: number;
  selectedCrisisOptionId?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Fetch bank
  const { data: bank } = await supabase
    .from("banks")
    .select("*")
    .eq("id", bankId)
    .eq("user_id", user.id)
    .single();

  if (!bank) throw new Error("Bank not found");

  // Fetch current simulation state
  const { data: simState } = await supabase
    .from("simulation_states")
    .select("*")
    .eq("bank_id", bankId)
    .single();

  if (!simState) throw new Error("Simulation state not found");

  // Fetch employees
  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .eq("bank_id", bankId);

  // Fetch AI agents
  const { data: aiAgents } = await supabase
    .from("ai_agents")
    .select("*")
    .eq("bank_id", bankId);

  // Fetch macro economy
  const { data: macro } = await supabase
    .from("economic_conditions")
    .select("*")
    .eq("bank_id", bankId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch competitors
  const { data: competitors } = await supabase
    .from("competitor_banks")
    .select("*")
    .eq("bank_id", bankId);

  // Fetch active crisis
  const { data: activeCrises } = await supabase
    .from("crisis_events")
    .select("*")
    .eq("bank_id", bankId)
    .eq("resolved", false);

  const stateInput: SimulationStateInput = {
    bankId,
    quarter: simState.current_quarter,
    year: simState.current_year,
    cash: Number(simState.cash_reserves),
    loans: Number(simState.total_loans),
    deposits: Number(simState.total_deposits),
    investments: Number(simState.investments ?? 5000000),
    equity: Number(simState.total_equity),
    reputation: Number(simState.reputation_score ?? 75),
    customerSatisfaction: Number(simState.customer_satisfaction_score ?? 78),
    macro: macro ? {
      quarter: simState.current_quarter,
      year: simState.current_year,
      gdp_growth_rate: Number(macro.gdp_growth_rate),
      inflation_rate: Number(macro.inflation_rate),
      benchmark_interest_rate: Number(macro.benchmark_interest_rate),
      unemployment_rate: Number(macro.unemployment_rate),
      market_sentiment: macro.market_sentiment ?? "stable",
    } : {
      quarter: simState.current_quarter,
      year: simState.current_year,
      gdp_growth_rate: 0.024,
      inflation_rate: 0.031,
      benchmark_interest_rate: 0.045,
      unemployment_rate: 0.048,
      market_sentiment: "stable",
    },
    competitors: (competitors ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      bank_type: c.bank_type,
      market_share: Number(c.market_share),
      deposit_rate: Number(c.deposit_rate),
      lending_rate: Number(c.lending_rate),
      total_assets: Number(c.total_assets),
      reputation: Number(c.reputation),
    })),
    employees: (employees ?? []).map((e) => ({
      id: e.id,
      name: e.name,
      department_id: e.department_id,
      role: e.role,
      salary: Number(e.salary),
      experience_years: e.experience_years ?? 3,
      skill_level: e.skill_level ?? 70,
      productivity: Number(e.productivity ?? 1.0),
      accuracy: Number(e.accuracy ?? 0.95),
      customer_service_rating: Number(e.customer_service_rating ?? 4.0),
      training_level: e.training_level ?? 2,
      morale: e.morale ?? 75,
      status: e.status ?? "active",
    })),
    aiAgents: (aiAgents ?? []).map((a) => ({
      id: a.id,
      department_id: a.department_id,
      agent_type: a.agent_type,
      model_tier: a.model_tier ?? "standard",
      monthly_cost: Number(a.monthly_operating_cost ?? 2000),
      processing_speed: Number(a.processing_speed ?? 3.0),
      accuracy_rate: Number(a.accuracy_rate ?? 0.94),
      cybersecurity_risk: Number(a.cybersecurity_risk ?? 0.03),
      human_supervision_required: a.human_supervision_required ?? true,
      status: a.status ?? "active",
    })),
    activeCrises: (activeCrises ?? []).map((c) => ({
      id: c.id,
      type: c.event_type,
      severity: c.severity,
      title: c.title,
      description: c.description,
      quarterTriggered: c.quarter_triggered,
      durationQuarters: c.duration_quarters,
      financialImpact: c.financial_impact ?? {},
      options: c.options ?? [],
      resolved: c.resolved,
    })),
    decisions: {
      retailDepositRate: decisions?.retailDepositRate ?? 0.035,
      commercialDepositRate: decisions?.commercialDepositRate ?? 0.030,
      retailLendingRate: decisions?.retailLendingRate ?? 0.075,
      corporateLendingRate: decisions?.corporateLendingRate ?? 0.065,
      investmentAllocation: decisions?.investmentAllocation ?? 5000000,
      dividendPayoutRatio: decisions?.dividendPayoutRatio ?? 0.10,
      selectedCrisisOptionId: decisions?.selectedCrisisOptionId,
    },
  };

  const result = executeQuarterSimulation(stateInput);

  // 1. Update simulation state
  await supabase
    .from("simulation_states")
    .update({
      current_quarter: result.nextQuarter,
      current_year: result.nextYear,
      cash_reserves: result.cash,
      total_assets: result.totalAssets,
      total_liabilities: result.totalLiabilities,
      total_equity: result.totalEquity,
      total_deposits: result.totalDeposits,
      total_loans: result.totalLoans,
      investments: result.investments,
      capital_adequacy_ratio: result.capitalAdequacyRatio,
      liquidity_ratio: result.liquidityRatio,
      non_performing_loan_ratio: result.nplRatio,
      return_on_equity: result.roe,
      return_on_assets: result.roa,
      reputation_score: result.reputation,
      customer_satisfaction_score: result.customerSatisfaction,
      net_profit_last_quarter: result.netProfit,
      updated_at: new Date().toISOString(),
    })
    .eq("bank_id", bankId);

  // 2. Insert quarterly report record
  await supabase
    .from("simulation_quarters")
    .insert({
      bank_id: bankId,
      year: simState.current_year,
      quarter: simState.current_quarter,
      total_revenue: result.netInterestIncome + result.nonInterestIncome,
      net_interest_income: result.netInterestIncome,
      non_interest_income: result.nonInterestIncome,
      total_expenses: result.operatingExpenses,
      credit_losses: result.creditLosses,
      net_profit: result.netProfit,
      total_assets: result.totalAssets,
      total_liabilities: result.totalLiabilities,
      total_equity: result.totalEquity,
      total_deposits: result.totalDeposits,
      total_loans: result.totalLoans,
      cash_reserves: result.cash,
      capital_adequacy_ratio: result.capitalAdequacyRatio,
      liquidity_ratio: result.liquidityRatio,
      non_performing_loan_ratio: result.nplRatio,
      return_on_equity: result.roe,
      return_on_assets: result.roa,
    });

  // 3. Update Macro Economy
  await supabase
    .from("economic_conditions")
    .insert({
      bank_id: bankId,
      quarter: result.updatedMacro.quarter,
      year: result.updatedMacro.year,
      gdp_growth_rate: result.updatedMacro.gdp_growth_rate,
      inflation_rate: result.updatedMacro.inflation_rate,
      benchmark_interest_rate: result.updatedMacro.benchmark_interest_rate,
      unemployment_rate: result.updatedMacro.unemployment_rate,
      market_sentiment: result.updatedMacro.market_sentiment,
    });

  // 4. Update bank slot last progress
  await supabase
    .from("bank_slots")
    .update({
      last_saved: new Date().toISOString(),
    })
    .eq("bank_id", bankId);

  revalidatePath(`/bank/${bankId}`);
  return { success: true, result };
}
