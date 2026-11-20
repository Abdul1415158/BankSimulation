"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, Bot, AlertTriangle, Shield, DollarSign, TrendingUp } from "lucide-react";

const chartData = [
  { quarter: "Y1Q1", assets: 50, profit: 2, deposits: 30 },
  { quarter: "Y1Q2", assets: 55, profit: 3, deposits: 35 },
  { quarter: "Y1Q3", assets: 52, profit: 1, deposits: 33 },
  { quarter: "Y1Q4", assets: 60, profit: 4, deposits: 40 },
  { quarter: "Y2Q1", assets: 65, profit: 5, deposits: 45 },
  { quarter: "Y2Q2", assets: 72, profit: 7, deposits: 52 },
  { quarter: "Y2Q3", assets: 68, profit: 4, deposits: 48 },
  { quarter: "Y2Q4", assets: 80, profit: 9, deposits: 58 },
];

function DashboardTab() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Assets", value: "$80M", change: "+12.4%", positive: true },
          { label: "Net Profit", value: "$9M", change: "+28.6%", positive: true },
          { label: "NPL Ratio", value: "2.1%", change: "-0.3%", positive: true },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-lg font-semibold font-mono-numbers">{kpi.value}</p>
            <p className={`text-xs font-medium ${kpi.positive ? "text-emerald-600" : "text-red-500"}`}>
              {kpi.change}
            </p>
          </div>
        ))}
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="quarter" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip />
            <Area type="monotone" dataKey="assets" stroke="#3b82f6" fill="url(#colorAssets)" strokeWidth={2} />
            <Area type="monotone" dataKey="deposits" stroke="#22d3ee" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function WorkforceTab() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h4 className="text-sm font-medium text-muted-foreground mb-4">
        Vacancy: Loan Officer resigned — Choose replacement
      </h4>
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Human option */}
        <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Human Employee</p>
              <p className="text-xs text-muted-foreground">Loan Officer</p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Salary</span><span className="font-medium">$72,000/yr</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Accuracy</span><span className="font-medium text-emerald-600">94%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Judgment</span><span className="font-medium text-emerald-600">High</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Speed</span><span className="font-medium text-amber-600">1x</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Customer Quality</span><span className="font-medium text-emerald-600">Excellent</span></div>
          </div>
        </div>
        {/* AI option */}
        <div className="border border-cyan-200 bg-cyan-50/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-cyan-100 flex items-center justify-center">
              <Bot className="size-4 text-cyan-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">AI Agent</p>
              <p className="text-xs text-muted-foreground">Loan Assessment</p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Cost</span><span className="font-medium">$32,000/yr</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Accuracy</span><span className="font-medium text-amber-600">88%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Judgment</span><span className="font-medium text-red-500">Low</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Speed</span><span className="font-medium text-emerald-600">8x</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Cyber Risk</span><span className="font-medium text-red-500">+3%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CrisisTab() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="size-5 text-red-600" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">Cyberattack Detected</h4>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
              Critical
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your online banking system has been breached. Customer data may be
            compromised. The IT department reports unauthorized access to
            account records.
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Response Options:</p>
        <div className="space-y-2">
          <div className="border border-border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Shield className="size-3.5 text-emerald-600" />
                <span className="text-sm font-medium">Full Incident Response</span>
              </div>
              <span className="text-xs text-red-500 font-mono-numbers">-$500K</span>
            </div>
            <p className="text-xs text-muted-foreground">Hire cybersecurity firm, notify all customers, offer credit monitoring. High cost but protects reputation.</p>
          </div>
          <div className="border border-border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <DollarSign className="size-3.5 text-amber-600" />
                <span className="text-sm font-medium">Minimal Response</span>
              </div>
              <span className="text-xs text-amber-500 font-mono-numbers">-$50K</span>
            </div>
            <p className="text-xs text-muted-foreground">Patch the vulnerability quietly. Low cost but high risk of discovery and reputational damage.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SimulationPreview() {
  return (
    <section id="simulator" className="py-24 px-4 bg-muted/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-blue-500 mb-2 tracking-wide uppercase">
            Preview
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            A Glimpse Inside Your Bank
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            See how BANKVERSE brings banking management to life with
            interactive dashboards, workforce decisions, and crisis events.
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5">
              <TrendingUp className="size-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="workforce" className="flex items-center gap-1.5">
              <Users className="size-3.5" />
              <span className="hidden sm:inline">Workforce</span>
            </TabsTrigger>
            <TabsTrigger value="crisis" className="flex items-center gap-1.5">
              <AlertTriangle className="size-3.5" />
              <span className="hidden sm:inline">Crisis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>
          <TabsContent value="workforce">
            <WorkforceTab />
          </TabsContent>
          <TabsContent value="crisis">
            <CrisisTab />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
