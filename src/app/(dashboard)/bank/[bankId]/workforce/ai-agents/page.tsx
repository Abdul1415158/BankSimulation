import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  Bot,
  Zap,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Cpu,
  Eye,
  Sliders,
  DollarSign,
} from "lucide-react";

export default async function AIAgentsPage({
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

  const { data: aiAgents } = await supabase
    .from("ai_agents")
    .select("*, departments(name)")
    .eq("bank_id", bankId)
    .order("agent_type", { ascending: true });

  const agents = aiAgents ?? [];
  const activeCount = agents.filter((a) => a.status === "active").length;
  const totalMonthlyCost = agents.reduce((sum, a) => sum + Number(a.monthly_operating_cost ?? 2000), 0);
  const avgSpeed = agents.length > 0
    ? (agents.reduce((sum, a) => sum + Number(a.processing_speed ?? 3.0), 0) / agents.length).toFixed(1)
    : "3.0";
  const avgCyberRisk = agents.length > 0
    ? agents.reduce((sum, a) => sum + Number(a.cybersecurity_risk ?? 0.03), 0) / agents.length
    : 0.03;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="xs" asChild className="p-0 text-muted-foreground hover:text-foreground">
              <Link href={`/bank/${bankId}/workforce`} className="flex items-center gap-1">
                <ArrowLeft className="size-3.5" /> Workforce
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AI Agent Management</h1>
          <p className="text-sm text-muted-foreground">
            Deploy autonomous agents, monitor hallucination/error rates, and manage model supervision.
          </p>
        </div>
      </div>

      {/* Highlights Rule */}
      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-start gap-3">
        <Bot className="size-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">BANKVERSE AI Economics:</strong> AI agents process transactions up to 5x faster at ~35% of human payroll cost. However, autonomous agents lack subjective credit discretion and increase systemic cybersecurity risk without human supervision.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active AI Agents</CardDescription>
            <CardTitle className="text-2xl font-bold">{activeCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <Cpu className="size-3.5 text-cyan-500" /> Automated workers
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Monthly AI Compute Cost</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {formatCurrency(totalMonthlyCost, bank.currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <DollarSign className="size-3.5 text-emerald-500" /> API & server licenses
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Average Speed Multiplier</CardDescription>
            <CardTitle className="text-2xl font-bold">{avgSpeed}x</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <Zap className="size-3.5 text-amber-500" /> Relative to human staff
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Systemic Cyber Risk</CardDescription>
            <CardTitle className="text-2xl font-bold">{formatPercent(avgCyberRisk)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldAlert className="size-3.5 text-rose-500" /> Vulnerability surface
          </CardContent>
        </Card>
      </div>

      {/* AI Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent) => {
          const speed = Number(agent.processing_speed ?? 3.0);
          const accuracy = Number(agent.accuracy_rate ?? 0.94);
          const cyberRisk = Number(agent.cybersecurity_risk ?? 0.03);
          const cost = Number(agent.monthly_operating_cost ?? 2000);

          return (
            <Card key={agent.id} className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                      <Bot className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{agent.agent_type}</CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {agent.departments?.name || "Operations"}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="uppercase text-[10px]">
                    {agent.model_tier ?? "Standard"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2 text-xs py-2 border-y border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Processing Speed</span>
                    <strong className="text-foreground">{speed.toFixed(1)}x Human</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Accuracy / Hallucination</span>
                    <strong className="text-foreground">{formatPercent(accuracy)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cyber Vulnerability</span>
                    <strong className="text-rose-500">{formatPercent(cyberRisk)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Monthly License</span>
                    <strong className="font-mono-numbers">{formatCurrency(cost, bank.currency)}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="size-3.5 text-blue-500" />
                    {agent.human_supervision_required ? "Human Supervised" : "Autonomous"}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {agent.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
