"use client";

import type { Bank, BankSlot, BankSettings, CreateBankFormData, BankType, Difficulty, AnnualReport, FinalFiveYearReport, HumanVsAiKpis } from "@/types/bank";
import { formatCurrency } from "@/lib/formatters";

export type { BankSettings, AnnualReport, FinalFiveYearReport, HumanVsAiKpis };

export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

export interface Department {
  id: string;
  bank_id: string;
  name: string;
  manager_name: string;
  employee_count: number;
  ai_agent_count: number;
  budget_monthly: number;
  productivity: number; // 0 - 100
  workload: number;     // 0 - 100
  error_rate: number;   // %
  performance_score: number; // 0 - 100
}

export interface Employee {
  id: string;
  bank_id: string;
  department_id: string;
  department_name: string;
  name: string;
  role: string;
  salary: number;
  experience_years: number;
  skill_level: "Junior" | "Mid" | "Senior" | "Lead";
  productivity: number; // %
  accuracy: number;     // %
  customer_rating: number; // 1.0 - 5.0
  morale: number;       // %
  status: "Active" | "On Leave" | "Resigned";
}

export interface AiAgent {
  id: string;
  bank_id: string;
  department_id: string;
  department_name: string;
  name: string;
  agent_type: string;
  monthly_cost: number;
  processing_speed: string; // e.g. "8x Human"
  accuracy: number;         // %
  error_probability: number;// %
  cybersecurity_risk: number;// %
  human_supervision_needed: "Low" | "Medium" | "High";
  status: "Active" | "Maintenance" | "Decommissioned";
}

export interface Customer {
  id: string;
  bank_id: string;
  name: string;
  category: "Individual" | "Small Business" | "Medium Business" | "Corporate";
  account_type: "Checking" | "Savings" | "Fixed Deposit";
  deposit_balance: number;
  credit_score: number;
  risk_category: "Low" | "Medium" | "High";
  satisfaction: number; // 0 - 100
  status: "Active" | "Dormant";
}

export interface Loan {
  id: string;
  bank_id: string;
  borrower_name: string;
  category: "Personal" | "Mortgage" | "Business" | "Corporate";
  amount: number;
  interest_rate: number;
  term_months: number;
  remaining_months: number;
  monthly_payment: number;
  status: "Active" | "Pending" | "Delinquent" | "Defaulted" | "Paid";
  risk_grade: "AAA" | "AA" | "A" | "BBB" | "BB" | "B";
  collateral_value: number;
}

export interface SimulationState {
  bank_id: string;
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  cash_reserves: number;
  total_deposits: number;
  total_loans_outstanding: number;
  net_interest_income: number;
  non_interest_income: number;
  operating_expenses: number;
  loan_loss_provisions: number;
  net_profit: number;
  liquidity_ratio: number;
  capital_adequacy_ratio: number;
  npl_ratio: number;
  roe: number;
  roa: number;
  customer_satisfaction: number;
  total_employees: number;
  total_ai_agents: number;
  fraud_incidents: number;
}

export interface EconomicCondition {
  bank_id: string;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  gdp_growth: number;
  inflation_rate: number;
  central_bank_rate: number;
  unemployment_rate: number;
  market_sentiment: "Bullish" | "Stable" | "Recession" | "Volatile";
  phase: "Expansion" | "Peak" | "Contraction" | "Trough";
}

export interface CrisisEvent {
  id: string;
  bank_id: string;
  title: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  category: "Cyber" | "Liquidity" | "Credit" | "Fraud" | "Regulatory";
  description: string;
  year: number;
  quarter: number;
  resolved: boolean;
  chosen_option?: string;
  options: {
    id: string;
    label: string;
    cost: number;
    description: string;
    reputation_impact: number;
    risk_reduction: number;
  }[];
}

export interface BankSecurityConfig {
  bank_id: string;
  cybersecurity_tier: "Basic" | "Enhanced" | "Military-Grade";
  fraud_monitoring: "Manual" | "Automated" | "AI-Realtime";
  physical_security: "Standard" | "Armed Guards" | "High-Sec Vault";
  internal_controls: "Standard" | "Dual Authorization" | "Continuous Audit";
  quarterly_security_budget: number;
  active_incidents_count: number;
  last_audit_score: number; // 0 - 100
}

export interface QuarterHistory {
  year: number;
  quarter: number;
  assets: number;
  liabilities: number;
  equity: number;
  deposits: number;
  loans: number;
  net_interest_income: number;
  net_profit: number;
  npl_ratio: number;
  car: number;
}

// STORAGE KEYS
const KEY_USER = "bankverse_user";
const KEY_SLOTS = "bankverse_slots";
const KEY_BANKS = "bankverse_banks";
const KEY_STATES = "bankverse_states";
const KEY_DEPARTMENTS = "bankverse_departments";
const KEY_EMPLOYEES = "bankverse_employees";
const KEY_AI_AGENTS = "bankverse_ai_agents";
const KEY_CUSTOMERS = "bankverse_customers";
const KEY_LOANS = "bankverse_loans";
const KEY_ECONOMY = "bankverse_economy";
const KEY_EVENTS = "bankverse_events";
const KEY_HISTORY = "bankverse_history";
const KEY_SETTINGS = "bankverse_settings";
const KEY_ANNUAL_REPORTS = "bankverse_annual_reports";
const KEY_FINAL_REPORTS = "bankverse_final_reports";
const KEY_SECURITY = "bankverse_security";

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("LocalStorage write error", e);
  }
}

// 1. AUTH
export function getCurrentUser(): UserProfile {
  return getStorage<UserProfile>(KEY_USER, {
    id: "local-user-1",
    email: "banker@bankverse.com",
    name: "Chief Executive Banker",
  });
}

export function setCurrentUser(user: UserProfile): void {
  setStorage(KEY_USER, user);
}

export function logoutUser(): void {
  // Keeps bank data intact, but resets user if needed
}

