import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Scale,
  Zap,
} from "lucide-react";

export default async function RiskManagementPage({
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

  const car = Number(simState?.capital_adequacy_ratio ?? 0.145);
  const totalEquity = Number(simState?.total_equity ?? 15000000);
  const totalLoans = Number(simState?.total_loans ?? 40000000);
  const nplRatio = Number(simState?.non_performing_loan_ratio ?? 0.024);
  const rwa = totalLoans * 0.75 + 5000000 * 0.20; // Risk weighted assets
  const minRequiredCar = 0.105; // 10.5% Basel III with buffers

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Risk Management & Capital Adequacy</h1>
          <p className="text-sm text-muted-foreground">
            Basel III regulatory compliance, Risk-Weighted Asset (RWA) modeling, and stress testing.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Capital Adequacy Ratio (CAR)</CardDescription>
            <CardTitle className={`text-2xl font-bold font-mono-numbers ${car >= minRequiredCar ? "text-emerald-600" : "text-destructive"}`}>
              {formatPercent(car)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <Scale className="size-3.5 text-blue-500" /> Basel III Min: {formatPercent(minRequiredCar)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Tier 1 Core Equity</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers">
              {formatCurrency(totalEquity, bank.currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-emerald-500" /> Loss-absorbing capital
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Risk-Weighted Assets (RWA)</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers">
              {formatCurrency(rwa, bank.currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <Activity className="size-3.5 text-cyan-500" /> Standardized Approach
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Credit Quality (NPL)</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers">
              {formatPercent(nplRatio)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="size-3.5 text-amber-500" /> Delinquency threshold: 5.0%
          </CardContent>
        </Card>
      </div>

      {/* Basel III Accord Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Basel III Regulatory Buffers</CardTitle>
            <CardDescription className="text-xs">
              Breakdown of minimum statutory capital and supervisory buffers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Pillar 1 Minimum Capital</span>
              <span className="font-semibold">8.00%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Capital Conservation Buffer (CCB)</span>
              <span className="font-semibold">2.50%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Current Buffer Surplus</span>
              <span className="font-semibold font-mono-numbers text-emerald-600">
                +{formatPercent(Math.max(0, car - minRequiredCar))}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Supervisory Stance</span>
              <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10">
                Well Capitalized
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Macroeconomic Stress Test Simulator</CardTitle>
            <CardDescription className="text-xs">
              Simulated capital erosion under severe market shock scenarios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-sm font-medium">Severe Recession (-4% GDP)</p>
                <p className="text-xs text-muted-foreground">Unemployment jumps to 9.5%, NPLs spike to 6.8%</p>
              </div>
              <Badge variant="destructive">CAR: {formatPercent(car - 0.035)}</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-sm font-medium">Liquidity Freeze (-20% Deposits)</p>
                <p className="text-xs text-muted-foreground">Emergency bond fire-sales erode Tier 1 equity</p>
              </div>
              <Badge variant="outline" className="text-amber-500 border-amber-500/30">LCR: 112%</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Critical Cyberattack</p>
                <p className="text-xs text-muted-foreground">Operational outage and regulatory restitution</p>
              </div>
              <Badge variant="outline">CAR: {formatPercent(car - 0.012)}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
