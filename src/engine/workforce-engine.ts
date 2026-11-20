/**
 * BANKVERSE Workforce Engine
 *
 * Implements the core Human vs AI workforce decision system,
 * productivity modeling, attrition, training, and operational risk.
 */

import { clamp } from "./financial-calculator";
import { Mulberry32 } from "./prng";

export interface Employee {
  id: string;
  name: string;
  department_id: string;
  role: string;
  salary: number;
  experience_years: number;
  skill_level: number; // 1-100
  productivity: number; // 0.5 - 2.0
  accuracy: number; // 0.7 - 0.99
  customer_service_rating: number; // 1-5
  training_level: number; // 1-5
  morale: number; // 1-100
  status: "active" | "resigned" | "terminated";
}

export interface AIAgent {
  id: string;
  department_id: string;
  agent_type: string;
  model_tier: "standard" | "advanced" | "enterprise";
  monthly_cost: number;
  processing_speed: number; // Multiplier vs human (e.g., 2.5x - 8.0x)
  accuracy_rate: number; // 0.85 - 0.98 (Not always 100%!)
  cybersecurity_risk: number; // 0.01 - 0.15
  human_supervision_required: boolean;
  supervising_employee_id?: string | null;
  status: "active" | "offline" | "deprecated";
}

export interface DepartmentMetrics {
  departmentId: string;
  name: string;
  humanCount: number;
  aiCount: number;
  humanSalaryCost: number;
  aiOperatingCost: number;
  totalCost: number;
  blendedProductivity: number;
  blendedAccuracy: number;
  operationalRisk: number;
  customerSatisfactionImpact: number;
}

export interface VacancyEvent {
  id: string;
  role: string;
  departmentId: string;
  departmentName: string;
  reason: string;
  humanCandidate: {
    salary: number;
    recruitmentFee: number;
    trainingCost: number;
    initialProductivity: number;
    accuracy: number;
    customerRating: number;
  };
  aiCandidate: {
    agentType: string;
    setupCost: number;
    monthlyCost: number;
    processingSpeed: number;
    accuracy: number;
    cyberRisk: number;
    requiresSupervision: boolean;
  };
}

/**
 * Calculate workforce metrics for a single department
 */