// 2. BANK SLOTS
export function getBankSlots(): BankSlot[] {
  const user = getCurrentUser();
  const existing = getStorage<BankSlot[]>(KEY_SLOTS, []);
  if (existing.length === 3) {
    // Populate with bank objects if occupied
    const banks = getStorage<Record<string, Bank>>(KEY_BANKS, {});
    return existing.map((s) => ({
      ...s,
      bank: s.is_occupied && s.bank_id ? banks[s.bank_id] || null : null,
    }));
  }

  // Initial 3 empty slots
  const initialSlots: BankSlot[] = [
    { id: "slot-1", user_id: user.id, slot_number: 1, bank_id: null, is_occupied: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "slot-2", user_id: user.id, slot_number: 2, bank_id: null, is_occupied: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "slot-3", user_id: user.id, slot_number: 3, bank_id: null, is_occupied: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];
  setStorage(KEY_SLOTS, initialSlots);
  return initialSlots;
}

// 3. GET SINGLE BANK
export function getBank(bankId: string): Bank | null {
  const banks = getStorage<Record<string, Bank>>(KEY_BANKS, {});
  const b = banks[bankId] || null;
  if (b && (b.current_quarter as number) > 4) {
    b.current_quarter = 4;
  }
  return b;
}

// 4. CREATE BANK
export function createBankInSlot(slotNumber: 1 | 2 | 3, data: CreateBankFormData): Bank {
  const user = getCurrentUser();
  const slots = getBankSlots();
  const slotIndex = slots.findIndex((s) => s.slot_number === slotNumber);

  if (slotIndex === -1) throw new Error("Invalid slot number");
  if (slots[slotIndex].is_occupied && slots[slotIndex].bank_id) {
    throw new Error(`Slot ${slotNumber} is already occupied. Delete the existing bank first.`);
  }

  const bankId = `bank-${Date.now()}`;
  const now = new Date().toISOString();

  const newBank: Bank = {
    id: bankId,
    user_id: user.id,
    slot_id: slots[slotIndex].id,
    name: data.name,
    ceo_name: data.ceo_name || user.name || "Chief Executive Officer",
    country: data.country,
    city: data.city,
    currency: data.currency,
    bank_type: data.bank_type,
    logo_url: null,
    difficulty: data.difficulty,
    simulation_duration_years: data.simulation_duration_years || 5,
    start_year: data.start_year || 2025,
    operating_mode: data.operating_mode || "guided",
    initial_strategy: data.initial_strategy,
    starting_capital: data.starting_capital,
    current_year: 1,
    current_quarter: 1,
    status: "active",
    quarter_processing: false,
    random_seed: Math.floor(Math.random() * 1000000),
    created_at: now,
    updated_at: now,
    last_played_at: now,
  };

  // 1. Save Bank
  const allBanks = getStorage<Record<string, Bank>>(KEY_BANKS, {});
  allBanks[bankId] = newBank;
  setStorage(KEY_BANKS, allBanks);

  // 2. Update Slot
  slots[slotIndex].is_occupied = true;
  slots[slotIndex].bank_id = bankId;
  slots[slotIndex].updated_at = now;
  setStorage(KEY_SLOTS, slots);

  // 3. Initialize Starting Financial State (ZERO START: Charter Capital only, No pre-existing debt or deposits)
  const initialCapital = data.starting_capital;
  const initialState: SimulationState = {
    bank_id: bankId,
    total_assets: initialCapital,
    total_liabilities: 0,
    total_equity: initialCapital,
    cash_reserves: initialCapital,
    total_deposits: 0,
    total_loans_outstanding: 0,
    net_interest_income: 0,
    non_interest_income: 0,
    operating_expenses: 0,
    loan_loss_provisions: 0,
    net_profit: 0,
    liquidity_ratio: 100,
    capital_adequacy_ratio: 100,
    npl_ratio: 0.0,
    roe: 0.0,
    roa: 0.0,
    customer_satisfaction: 100,
    total_employees: 0,
    total_ai_agents: 0,
    fraud_incidents: 0,
  };
  const allStates = getStorage<Record<string, SimulationState>>(KEY_STATES, {});
  allStates[bankId] = initialState;
  setStorage(KEY_STATES, allStates);

  // 4. Initialize 10 Departments (Ready for hiring)
  const deptNames = [
    { name: "Customer Service", manager: "Unassigned (Vacant)", emp: 0, ai: 0, budget: 15000 },
    { name: "Loan and Credit Department", manager: "Unassigned (Vacant)", emp: 0, ai: 0, budget: 20000 },
    { name: "Cash Operations", manager: "Unassigned (Vacant)", emp: 0, ai: 0, budget: 15000 },
    { name: "Risk Management", manager: "Unassigned (Vacant)", emp: 0, ai: 0, budget: 15000 },
    { name: "Fraud Prevention", manager: "Unassigned (Vacant)", emp: 0, ai: 0, budget: 12000 },
    { name: "Treasury", manager: "Unassigned (Vacant)", emp: 0, ai: 0, budget: 20000 },
    { name: "Compliance", manager: "Unassigned (Vacant)", emp: 0, ai: 0, budget: 15000 },
    { name: "Human Resources", manager: "Unassigned (Vacant)", emp: 0, ai: 0, budget: 12000 },
    { name: "Digital Banking", manager: "Unassigned (Vacant)", emp: 0, ai: 0, budget: 25000 },
    { name: "IT and Cybersecurity", manager: "Unassigned (Vacant)", emp: 0, ai: 0, budget: 25000 },
  ];
  const departments: Department[] = deptNames.map((d, i) => ({
    id: `dept-${bankId}-${i + 1}`,
    bank_id: bankId,
    name: d.name,
    manager_name: d.manager,
    employee_count: 0,
    ai_agent_count: 0,
    budget_monthly: d.budget,
    productivity: 0,
    workload: 0,
    error_rate: 0,
    performance_score: 50,
  }));
  const allDepts = getStorage<Record<string, Department[]>>(KEY_DEPARTMENTS, {});
  allDepts[bankId] = departments;
  setStorage(KEY_DEPARTMENTS, allDepts);

  // 5. Zero Initial Employees (Recruit via HR)
  const allEmps = getStorage<Record<string, Employee[]>>(KEY_EMPLOYEES, {});
  allEmps[bankId] = [];
  setStorage(KEY_EMPLOYEES, allEmps);

  // 6. Zero Initial AI Agents
  const allAi = getStorage<Record<string, AiAgent[]>>(KEY_AI_AGENTS, {});
  allAi[bankId] = [];
  setStorage(KEY_AI_AGENTS, allAi);

  // 7. Zero Initial Customers
  const allCusts = getStorage<Record<string, Customer[]>>(KEY_CUSTOMERS, {});
  allCusts[bankId] = [];
  setStorage(KEY_CUSTOMERS, allCusts);

  // 8. Initial Loans: 0 Active, 2 Incoming Pending Applications for CEO Review
  const pendingLoanSeed: Loan[] = [
    { id: `loan-${bankId}-init-1`, bank_id: bankId, borrower_name: "Apex Logistics Corp", category: "Corporate", amount: 1500000, interest_rate: 6.8, term_months: 60, remaining_months: 60, monthly_payment: 29500, status: "Pending", risk_grade: "AA", collateral_value: 2200000 },
    { id: `loan-${bankId}-init-2`, bank_id: bankId, borrower_name: "Dr. Alistair Finch", category: "Mortgage", amount: 450000, interest_rate: 5.4, term_months: 240, remaining_months: 240, monthly_payment: 3070, status: "Pending", risk_grade: "AAA", collateral_value: 650000 },
  ];
  const allLoans = getStorage<Record<string, Loan[]>>(KEY_LOANS, {});
  allLoans[bankId] = pendingLoanSeed;
  setStorage(KEY_LOANS, allLoans);

  // 9. Initial Security Configuration
  const initialSecurity: BankSecurityConfig = {
    bank_id: bankId,
    cybersecurity_tier: "Basic",
    fraud_monitoring: "Manual",
    physical_security: "Standard",
    internal_controls: "Standard",
    quarterly_security_budget: 25000,
    active_incidents_count: 0,
    last_audit_score: 80,
  };
  const allSec = getStorage<Record<string, BankSecurityConfig>>(KEY_SECURITY, {});
  allSec[bankId] = initialSecurity;
  setStorage(KEY_SECURITY, allSec);
  setStorage(KEY_LOANS, allLoans);

  // 9. Initial Economic Condition
  const initialEco: EconomicCondition = {
    bank_id: bankId,
    year: 1,
    quarter: 1,
    gdp_growth: 2.8,
    inflation_rate: 2.4,
    central_bank_rate: 5.25,
    unemployment_rate: 3.9,
    market_sentiment: "Bullish",
    phase: "Expansion",
  };
  const allEco = getStorage<Record<string, EconomicCondition>>(KEY_ECONOMY, {});
  allEco[bankId] = initialEco;
  setStorage(KEY_ECONOMY, allEco);

  // 10. Initial Settings
  const initialSettings: BankSettings = {
    id: `set-${bankId}`,
    bank_id: bankId,
    savings_rate: 2.5,
    current_account_rate: 0.5,
    fixed_deposit_rate_1yr: 4.2,
    fixed_deposit_rate_3yr: 4.8,
    fixed_deposit_rate_5yr: 5.1,
    personal_loan_spread: 4.5,
    business_loan_spread: 3.5,
    mortgage_spread: 2.2,
    vehicle_loan_spread: 3.0,
    corporate_loan_spread: 2.0,
    max_loan_to_value: 80,
    min_credit_score: 650,
    max_single_exposure: 15,
    auto_approve_low_risk: false,
    ai_supervision_level: "moderate",
    updated_at: now,
  };
  const allSettings = getStorage<Record<string, BankSettings>>(KEY_SETTINGS, {});
  allSettings[bankId] = initialSettings;
  setStorage(KEY_SETTINGS, allSettings);

  // 11. Initial History Record
  const initialHistory: QuarterHistory[] = [
    {
      year: 1,
      quarter: 1,
      assets: initialState.total_assets,
      liabilities: initialState.total_liabilities,
      equity: initialState.total_equity,
      deposits: initialState.total_deposits,
      loans: initialState.total_loans_outstanding,
      net_interest_income: initialState.net_interest_income,
      net_profit: initialState.net_profit,
      npl_ratio: initialState.npl_ratio,
      car: initialState.capital_adequacy_ratio,
    },
  ];
  const allHist = getStorage<Record<string, QuarterHistory[]>>(KEY_HISTORY, {});
  allHist[bankId] = initialHistory;
  setStorage(KEY_HISTORY, allHist);

  return newBank;
}

// 5. DELETE BANK
export function deleteBank(bankId: string): void {
  const slots = getBankSlots();
  const slot = slots.find((s) => s.bank_id === bankId);
  if (slot) {
    slot.is_occupied = false;
    slot.bank_id = null;
    slot.bank = null;
    setStorage(KEY_SLOTS, slots);
  }

  const allBanks = getStorage<Record<string, Bank>>(KEY_BANKS, {});
  delete allBanks[bankId];
  setStorage(KEY_BANKS, allBanks);

  const allStates = getStorage<Record<string, SimulationState>>(KEY_STATES, {});
  delete allStates[bankId];
  setStorage(KEY_STATES, allStates);
}

// 6. SIMULATION STATE GETTER
export function getSimulationState(bankId: string): SimulationState {
  const allStates = getStorage<Record<string, SimulationState>>(KEY_STATES, {});
  return (
    allStates[bankId] || {
      bank_id: bankId,
      total_assets: 50000000,
      total_liabilities: 20000000,
      total_equity: 30000000,
      cash_reserves: 15000000,
      total_deposits: 20000000,
      total_loans_outstanding: 35000000,
      net_interest_income: 1200000,
      non_interest_income: 300000,
      operating_expenses: 650000,
      loan_loss_provisions: 80000,
      net_profit: 770000,
      liquidity_ratio: 42.8,
      capital_adequacy_ratio: 21.4,
      npl_ratio: 1.8,
      roe: 10.2,
      roa: 1.8,
      customer_satisfaction: 88,
      total_employees: 14,
      total_ai_agents: 2,
      fraud_incidents: 0,
    }
  );
}

// 6b. UPDATE SIMULATION STATE
export function updateSimulationState(bankId: string, stateUpdate: Partial<SimulationState>): SimulationState {
  const allStates = getStorage<Record<string, SimulationState>>(KEY_STATES, {});
  const current = getSimulationState(bankId);
  const updated: SimulationState = {
    ...current,
    ...stateUpdate,
    bank_id: bankId,
  };
  allStates[bankId] = updated;
  setStorage(KEY_STATES, allStates);

  // Sync with current quarter history if exists
  const bank = getBank(bankId);
  if (bank) {
    const allHist = getStorage<Record<string, QuarterHistory[]>>(KEY_HISTORY, {});
    const history = allHist[bankId] || [];
    const existingHistIdx = history.findIndex((h) => h.year === bank.current_year && h.quarter === bank.current_quarter);
    const histItem: QuarterHistory = {
      year: bank.current_year,
      quarter: bank.current_quarter,
      assets: updated.total_assets,
      liabilities: updated.total_liabilities,
      equity: updated.total_equity,
      deposits: updated.total_deposits,
      loans: updated.total_loans_outstanding,
      net_interest_income: updated.net_interest_income,
      net_profit: updated.net_profit,
      npl_ratio: updated.npl_ratio,
      car: updated.capital_adequacy_ratio,
    };
    if (existingHistIdx >= 0) {
      history[existingHistIdx] = histItem;
    } else {
      history.push(histItem);
    }
    allHist[bankId] = history;
    setStorage(KEY_HISTORY, allHist);
  }

  return updated;
}

// 6c. UPDATE BANK DATA
export function updateBank(bankId: string, updates: Partial<Bank>): Bank {
  const allBanks = getStorage<Record<string, Bank>>(KEY_BANKS, {});
  const current = getBank(bankId);
  if (!current) throw new Error("Bank not found");
  const updated: Bank = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  allBanks[bankId] = updated;
  setStorage(KEY_BANKS, allBanks);

  // Sync slot if bank exists
  const slots = getBankSlots();
  const slotIdx = slots.findIndex((s) => s.bank_id === bankId);
  if (slotIdx >= 0) {
    slots[slotIdx].bank = updated;
    slots[slotIdx].updated_at = updated.updated_at;
    setStorage(KEY_SLOTS, slots);
  }

  return updated;
}

// 6d. UPDATE ECONOMIC CONDITIONS
export function updateEconomicCondition(bankId: string, ecoUpdates: Partial<EconomicCondition>): EconomicCondition {
  const allEco = getStorage<Record<string, EconomicCondition>>(KEY_ECONOMY, {});
  const current = getEconomicCondition(bankId);
  const updated: EconomicCondition = {
    ...current,
    ...ecoUpdates,
    bank_id: bankId,
  };
  allEco[bankId] = updated;
  setStorage(KEY_ECONOMY, allEco);
  return updated;
}

// 7. GET DEPARTMENTS
export function getDepartments(bankId: string): Department[] {
  const allDepts = getStorage<Record<string, Department[]>>(KEY_DEPARTMENTS, {});
  return allDepts[bankId] || [];
}

// 8. EMPLOYEES & AI
export function getEmployees(bankId: string): Employee[] {
  const allEmps = getStorage<Record<string, Employee[]>>(KEY_EMPLOYEES, {});
  return allEmps[bankId] || [];
}

export function hireEmployee(bankId: string, emp: Omit<Employee, "id" | "bank_id">): Employee {
  const allEmps = getStorage<Record<string, Employee[]>>(KEY_EMPLOYEES, {});
  const emps = allEmps[bankId] || [];
  const newEmp: Employee = {
    ...emp,
    id: `emp-${bankId}-${Date.now()}`,
    bank_id: bankId,
  };
  emps.push(newEmp);
  allEmps[bankId] = emps;
  setStorage(KEY_EMPLOYEES, allEmps);
  return newEmp;
}

export function terminateEmployee(bankId: string, employeeId: string): void {
  const allEmps = getStorage<Record<string, Employee[]>>(KEY_EMPLOYEES, {});
  const emps = allEmps[bankId] || [];
  allEmps[bankId] = emps.filter((e) => e.id !== employeeId);
  setStorage(KEY_EMPLOYEES, allEmps);
}

export function getAiAgents(bankId: string): AiAgent[] {
  const allAi = getStorage<Record<string, AiAgent[]>>(KEY_AI_AGENTS, {});
  return allAi[bankId] || [];
}

export function deployAiAgent(bankId: string, agent: Omit<AiAgent, "id" | "bank_id">): AiAgent {
  const allAi = getStorage<Record<string, AiAgent[]>>(KEY_AI_AGENTS, {});
  const agents = allAi[bankId] || [];
  const newAgent: AiAgent = {
    ...agent,
    id: `ai-${bankId}-${Date.now()}`,
    bank_id: bankId,
  };
  agents.push(newAgent);
  allAi[bankId] = agents;
  setStorage(KEY_AI_AGENTS, allAi);
  return newAgent;
}

export function decommissionAiAgent(bankId: string, agentId: string): void {
  const allAi = getStorage<Record<string, AiAgent[]>>(KEY_AI_AGENTS, {});
  const agents = allAi[bankId] || [];
  allAi[bankId] = agents.filter((a) => a.id !== agentId);
  setStorage(KEY_AI_AGENTS, allAi);
}

// 9. CUSTOMERS & LOANS
export function getCustomers(bankId: string): Customer[] {
  const allCusts = getStorage<Record<string, Customer[]>>(KEY_CUSTOMERS, {});
  return allCusts[bankId] || [];
}

export function onboardCustomer(bankId: string, customerData: Omit<Customer, "id" | "bank_id">): Customer {
  const allCusts = getStorage<Record<string, Customer[]>>(KEY_CUSTOMERS, {});
  const bankCusts = allCusts[bankId] || [];
  const newCustomer: Customer = {
    ...customerData,
    id: `cust-${bankId}-${Date.now()}`,
    bank_id: bankId,
  };
  bankCusts.push(newCustomer);
  allCusts[bankId] = bankCusts;
  setStorage(KEY_CUSTOMERS, allCusts);

  // Update financial state
  const allStates = getStorage<Record<string, SimulationState>>(KEY_STATES, {});
  const state = allStates[bankId];
  if (state) {
    state.total_deposits += newCustomer.deposit_balance;
    state.total_liabilities += newCustomer.deposit_balance;
    state.total_assets += newCustomer.deposit_balance;
    state.cash_reserves += newCustomer.deposit_balance;
    setStorage(KEY_STATES, allStates);
  }

  return newCustomer;
}

export function getLoans(bankId: string): Loan[] {
  const allLoans = getStorage<Record<string, Loan[]>>(KEY_LOANS, {});
  return allLoans[bankId] || [];
}

export function approveLoan(bankId: string, loanId: string): void {
  const allLoans = getStorage<Record<string, Loan[]>>(KEY_LOANS, {});
  const loans = allLoans[bankId] || [];
  const l = loans.find((x) => x.id === loanId);
  if (l) {
    l.status = "Active";
    setStorage(KEY_LOANS, allLoans);

    // Update financial state
    const allStates = getStorage<Record<string, SimulationState>>(KEY_STATES, {});
    const state = allStates[bankId];
    if (state) {
      state.total_loans_outstanding += l.amount;
      state.cash_reserves = Math.max(0, state.cash_reserves - l.amount);
      setStorage(KEY_STATES, allStates);
    }
  }
}

export function rejectLoan(bankId: string, loanId: string): void {
  const allLoans = getStorage<Record<string, Loan[]>>(KEY_LOANS, {});
  const loans = allLoans[bankId] || [];
  allLoans[bankId] = loans.filter((x) => x.id !== loanId);
  setStorage(KEY_LOANS, allLoans);
}

// 10. ECONOMY & EVENTS
export function getEconomicCondition(bankId: string): EconomicCondition {
  const allEco = getStorage<Record<string, EconomicCondition>>(KEY_ECONOMY, {});
  return (
    allEco[bankId] || {
      bank_id: bankId,
      year: 1,
      quarter: 1,
      gdp_growth: 2.8,
      inflation_rate: 2.4,
      central_bank_rate: 5.25,
      unemployment_rate: 3.9,
      market_sentiment: "Bullish",
      phase: "Expansion",
    }
  );
}

export function getEvents(bankId: string): CrisisEvent[] {
  const allEvents = getStorage<Record<string, CrisisEvent[]>>(KEY_EVENTS, {});
  return allEvents[bankId] || [];
}

export function resolveEvent(bankId: string, eventId: string, optionId: string): void {
  const allEvents = getStorage<Record<string, CrisisEvent[]>>(KEY_EVENTS, {});
  const events = allEvents[bankId] || [];
  const ev = events.find((e) => e.id === eventId);
  if (ev) {
    ev.resolved = true;
    ev.chosen_option = optionId;
    setStorage(KEY_EVENTS, allEvents);
  }
}

// 11. SETTINGS & HISTORY
export function getBankSettings(bankId: string): BankSettings {
  const allSettings = getStorage<Record<string, BankSettings>>(KEY_SETTINGS, {});
  return (
    allSettings[bankId] || {
      id: `set-${bankId}`,
      bank_id: bankId,
      savings_rate: 2.5,
      current_account_rate: 0.5,
      fixed_deposit_rate_1yr: 4.2,
      fixed_deposit_rate_3yr: 4.8,
      fixed_deposit_rate_5yr: 5.1,
      personal_loan_spread: 4.5,
      business_loan_spread: 3.5,
      mortgage_spread: 2.2,
      vehicle_loan_spread: 3.0,
      corporate_loan_spread: 2.0,
      max_loan_to_value: 80,
      min_credit_score: 650,
      max_single_exposure: 15,
      auto_approve_low_risk: false,
      ai_supervision_level: "moderate",
      updated_at: new Date().toISOString(),
    }
  );
}

export function updateBankSettings(bankId: string, settings: Partial<BankSettings>): void {
  const allSettings = getStorage<Record<string, BankSettings>>(KEY_SETTINGS, {});
  allSettings[bankId] = { ...getBankSettings(bankId), ...settings, updated_at: new Date().toISOString() };
  setStorage(KEY_SETTINGS, allSettings);
}

export function getQuarterHistory(bankId: string): QuarterHistory[] {
  const allHist = getStorage<Record<string, QuarterHistory[]>>(KEY_HISTORY, {});
  const raw = allHist[bankId] || [];
  const map = new Map<string, QuarterHistory>();
  for (const h of raw) {
    map.set(`y${h.year}-q${h.quarter}`, h);
  }
  return Array.from(map.values()).sort((a, b) => a.year * 10 + a.quarter - (b.year * 10 + b.quarter));
}

// 12. ANNUAL & FINAL REPORTS GENERATORS
function generateAnnualReportForYear(bankId: string, year: number): AnnualReport {
  const bank = getBank(bankId);
  const state = getSimulationState(bankId);
  const history = getQuarterHistory(bankId);
  const emps = getEmployees(bankId);
  const depts = getDepartments(bankId);
  const loans = getLoans(bankId);
  const sec = getSecurityConfig(bankId);
  const events = getEvents(bankId).filter((e) => e.year === year);

  const calendarYear = (bank?.start_year || 2025) + (year - 1);
  const yearHistory = history.filter((h) => h.year === year);
  const totalQuarterProfit = yearHistory.reduce((sum, h) => sum + h.net_profit, 0);
  const totalNII = yearHistory.reduce((sum, h) => sum + h.net_interest_income, 0);
  const activeLoans = loans.filter((l) => l.status === "Active");

  // Human vs AI workforce analytics
  const aiAgents = getAiAgents(bankId);
  const humanCount = emps.length;
  const aiCount = aiAgents.length;
  const humanQuarterlyCost = emps.reduce((sum, e) => sum + e.salary, 0);
  const aiQuarterlyCost = aiAgents.reduce((sum, a) => sum + (a.monthly_cost * 3), 0);
  const totalWorkforceCost = humanQuarterlyCost + aiQuarterlyCost;

  // Replacement benchmark: average human banker salary ~35,000/qtr
  const baselineHumanEquivalent = aiCount * 35000;
  const estimatedSavings = Math.max(0, baselineHumanEquivalent - aiQuarterlyCost);
  const costSavingsPct = baselineHumanEquivalent > 0
    ? Math.round((estimatedSavings / baselineHumanEquivalent) * 100)
    : 0;

  const humanProd = humanCount > 0
    ? Math.round(emps.reduce((s, e) => s + e.productivity, 0) / humanCount)
    : 0;
  const aiAcc = aiCount > 0
    ? Math.round(aiAgents.reduce((s, a) => s + a.accuracy, 0) / aiCount)
    : 0;

  const humanTasks = humanCount * 320;
  const aiTasks = aiCount * 1450;
  const totalTasks = humanTasks + aiTasks;
  const aiWorkloadShare = totalTasks > 0 ? Math.round((aiTasks / totalTasks) * 100) : 0;

  let outcomeCategory: HumanVsAiKpis["outcome_category"] = "Human-Centric Model";
  let decisionEval: HumanVsAiKpis["decision_evaluation"] = "Neutral Transition";
  let evalSummary = "";

  if (aiCount > 0 && humanCount > 0) {
    outcomeCategory = "Balanced Hybrid Workforce";
    decisionEval = "Positive Outcome";
    evalSummary = `The hybrid workforce strategy successfully combined ${humanCount} human officers with ${aiCount} autonomous AI agents. AI units absorbed ${aiWorkloadShare}% of high-frequency customer and operational tasks, delivering approximately ${formatCurrency(estimatedSavings)} in quarterly personnel cost savings while maintaining high operational throughput.`;
  } else if (aiCount > 0 && humanCount === 0) {
    outcomeCategory = "Automated High-Efficiency";
    decisionEval = "Positive Outcome";
    evalSummary = `Full autonomous banking workforce deployed with ${aiCount} AI agents managing all active customer inquiries and digital workflows. Operational overhead remains significantly lower than traditional branch banking.`;
  } else {
    outcomeCategory = "Human-Centric Model";
    decisionEval = "Neutral Transition";
    evalSummary = `Traditional human banking operations maintained with ${humanCount} staff members. Human employees provided dedicated relationship banking and customized loan advisory, with opportunities to deploy AI agents for routine back-office cost reduction.`;
  }

  const humanVsAiKpis: HumanVsAiKpis = {
    human_count: humanCount,
    ai_count: aiCount,
    human_quarterly_cost: humanQuarterlyCost,
    ai_quarterly_cost: aiQuarterlyCost,
    total_workforce_cost: totalWorkforceCost,
    estimated_human_savings: estimatedSavings,
    cost_savings_pct: costSavingsPct,
    human_productivity_score: humanProd,
    ai_accuracy_score: aiAcc,
    human_tasks_handled: humanTasks,
    ai_tasks_handled: aiTasks,
    total_tasks_handled: totalTasks,
    ai_workload_share_pct: aiWorkloadShare,
    customer_satisfaction_rating: state.customer_satisfaction,
    outcome_category: outcomeCategory,
    decision_evaluation: decisionEval,
    evaluation_summary: evalSummary,
  };

  return {
    id: `rep-${bankId}-y${year}`,
    bank_id: bankId,
    year,
    calendar_year: calendarYear,
    generated_at: new Date().toISOString(),
    is_read: false,
    human_vs_ai_kpis: humanVsAiKpis,
    sections: {
      executive_summary: {
        title: "1. Executive Summary",
        content: `Annual Review for ${bank?.name || "The Institution"} under Chairman & CEO ${bank?.ceo_name || "Executive Leadership"}. Year ${year} (${calendarYear}) concluded all 4 operational quarters. Total assets stand at ${formatCurrency(state.total_assets)} supported by ${formatCurrency(state.total_equity)} in tier-1 capital reserves. Overall solvency remains ${state.capital_adequacy_ratio >= 12 ? "satisfactory and compliant" : "under supervisory observation"}.`,
        status: state.capital_adequacy_ratio >= 12 ? "positive" : "warning",
        metrics: {
          "Calendar Year": calendarYear,
          "Total Assets": formatCurrency(state.total_assets),
          "Total Equity": formatCurrency(state.total_equity),
          "Quarters Completed": 4,
        },
      },
      human_vs_ai_workforce: {
        title: "Workforce Strategy: Human vs. AI Performance",
        content: evalSummary,
        status: aiCount > 0 ? "positive" : "neutral",
        metrics: {
          "Human Employees": `${humanCount} Personnel`,
          "AI Agents Deployed": `${aiCount} Autonomous Units`,
          "Human Payroll (Qtr)": formatCurrency(humanQuarterlyCost),
          "AI Opex Cost (Qtr)": formatCurrency(aiQuarterlyCost),
          "Payroll Savings": formatCurrency(estimatedSavings),
          "AI Workload Share": `${aiWorkloadShare}% of Tasks`,
          "Human Productivity": humanCount > 0 ? `${humanProd}%` : "N/A",
          "AI Processing Accuracy": aiCount > 0 ? `${aiAcc}%` : "N/A",
        },
      },
      financial_performance: {
        title: "2. Financial Performance",
        content: `Full year net profit recorded at ${formatCurrency(totalQuarterProfit)}. Return on Equity (ROE) annualized at ${state.roe}% with Return on Assets (ROA) of ${state.roa}%. The bank maintains cash reserves of ${formatCurrency(state.cash_reserves)}.`,
        status: totalQuarterProfit >= 0 ? "positive" : "negative",
        metrics: {
          "Year Net Profit": formatCurrency(totalQuarterProfit),
          "Return on Equity": `${state.roe}%`,
          "Return on Assets": `${state.roa}%`,
          "Cash Liquidity": formatCurrency(state.cash_reserves),
        },
      },
      profit_and_loss: {
        title: "3. Profit and Loss",
        content: `Net interest income generated over the 4 quarters totaled ${formatCurrency(totalNII)}. Operating expenditure absorbed ${formatCurrency(state.operating_expenses * 4)}, with loan loss provisions of ${formatCurrency(state.loan_loss_provisions * 4)}.`,
        metrics: {
          "Net Interest Income": formatCurrency(totalNII),
          "Operating Expenses (Est.)": formatCurrency(state.operating_expenses * 4),
          "Loan Provisions": formatCurrency(state.loan_loss_provisions * 4),
        },
      },
      assets_and_liabilities: {
        title: "4. Assets and Liabilities",
        content: `Balance sheet total stood at ${formatCurrency(state.total_assets)}, balanced by ${formatCurrency(state.total_liabilities)} in customer liabilities and ${formatCurrency(state.total_equity)} in core equity capital.`,
        metrics: {
          "Total Assets": formatCurrency(state.total_assets),
          "Customer Deposits": formatCurrency(state.total_deposits),
          "Core Capital Equity": formatCurrency(state.total_equity),
        },
      },
      loan_portfolio: {
        title: "5. Loan Portfolio Performance",
        content: `The active loan book amounts to ${formatCurrency(state.total_loans_outstanding)} across ${activeLoans.length} authorized credit lines. Non-Performing Loan (NPL) ratio stands at ${state.npl_ratio}%.`,
        status: state.npl_ratio <= 3 ? "positive" : state.npl_ratio <= 5 ? "warning" : "negative",
        metrics: {
          "Loans Outstanding": formatCurrency(state.total_loans_outstanding),
          "Active Loans Count": activeLoans.length,
          "NPL Ratio": `${state.npl_ratio}%`,
        },
      },
      deposit_growth: {
        title: "6. Deposit Growth",
        content: `Total customer deposit book finished at ${formatCurrency(state.total_deposits)}. Liquidity Coverage Ratio finished at ${state.liquidity_ratio}%.`,
        metrics: {
          "Deposit Base": formatCurrency(state.total_deposits),
          "Liquidity Ratio": `${state.liquidity_ratio}%`,
        },
      },
      capital_and_liquidity: {
        title: "7. Capital and Liquidity Position",
        content: `Capital Adequacy Ratio (CAR) is ${state.capital_adequacy_ratio}%, measured against the minimum Basel III statutory threshold of 12.0%. Liquidity ratio is ${state.liquidity_ratio}%.`,
        status: state.capital_adequacy_ratio >= 12 ? "positive" : "negative",
        metrics: {
          "Capital Adequacy Ratio": `${state.capital_adequacy_ratio}%`,
          "Minimum Required CAR": "12.0%",
          "Liquidity Buffer": `${state.liquidity_ratio}%`,
        },
      },
      employee_and_hr: {
        title: "8. Employee and HR Performance",
        content: `Workforce headcount closed at ${emps.length} personnel. Average staff morale is calculated at ${emps.length > 0 ? Math.round(emps.reduce((s, e) => s + e.morale, 0) / emps.length) : 0}% with an average productivity score of ${emps.length > 0 ? Math.round(emps.reduce((s, e) => s + e.productivity, 0) / emps.length) : 0}%.`,
        metrics: {
          "Total Headcount": emps.length,
          "Average Morale": emps.length > 0 ? `${Math.round(emps.reduce((s, e) => s + e.morale, 0) / emps.length)}%` : "N/A",
          "Active Staffing Ratio": emps.length > 0 ? "Staffed" : "Unstaffed - Vacancies Open",
        },
      },
      department_performance: {
        title: "9. Department Performance",
        content: `All 10 divisions evaluated. Primary operational load handled across ${depts.filter((d) => d.employee_count > 0).length} staffed units. Operations and Credit have maintained strict supervisory discipline.`,
        metrics: {
          "Staffed Departments": depts.filter((d) => d.employee_count > 0).length,
          "Total Departments": depts.length,
        },
      },
      security_and_risk: {
        title: "10. Security and Risk Assessment",
        content: `Security tier maintained at ${sec.cybersecurity_tier}. Fraud monitoring protocol: ${sec.fraud_monitoring}. Physical security rated ${sec.physical_security}. Recorded security incidents this year: ${events.filter((e) => e.category === "Cyber" || e.category === "Fraud").length}.`,
        metrics: {
          "Cybersecurity Tier": sec.cybersecurity_tier,
          "Fraud Protocol": sec.fraud_monitoring,
          "Physical Security": sec.physical_security,
          "Active Incidents": sec.active_incidents_count,
        },
      },
      regulatory_and_compliance: {
        title: "11. Regulatory and Compliance Status",
        content: `The Central Bank and National Supervisory Authority assessed operations. Solvency standing is ${state.capital_adequacy_ratio >= 12 ? "Compliant" : "DEFICIENT (Corrective Action Required)"}. Internal control audit score: ${sec.last_audit_score || 85}/100.`,
        status: state.capital_adequacy_ratio >= 12 ? "positive" : "negative",
        metrics: {
          "Supervisory Standing": state.capital_adequacy_ratio >= 12 ? "In Good Standing" : "Capital Warning",
          "Audit Rating": `${sec.last_audit_score || 85}/100`,
        },
      },
      major_decisions: {
        title: "12. Major Decisions Taken",
        content: `Throughout Year ${year}'s 4 operational quarters, executive leadership executed monetary interest spread adjustments, approved personnel allocations, directed lending quotas, and safeguarded liquidity against external shocks.`,
        metrics: {
          "Operating Quarters": "4 Quarters Executed",
          "Policy Alignment": "Benchmarked",
        },
      },
      important_events: {
        title: "13. Important Events and Incidents",
        content: events.length > 0
          ? `Encountered ${events.length} market and operational events during the year, including: ${events.map((e) => e.title).slice(0, 3).join(", ")}.`
          : `Year ${year} concluded with stable market conditions and no catastrophic counterparty defaults.`,
        metrics: {
          "Events Recorded": events.length,
          "Resolution Rate": events.length > 0 ? "100% Resolved" : "Zero Incidents",
        },
      },
      achievements_and_failures: {
        title: "14. Achievements and Failures",
        content: `${state.net_profit >= 0 ? "Successfully posted positive bottom-line earnings while preserving capital." : "Experienced operational losses requiring capitalization attention."} ${state.capital_adequacy_ratio >= 14 ? "Tier-1 capital buffer remains robust." : "Capital adequacy requires close monitoring."}`,
        status: state.net_profit >= 0 && state.capital_adequacy_ratio >= 12 ? "positive" : "warning",
        metrics: {
          "Earnings Health": state.net_profit >= 0 ? "Profitable" : "Deficit",
          "Capital Cushion": `${state.capital_adequacy_ratio}% (Min 12%)`,
        },
      },
      recommendations_next_year: {
        title: "15. Recommendations for the Next Year",
        content: `For Year ${year + 1}, the Supervisory Board recommends prioritizing the following governance actions:\n• Calibrate commercial and retail credit spreads against central bank policy rates.\n• Enforce strict loan underwriting standards to maintain NPL ratio below 3.0%.\n• Fill open vacancies across critical departments with qualified banking personnel.\n• Maintain high-quality liquid cash reserves to cushion against macroeconomic liquidity shocks.`,
        status: "positive",
        metrics: {
          "Max Target NPL": "3.0%",
          "Min Solvency CAR": "12.0%",
          "Next Fiscal Period": `Year ${year + 1} (${calendarYear + 1})`,
          "Audit Mandate": "Unconditional",
        },
      },
    },
  };
}

function generateFinalFiveYearReport(bankId: string): FinalFiveYearReport {
  const bank = getBank(bankId);
  const state = getSimulationState(bankId);
  const history = getQuarterHistory(bankId);
  const loans = getLoans(bankId);

  const cumulativeProfit = history.reduce((sum, h) => sum + h.net_profit, 0);
  const peakAssets = history.reduce((max, h) => Math.max(max, h.assets), state.total_assets);
  const totalLoansIssued = loans.length;

  let grade: FinalFiveYearReport["mandate_grade"] = "B - Sound Institution";
  if (state.capital_adequacy_ratio >= 15 && cumulativeProfit > 1000000 && state.npl_ratio <= 2.5) {
    grade = "A - Exemplary";
  } else if (state.capital_adequacy_ratio < 10 || cumulativeProfit < -5000000) {
    grade = "Dismissed by Board";
  } else if (state.capital_adequacy_ratio < 12 || state.npl_ratio > 5.0) {
    grade = "C - Marginal";
  }

  return {
    id: `final-rep-${bankId}`,
    bank_id: bankId,
    completed_at: new Date().toISOString(),
    ceo_name: bank?.ceo_name || "Chief Executive Officer",
    bank_name: bank?.name || "The Institution",
    mandate_grade: grade,
    summary: `The 5-Year Executive Mandate encompassing 20 operational quarters has concluded. Under Chairman & CEO ${bank?.ceo_name || "Chief Executive Officer"}, the bank achieved peak balance sheet assets of ${formatCurrency(peakAssets)} and cumulative net earnings of ${formatCurrency(cumulativeProfit)}. Final supervisory CAR ended at ${state.capital_adequacy_ratio}%.`,
    cumulative_profit: cumulativeProfit,
    peak_assets: peakAssets,
    total_loans_issued: totalLoansIssued,
    npl_final: state.npl_ratio,
    final_car: state.capital_adequacy_ratio,
    total_quarters_completed: 20,
  };
}

// 13. REPORTS RETRIEVAL & MARKING
export function getAnnualReports(bankId: string): AnnualReport[] {
  const allReports = getStorage<Record<string, AnnualReport[]>>(KEY_ANNUAL_REPORTS, {});
  const raw = allReports[bankId] || [];
  // Deduplicate and regenerate fresh, properly-formatted sections for all completed years
  const map = new Map<number, AnnualReport>();
  for (const r of raw) {
    if (r.year >= 1 && r.year <= 5) {
      const fresh = generateAnnualReportForYear(bankId, r.year);
      fresh.is_read = r.is_read ?? false;
      fresh.generated_at = r.generated_at || fresh.generated_at;
      map.set(r.year, fresh);
    }
  }
  const reports = Array.from(map.values()).sort((a, b) => a.year - b.year);
  allReports[bankId] = reports;
  setStorage(KEY_ANNUAL_REPORTS, allReports);
  return reports;
}

export function getAnnualReport(bankId: string, reportId: string): AnnualReport | null {
  const reports = getAnnualReports(bankId);
  return reports.find((r) => r.id === reportId) || null;
}

export function markReportAsRead(bankId: string, reportId: string): void {
  const allReports = getStorage<Record<string, AnnualReport[]>>(KEY_ANNUAL_REPORTS, {});
  const reports = allReports[bankId] || [];
  const rep = reports.find((r) => r.id === reportId);
  if (rep) {
    rep.is_read = true;
    setStorage(KEY_ANNUAL_REPORTS, allReports);
  }
}

export function getUnreadReportsCount(bankId: string): number {
  const reports = getAnnualReports(bankId);
  return reports.filter((r) => !r.is_read).length;
}

export function getFinalReport(bankId: string): FinalFiveYearReport | null {
  const allFinal = getStorage<Record<string, FinalFiveYearReport>>(KEY_FINAL_REPORTS, {});
  return allFinal[bankId] || null;
}

// 14. SECURITY CONFIGURATION
export function getSecurityConfig(bankId: string): BankSecurityConfig {
  const allSec = getStorage<Record<string, BankSecurityConfig>>(KEY_SECURITY, {});
  return (
    allSec[bankId] || {
      bank_id: bankId,
      cybersecurity_tier: "Basic",
      fraud_monitoring: "Manual",
      physical_security: "Standard",
      internal_controls: "Standard",
      quarterly_security_budget: 25000,
      active_incidents_count: 0,
      last_audit_score: 80,
    }
  );
}

export function updateSecurityConfig(bankId: string, config: Partial<BankSecurityConfig>): void {
  const allSec = getStorage<Record<string, BankSecurityConfig>>(KEY_SECURITY, {});
  allSec[bankId] = { ...getSecurityConfig(bankId), ...config };
  setStorage(KEY_SECURITY, allSec);
}

// 15. ADVANCE QUARTER SIMULATION (4 Quarters per Year, 5 Years total = 20 Quarters)
export function advanceQuarterInStorage(
  bankId: string,
  decisions: {
    savingsRate?: number;
    personalLoanSpread?: number;
    businessLoanSpread?: number;
    marketingBudget?: number;
    trainingBudget?: number;
    aiInvestment?: number;
  }
): { bank: Bank; state: SimulationState } {
  const bank = getBank(bankId);
  if (!bank) throw new Error("Bank not found");

  const state = getSimulationState(bankId);

  // If 5-year simulation mandate is already completed, lock and do not corrupt data
  if (bank.status === "completed" || (bank.current_year >= 5 && bank.current_quarter >= 4 && getFinalReport(bankId))) {
    bank.status = "completed";
    return { bank, state };
  }

  const eco = getEconomicCondition(bankId);
  const history = getQuarterHistory(bankId);

  // Active workforce and loans
  const emps = getEmployees(bankId);
  const aiAgents = getAiAgents(bankId);
  const activeLoans = getLoans(bankId).filter((l) => l.status === "Active");
  const currentLoansOutstanding = activeLoans.reduce((sum, l) => sum + l.amount, 0);

  // 1. DYNAMIC CUSTOMER ONBOARDING & DEPOSIT INFLOW
  const allCusts = getStorage<Record<string, Customer[]>>(KEY_CUSTOMERS, {});
  const bankCusts = allCusts[bankId] || [];

  const customerProspects = [
    { name: "Apex Logistics Corp", cat: "Corporate" as const, acc: "Checking" as const, baseDep: 2800000, score: 790, risk: "Low" as const },
    { name: "Green Valley Organics", cat: "Small Business" as const, acc: "Savings" as const, baseDep: 420000, score: 735, risk: "Low" as const },
    { name: "Dr. Alistair Finch", cat: "Individual" as const, acc: "Fixed Deposit" as const, baseDep: 650000, score: 810, risk: "Low" as const },
    { name: "Skyline Media Group", cat: "Medium Business" as const, acc: "Checking" as const, baseDep: 1250000, score: 685, risk: "Medium" as const },
    { name: "Jessica Barnes", cat: "Individual" as const, acc: "Savings" as const, baseDep: 85000, score: 745, risk: "Low" as const },
    { name: "Nordic Maritime Logistics", cat: "Corporate" as const, acc: "Checking" as const, baseDep: 3400000, score: 780, risk: "Low" as const },
    { name: "Highland Biotech Labs", cat: "Medium Business" as const, acc: "Fixed Deposit" as const, baseDep: 950000, score: 720, risk: "Medium" as const },
    { name: "Marcus Thorne & Associates", cat: "Small Business" as const, acc: "Checking" as const, baseDep: 310000, score: 760, risk: "Low" as const },
    { name: "Eleanor Vance", cat: "Individual" as const, acc: "Savings" as const, baseDep: 110000, score: 790, risk: "Low" as const },
    { name: "Vanguard Tech Innovations", cat: "Corporate" as const, acc: "Checking" as const, baseDep: 4200000, score: 760, risk: "Medium" as const },
    { name: "Cobalt Engineering Co", cat: "Medium Business" as const, acc: "Checking" as const, baseDep: 780000, score: 695, risk: "Medium" as const },
    { name: "Sophia Reynolds", cat: "Individual" as const, acc: "Fixed Deposit" as const, baseDep: 240000, score: 805, risk: "Low" as const },
    { name: "Silverline Retail Holdings", cat: "Corporate" as const, acc: "Checking" as const, baseDep: 3100000, score: 740, risk: "Low" as const },
    { name: "David K. Ross, Architect", cat: "Small Business" as const, acc: "Savings" as const, baseDep: 220000, score: 755, risk: "Low" as const },
    { name: "Catherine Sterling", cat: "Individual" as const, acc: "Checking" as const, baseDep: 95000, score: 770, risk: "Low" as const },
  ];

  // Onboard 2-3 new customers each quarter based on market attractiveness
  const existingNames = new Set(bankCusts.map((c) => c.name));
  const newCandidates = customerProspects.filter((p) => !existingNames.has(p.name));
  const toAdd = newCandidates.slice(0, bankCusts.length === 0 ? 3 : 2);

  for (const cand of toAdd) {
    const rateFactor = 1 + ((decisions.savingsRate || 2.5) - 2.5) * 0.05;
    const initialBalance = Math.round(cand.baseDep * Math.max(0.7, rateFactor));
    bankCusts.push({
      id: `cust-${bankId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bank_id: bankId,
      name: cand.name,
      category: cand.cat,
      account_type: cand.acc,
      deposit_balance: initialBalance,
      credit_score: cand.score,
      risk_category: cand.risk,
      satisfaction: 85 + Math.floor(Math.random() * 12),
      status: "Active",
    });
  }

  // Organic growth on existing accounts
  for (const c of bankCusts) {
    c.deposit_balance = Math.round(c.deposit_balance * (1 + (Math.random() * 0.03 - 0.01)));
  }
  allCusts[bankId] = bankCusts;
  setStorage(KEY_CUSTOMERS, allCusts);

  // Compute total deposits directly from verified customer base
  const newDeposits = bankCusts.reduce((sum, c) => sum + c.deposit_balance, 0);

  // Loans growth (compounded if active loans exist)
  const newLoans = Math.max(currentLoansOutstanding, Math.round(state.total_loans_outstanding * 1.02));

  // Interest Income & Expense
  const avgLoanRate = (eco.central_bank_rate + (decisions.personalLoanSpread || 4.5)) / 100;
  const avgDepositRate = (decisions.savingsRate || 2.5) / 100;
  const quarterlyInterestIncome = newLoans > 0 ? Math.round((newLoans * avgLoanRate) / 4) : 0;
  const quarterlyInterestExpense = newDeposits > 0 ? Math.round((newDeposits * avgDepositRate) / 4) : 0;
  const netInterestIncome = quarterlyInterestIncome - quarterlyInterestExpense;

  // Operational Expenses (salaries + AI + overhead + security)
  const sec = getSecurityConfig(bankId);
  const totalSalaries = emps.reduce((acc, e) => acc + e.salary / 4, 0);
  const totalAiCost = aiAgents.reduce((acc, a) => acc + a.monthly_cost * 3, 0);
  const operatingExpenses = Math.round(
    totalSalaries + totalAiCost + (decisions.marketingBudget || 30000) + (decisions.trainingBudget || 15000) + (sec.quarterly_security_budget || 25000) + 15000
  );

  // Fee Income directly from customer accounts & transaction volume
  const feeIncome = bankCusts.length * 2500 + Math.round(newDeposits * 0.001);
  const loanLossProvisions = Math.round(newLoans * 0.002);
  const netProfit = Math.round(netInterestIncome + feeIncome - operatingExpenses - loanLossProvisions);

  // Update Balance Sheet (Assets = Liabilities + Equity)
  const totalEquity = Math.max(1000000, state.total_equity + netProfit);
  const totalLiabilities = newDeposits;
  const totalAssets = totalLiabilities + totalEquity;
  const cashReserves = Math.max(0, totalAssets - newLoans);

  // Solvency Ratios
  const riskWeightedAssets = Math.max(1000000, newLoans * 0.8 + totalAssets * 0.1);
  const car = parseFloat(Math.max(4, Math.min(60, (totalEquity / riskWeightedAssets) * 100)).toFixed(1));
  const npl = parseFloat(Math.max(0.0, Math.min(8.5, state.npl_ratio + (Math.random() * 0.3 - 0.15))).toFixed(2));
  const roe = parseFloat(((netProfit * 4) / totalEquity * 100).toFixed(1));
  const roa = parseFloat(((netProfit * 4) / totalAssets * 100).toFixed(2));

  // Update State
  state.total_assets = totalAssets;
  state.total_liabilities = totalLiabilities;
  state.total_equity = totalEquity;
  state.cash_reserves = cashReserves;
  state.total_deposits = newDeposits;
  state.total_loans_outstanding = newLoans;
  state.net_interest_income = netInterestIncome;
  state.non_interest_income = feeIncome;
  state.operating_expenses = operatingExpenses;
  state.loan_loss_provisions = loanLossProvisions;
  state.net_profit = netProfit;
  state.capital_adequacy_ratio = car;
  state.liquidity_ratio = parseFloat(Math.min(100, Math.max(15, (cashReserves / (newDeposits || 1)) * 100)).toFixed(1));
  state.npl_ratio = npl;
  state.roe = roe;
  state.roa = roa;
  state.total_employees = emps.length;
  state.total_ai_agents = aiAgents.length;
  state.customer_satisfaction = Math.min(99, Math.max(60, state.customer_satisfaction + (decisions.trainingBudget ? 2 : 0)));

  // Save current quarter in history (deduplicated by year and quarter)
  const existingHistIdx = history.findIndex((h) => h.year === bank.current_year && h.quarter === bank.current_quarter);
  const histItem: QuarterHistory = {
    year: bank.current_year,
    quarter: bank.current_quarter,
    assets: totalAssets,
    liabilities: totalLiabilities,
    equity: totalEquity,
    deposits: newDeposits,
    loans: newLoans,
    net_interest_income: netInterestIncome,
    net_profit: netProfit,
    npl_ratio: npl,
    car: car,
  };
  if (existingHistIdx >= 0) {
    history[existingHistIdx] = histItem;
  } else {
    history.push(histItem);
  }
  const allHist = getStorage<Record<string, QuarterHistory[]>>(KEY_HISTORY, {});
  allHist[bankId] = history;
  setStorage(KEY_HISTORY, allHist);

  // Check if Quarter 4 is completed (Year-End)
  const isYearEnd = bank.current_quarter === 4;
  if (isYearEnd) {
    // Generate Annual Report for this completed year
    const annualReport = generateAnnualReportForYear(bankId, bank.current_year);
    const allReports = getStorage<Record<string, AnnualReport[]>>(KEY_ANNUAL_REPORTS, {});
    const bankReports = allReports[bankId] || [];
    
    // Deduplicate by year (replace if already exists, otherwise push)
    const existingRepIdx = bankReports.findIndex((r) => r.year === bank.current_year);
    if (existingRepIdx >= 0) {
      bankReports[existingRepIdx] = annualReport;
    } else {
      bankReports.push(annualReport);
    }
    allReports[bankId] = bankReports;
    setStorage(KEY_ANNUAL_REPORTS, allReports);

    if (bank.current_year >= 5) {
      // 5-Year simulation complete (all 20 quarters completed!)
      const finalReport = generateFinalFiveYearReport(bankId);
      const allFinal = getStorage<Record<string, FinalFiveYearReport>>(KEY_FINAL_REPORTS, {});
      allFinal[bankId] = finalReport;
      setStorage(KEY_FINAL_REPORTS, allFinal);
      bank.status = "completed";
    } else {
      bank.current_year = bank.current_year + 1;
      bank.current_quarter = 1;
    }
  } else {
    bank.current_quarter = (bank.current_quarter + 1) as 1 | 2 | 3 | 4;
  }
  bank.last_played_at = new Date().toISOString();

  // Save bank & state
  const allBanks = getStorage<Record<string, Bank>>(KEY_BANKS, {});
  allBanks[bankId] = bank;
  setStorage(KEY_BANKS, allBanks);

  const allStates = getStorage<Record<string, SimulationState>>(KEY_STATES, {});
  allStates[bankId] = state;
  setStorage(KEY_STATES, allStates);

  // Update Slot
  const slots = getBankSlots();
  const s = slots.find((x) => x.bank_id === bankId);
  if (s) {
    s.bank = bank;
    setStorage(KEY_SLOTS, slots);
  }

  // Refresh loan opportunities if pending queue is low
  const allLoans = getStorage<Record<string, Loan[]>>(KEY_LOANS, {});
  const bankLoans = allLoans[bankId] || [];
  const pendingCount = bankLoans.filter((l) => l.status === "Pending").length;
  if (pendingCount < 2) {
    const loanNames = [
      { name: "Apex Logistics Corp", cat: "Corporate" as const, amt: 1200000, rate: 6.8, term: 60, grade: "AA" as const, coll: 1800000 },
      { name: "Dr. Alistair Finch", cat: "Mortgage" as const, amt: 480000, rate: 5.4, term: 240, grade: "AAA" as const, coll: 720000 },
      { name: "Green Valley Organics", cat: "Business" as const, amt: 320000, rate: 7.9, term: 36, grade: "A" as const, coll: 450000 },
      { name: "Skyline Media Group", cat: "Corporate" as const, amt: 950000, rate: 7.2, term: 48, grade: "BBB" as const, coll: 1200000 },
      { name: "Elena Rostova", cat: "Personal" as const, amt: 45000, rate: 9.8, term: 24, grade: "A" as const, coll: 60000 },
    ];
    const candidate = loanNames[Math.floor(Math.random() * loanNames.length)];
    bankLoans.push({
      id: `loan-${bankId}-${Date.now()}`,
      bank_id: bankId,
      borrower_name: candidate.name,
      category: candidate.cat,
      amount: candidate.amt,
      interest_rate: candidate.rate,
      term_months: candidate.term,
      remaining_months: candidate.term,
      monthly_payment: Math.round((candidate.amt * (candidate.rate / 100)) / 12 + candidate.amt / candidate.term),
      status: "Pending",
      risk_grade: candidate.grade,
      collateral_value: candidate.coll,
    });
    allLoans[bankId] = bankLoans;
    setStorage(KEY_LOANS, allLoans);
  }

  // Generate dynamic quarterly event
  if (Math.random() < 0.45) {
    const events = getEvents(bankId);
    const eventCatalog = [
      {
        title: "Central Bank Capital Adequacy Audit",
        cat: "Regulatory" as const,
        sev: "Medium" as const,
        desc: "National regulators are conducting an unannounced capital inspection on mid-tier institutions.",
        options: [
          { id: "opt-1", label: "Cooperate & Submit Internal Audit", cost: 15000, description: "Full transparency preserves supervisor trust.", reputation_impact: 3, risk_reduction: 10 },
          { id: "opt-2", label: "Standard Filing", cost: 0, description: "Submit standard reports without special counsel.", reputation_impact: 0, risk_reduction: 0 },
        ],
      },
      {
        title: "DDoS Cyber Probe on API Gateway",
        cat: "Cyber" as const,
        sev: "High" as const,
        desc: "Network monitoring flagged automated traffic spikes attempting credential stuffing against client portals.",
        options: [
          { id: "opt-1", label: "Activate Tier-3 Cloudflare Armor", cost: 25000, description: "Zero downtime mitigation with rate limiting.", reputation_impact: 2, risk_reduction: 20 },
          { id: "opt-2", label: "Internal SOC Mitigation", cost: 5000, description: "Rely on in-house engineering team to blacklist IPs.", reputation_impact: -1, risk_reduction: 8 },
        ],
      },
      {
        title: "Large Corporate Deposit Inflow",
        cat: "Liquidity" as const,
        sev: "Low" as const,
        desc: "A regional enterprise group seeks to park liquid liquidity in a 1-year fixed term deposit.",
        options: [
          { id: "opt-1", label: "Accept at Competitive Spread", cost: 0, description: "Boosts liquidity ratio and deposit footings.", reputation_impact: 2, risk_reduction: 5 },
          { id: "opt-2", label: "Cap Deposit Size", cost: 0, description: "Avoid concentration risk in single corporate depositor.", reputation_impact: 0, risk_reduction: 0 },
        ],
      },
    ];
    const picked = eventCatalog[Math.floor(Math.random() * eventCatalog.length)];
    events.push({
      id: `ev-${Date.now()}`,
      bank_id: bankId,
      title: picked.title,
      severity: picked.sev,
      category: picked.cat,
      description: picked.desc,
      year: bank.current_year,
      quarter: bank.current_quarter,
      resolved: false,
      options: picked.options,
    });
    const allEvs = getStorage<Record<string, CrisisEvent[]>>(KEY_EVENTS, {});
    allEvs[bankId] = events;
    setStorage(KEY_EVENTS, allEvs);
  }

  return { bank, state };
}
