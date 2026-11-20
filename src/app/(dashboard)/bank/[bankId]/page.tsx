"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent, formatCompactNumber } from "@/lib/formatters";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Bot,
  UserCircle,
  ShieldCheck,
  Activity,
  PiggyBank,
  CreditCard,
  Landmark,
  BarChart3,
} from "lucide-react";
import { getBank, getSimulationState, getEconomicCondition, getLoans, approveLoan, rejectLoan, SimulationState, EconomicCondition, Loan } from "@/lib/storage";
import type { Bank } from "@/types/bank";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-xl font-bold font-mono-numbers">{value}</p>
            {subtitle && (
              <p
                className={`text-xs font-medium ${
                  trend === "up"
                    ? "text-emerald-600"
                    : trend === "down"
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
          <div className="size-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Icon className="size-4 text-blue-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BankOverviewPage() {
  const params = useParams();
  const bankId = params.bankId as string;

  const [bank, setBank] = useState<Bank | null>(null);
  const [state, setState] = useState<SimulationState | null>(null);
  const [economy, setEconomy] = useState<EconomicCondition | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    if (!bankId) return;
    refreshData();
  }, [bankId]);

  function refreshData() {
    setBank(getBank(bankId));
    setState(getSimulationState(bankId));
    setEconomy(getEconomicCondition(bankId));
    setLoans(getLoans(bankId));
  }

  function handleApprove(loanId: string) {
    approveLoan(bankId, loanId);
    refreshData();
  }

  function handleReject(loanId: string) {
    rejectLoan(bankId, loanId);
    refreshData();
  }

  if (!bank || !state) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currency = bank.currency || "USD";
  const overallScore = Math.min(100, Math.round(state.customer_satisfaction * 0.4 + (state.capital_adequacy_ratio / 30) * 30 + (state.net_profit > 0 ? 30 : 10)));
  const pendingLoans = loans.filter((l) => l.status === "Pending");

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              CEO: {bank.ceo_name || "Chief Executive Officer"}
            </span>
            <span className="text-xs text-muted-foreground">
              Est. Year {bank.start_year || 2025} · {bank.operating_mode === "guided" ? "Guided Terms" : "Autonomous"}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{bank.name}</h1>
          <p className="text-muted-foreground text-sm font-mono-numbers">
            Year {bank.current_year} of 5 · Quarter {bank.current_quarter} of 5 (Quarter {((bank.current_year - 1) * 5) + bank.current_quarter} / 25)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/bank/${bankId}/workforce`}>Recruit Staff</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/bank/${bankId}/risk`}>Security & Defense</Link>
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
            <Link href={`/bank/${bankId}/simulation`}>Quarter Controls</Link>
          </Button>
        </div>
      </div>

      {/* PENDING CREDIT DESK QUEUE (If loans awaiting underwriting) */}
      {pendingLoans.length > 0 && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <CreditCard className="size-4 text-blue-400" />
                Credit Desk Referral Queue ({pendingLoans.length} Applications Pending Review)
              </div>
              <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30">
                Action Required
              </Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {pendingLoans.map((pl) => (
                <div key={pl.id} className="p-3 rounded-lg border border-border bg-background flex flex-col justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">{pl.borrower_name}</span>
                      <Badge variant="secondary" className="text-[10px]">{pl.risk_grade}</Badge>
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {pl.category} · {formatCurrency(pl.amount, currency)} @ {pl.interest_rate}% ({pl.term_months} mo)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                    <Button size="sm" onClick={() => handleApprove(pl.id)} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex-1">
                      Approve Credit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(pl.id)} className="h-7 text-xs flex-1 text-rose-500 hover:text-rose-600">
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial KPIs */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Balance Sheet & Capital Solvency</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Assets" value={formatCurrency(state.total_assets, currency, true)} icon={DollarSign} />
          <KPICard title="Total Liabilities" value={formatCurrency(state.total_liabilities, currency, true)} icon={TrendingDown} />
          <KPICard title="Core Equity Capital" value={formatCurrency(state.total_equity, currency, true)} icon={TrendingUp} />
          <KPICard title="Net Profit (Qtr)" value={formatCurrency(state.net_profit, currency, true)} icon={BarChart3} trend={state.net_profit >= 0 ? "up" : "down"} />
          <KPICard title="Customer Deposits" value={formatCurrency(state.total_deposits, currency, true)} icon={PiggyBank} />
          <KPICard title="Active Loan Book" value={formatCurrency(state.total_loans_outstanding, currency, true)} icon={CreditCard} />
          <KPICard title="Cash Reserves" value={formatCurrency(state.cash_reserves, currency, true)} icon={Landmark} />
          <KPICard title="Net Interest Income" value={formatCurrency(state.net_interest_income, currency, true)} icon={Activity} />
        </div>
      </div>

      {/* Ratios & Operational */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Prudential & Performance Ratios</h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              {[
                { label: "Liquidity Ratio", value: `${state.liquidity_ratio}%`, good: state.liquidity_ratio > 20 },
                { label: "Capital Adequacy Ratio (CAR)", value: `${state.capital_adequacy_ratio}%`, good: state.capital_adequacy_ratio > 10.5 },
                { label: "Non-Performing Loans (NPL)", value: `${state.npl_ratio}%`, good: state.npl_ratio < 4.0 },
                { label: "Return on Equity (ROE)", value: `${state.roe}%`, good: state.roe > 6 },
                { label: "Return on Assets (ROA)", value: `${state.roa}%`, good: state.roa > 1 },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between text-sm py-1 border-b last:border-0 border-border/50">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className={`font-mono-numbers font-medium ${r.good ? "text-emerald-600" : "text-amber-600"}`}>
                    {r.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Operational Indicators</h2>
          <div className="grid grid-cols-2 gap-4">
            <KPICard title="Human Staff" value={String(state.total_employees)} icon={Users} />
            <KPICard title="Active AI Agents" value={String(state.total_ai_agents)} icon={Bot} />
            <KPICard title="Fraud Incidents" value={String(state.fraud_incidents)} icon={ShieldCheck} trend="up" />
            <KPICard title="Customer Satisfaction" value={`${state.customer_satisfaction}%`} icon={UserCircle} trend={state.customer_satisfaction >= 75 ? "up" : "down"} />
          </div>

          {economy && (
            <div className="mt-4">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Macroeconomic Environment</h2>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Economic Phase</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700">{economy.phase}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Central Bank Rate</span>
                    <span className="font-mono-numbers font-medium">{economy.central_bank_rate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GDP Growth Rate</span>
                    <span className="font-mono-numbers font-medium">{economy.gdp_growth}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Inflation</span>
                    <span className="font-mono-numbers font-medium">{economy.inflation_rate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Bank score */}
      <Card className="bg-gradient-to-r from-blue-900 to-slate-900 text-white border-0">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-300 font-semibold">Regulatory & Management Score</p>
            <p className="text-3xl font-bold font-mono-numbers mt-1">
              {overallScore}
              <span className="text-lg text-white/50"> / 100</span>
            </p>
            <p className="text-xs text-white/70 mt-1">
              Bank health is stable. Capital adequacy and liquidity meet regulatory standards.
            </p>
          </div>
          <div className="size-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-cyan-300">
              {overallScore >= 80 ? "A+" : overallScore >= 70 ? "A" : overallScore >= 55 ? "B" : "C"}
            </span>
            <span className="text-[10px] text-white/60">Rating</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
