"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import {
  Landmark,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  ArrowRightLeft,
} from "lucide-react";
import { getBank, getSimulationState, SimulationState } from "@/lib/storage";
import type { Bank } from "@/types/bank";

export default function TreasuryPage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [state, setState] = useState<SimulationState | null>(null);

  useEffect(() => {
    if (!bankId) return;
    setBank(getBank(bankId));
    setState(getSimulationState(bankId));
  }, [bankId]);

  if (!bank || !state) return <div className="p-6">Loading treasury operations...</div>;

  const currency = bank.currency || "USD";
  const cashReserves = state.cash_reserves;
  const lcr = state.liquidity_ratio;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Treasury & Liquidity Desk</h1>
        <p className="text-sm text-muted-foreground">
          Monitor High-Quality Liquid Assets (HQLA), interbank money market positions, and Central Bank reserves.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Vault Cash Reserves</p>
              <p className="text-2xl font-bold font-mono-numbers">{formatCurrency(cashReserves, currency, true)}</p>
            </div>
            <Landmark className="size-5 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Liquidity Coverage Ratio</p>
              <p className="text-2xl font-bold font-mono-numbers text-emerald-600">{lcr}%</p>
            </div>
            <ShieldCheck className="size-5 text-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Sovereign Bonds</p>
              <p className="text-2xl font-bold font-mono-numbers">{formatCurrency(cashReserves * 0.4, currency, true)}</p>
            </div>
            <TrendingUp className="size-5 text-cyan-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Interbank Borrowing Line</p>
              <p className="text-2xl font-bold font-mono-numbers text-blue-600">{formatCurrency(cashReserves * 0.5, currency, true)}</p>
            </div>
            <ArrowRightLeft className="size-5 text-amber-500" />
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Holdings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Liquid Asset Portfolio Breakdown</CardTitle>
          <CardDescription className="text-xs">Composition of liquid reserves for emergency liquidity coverage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Central Bank Overnight Facility", amount: cashReserves * 0.45, yield: "5.25%", risk: "Zero Risk" },
            { name: "10-Year Sovereign Government Bonds", amount: cashReserves * 0.35, yield: "4.85%", risk: "Minimal Risk" },
            { name: "Interbank Call Money & Repo Loans", amount: cashReserves * 0.20, yield: "5.40%", risk: "Low Risk" },
          ].map((asset) => (
            <div key={asset.name} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div>
                <p className="font-semibold text-sm">{asset.name}</p>
                <Badge variant="outline" className="text-[10px] mt-1">{asset.risk}</Badge>
              </div>
              <div className="text-right">
                <p className="font-mono-numbers font-bold">{formatCurrency(asset.amount, currency)}</p>
                <p className="text-xs text-emerald-600 font-medium">Yield: {asset.yield}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
