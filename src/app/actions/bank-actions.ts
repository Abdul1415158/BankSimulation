"use server";

import { createClient } from "@/lib/supabase/server";
import type { CreateBankFormData } from "@/types/bank";

// ---- Name pools for seeding initial data ----
const FIRST_NAMES = [
  "Sarah", "James", "Maria", "David", "Emily", "Michael", "Anna", "Robert",
  "Lisa", "Daniel", "Karen", "Thomas", "Jennifer", "William", "Patricia",
  "Ahmed", "Fatima", "Chen", "Yuki", "Raj", "Priya", "Carlos", "Sofia",
  "Oliver", "Emma", "Liam", "Ava", "Noah", "Isabella", "Lucas",
];
const LAST_NAMES = [
  "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson",
  "Taylor", "Thomas", "Moore", "Jackson", "Martin", "Lee", "Thompson",
  "White", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Hall",
];

const DEPARTMENTS = [
  { name: "Customer Service", code: "customer_service", budget: 150000 },
  { name: "Loan & Credit", code: "loans", budget: 200000 },
  { name: "Cash Operations", code: "cash_ops", budget: 120000 },
  { name: "Risk Management", code: "risk", budget: 180000 },
  { name: "Fraud Prevention", code: "fraud", budget: 160000 },
  { name: "Treasury", code: "treasury", budget: 250000 },
  { name: "Compliance", code: "compliance", budget: 140000 },
  { name: "Human Resources", code: "hr", budget: 100000 },
  { name: "Digital Banking", code: "digital", budget: 200000 },
  { name: "IT & Cybersecurity", code: "it_cyber", budget: 220000 },
];

const DEPT_ROLES: Record<string, string[]> = {
  customer_service: ["Customer Service Rep", "Account Manager", "Branch Teller"],
  loans: ["Loan Officer", "Credit Analyst", "Underwriter"],
  cash_ops: ["Cash Operations Specialist", "Vault Officer"],
  risk: ["Risk Analyst", "Portfolio Manager"],
  fraud: ["Fraud Analyst", "Investigation Specialist"],
  treasury: ["Treasury Analyst", "Funds Manager"],
  compliance: ["Compliance Officer", "Regulatory Analyst"],
  hr: ["HR Coordinator", "Recruiter"],
  digital: ["Digital Banking Specialist", "UX Analyst"],
  it_cyber: ["Systems Engineer", "Cybersecurity Analyst"],
};

const COMPETITOR_BANKS = [
  { name: "Atlas National Bank", type: "universal", strategy: "aggressive", aggressiveness: 65 },
  { name: "Meridian Financial Group", type: "corporate", strategy: "balanced", aggressiveness: 50 },
  { name: "Pacific Trust Bank", type: "retail", strategy: "conservative", aggressiveness: 35 },
];

const CUSTOMER_NAMES_INDIVIDUAL = [
  "Alex Morgan", "Sam Rivera", "Jordan Chen", "Taylor Brooks", "Casey Williams",
  "Drew Palmer", "Riley Cooper", "Quinn Foster", "Avery Mitchell", "Morgan Blake",
  "Jamie Lee", "Harper Scott", "Logan Cruz", "Dakota West", "Sage Anderson",
];
const CUSTOMER_NAMES_BUSINESS = [
  "GreenLeaf Solutions Ltd", "TechBridge Corp", "Summit Industries", "BlueWave Consulting",
  "Apex Traders Inc", "Vertex Manufacturing", "NovaStar Logistics", "PrimePath Holdings",
  "ClearView Analytics", "Ironclad Construction",
];

