"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  PiggyBank,
  TrendingUp,
  Percent,
  ShieldCheck,
  Landmark,
} from "lucide-react";
import { getBank, getSimulationState, getBankSettings, SimulationState, BankSettings } from "@/lib/storage";
import type { Bank } from "@/types/bank";

export default function DepositsPage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [state, setState] = useState<SimulationState | null>(null);
  const [settings, setSettings] = useState<BankSettings | null>(null);

  useEffect(() => {
    if (!bankId) return;
    setBank(getBank(bankId));
    setState(getSimulationState(bankId));
    setSettings(getBankSettings(bankId));
  }, [bankId]);

  if (!bank || !state || !settings) return <div className="p-6">Loading deposit operations...</div>;

  const currency = bank.currency || "USD";
  const totalDeposits = state.total_deposits;
  const requiredReserves = totalDeposits * 0.1;

  const depositProducts = [
    { name: "Everyday Checking Account", rate: settings.current_account_rate, volume: totalDeposits * 0.35, liquidity: "Immediate", term: "None" },
    { name: "High-Yield Savings", rate: settings.savings_rate, volume: totalDeposits * 0.40, liquidity: "T+1 Day", term: "Flexible" },
    { name: "1-Year Fixed Term Deposit", rate: settings.fixed_deposit_rate_1yr, volume: totalDeposits * 0.15, liquidity: "Locked", term: "12 Months" },
    { name: "3-Year Commercial Certificate", rate: settings.fixed_deposit_rate_3yr, volume: totalDeposits * 0.10, liquidity: "Locked", term: "36 Months" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deposit Operations & Liability Structure</h1>
        <p className="text-sm text-muted-foreground">
          Manage deposit tiers, customer interest yields, reserve ratios, and liability funding stability.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Customer Deposits</p>
              <p className="text-2xl font-bold font-mono-numbers">{formatCurrency(totalDeposits, currency, true)}</p>
            </div>
            <PiggyBank className="size-5 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Required Cash Reserves</p>
              <p className="text-2xl font-bold font-mono-numbers">{formatCurrency(requiredReserves, currency, true)}</p>
            </div>
            <ShieldCheck className="size-5 text-cyan-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Actual Cash Vault</p>
              <p className="text-2xl font-bold font-mono-numbers text-emerald-600">{formatCurrency(state.cash_reserves, currency, true)}</p>
            </div>
            <Landmark className="size-5 text-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Weighted Cost of Funds</p>
              <p className="text-2xl font-bold font-mono-numbers text-blue-600">2.65%</p>
            </div>
            <Percent className="size-5 text-amber-500" />
          </CardContent>
        </Card>
      </div>

      {/* Deposit Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Deposit Products & Interest Rates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-y border-border text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Product Name</th>
                  <th className="px-4 py-3 text-center">Interest Offered</th>
                  <th className="px-4 py-3 text-right">Total Balance</th>
                  <th className="px-4 py-3 text-center">Commitment Term</th>
                  <th className="px-4 py-3 text-center">Liquidity Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {depositProducts.map((p) => (
                  <tr key={p.name} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-semibold">{p.name}</td>
                    <td className="px-4 py-3 text-center font-mono-numbers text-emerald-600 font-bold">
                      {p.rate}% APY
                    </td>
                    <td className="px-4 py-3 text-right font-mono-numbers font-medium">
                      {formatCurrency(p.volume, currency, true)}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{p.term}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className="text-xs">
                        {p.liquidity}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
