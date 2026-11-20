"use client";

import type { Bank, BankSlot, BankSettings, CreateBankFormData, BankType, Difficulty } from "@/types/bank";
import { formatCurrency } from "@/lib/formatters";

export type { BankSettings };

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
  return banks[bankId] || null;
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
    country: data.country,
    city: data.city,
    currency: data.currency,
    bank_type: data.bank_type,
    logo_url: null,
    difficulty: data.difficulty,
    simulation_duration_years: data.simulation_duration_years,
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

  // 3. Initialize Starting Financial State
  const initialCapital = data.starting_capital;
  const initialDeposits = Math.round(initialCapital * 1.5);
  const initialLoans = Math.round(initialCapital * 1.2);
  const cashReserves = initialCapital + initialDeposits - initialLoans;

  const initialState: SimulationState = {
    bank_id: bankId,
    total_assets: initialCapital + initialDeposits,
    total_liabilities: initialDeposits,
    total_equity: initialCapital,
    cash_reserves: cashReserves,
    total_deposits: initialDeposits,
    total_loans_outstanding: initialLoans,
    net_interest_income: Math.round(initialLoans * 0.02),
    non_interest_income: 150000,
    operating_expenses: 420000,
    loan_loss_provisions: 50000,
    net_profit: 180000,
    liquidity_ratio: parseFloat(((cashReserves / initialDeposits) * 100).toFixed(1)),
    capital_adequacy_ratio: 24.5,
    npl_ratio: 1.2,
    roe: 8.4,
    roa: 1.6,
    customer_satisfaction: 88,
    total_employees: 14,
    total_ai_agents: 2,
    fraud_incidents: 0,
  };
  const allStates = getStorage<Record<string, SimulationState>>(KEY_STATES, {});
  allStates[bankId] = initialState;
  setStorage(KEY_STATES, allStates);

  // 4. Initialize 10 Departments
  const deptNames = [
    { name: "Customer Service", manager: "Sarah Jenkins", emp: 4, ai: 1, budget: 35000 },
    { name: "Loan and Credit Department", manager: "Marcus Vance", emp: 3, ai: 1, budget: 45000 },
    { name: "Cash Operations", manager: "David Ross", emp: 2, ai: 0, budget: 25000 },
    { name: "Risk Management", manager: "Elena Rostova", emp: 1, ai: 0, budget: 30000 },
    { name: "Fraud Prevention", manager: "Alan Turing", emp: 1, ai: 0, budget: 28000 },
    { name: "Treasury", manager: "Claire Beaumont", emp: 1, ai: 0, budget: 40000 },
    { name: "Compliance", manager: "Robert Sterling", emp: 1, ai: 0, budget: 32000 },
    { name: "Human Resources", manager: "Chloe Adams", emp: 1, ai: 0, budget: 20000 },
    { name: "Digital Banking", manager: "Kevin Lin", emp: 0, ai: 0, budget: 50000 },
    { name: "IT and Cybersecurity", manager: "Alex Chen", emp: 1, ai: 0, budget: 60000 },
  ];
  const departments: Department[] = deptNames.map((d, i) => ({
    id: `dept-${bankId}-${i + 1}`,
    bank_id: bankId,
    name: d.name,
    manager_name: d.manager,
    employee_count: d.emp,
    ai_agent_count: d.ai,
    budget_monthly: d.budget,
    productivity: 85 + Math.floor(Math.random() * 10),
    workload: 70 + Math.floor(Math.random() * 20),
    error_rate: 1.2,
    performance_score: 88,
  }));
  const allDepts = getStorage<Record<string, Department[]>>(KEY_DEPARTMENTS, {});
  allDepts[bankId] = departments;
  setStorage(KEY_DEPARTMENTS, allDepts);

  // 5. Initialize Starting Employees
  const employeeSeed = [
    { name: "Emma Watson", role: "Senior Loan Officer", dept: "Loan and Credit Department", salary: 75000, exp: 6, skill: "Senior" as const },
    { name: "Liam Miller", role: "Credit Risk Analyst", dept: "Loan and Credit Department", salary: 62000, exp: 3, skill: "Mid" as const },
    { name: "Sophia Davis", role: "Junior Underwriter", dept: "Loan and Credit Department", salary: 48000, exp: 1, skill: "Junior" as const },
    { name: "James Wilson", role: "Customer Service Lead", dept: "Customer Service", salary: 55000, exp: 5, skill: "Lead" as const },
    { name: "Olivia Taylor", role: "Support Representative", dept: "Customer Service", salary: 42000, exp: 2, skill: "Junior" as const },
    { name: "Noah Anderson", role: "VIP Relationship Manager", dept: "Customer Service", salary: 68000, exp: 4, skill: "Mid" as const },
    { name: "Ava Thomas", role: "Branch Cashier", dept: "Cash Operations", salary: 40000, exp: 2, skill: "Junior" as const },
    { name: "Ethan Jackson", role: "Vault Supervisor", dept: "Cash Operations", salary: 58000, exp: 7, skill: "Senior" as const },
    { name: "Isabella White", role: "Chief Risk Officer", dept: "Risk Management", salary: 110000, exp: 10, skill: "Lead" as const },
    { name: "Lucas Harris", role: "Senior Fraud Investigator", dept: "Fraud Prevention", salary: 78000, exp: 5, skill: "Senior" as const },
    { name: "Mia Martin", role: "Treasury Portfolio Manager", dept: "Treasury", salary: 95000, exp: 8, skill: "Senior" as const },
    { name: "Benjamin Clark", role: "Regulatory Compliance Officer", dept: "Compliance", salary: 72000, exp: 4, skill: "Mid" as const },
    { name: "Charlotte Lewis", role: "HR Generalist", dept: "Human Resources", salary: 52000, exp: 3, skill: "Mid" as const },
    { name: "Henry Walker", role: "Cybersecurity Engineer", dept: "IT and Cybersecurity", salary: 88000, exp: 5, skill: "Senior" as const },
  ];
  const employees: Employee[] = employeeSeed.map((e, idx) => ({
    id: `emp-${bankId}-${idx + 1}`,
    bank_id: bankId,
    department_id: departments.find((d) => d.name === e.dept)?.id || departments[0].id,
    department_name: e.dept,
    name: e.name,
    role: e.role,
    salary: e.salary,
    experience_years: e.exp,
    skill_level: e.skill,
    productivity: 88 + (idx % 7),
    accuracy: 94 + (idx % 5),
    customer_rating: 4.6,
    morale: 92,
    status: "Active",
  }));
  const allEmps = getStorage<Record<string, Employee[]>>(KEY_EMPLOYEES, {});
  allEmps[bankId] = employees;
  setStorage(KEY_EMPLOYEES, allEmps);

  // 6. Initialize Starting AI Agents
  const initialAi: AiAgent[] = [
    {
      id: `ai-${bankId}-1`,
      bank_id: bankId,
      department_id: departments[0].id,
      department_name: "Customer Service",
      name: "Atlas-CS1",
      agent_type: "AI Customer Support Agent",
      monthly_cost: 2500,
      processing_speed: "12x Human",
      accuracy: 91,
      error_probability: 2.1,
      cybersecurity_risk: 1.5,
      human_supervision_needed: "Low",
      status: "Active",
    },
    {
      id: `ai-${bankId}-2`,
      bank_id: bankId,
      department_id: departments[1].id,
      department_name: "Loan and Credit Department",
      name: "Cortex-Credit",
      agent_type: "AI Loan Assessment Agent",
      monthly_cost: 4200,
      processing_speed: "8x Human",
      accuracy: 89,
      error_probability: 3.4,
      cybersecurity_risk: 2.8,
      human_supervision_needed: "Medium",
      status: "Active",
    },
  ];
  const allAi = getStorage<Record<string, AiAgent[]>>(KEY_AI_AGENTS, {});
  allAi[bankId] = initialAi;
  setStorage(KEY_AI_AGENTS, allAi);

  // 7. Initialize Customers
  const customerSeed: Customer[] = [
    { id: `cust-1`, bank_id: bankId, name: "Apex Logistics Corp", category: "Corporate", account_type: "Checking", deposit_balance: 4200000, credit_score: 790, risk_category: "Low", satisfaction: 94, status: "Active" },
    { id: `cust-2`, bank_id: bankId, name: "Green Valley Organics", category: "Small Business", account_type: "Checking", deposit_balance: 380000, credit_score: 720, risk_category: "Low", satisfaction: 89, status: "Active" },
    { id: `cust-3`, bank_id: bankId, name: "Dr. Alistair Finch", category: "Individual", account_type: "Fixed Deposit", deposit_balance: 650000, credit_score: 810, risk_category: "Low", satisfaction: 96, status: "Active" },
    { id: `cust-4`, bank_id: bankId, name: "Skyline Media Group", category: "Medium Business", account_type: "Checking", deposit_balance: 1400000, credit_score: 680, risk_category: "Medium", satisfaction: 82, status: "Active" },
    { id: `cust-5`, bank_id: bankId, name: "Jessica Barnes", category: "Individual", account_type: "Savings", deposit_balance: 85000, credit_score: 740, risk_category: "Low", satisfaction: 91, status: "Active" },
  ];
  const allCusts = getStorage<Record<string, Customer[]>>(KEY_CUSTOMERS, {});
  allCusts[bankId] = customerSeed;
  setStorage(KEY_CUSTOMERS, allCusts);

  // 8. Initialize Loans
  const loanSeed: Loan[] = [
    { id: `loan-1`, bank_id: bankId, borrower_name: "Apex Logistics Corp", category: "Corporate", amount: 2500000, interest_rate: 6.8, term_months: 60, remaining_months: 52, monthly_payment: 49200, status: "Active", risk_grade: "AA", collateral_value: 3800000 },
    { id: `loan-2`, bank_id: bankId, borrower_name: "Green Valley Organics", category: "Business", amount: 450000, interest_rate: 8.2, term_months: 36, remaining_months: 28, monthly_payment: 14100, status: "Active", risk_grade: "A", collateral_value: 620000 },
    { id: `loan-3`, bank_id: bankId, borrower_name: "Michael Chang", category: "Mortgage", amount: 720000, interest_rate: 5.4, term_months: 360, remaining_months: 340, monthly_payment: 4040, status: "Active", risk_grade: "AAA", collateral_value: 950000 },
    { id: `loan-4`, bank_id: bankId, borrower_name: "Sarah Jenkins", category: "Personal", amount: 35000, interest_rate: 11.5, term_months: 24, remaining_months: 18, monthly_payment: 1640, status: "Active", risk_grade: "A", collateral_value: 45000 },
  ];
  const allLoans = getStorage<Record<string, Loan[]>>(KEY_LOANS, {});
  allLoans[bankId] = loanSeed;
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
  return allHist[bankId] || [];
}

