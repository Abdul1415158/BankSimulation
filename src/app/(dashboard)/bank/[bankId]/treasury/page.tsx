import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  Landmark,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  ArrowRightLeft,
  Building,
} from "lucide-react";

export default async function TreasuryPage({
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

  const cashReserves = Number(simState?.cash_reserves ?? 15000000);
  const investments = Number(simState?.investments ?? 5000000);
  const lcr = Number(simState?.liquidity_ratio ?? 0.35); // 35% liquidity ratio

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Treasury & Liquidity Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage cash buffers, sovereign securities, and Central Bank discount window facilities.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Cash Reserves</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers">
              {formatCurrency(cashReserves, bank.currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <DollarSign className="size-3.5 text-blue-500" /> Vault & central bank deposits
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Government Securities</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers">
              {formatCurrency(investments, bank.currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <Landmark className="size-3.5 text-cyan-500" /> High-Quality Liquid Assets
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Liquidity Coverage Ratio</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers text-emerald-600">
              {formatPercent(lcr)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-emerald-500" /> Regulatory minimum: 100% (30-day)
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total High-Liquid Buffer</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers">
              {formatCurrency(cashReserves + investments, bank.currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="size-3.5 text-purple-500" /> Immediate run protection
          </CardContent>
        </Card>
      </div>

      {/* Treasury Facilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Government Bond Portfolio</CardTitle>
            <CardDescription className="text-xs">
              Sovereign debt securities held for liquidity backing and yield enhancement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">3-Month Treasury Bills</span>
              <span className="font-semibold font-mono-numbers">{formatCurrency(investments * 0.4, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">2-Year Government Notes</span>
              <span className="font-semibold font-mono-numbers">{formatCurrency(investments * 0.35, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">10-Year Benchmark Bonds</span>
              <span className="font-semibold font-mono-numbers">{formatCurrency(investments * 0.25, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Average Annualized Yield</span>
              <Badge variant="outline" className="text-emerald-600">4.85% Coupon</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Central Bank Standby Facilities</CardTitle>
            <CardDescription className="text-xs">
              Emergency liquidity access windows and overnight interbank repo operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Discount Window Status</span>
              <Badge variant="outline" className="text-emerald-600 border-emerald-500/20">Operational</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Available Collateralized Borrowing</span>
              <span className="font-semibold font-mono-numbers">{formatCurrency(investments * 0.9, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Penalty Rate</span>
              <span className="font-semibold font-mono-numbers">Benchmark + 1.00%</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Market Stigma Warning</span>
              <span className="text-xs text-amber-500">Signaling distress can affect share rating</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
