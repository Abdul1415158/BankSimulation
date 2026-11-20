import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  PiggyBank,
  TrendingUp,
  Percent,
  ShieldCheck,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

export default async function DepositsPage({
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

  const { data: simState } = await supabase
    .from("simulation_states")
    .select("*")
    .eq("bank_id", bankId)
    .single();

  const { data: macro } = await supabase
    .from("economic_conditions")
    .select("*")
    .eq("bank_id", bankId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const totalDeposits = Number(simState?.total_deposits ?? 45000000);
  const retailDeposits = totalDeposits * 0.62;
  const corporateDeposits = totalDeposits * 0.38;
  const benchmarkRate = Number(macro?.benchmark_interest_rate ?? 0.045);
  const retailRate = benchmarkRate - 0.010; // 3.5%
  const corporateRate = benchmarkRate - 0.015; // 3.0%
  const reserveRatio = 0.10; // 10% statutory reserve
  const requiredReserves = totalDeposits * reserveRatio;
  const actualReserves = Number(simState?.cash_reserves ?? 15000000);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deposits Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage deposit products, interest rate policies, liquidity reserves, and customer run risk.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Customer Deposits</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers">
              {formatCurrency(totalDeposits, bank.currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <PiggyBank className="size-3.5 text-blue-500" /> Primary funding source
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Retail Deposit Rate</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers">
              {formatPercent(retailRate)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <Percent className="size-3.5 text-emerald-500" /> Benchmark: {formatPercent(benchmarkRate)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Statutory Reserve Requirement</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers">
              {formatCurrency(requiredReserves, bank.currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-cyan-500" /> 10% Central Bank Mandate
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Reserve Surplus</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers text-emerald-600">
              {formatCurrency(actualReserves - requiredReserves, bank.currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="size-3.5 text-emerald-500" /> Fully liquid buffer
          </CardContent>
        </Card>
      </div>

      {/* Deposit Products Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Retail Deposits</CardTitle>
            <CardDescription className="text-xs">
              Consumer checking, high-yield savings, and retail certificates of deposit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Outstanding Balance</span>
              <span className="font-semibold font-mono-numbers">{formatCurrency(retailDeposits, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Portfolio Share</span>
              <span className="font-semibold">62.0%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Current Interest Rate</span>
              <span className="font-semibold font-mono-numbers">{formatPercent(retailRate)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Elasticity Sensitivity</span>
              <Badge variant="outline">High (Beta 0.85)</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Corporate & Commercial Deposits</CardTitle>
            <CardDescription className="text-xs">
              Commercial treasury accounts, corporate sweep accounts, and institutional deposits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Outstanding Balance</span>
              <span className="font-semibold font-mono-numbers">{formatCurrency(corporateDeposits, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Portfolio Share</span>
              <span className="font-semibold">38.0%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Current Interest Rate</span>
              <span className="font-semibold font-mono-numbers">{formatPercent(corporateRate)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Run Risk Profile</span>
              <Badge variant="outline" className="text-amber-500 border-amber-500/30">Moderate Wholesale Flight</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