export function calculateDepartmentWorkforce(
  departmentId: string,
  departmentName: string,
  employees: Employee[],
  aiAgents: AIAgent[]
): DepartmentMetrics {
  const activeHumans = employees.filter((e) => e.status === "active");
  const activeAI = aiAgents.filter((a) => a.status === "active");

  const humanSalaryCost = activeHumans.reduce((acc, e) => acc + e.salary, 0);
  const aiOperatingCost = activeAI.reduce((acc, a) => acc + a.monthly_cost * 3, 0); // quarterly

  // Baseline productivity
  const humanProd = activeHumans.length > 0
    ? activeHumans.reduce((acc, e) => acc + e.productivity * (e.morale / 100), 0) / activeHumans.length
    : 0;

  const aiProd = activeAI.length > 0
    ? activeAI.reduce((acc, a) => acc + a.processing_speed, 0) / activeAI.length
    : 0;

  // Hybrid synergy: AI handles volume, humans handle exceptions
  let synergy = 1.0;
  if (activeHumans.length > 0 && activeAI.length > 0) {
    const ratio = activeAI.length / activeHumans.length;
    // Ideal ratio: 1 human to 2-3 AI agents
    if (ratio >= 1 && ratio <= 3) {
      synergy = 1.15; // 15% synergy boost
    } else if (ratio > 5) {
      synergy = 0.85; // Too many AI agents without enough human supervisors causes drift
    }
  }

  const blendedProductivity = activeHumans.length === 0 && activeAI.length === 0
    ? 0.1
    : ((humanProd * 1.0 + aiProd * 1.5) / Math.max(1, activeHumans.length + activeAI.length)) * synergy;

  // Accuracy
  const humanAcc = activeHumans.length > 0
    ? activeHumans.reduce((acc, e) => acc + e.accuracy, 0) / activeHumans.length
    : 0.80;

  const aiAcc = activeAI.length > 0
    ? activeAI.reduce((acc, a) => acc + a.accuracy_rate, 0) / activeAI.length
    : 0.90;

  const blendedAccuracy = activeHumans.length === 0 && activeAI.length === 0
    ? 0.50
    : (humanAcc * 0.45 + aiAcc * 0.55);

  // Operational Risk
  // AI increases cybersecurity risk; human understaffing increases compliance/burnout risk
  let risk = 0.05;
  if (activeAI.length > 0) {
    const avgCyberRisk = activeAI.reduce((acc, a) => acc + a.cybersecurity_risk, 0) / activeAI.length;
    risk += avgCyberRisk * 0.5;
  }
  if (activeHumans.length === 0 && activeAI.length > 0) {
    risk += 0.20; // Autonomous unchecked AI penalty
  }

  // Customer satisfaction impact
  // Customers prefer human empathy for disputes, but appreciate AI speed for simple tasks
  let csImpact = 0;
  if (activeHumans.length > 0) {
    const avgRating = activeHumans.reduce((acc, e) => acc + e.customer_service_rating, 0) / activeHumans.length;
    csImpact += (avgRating - 3.0) * 10;
  }
  if (activeAI.length > 0 && activeHumans.length === 0) {
    csImpact -= 15; // Frustrated customers with bot-only support
  }

  return {
    departmentId,
    name: departmentName,
    humanCount: activeHumans.length,
    aiCount: activeAI.length,
    humanSalaryCost,
    aiOperatingCost,
    totalCost: humanSalaryCost + aiOperatingCost,
    blendedProductivity: clamp(blendedProductivity, 0.1, 3.0),
    blendedAccuracy: clamp(blendedAccuracy, 0.4, 0.99),
    operationalRisk: clamp(risk, 0.01, 0.50),
    customerSatisfactionImpact: csImpact,
  };
}

/**
 * Determine quarterly employee resignations and generate vacancy choices
 */
export function checkQuarterlyTurnover(
  employees: Employee[],
  salaryBenchmarkRatio: number, // 1.0 = competitive, <1.0 = underpaid
  prng: Mulberry32
): { resignedEmployees: Employee[]; vacancies: VacancyEvent[] } {
  const resignedEmployees: Employee[] = [];
  const vacancies: VacancyEvent[] = [];

  for (const emp of employees) {
    if (emp.status !== "active") continue;

    // Resignation probability based on salary vs market and morale
    let turnoverChance = 0.03; // Base 3% quarterly turnover
    if (salaryBenchmarkRatio < 0.9) turnoverChance += 0.08;
    if (salaryBenchmarkRatio < 0.8) turnoverChance += 0.15;
    if (emp.morale < 40) turnoverChance += 0.10;
    if (emp.morale < 20) turnoverChance += 0.25;

    if (prng.chance(turnoverChance)) {
      emp.status = "resigned";
      resignedEmployees.push(emp);

      // Create a vacancy decision event
      vacancies.push({
        id: `vac-${emp.id}-${Date.now()}`,
        role: emp.role,
        departmentId: emp.department_id,
        departmentName: emp.role.includes("Officer") ? "Loan and Credit" : "Customer Service",
        reason: `${emp.name} has resigned due to ${turnoverChance > 0.15 ? "compensation and workload concerns" : "an opportunity at another institution"}.`,
        humanCandidate: {
          salary: Math.round(emp.salary * 1.05),
          recruitmentFee: Math.round(emp.salary * 0.25),
          trainingCost: 5000,
          initialProductivity: 0.85,
          accuracy: 0.92,
          customerRating: 4.2,
        },
        aiCandidate: {
          agentType: `AI ${emp.role.replace("Senior ", "")} Agent`,
          setupCost: 15000,
          monthlyCost: Math.round((emp.salary / 3) * 0.35), // ~35% of human monthly cost
          processingSpeed: 3.5,
          accuracy: 0.94,
          cyberRisk: 0.04,
          requiresSupervision: true,
        },
      });
    }
  }

  return { resignedEmployees, vacancies };
}
