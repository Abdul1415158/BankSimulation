"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  FileText,
  Download,
  Scale,
  TrendingUp,
  Landmark,
} from "lucide-react";
import { getBank, getSimulationState, getQuarterHistory, SimulationState, QuarterHistory } from "@/lib/storage";
import type { Bank } from "@/types/bank";

export default function ReportsPage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [state, setState] = useState<SimulationState | null>(null);
  const [history, setHistory] = useState<QuarterHistory[]>([]);

  useEffect(() => {
    if (!bankId) return;
    setBank(getBank(bankId));
    setState(getSimulationState(bankId));
    setHistory(getQuarterHistory(bankId));
  }, [bankId]);

  if (!bank || !state) return <div className="p-6">Loading financial reports...</div>;

  const currency = bank.currency || "USD";

  function exportCSV() {
    if (!history.length) return;
    const headers = ["Year", "Quarter", "Assets", "Liabilities", "Equity", "Deposits", "Loans", "Net Profit", "NPL", "CAR"];
    const rows = history.map((h) => [
      h.year,
      `Q${h.quarter}`,
      h.assets,
      h.liabilities,
      h.equity,
      h.deposits,
      h.loans,
      h.net_profit,
      `${h.npl_ratio}%`,
      `${h.car}%`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${bank?.name || "bank"}_financial_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial & Management Reports</h1>
          <p className="text-sm text-muted-foreground">
            Audited Balance Sheet, Profit & Loss Statement, and Multi-Quarter Historical Ledgers.
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
          <Download className="size-4" />
          <span>Export CSV Statement</span>
        </Button>
      </div>

      <Tabs defaultValue="balance-sheet" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="balance-sheet" className="gap-1.5">
            <Scale className="size-4" /> Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="income-statement" className="gap-1.5">
            <TrendingUp className="size-4" /> Profit & Loss (P&L)
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Landmark className="size-4" /> Quarterly History
          </TabsTrigger>
        </TabsList>

        {/* 1. BALANCE SHEET */}
        <TabsContent value="balance-sheet" className="space-y-6">
          <Card>
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Consolidated Balance Sheet</CardTitle>
                  <CardDescription className="text-xs">
                    As of Year {bank.current_year}, Quarter {bank.current_quarter} · Accounting Equation: Assets = Liabilities + Equity
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700">
                  BALANCED
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Assets */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-blue-600 uppercase tracking-wider border-b pb-2">
                    Total Assets
                  </h3>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span>Cash & Central Bank Reserves</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.cash_reserves, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span>Gross Loan Portfolio</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.total_loans_outstanding, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span>Sovereign Treasury Securities</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.cash_reserves * 0.3, currency)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 text-foreground">
                    <span>Total Assets</span>
                    <span className="font-mono-numbers text-blue-600">{formatCurrency(state.total_assets, currency)}</span>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-cyan-600 uppercase tracking-wider border-b pb-2">
                    Liabilities & Shareholder Equity
                  </h3>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span>Customer Deposit Liabilities</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.total_deposits, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span>Paid-in Capital</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(bank.starting_capital, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span>Retained Earnings</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.total_equity - bank.starting_capital, currency)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 text-foreground">
                    <span>Total Liabilities & Equity</span>
                    <span className="font-mono-numbers text-cyan-600">{formatCurrency(state.total_liabilities + state.total_equity, currency)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. INCOME STATEMENT */}
        <TabsContent value="income-statement">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Statement of Comprehensive Income (P&L)</CardTitle>
              <CardDescription className="text-xs">Quarterly financial performance and earnings yield.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-w-2xl">
              <div className="flex justify-between text-sm py-1.5 border-b">
                <span className="text-muted-foreground">Net Interest Income (NII)</span>
                <span className="font-mono-numbers font-semibold text-emerald-600">{formatCurrency(state.net_interest_income, currency)}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5 border-b">
                <span className="text-muted-foreground">Non-Interest Fees & Commissions</span>
                <span className="font-mono-numbers font-semibold text-emerald-600">{formatCurrency(state.non_interest_income, currency)}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5 border-b">
                <span className="text-muted-foreground">Operating Expenses (Salaries, AI, Overhead)</span>
                <span className="font-mono-numbers font-semibold text-rose-600">-{formatCurrency(state.operating_expenses, currency)}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5 border-b">
                <span className="text-muted-foreground">Loan Loss Provisions</span>
                <span className="font-mono-numbers font-semibold text-rose-600">-{formatCurrency(state.loan_loss_provisions, currency)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-foreground">
                <span>Net Quarterly Profit</span>
                <span className={`font-mono-numbers ${state.net_profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {formatCurrency(state.net_profit, currency)}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. HISTORY */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Quarterly Financial Ledger</CardTitle>
              <CardDescription className="text-xs">Complete trajectory across all simulated quarters.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b text-xs text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Period</th>
                      <th className="px-4 py-3 text-right">Assets</th>
                      <th className="px-4 py-3 text-right">Deposits</th>
                      <th className="px-4 py-3 text-right">Loans</th>
                      <th className="px-4 py-3 text-right">Net Profit</th>
                      <th className="px-4 py-3 text-center">NPL</th>
                      <th className="px-4 py-3 text-center">CAR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {history.map((h, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-semibold">Y{h.year} Q{h.quarter}</td>
                        <td className="px-4 py-3 text-right font-mono-numbers">{formatCurrency(h.assets, currency, true)}</td>
                        <td className="px-4 py-3 text-right font-mono-numbers">{formatCurrency(h.deposits, currency, true)}</td>
                        <td className="px-4 py-3 text-right font-mono-numbers">{formatCurrency(h.loans, currency, true)}</td>
                        <td className="px-4 py-3 text-right font-mono-numbers font-semibold text-emerald-600">{formatCurrency(h.net_profit, currency, true)}</td>
                        <td className="px-4 py-3 text-center font-mono-numbers">{h.npl_ratio}%</td>
                        <td className="px-4 py-3 text-center font-mono-numbers font-medium text-blue-600">{h.car}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