function randomName(): string {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function createBank(
  slotNumber: number,
  data: CreateBankFormData
): Promise<{ success: boolean; bankId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // 1. Verify slot is not occupied
    const { data: slot } = await supabase
      .from("bank_slots")
      .select("*")
      .eq("user_id", user.id)
      .eq("slot_number", slotNumber)
      .single();

    if (!slot) return { success: false, error: "Slot not found" };
    if (slot.is_occupied) return { success: false, error: "Slot is already occupied" };

    const randomSeed = Math.floor(Math.random() * 2147483647);

    // 2. Insert bank
    const { data: bank, error: bankErr } = await supabase
      .from("banks")
      .insert({
        user_id: user.id,
        slot_id: slot.id,
        name: data.name,
        country: data.country,
        city: data.city,
        currency: data.currency,
        bank_type: data.bank_type,
        difficulty: data.difficulty,
        simulation_duration_years: data.simulation_duration_years,
        initial_strategy: data.initial_strategy,
        starting_capital: data.starting_capital,
        random_seed: randomSeed,
        current_year: 1,
        current_quarter: 1,
        status: "active",
      })
      .select()
      .single();

    if (bankErr || !bank) return { success: false, error: bankErr?.message || "Failed to create bank" };

    // 3. Update slot
    await supabase
      .from("bank_slots")
      .update({ is_occupied: true, bank_id: bank.id, updated_at: new Date().toISOString() })
      .eq("id", slot.id);

    // 4. Insert bank settings
    await supabase.from("bank_settings").insert({ bank_id: bank.id });

    // 5. Insert simulation state
    const startingCap = data.starting_capital;
    const initialDeposits = startingCap * 4; // Banks typically have 4x deposits to equity
    const initialLoans = initialDeposits * 0.6;
    const initialCash = startingCap * 0.3;
    const initialInvestments = startingCap * 0.5;
    const totalAssets = initialCash + initialLoans + initialInvestments + startingCap * 0.2;
    const totalLiabilities = initialDeposits;
    const totalEquity = totalAssets - totalLiabilities;

    await supabase.from("simulation_states").insert({
      bank_id: bank.id,
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      total_equity: totalEquity,
      cash_reserves: initialCash,
      total_deposits: initialDeposits,
      total_loans_outstanding: initialLoans,
      total_investments: initialInvestments,
      liquidity_ratio: initialCash / initialDeposits,
      capital_adequacy_ratio: totalEquity / (initialLoans * 0.75 + initialInvestments * 0.2),
      net_interest_margin: 0.035,
      customer_satisfaction: 55,
      reputation_score: 50,
      overall_score: 50,
    });

    // 6. Insert departments
    const deptInserts = DEPARTMENTS.map((d) => ({
      bank_id: bank.id,
      name: d.name,
      code: d.code,
      monthly_budget: d.budget,
      productivity: 50 + randomBetween(-5, 10),
      performance_score: 50,
    }));
    const { data: departments } = await supabase
      .from("departments")
      .insert(deptInserts)
      .select();

    if (!departments) return { success: false, error: "Failed to create departments" };

    // 7. Insert initial employees
    const employeeCount = data.bank_type === "universal" ? 15 : data.bank_type === "retail" ? 12 : 10;
    const deptMap = new Map(departments.map((d: { id: string; code: string }) => [d.code, d.id]));
    const empInserts = [];

    let empIdx = 0;
    for (const dept of DEPARTMENTS) {
      const deptId = deptMap.get(dept.code);
      if (!deptId) continue;
      const roles = DEPT_ROLES[dept.code] || ["Specialist"];
      const count = dept.code === "loans" || dept.code === "customer_service" ? 2 : 1;
      for (let i = 0; i < count && empIdx < employeeCount; i++, empIdx++) {
        const role = roles[i % roles.length];
        empInserts.push({
          bank_id: bank.id,
          department_id: deptId,
          employee_code: `EMP-${String(empIdx + 1).padStart(3, "0")}`,
          full_name: randomName(),
          job_role: role,
          salary: randomBetween(45000, 95000),
          experience_years: randomBetween(1, 12),
          skill_level: randomBetween(40, 75),
          productivity: randomBetween(45, 70),
          accuracy: randomBetween(82, 96),
          customer_rating: randomBetween(45, 75),
          training_level: randomBetween(0, 3),
          hire_quarter: "Y1Q1",
          resignation_probability: parseFloat((Math.random() * 0.08 + 0.02).toFixed(4)),
        });
      }
    }
    await supabase.from("employees").insert(empInserts);

    // 8. Update department employee counts
    for (const dept of departments) {
      const count = empInserts.filter((e) => e.department_id === dept.id).length;
      if (count > 0) {
        await supabase.from("departments").update({ employee_count: count }).eq("id", dept.id);
      }
    }

    // 9. Insert competitors
    const compInserts = COMPETITOR_BANKS.map((c) => ({
      bank_id: bank.id,
      competitor_name: c.name,
      competitor_type: c.type,
      market_share: randomBetween(20, 30),
      deposit_rate: parseFloat((Math.random() * 1.5 + 2).toFixed(3)),
      loan_rate: parseFloat((Math.random() * 2 + 5).toFixed(3)),
      customer_satisfaction: randomBetween(45, 65),
      profitability: randomBetween(40, 60),
      aggressiveness: c.aggressiveness,
      strategy: c.strategy,
    }));
    await supabase.from("competitor_banks").insert(compInserts);

    // 10. Insert initial economic conditions
    const difficultyMultiplier = data.difficulty === "beginner" ? 0.8 : data.difficulty === "advanced" ? 1.2 : 1;
    await supabase.from("economic_conditions").insert({
      bank_id: bank.id,
      year: 1,
      quarter: 1,
      gdp_growth: 2.5 * difficultyMultiplier,
      inflation_rate: 2.0,
      central_bank_rate: 3.0,
      unemployment_rate: 5.0,
      market_interest_rate: 4.0,
      consumer_confidence: 55,
      housing_index: 100,
      recession_flag: false,
    });

    // 11. Insert initial customers
    const custCount = data.bank_type === "retail" ? 30 : data.bank_type === "corporate" ? 15 : 25;
    const custInserts = [];
    for (let i = 0; i < custCount; i++) {
      const isBusinessSlot = i >= custCount * 0.6;
      const isCorporate = i >= custCount * 0.85;
      let custType: string;
      let custName: string;
      let income: number;

      if (isCorporate) {
        custType = "corporate";
        custName = CUSTOMER_NAMES_BUSINESS[i % CUSTOMER_NAMES_BUSINESS.length] + " Corp";
        income = randomBetween(5000000, 50000000);
      } else if (isBusinessSlot) {
        custType = Math.random() > 0.5 ? "small_business" : "medium_business";
        custName = CUSTOMER_NAMES_BUSINESS[i % CUSTOMER_NAMES_BUSINESS.length];
        income = randomBetween(500000, 5000000);
      } else {
        custType = "individual";
        custName = CUSTOMER_NAMES_INDIVIDUAL[i % CUSTOMER_NAMES_INDIVIDUAL.length];
        income = randomBetween(30000, 150000);
      }

      const creditScore = randomBetween(580, 820);
      const riskCat =
        creditScore >= 750 ? "low" : creditScore >= 650 ? "medium" : creditScore >= 550 ? "high" : "very_high";

      custInserts.push({
        bank_id: bank.id,
        customer_type: custType,
        name: custName,
        credit_score: creditScore,
        risk_category: riskCat,
        annual_income: income,
        existing_debt: income * (Math.random() * 0.3),
        satisfaction_score: randomBetween(40, 70),
        joined_quarter: "Y1Q1",
      });
    }
    await supabase.from("customers").insert(custInserts);

    // 12. Update simulation state counts
    await supabase.from("simulation_states").update({
      total_employees: empInserts.length,
      total_customers: custInserts.length,
    }).eq("bank_id", bank.id);

    return { success: true, bankId: bank.id };
  } catch (err) {
    console.error("createBank error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteBank(
  bankId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Verify ownership
    const { data: bank } = await supabase
      .from("banks")
      .select("id, slot_id")
      .eq("id", bankId)
      .eq("user_id", user.id)
      .single();

    if (!bank) return { success: false, error: "Bank not found or not owned by you" };

    // Update slot first
    await supabase
      .from("bank_slots")
      .update({ is_occupied: false, bank_id: null, updated_at: new Date().toISOString() })
      .eq("id", bank.slot_id);

    // Delete bank (cascades to all child tables)
    const { error: delErr } = await supabase.from("banks").delete().eq("id", bankId);
    if (delErr) return { success: false, error: delErr.message };

    return { success: true };
  } catch (err) {
    console.error("deleteBank error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
