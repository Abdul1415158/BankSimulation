"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import {
  Bot,
  Zap,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Cpu,
  Trash2,
  Plus,
} from "lucide-react";
import { getBank, getAiAgents, deployAiAgent, decommissionAiAgent, AiAgent } from "@/lib/storage";
import type { Bank } from "@/types/bank";

export default function AIAgentsPage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [agents, setAgents] = useState<AiAgent[]>([]);

  function reload() {
    if (!bankId) return;
    setBank(getBank(bankId));
    setAgents(getAiAgents(bankId));
  }

  useEffect(() => {
    reload();
  }, [bankId]);

  if (!bank) return <div className="p-6">Loading AI agents...</div>;

  const currency = bank.currency || "USD";
  const activeCount = agents.filter((a) => a.status === "Active").length;
  const totalMonthlyCost = agents.reduce((sum, a) => sum + a.monthly_cost, 0);

  function handleDeploy() {
    const prototypes = [
      { name: `FraudScan-AI-${Date.now().toString().slice(-3)}`, type: "AI Fraud Detection Agent", cost: 3500, dept: "Fraud Prevention", speed: "15x Human", acc: 93, risk: 2.2 },
      { name: `ComplianceBot-v${Date.now().toString().slice(-2)}`, type: "AI Compliance Assistant", cost: 4000, dept: "Compliance", speed: "10x Human", acc: 96, risk: 1.8 },
      { name: `DocVerify-Fast`, type: "AI Document Verification Agent", cost: 2800, dept: "Loan and Credit Department", speed: "20x Human", acc: 90, risk: 3.1 },
    ];
    const p = prototypes[Math.floor(Math.random() * prototypes.length)];
    deployAiAgent(bankId, {
      name: p.name,
      agent_type: p.type,
      department_id: "dept-1",
      department_name: p.dept,
      monthly_cost: p.cost,
      processing_speed: p.speed,
      accuracy: p.acc,
      error_probability: 2.5,
      cybersecurity_risk: p.risk,
      human_supervision_needed: "Medium",
      status: "Active",
    });
    reload();
  }

  function handleDecommission(id: string) {
    decommissionAiAgent(bankId, id);
    reload();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" asChild className="p-0 text-muted-foreground hover:text-foreground">
              <Link href={`/bank/${bankId}/workforce`} className="flex items-center gap-1">
                <ArrowLeft className="size-3.5" /> Workforce
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AI Agents Management</h1>
          <p className="text-sm text-muted-foreground">
            Configure automated banking agents, monitor hallucination/error rates, and manage operational risk.
          </p>
        </div>
        <Button onClick={handleDeploy} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
          <Plus className="size-4 mr-1.5" />
          Deploy New AI Agent
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Active AI Fleet</p>
              <p className="text-2xl font-bold font-mono-numbers">{activeCount}</p>
            </div>
            <Bot className="size-5 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Monthly Operating Cost</p>
              <p className="text-2xl font-bold font-mono-numbers">{formatCurrency(totalMonthlyCost, currency)}</p>
            </div>
            <Cpu className="size-5 text-cyan-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Average Processing Speed</p>
              <p className="text-2xl font-bold font-mono-numbers text-emerald-600">10x Human</p>
            </div>
            <Zap className="size-5 text-amber-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Fleet Cyber Risk</p>
              <p className="text-2xl font-bold font-mono-numbers text-amber-600">2.4%</p>
            </div>
            <ShieldAlert className="size-5 text-rose-500" />
          </CardContent>
        </Card>
      </div>

      {/* AI Agents Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                  {agent.agent_type}
                </Badge>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs">
                  {agent.status}
                </Badge>
              </div>
              <CardTitle className="text-base font-bold">{agent.name}</CardTitle>
              <CardDescription className="text-xs">{agent.department_name}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-2.5 text-xs pt-0">
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Processing Speed</span>
                <span className="font-semibold text-emerald-600">{agent.processing_speed}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-semibold">{agent.accuracy}%</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Monthly Subscription</span>
                <span className="font-mono-numbers font-medium">{formatCurrency(agent.monthly_cost, currency)}/mo</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Supervision Needed</span>
                <span className="font-medium text-amber-600">{agent.human_supervision_needed}</span>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDecommission(agent.id)}
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 h-8 text-xs"
                >
                  <Trash2 className="size-3.5 mr-1" /> Decommission Agent
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
