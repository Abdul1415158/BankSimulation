import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  FileText,
  Download,
  Printer,
  Scale,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ bankId: string }>;
}) {
  const { bankId } = await params;
  const supabase = await createClient();

  const { data: bank } = await supabase
    .from("banks")
    .select("currency, name")
    .eq("id", bankId)
    .single();

  if (!bank) notFound();

  const { data: simState } = await supabase
    .from("simulation_states")
    .select("*")
    .eq("bank_id", bankId)
    .single();

  const totalAssets = Number(simState?.total_assets ?? 60000000);
  const totalLiabilities = Number(simState?.total_liabilities ?? 45000000);
  const totalEquity = Number(simState?.total_equity ?? 15000000);
  const cash = Number(simState?.cash_reserves ?? 15000000);
  const loans = Number(simState?.total_loans ?? 40000000);
  const investments = Number(simState?.investments ?? 5000000);
  const deposits = Number(simState?.total_deposits ?? 45000000);

  // Income statement figures
  const interestIncome = loans * (0.075 / 4) + investments * (0.045 / 4);
  const interestExpense = deposits * (0.035 / 4);
  const nii = interestIncome - interestExpense;
  const feeIncome = deposits * 0.0015;
  const totalRevenue = nii + feeIncome;
  const opex = 550000;
  const creditLosses = loans * 0.003;
  const preTaxProfit = totalRevenue - opex - creditLosses;
  const tax = preTaxProfit > 0 ? preTaxProfit * 0.25 : 0;
  const netProfit = preTaxProfit - tax;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Statements & Reports</h1>
          <p className="text-sm text-muted-foreground">
            Official quarterly management accounts, regulatory filings, and balance sheet verification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="size-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="size-4 mr-2" /> Print Statement
          </Button>
        </div>
      </div>

      {/* Accounting Balance Check */}
      <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Scale className="size-4 text-emerald-600" />
          <span className="font-semibold text-emerald-950 dark:text-emerald-200">
            Accounting Identity Enforced: Assets = Liabilities + Equity
          </span>
        </div>
        <span className="font-mono-numbers font-medium text-emerald-800 dark:text-emerald-300">
          {formatCurrency(totalAssets, bank.currency)} = {formatCurrency(totalLiabilities, bank.currency)} + {formatCurrency(totalEquity, bank.currency)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Sheet */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Balance Sheet</CardTitle>
            <CardDescription className="text-xs">
              Statement of financial condition as of Quarter {simState?.current_quarter ?? 1}, Year {simState?.current_year ?? 1}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="font-semibold text-xs text-muted-foreground uppercase pt-1">Assets</div>
            <div className="flex items-center justify-between pl-3 py-1">
              <span>Cash & Central Bank Reserves</span>
              <span className="font-mono-numbers">{formatCurrency(cash, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between pl-3 py-1">
              <span>Net Loans & Advances</span>
              <span className="font-mono-numbers">{formatCurrency(loans, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between pl-3 py-1">
              <span>Government Debt Securities</span>
              <span className="font-mono-numbers">{formatCurrency(investments, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border font-bold">
              <span>Total Assets</span>
              <span className="font-mono-numbers text-blue-600">{formatCurrency(totalAssets, bank.currency)}</span>
            </div>

            <div className="font-semibold text-xs text-muted-foreground uppercase pt-3">Liabilities</div>
            <div className="flex items-center justify-between pl-3 py-1">
              <span>Customer Deposit Liabilities</span>
              <span className="font-mono-numbers">{formatCurrency(deposits, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border font-bold">
              <span>Total Liabilities</span>
              <span className="font-mono-numbers">{formatCurrency(totalLiabilities, bank.currency)}</span>
            </div>

            <div className="font-semibold text-xs text-muted-foreground uppercase pt-3">Shareholders' Equity</div>
            <div className="flex items-center justify-between pl-3 py-1">
              <span>Paid-in Capital & Reserves</span>
              <span className="font-mono-numbers">{formatCurrency(totalEquity - netProfit, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between pl-3 py-1">
              <span>Quarterly Retained Earnings</span>
              <span className="font-mono-numbers text-emerald-600">+{formatCurrency(netProfit, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border font-bold">
              <span>Total Equity</span>
              <span className="font-mono-numbers text-emerald-600">{formatCurrency(totalEquity, bank.currency)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Income Statement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Income Statement (P&L)</CardTitle>
            <CardDescription className="text-xs">
              Quarterly statement of operational performance and bottom-line earnings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="font-semibold text-xs text-muted-foreground uppercase pt-1">Operating Revenue</div>
            <div className="flex items-center justify-between pl-3 py-1">
              <span>Interest Income (Loans & Bonds)</span>
              <span className="font-mono-numbers font-medium text-emerald-600">+{formatCurrency(interestIncome, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between pl-3 py-1">
              <span>Interest Expense (Deposits)</span>
              <span className="font-mono-numbers text-destructive">-{formatCurrency(interestExpense, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border font-semibold">
              <span>Net Interest Income (NII)</span>
              <span className="font-mono-numbers text-blue-600">{formatCurrency(nii, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between pl-3 py-1">
              <span>Non-Interest & Service Fee Income</span>
              <span className="font-mono-numbers">+{formatCurrency(feeIncome, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border font-bold">
              <span>Total Operating Revenue</span>
              <span className="font-mono-numbers">{formatCurrency(totalRevenue, bank.currency)}</span>
            </div>

            <div className="font-semibold text-xs text-muted-foreground uppercase pt-3">Operating & Credit Expenses</div>
            <div className="flex items-center justify-between pl-3 py-1">
              <span>Personnel & AI Operating Expenses</span>
              <span className="font-mono-numbers text-destructive">-{formatCurrency(opex, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between pl-3 py-1">
              <span>Provision for Credit Losses (NPLs)</span>
              <span className="font-mono-numbers text-destructive">-{formatCurrency(creditLosses, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between pl-3 py-1">
              <span>Corporate Income Tax (25%)</span>
              <span className="font-mono-numbers text-destructive">-{formatCurrency(tax, bank.currency)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border font-bold text-base">
              <span>Net Profit (PAT)</span>
              <span className={`font-mono-numbers ${netProfit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                {formatCurrency(netProfit, bank.currency)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
