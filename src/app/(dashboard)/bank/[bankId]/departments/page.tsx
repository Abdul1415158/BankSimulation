"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  Building2,
  Users,
  Bot,
  TrendingUp,
  Cpu,
} from "lucide-react";
import { getBank, getDepartments, Department } from "@/lib/storage";
import type { Bank } from "@/types/bank";

const DEPARTMENT_METADATA: Record<string, { desc: string; iconBg: string }> = {
  "Customer Service": { desc: "Frontline customer support, inquiries, and dispute resolution.", iconBg: "bg-blue-500/10 text-blue-500" },
  "Loan and Credit Department": { desc: "Credit evaluation, loan underwriting, and mortgage processing.", iconBg: "bg-emerald-500/10 text-emerald-500" },
  "Cash Operations": { desc: "Vault management, ATM networks, and teller operations.", iconBg: "bg-amber-500/10 text-amber-500" },
  "Risk Management": { desc: "Capital adequacy monitoring, stress tests, and credit risk modeling.", iconBg: "bg-purple-500/10 text-purple-500" },
  "Fraud Prevention": { desc: "Transaction anomaly detection, AML compliance, and anti-theft.", iconBg: "bg-red-500/10 text-red-500" },
  "Treasury": { desc: "Liquidity ratios, interbank lending, and sovereign bond management.", iconBg: "bg-cyan-500/10 text-cyan-500" },
  "Compliance": { desc: "Regulatory reporting, Central Bank audits, and legal compliance.", iconBg: "bg-indigo-500/10 text-indigo-500" },
  "Human Resources": { desc: "Recruitment, talent retention, employee training, and compensation.", iconBg: "bg-pink-500/10 text-pink-500" },
  "Digital Banking": { desc: "Mobile banking app, web portal, API integrations, and uptime.", iconBg: "bg-sky-500/10 text-sky-500" },
  "IT and Cybersecurity": { desc: "Server infrastructure, database resilience, and cyber defenses.", iconBg: "bg-slate-500/10 text-slate-500" },
};

export default function DepartmentsPage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (!bankId) return;
    setBank(getBank(bankId));
    setDepartments(getDepartments(bankId));
  }, [bankId]);

  if (!bank) return <div className="p-6">Loading departments...</div>;

  const currency = bank.currency || "USD";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Banking Departments</h1>
        <p className="text-muted-foreground text-sm">
          Operational structure, headcount, productivity, and budgets across all 10 banking divisions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const meta = DEPARTMENT_METADATA[dept.name] || {
            desc: "Operational banking unit.",
            iconBg: "bg-blue-500/10 text-blue-500",
          };

          return (
            <Card key={dept.id} className="relative overflow-hidden flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className={`size-10 rounded-lg flex items-center justify-center ${meta.iconBg}`}>
                    <Building2 className="size-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Score: <span className="font-semibold text-emerald-600 ml-1">{dept.performance_score}/100</span>
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold">{dept.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{meta.desc}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-xs pt-0">
                <div className="flex items-center justify-between text-muted-foreground py-1 border-b border-border/50">
                  <span>Manager</span>
                  <span className="font-medium text-foreground">{dept.manager_name}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground py-1 border-b border-border/50">
                  <span className="flex items-center gap-1.5"><Users className="size-3.5" /> Human Staff</span>
                  <span className="font-semibold text-foreground">{dept.employee_count}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground py-1 border-b border-border/50">
                  <span className="flex items-center gap-1.5"><Bot className="size-3.5" /> AI Agents</span>
                  <span className="font-semibold text-blue-600">{dept.ai_agent_count}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground py-1 border-b border-border/50">
                  <span>Monthly Budget</span>
                  <span className="font-mono-numbers font-medium text-foreground">{formatCurrency(dept.budget_monthly, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground py-1">
                  <span>Productivity / Error</span>
                  <span className="font-medium text-emerald-600">{dept.productivity}% / {dept.error_rate}%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
