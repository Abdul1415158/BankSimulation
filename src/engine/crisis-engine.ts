/**
 * BANKVERSE Crisis & Economic Event Engine
 *
 * Implements macroeconomic shocks, cybersecurity breaches, liquidity stress,
 * and user response decision pathways.
 */

import { Mulberry32 } from "./prng";

export interface CrisisEvent {
  id: string;
  type: "liquidity_run" | "credit_crunch" | "cyberattack" | "regulatory_audit" | "inflation_shock" | "tech_failure";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  quarterTriggered: number;
  durationQuarters: number;
  financialImpact: {
    depositWithdrawalPct?: number; // e.g. 0.15 (15% deposit run)
    defaultRateMultiplier?: number; // e.g. 2.5x defaults
    immediateCashPenalty?: number; // e.g. regulatory fine or ransom
    reputationPenalty?: number; // -10 to -30
  };
  options: {
    id: string;
    label: string;
    description: string;
    cost: number;
    mitigationPct: number; // e.g. 0.60 mitigates 60% of damage
    reputationDelta: number;
  }[];
  resolved: boolean;
  chosenOptionId?: string;
}

export const CRISIS_TEMPLATES: Omit<CrisisEvent, "id" | "quarterTriggered" | "resolved">[] = [
  {
    type: "liquidity_run",
    severity: "critical",
    title: "Regional Panic Sparks Deposit Outflows",
    description: "Rumors about regional banking instability have caused retail and corporate clients to withdraw funds at an elevated pace. Your treasury team reports substantial daily liquidity drain.",
    durationQuarters: 2,
    financialImpact: {
      depositWithdrawalPct: 0.18,
      reputationPenalty: -15,
    },
    options: [
      {
        id: "opt_cb_discount",
        label: "Borrow from Central Bank Discount Window",
        description: "Access emergency emergency funding at penalty rate. Restores liquidity immediately but signals distress to markets.",
        cost: 250000,
        mitigationPct: 0.75,
        reputationDelta: -5,
      },
      {
        id: "opt_liquidate_bonds",
        label: "Liquidate Long-Term Government Bonds",
        description: "Sell held-to-maturity bonds at current market discount to raise instant cash reserves.",
        cost: 500000,
        mitigationPct: 0.85,
        reputationDelta: 0,
      },
      {
        id: "opt_raise_deposit_rates",
        label: "Raise Premium Deposit Rates Aggressively (+1.5%)",
        description: "Incentivize depositors to keep balances by paying above-market interest yield.",
        cost: 400000,
        mitigationPct: 0.50,
        reputationDelta: 5,
      },
    ],
  },
  {
    type: "cyberattack",
    severity: "high",
    title: "Coordinated Ransomware & Data Breach Attack",
    description: "Adversaries breached an automated customer-facing AI endpoint, disrupting online banking and exposing customer account records.",
    durationQuarters: 1,
    financialImpact: {
      immediateCashPenalty: 1200000,
      reputationPenalty: -25,
    },
    options: [
      {
        id: "opt_full_incident_response",
        label: "Deploy Elite Forensics & Upgrade Zero-Trust Infrastructure",
        description: "Engage tier-1 cybersecurity contractors, patch neural pipelines, and provide free credit monitoring.",
        cost: 1500000,
        mitigationPct: 0.90,
        reputationDelta: 10,
      },
      {
        id: "opt_internal_containment",
        label: "Internal IT Patching & Quiet Remediation",
        description: "Isolate affected servers and handle data restoration internally to minimize public headlines.",
        cost: 300000,
        mitigationPct: 0.40,
        reputationDelta: -10,
      },
    ],
  },
  {
    type: "regulatory_audit",
    severity: "medium",
    title: "Comprehensive Central Bank Compliance Audit",
    description: "Regulators are inspecting your risk-weighted asset classifications, AI underwriting fairness, and anti-money laundering controls.",
    durationQuarters: 1,
    financialImpact: {
      immediateCashPenalty: 400000,
      reputationPenalty: -8,
    },
    options: [
      {
        id: "opt_hire_consultants",
        label: "Engage Big-4 Compliance Advisory",
        description: "Audit all algorithmic underwriting models and file comprehensive remediation filings.",
        cost: 600000,
        mitigationPct: 0.95,
        reputationDelta: 5,
      },
      {
        id: "opt_self_remediate",
        label: "Direct In-House Compliance Team to Remediate",
        description: "Reassign internal legal and compliance staff to resolve outstanding regulatory findings.",
        cost: 150000,
        mitigationPct: 0.60,
        reputationDelta: 0,
      },
    ],
  },
];

/**
 * Check if a random crisis triggers during quarterly simulation
 */
export function checkQuarterlyCrisis(
  currentQuarter: number,
  activeCrises: CrisisEvent[],
  capitalAdequacyRatio: number,
  operationalRisk: number,
  prng: Mulberry32
): CrisisEvent | null {
  // If a crisis is already active, lower the chance of concurrent crisis
  if (activeCrises.some((c) => !c.resolved)) return null;

  // Base 12% chance per quarter
  let triggerChance = 0.12;

  // Capital distress increases crisis probability
  if (capitalAdequacyRatio < 0.105) triggerChance += 0.20;
  // High operational risk triggers cyber/audit crises
  if (operationalRisk > 0.25) triggerChance += 0.15;

  if (prng.chance(triggerChance)) {
    const template = prng.pick(CRISIS_TEMPLATES);
    return {
      ...template,
      id: `crisis-${currentQuarter}-${Date.now()}`,
      quarterTriggered: currentQuarter,
      resolved: false,
    };
  }

  return null;
}