// 12. ADVANCE QUARTER SIMULATION
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
  const eco = getEconomicCondition(bankId);
  const history = getQuarterHistory(bankId);

  // Advance Quarter & Year
  let nextQuarter = (bank.current_quarter + 1) as 1 | 2 | 3 | 4;
  let nextYear = bank.current_year;
  if (nextQuarter > 4) {
    nextQuarter = 1;
    nextYear += 1;
  }
  bank.current_quarter = nextQuarter;
  bank.current_year = nextYear;
  bank.last_played_at = new Date().toISOString();

  // Financial Growth Calculations
  const depositGrowthRate = 0.03 + (decisions.marketingBudget ? decisions.marketingBudget / 10000000 : 0.01);
  const newDeposits = Math.round(state.total_deposits * (1 + depositGrowthRate));
  const newLoans = Math.round(state.total_loans_outstanding * 1.025);

  // Interest Income & Expense
  const avgLoanRate = (eco.central_bank_rate + (decisions.personalLoanSpread || 4.5)) / 100;
  const avgDepositRate = (decisions.savingsRate || 2.5) / 100;
  const quarterlyInterestIncome = Math.round((newLoans * avgLoanRate) / 4);
  const quarterlyInterestExpense = Math.round((newDeposits * avgDepositRate) / 4);
  const netInterestIncome = quarterlyInterestIncome - quarterlyInterestExpense;

  // Operational Expenses (salaries + AI + marketing + training)
  const emps = getEmployees(bankId);
  const totalSalaries = emps.reduce((acc, e) => acc + e.salary / 4, 0);
  const aiAgents = getAiAgents(bankId);
  const totalAiCost = aiAgents.reduce((acc, a) => acc + a.monthly_cost * 3, 0);
  const operatingExpenses = Math.round(totalSalaries + totalAiCost + (decisions.marketingBudget || 50000) + (decisions.trainingBudget || 20000));

  // Net Profit
  const netProfit = Math.round(netInterestIncome + 200000 - operatingExpenses - 40000);

  // Update Balance Sheet
  const totalEquity = state.total_equity + netProfit;
  const totalLiabilities = newDeposits;
  const totalAssets = totalLiabilities + totalEquity;
  const cashReserves = totalAssets - newLoans;

  // Ratios
  const car = parseFloat(Math.max(12, Math.min(32, ((totalEquity / (newLoans * 0.8)) * 100))).toFixed(1));
  const npl = parseFloat(Math.max(0.8, Math.min(6.5, state.npl_ratio + (Math.random() * 0.4 - 0.2))).toFixed(2));
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
  state.operating_expenses = operatingExpenses;
  state.net_profit = netProfit;
  state.capital_adequacy_ratio = car;
  state.npl_ratio = npl;
  state.roe = roe;
  state.roa = roa;
  state.customer_satisfaction = Math.min(99, Math.max(65, state.customer_satisfaction + (decisions.trainingBudget ? 1 : 0)));

  // Save updated objects
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

  // Append history
  history.push({
    year: nextYear,
    quarter: nextQuarter,
    assets: totalAssets,
    liabilities: totalLiabilities,
    equity: totalEquity,
    deposits: newDeposits,
    loans: newLoans,
    net_interest_income: netInterestIncome,
    net_profit: netProfit,
    npl_ratio: npl,
    car: car,
  });
  const allHist = getStorage<Record<string, QuarterHistory[]>>(KEY_HISTORY, {});
  allHist[bankId] = history;
  setStorage(KEY_HISTORY, allHist);

  // Occasionally trigger a crisis or resignation event
  if (Math.random() < 0.4) {
    const events = getEvents(bankId);
    const newEvent: CrisisEvent = {
      id: `ev-${Date.now()}`,
      bank_id: bankId,
      title: "Sudden Loan Officer Resignation",
      severity: "Medium",
      category: "Credit",
      description: "A Senior Loan Officer has resigned to join a competitor. You must decide whether to hire an experienced human loan officer or deploy an AI Loan Assessment Agent.",
      year: nextYear,
      quarter: nextQuarter,
      resolved: false,
      options: [
        { id: "opt-1", label: "Hire Human Loan Officer", cost: 72000, description: "Recruit human with high judgment and strong client rapport.", reputation_impact: 2, risk_reduction: 5 },
        { id: "opt-2", label: "Deploy AI Loan Agent", cost: 32000, description: "Deploy 8x faster AI scoring with lower cost but higher cyber risk.", reputation_impact: -1, risk_reduction: 2 },
      ],
    };
    events.push(newEvent);
    const allEvs = getStorage<Record<string, CrisisEvent[]>>(KEY_EVENTS, {});
    allEvs[bankId] = events;
    setStorage(KEY_EVENTS, allEvs);
  }

  return { bank, state };
}
