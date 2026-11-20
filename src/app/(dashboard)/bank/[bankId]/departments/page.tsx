import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  Building2,
  Users,
  Bot,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Cpu,
} from "lucide-react";

const DEPARTMENT_METADATA: Record<string, { desc: string; iconBg: string }> = {
  "Customer Service": { desc: "Frontline customer support, inquiries, and dispute resolution.", iconBg: "bg-blue-500/10 text-blue-500" },
  "Loan and Credit": { desc: "Credit evaluation, loan underwriting, and mortgage processing.", iconBg: "bg-emerald-500/10 text-emerald-500" },
  "Cash Operations": { desc: "Vault management, ATM networks, and teller operations.", iconBg: "bg-amber-500/10 text-amber-500" },
  "Risk Management": { desc: "Capital adequacy monitoring, stress tests, and credit risk modeling.", iconBg: "bg-purple-500/10 text-purple-500" },
  "Fraud Prevention": { desc: "Transaction anomaly detection, AML compliance, and anti-theft.", iconBg: "bg-red-500/10 text-red-500" },
  "Treasury": { desc: "Liquidity ratios, interbank lending, and sovereign bond management.", iconBg: "bg-cyan-500/10 text-cyan-500" },
  "Compliance": { desc: "Regulatory reporting, Central Bank audits, and legal compliance.", iconBg: "bg-indigo-500/10 text-indigo-500" },
  "Human Resources": { desc: "Recruitment, talent retention, employee training, and compensation.", iconBg: "bg-pink-500/10 text-pink-500" },
  "Digital Banking": { desc: "Mobile banking app, web portal, API integrations, and uptime.", iconBg: "bg-sky-500/10 text-sky-500" },
  "IT and Cybersecurity": { desc: "Server infrastructure, database resilience, and cyber defenses.", iconBg: "bg-slate-500/10 text-slate-500" },
};

export default async function DepartmentsPage({
  params,
}: {
  params: Promise<{ bankId: string }>;
}) {
  const { bankId } = await params;
  const supabase = await createClient();

  const { data: bank } = await supabase
    .from("banks")
    .select("currency")
    .eq("id", bankId)
    .single();

  if (!bank) notFound();

  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .eq("bank_id", bankId)
    .order("name", { ascending: true });

  const { data: employees } = await supabase
    .from("employees")
    .select("department_id, status")
    .eq("bank_id", bankId);

  const { data: aiAgents } = await supabase
    .from("ai_agents")
    .select("department_id, status")
    .eq("bank_id", bankId);

  // Group workforce counts
  const depts = (departments ?? []).map((d) => {
    const dHumans = (employees ?? []).filter((e) => e.department_id === d.id && e.status === "active").length;
    const dAi = (aiAgents ?? []).filter((a) => a.department_id === d.id && a.status === "active").length;
    return {
      ...d,
      humanCount: dHumans,
      aiCount: dAi,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Banking Departments</h1>
          <p className="text-sm text-muted-foreground">
            Manage operations, staff allocation, and AI automation across all 10 functional divisions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            {depts.length} Active Departments
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {depts.map((d) => {
          const meta = DEPARTMENT_METADATA[d.name] || {
            desc: "Operational banking division.",
            iconBg: "bg-blue-500/10 text-blue-500",
          };

          const performanceScore = Number(d.performance_score ?? 85);
          const errorRate = Number(d.error_rate ?? 0.02);
          const quarterlyBudget = Number(d.monthly_budget ?? 45000) * 3;

          return (
            <Card key={d.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-lg flex items-center justify-center ${meta.iconBg}`}>
                      <Building2 className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">{d.name}</CardTitle>
                      <span className="text-xs text-muted-foreground">Manager: {d.manager_name || "Assigned"}</span>
                    </div>
                  </div>
                  <Badge variant={performanceScore >= 80 ? "default" : "secondary"}>
                    {performanceScore}% Score
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-2 line-clamp-2">
                  {meta.desc}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-3.5 text-blue-500" />
                    <span>Staff: <strong className="text-foreground">{d.humanCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Bot className="size-3.5 text-cyan-500" />
                    <span>AI Agents: <strong className="text-foreground">{d.aiCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="size-3.5 text-emerald-500" />
                    <span>Budget: <strong className="text-foreground">{formatCurrency(quarterlyBudget, bank.currency)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <AlertTriangle className="size-3.5 text-amber-500" />
                    <span>Error Rate: <strong className="text-foreground">{formatPercent(errorRate)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Workload Capacity</span>
                  <span className="font-medium text-foreground">{(d.humanCount * 1.0 + d.aiCount * 2.5).toFixed(1)}x Baseline</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
