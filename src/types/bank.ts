/** Bank type options */
export type BankType = "retail" | "corporate" | "universal";

/** Difficulty level */
export type Difficulty = "beginner" | "intermediate" | "advanced";

/** Bank status */
export type BankStatus = "active" | "paused" | "bankrupt" | "completed" | "seized";

/** Bank slot data */
export interface BankSlot {
  id: string;
  user_id: string;
  slot_number: 1 | 2 | 3;
  bank_id: string | null;
  is_occupied: boolean;
  created_at: string;
  updated_at: string;
  bank?: Bank | null;
}

/** Full bank data */
export interface Bank {
  id: string;
  user_id: string;
  slot_id: string;
  name: string;
  country: string;
  city: string;
  currency: string;
  bank_type: BankType;
  logo_url: string | null;
  difficulty: Difficulty;
  simulation_duration_years: number;
  initial_strategy: string;
  starting_capital: number;
  current_year: number;
  current_quarter: 1 | 2 | 3 | 4;
  status: BankStatus;
  quarter_processing: boolean;
  random_seed: number;
  created_at: string;
  updated_at: string;
  last_played_at: string;
}

/** Bank creation form data */
export interface CreateBankFormData {
  name: string;
  country: string;
  city: string;
  currency: string;
  bank_type: BankType;
  difficulty: Difficulty;
  simulation_duration_years: number;
  initial_strategy: string;
  starting_capital: number;
}

/** Bank settings */
export interface BankSettings {
  id: string;
  bank_id: string;
  savings_rate: number;
  current_account_rate: number;
  fixed_deposit_rate_1yr: number;
  fixed_deposit_rate_3yr: number;
  fixed_deposit_rate_5yr: number;
  personal_loan_spread: number;
  business_loan_spread: number;
  mortgage_spread: number;
  vehicle_loan_spread: number;
  corporate_loan_spread: number;
  max_loan_to_value: number;
  min_credit_score: number;
  max_single_exposure: number;
  auto_approve_low_risk: boolean;
  ai_supervision_level: "minimal" | "moderate" | "strict";
  updated_at: string;
}

/** Available countries for bank creation */
export const COUNTRIES = [
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "JP", name: "Japan", currency: "JPY" },
  { code: "SG", name: "Singapore", currency: "SGD" },
  { code: "AE", name: "United Arab Emirates", currency: "AED" },
  { code: "CH", name: "Switzerland", currency: "CHF" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "PK", name: "Pakistan", currency: "PKR" },
] as const;

/** Bank type display info */
export const BANK_TYPES: Record<BankType, { label: string; description: string }> = {
  retail: {
    label: "Retail Commercial Bank",
    description: "Focus on individual customers, personal loans, mortgages, and savings accounts.",
  },
  corporate: {
    label: "Corporate Commercial Bank",
    description: "Focus on business clients, corporate lending, trade finance, and treasury services.",
  },
  universal: {
    label: "Universal Commercial Bank",
    description: "Full-service bank serving both retail and corporate clients with comprehensive products.",
  },
};

/** Difficulty display info */
export const DIFFICULTIES: Record<Difficulty, { label: string; description: string; startingCapital: number }> = {
  beginner: {
    label: "Beginner",
    description: "Slower economic changes, fewer crises, more forgiving ratios. Great for learning.",
    startingCapital: 50_000_000,
  },
  intermediate: {
    label: "Intermediate",
    description: "Realistic economic cycles, moderate crisis frequency, standard regulatory requirements.",
    startingCapital: 30_000_000,
  },
  advanced: {
    label: "Advanced",
    description: "Volatile markets, frequent crises, strict supervision. For experienced banking professionals.",
    startingCapital: 20_000_000,
  },
};

/** Initial strategy options */
export const STRATEGIES = [
  { value: "conservative", label: "Conservative Growth", description: "Low risk, steady returns, strong capital buffers." },
  { value: "balanced", label: "Balanced Approach", description: "Moderate risk and growth, diversified portfolio." },
  { value: "aggressive", label: "Aggressive Expansion", description: "High growth targets, higher risk appetite, rapid lending." },
  { value: "digital_first", label: "Digital-First", description: "Heavy AI/technology investment, lean operations, digital services." },
  { value: "relationship", label: "Relationship Banking", description: "Focus on customer relationships, premium service, human workforce." },
] as const;
