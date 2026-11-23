"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Edit3,
  Sliders,
  CheckCircle2,
  X,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Globe,
  Building2,
} from "lucide-react";
import {
  getBank,
  getSimulationState,
  getEconomicCondition,
  getLoans,
  approveLoan,
  rejectLoan,
  updateSimulationState,
  updateBank,
  updateEconomicCondition,
  SimulationState,
  EconomicCondition,
  Loan,
} from "@/lib/storage";
import type { Bank } from "@/types/bank";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  onEdit,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  onEdit?: () => void;
}) {
  return (
    <Card className="relative group transition-all hover:border-blue-500/40">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-muted-foreground font-medium">{title}</p>
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-300 p-0.5 rounded"
                  title={`Edit ${title}`}
                >
                  <Edit3 className="size-3" />
                </button>
              )}
            </div>
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

  // Editor Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<"financial" | "ratios" | "operations" | "economy" | "identity">("financial");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form states
  const [formFinancial, setFormFinancial] = useState({
    total_assets: 0,
    total_liabilities: 0,
    total_equity: 0,
    cash_reserves: 0,
    total_deposits: 0,
    total_loans_outstanding: 0,
    net_interest_income: 0,
    non_interest_income: 0,
    operating_expenses: 0,
    net_profit: 0,
  });

  const [formRatios, setFormRatios] = useState({
    liquidity_ratio: 0,
    capital_adequacy_ratio: 0,
    npl_ratio: 0,
    roe: 0,
    roa: 0,
  });

  const [formOps, setFormOps] = useState({
    total_employees: 0,
    total_ai_agents: 0,
    fraud_incidents: 0,
    customer_satisfaction: 0,
  });

  const [formEconomy, setFormEconomy] = useState({
    phase: "Expansion" as "Expansion" | "Peak" | "Contraction" | "Trough",
    market_sentiment: "Bullish" as "Bullish" | "Stable" | "Recession" | "Volatile",
    central_bank_rate: 0,
    gdp_growth: 0,
    inflation_rate: 0,
    unemployment_rate: 0,
  });

  const [formIdentity, setFormIdentity] = useState({
    name: "",
    ceo_name: "",
    current_year: 1,
    current_quarter: 1 as 1 | 2 | 3 | 4,
  });

  useEffect(() => {
    if (!bankId) return;
    refreshData();
  }, [bankId]);

  function refreshData() {
    const b = getBank(bankId);
    const s = getSimulationState(bankId);
    const e = getEconomicCondition(bankId);
    const l = getLoans(bankId);
    setBank(b);
    setState(s);
    setEconomy(e);
    setLoans(l);

    if (s) {
      setFormFinancial({
        total_assets: s.total_assets,
        total_liabilities: s.total_liabilities,
        total_equity: s.total_equity,
        cash_reserves: s.cash_reserves,
        total_deposits: s.total_deposits,
        total_loans_outstanding: s.total_loans_outstanding,
        net_interest_income: s.net_interest_income,
        non_interest_income: s.non_interest_income,
        operating_expenses: s.operating_expenses,
        net_profit: s.net_profit,
      });
      setFormRatios({
        liquidity_ratio: s.liquidity_ratio,
        capital_adequacy_ratio: s.capital_adequacy_ratio,
        npl_ratio: s.npl_ratio,
        roe: s.roe,
        roa: s.roa,
      });
      setFormOps({
        total_employees: s.total_employees,
        total_ai_agents: s.total_ai_agents,
        fraud_incidents: s.fraud_incidents,
        customer_satisfaction: s.customer_satisfaction,
      });
    }

    if (e) {
      setFormEconomy({
        phase: e.phase,
        market_sentiment: e.market_sentiment,
        central_bank_rate: e.central_bank_rate,
        gdp_growth: e.gdp_growth,
        inflation_rate: e.inflation_rate,
        unemployment_rate: e.unemployment_rate,
      });
    }

    if (b) {
      setFormIdentity({
        name: b.name,
        ceo_name: b.ceo_name || "",
        current_year: b.current_year,
        current_quarter: b.current_quarter,
      });
    }
  }

  function handleApprove(loanId: string) {
    approveLoan(bankId, loanId);
    refreshData();
  }

  function handleReject(loanId: string) {
    rejectLoan(bankId, loanId);
    refreshData();
  }

  function openEditor(tab: "financial" | "ratios" | "operations" | "economy" | "identity" = "financial") {
    refreshData();
    setActiveEditorTab(tab);
    setIsEditorOpen(true);
  }

  function autoBalanceAssets() {
    const balancedAssets = formFinancial.total_liabilities + formFinancial.total_equity;
    const balancedCash = Math.max(0, balancedAssets - formFinancial.total_loans_outstanding);
    setFormFinancial((prev) => ({
      ...prev,
      total_assets: balancedAssets,
      cash_reserves: balancedCash,
    }));
  }

  function autoCalculateNetProfit() {
    const profit = formFinancial.net_interest_income + formFinancial.non_interest_income - formFinancial.operating_expenses;
    setFormFinancial((prev) => ({
      ...prev,
      net_profit: profit,
    }));
  }

  function handleSaveAllChanges() {
    if (!bankId) return;

    // 1. Update Simulation State
    updateSimulationState(bankId, {
      ...formFinancial,
      ...formRatios,
      ...formOps,
    });

    // 2. Update Bank Identity & Quarter
    updateBank(bankId, {
      name: formIdentity.name,
      ceo_name: formIdentity.ceo_name,
      current_year: formIdentity.current_year,
      current_quarter: formIdentity.current_quarter,
    });

    // 3. Update Economic Conditions
    updateEconomicCondition(bankId, {
      ...formEconomy,
    });

    refreshData();
    setSaveSuccessMsg("All parameters updated successfully! Quarter advances & reports will now reflect these numbers.");
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setIsEditorOpen(false);
    }, 1500);
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
    <div className="p-4 sm:p-6 space-y-6 max-w-[1500px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              CEO: {bank.ceo_name || "Chief Executive Officer"}
            </span>
            <span className="text-xs text-muted-foreground">
              Est. Year {bank.start_year || 2025} · {bank.operating_mode === "guided" ? "Guided Terms" : "Autonomous"}
            </span>
            <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30">
              Simulation Active
            </Badge>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{bank.name}</h1>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => openEditor("identity")}
              className="size-7 text-muted-foreground hover:text-blue-400"
              title="Edit Bank Name, CEO, or Period"
            >
              <Edit3 className="size-3.5" />
            </Button>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-mono-numbers mt-0.5">
            Year {bank.current_year} of 5 · Quarter {bank.current_quarter} of 4 (Quarter {((bank.current_year - 1) * 4) + bank.current_quarter} / 20)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* PRIMARY CUSTOMIZATION / EDIT BUTTON */}
          <Button
            size="sm"
            onClick={() => openEditor("financial")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-1.5 shadow-sm"
          >
            <Sliders className="size-4" />
            <span>Customize Parameters</span>
          </Button>

          <Button size="sm" variant="outline" asChild>
            <Link href={`/bank/${bankId}/workforce`}>Recruit Staff</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/bank/${bankId}/risk`}>Security & Defense</Link>
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
            <Link href={`/bank/${bankId}/simulation`}>Quarter Controls</Link>
          </Button>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION BANNER */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{saveSuccessMsg}</span>
        </div>
      )}

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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="size-4 text-blue-400" />
            Balance Sheet & Capital Solvency
          </h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEditor("financial")}
            className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1.5"
          >
            <Edit3 className="size-3" />
            <span>Edit Balance Sheet</span>
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Assets" value={formatCurrency(state.total_assets, currency, true)} icon={DollarSign} onEdit={() => openEditor("financial")} />
          <KPICard title="Total Liabilities" value={formatCurrency(state.total_liabilities, currency, true)} icon={TrendingDown} onEdit={() => openEditor("financial")} />
          <KPICard title="Core Equity Capital" value={formatCurrency(state.total_equity, currency, true)} icon={TrendingUp} onEdit={() => openEditor("financial")} />
          <KPICard title="Net Profit (Qtr)" value={formatCurrency(state.net_profit, currency, true)} icon={BarChart3} trend={state.net_profit >= 0 ? "up" : "down"} onEdit={() => openEditor("financial")} />
          <KPICard title="Customer Deposits" value={formatCurrency(state.total_deposits, currency, true)} icon={PiggyBank} onEdit={() => openEditor("financial")} />
          <KPICard title="Active Loan Book" value={formatCurrency(state.total_loans_outstanding, currency, true)} icon={CreditCard} onEdit={() => openEditor("financial")} />
          <KPICard title="Cash Reserves" value={formatCurrency(state.cash_reserves, currency, true)} icon={Landmark} onEdit={() => openEditor("financial")} />
          <KPICard title="Net Interest Income" value={formatCurrency(state.net_interest_income, currency, true)} icon={Activity} onEdit={() => openEditor("financial")} />
        </div>
      </div>

      {/* Ratios & Operational */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Activity className="size-4 text-cyan-400" />
              Prudential & Performance Ratios
            </h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openEditor("ratios")}
              className="h-7 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 gap-1.5"
            >
              <Edit3 className="size-3" />
              <span>Edit Ratios</span>
            </Button>
          </div>
          <Card className="hover:border-blue-500/40 transition-all">
            <CardContent className="p-4 space-y-3">
              {[
                { label: "Liquidity Ratio", value: `${state.liquidity_ratio}%`, good: state.liquidity_ratio > 20 },
                { label: "Capital Adequacy Ratio (CAR)", value: `${state.capital_adequacy_ratio}%`, good: state.capital_adequacy_ratio > 10.5 },
                { label: "Non-Performing Loans (NPL)", value: `${state.npl_ratio}%`, good: state.npl_ratio < 4.0 },
                { label: "Return on Equity (ROE)", value: `${state.roe}%`, good: state.roe > 6 },
                { label: "Return on Assets (ROA)", value: `${state.roa}%`, good: state.roa > 1 },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0 border-border/50">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className={`font-mono-numbers font-medium ${r.good ? "text-emerald-500" : "text-amber-500"}`}>
                    {r.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="size-4 text-purple-400" />
              Operational Indicators
            </h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openEditor("operations")}
              className="h-7 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-1.5"
            >
              <Edit3 className="size-3" />
              <span>Edit Operations</span>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <KPICard title="Human Staff" value={String(state.total_employees)} icon={Users} onEdit={() => openEditor("operations")} />
            <KPICard title="Active AI Agents" value={String(state.total_ai_agents)} icon={Bot} onEdit={() => openEditor("operations")} />
            <KPICard title="Fraud Incidents" value={String(state.fraud_incidents)} icon={ShieldCheck} trend="up" onEdit={() => openEditor("operations")} />
            <KPICard title="Customer Satisfaction" value={`${state.customer_satisfaction}%`} icon={UserCircle} trend={state.customer_satisfaction >= 75 ? "up" : "down"} onEdit={() => openEditor("operations")} />
          </div>

          {economy && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Globe className="size-4 text-emerald-400" />
                  Macroeconomic Environment
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEditor("economy")}
                  className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1.5"
                >
                  <Edit3 className="size-3" />
                  <span>Edit Economy</span>
                </Button>
              </div>
              <Card className="hover:border-blue-500/40 transition-all">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm py-0.5">
                    <span className="text-muted-foreground">Economic Phase</span>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">{economy.phase}</Badge>
                  </div>
                  <div className="flex justify-between text-sm py-0.5">
                    <span className="text-muted-foreground">Central Bank Rate</span>
                    <span className="font-mono-numbers font-medium">{economy.central_bank_rate}%</span>
                  </div>
                  <div className="flex justify-between text-sm py-0.5">
                    <span className="text-muted-foreground">GDP Growth Rate</span>
                    <span className="font-mono-numbers font-medium">{economy.gdp_growth}%</span>
                  </div>
                  <div className="flex justify-between text-sm py-0.5">
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
      <Card className="bg-gradient-to-r from-blue-900 to-slate-900 text-white border-0 shadow-lg">
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

      {/* ========================================================================= */}
      {/* FULL CUSTOMIZATION MODAL / SLIDE-IN DIALOG                               */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b bg-muted/30 flex items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <Sliders className="size-5 text-blue-400" />
                  Customize Bank Overview & Simulation Parameters
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set baseline numbers before running simulation quarters. Reports and financial statements will calculate directly against these figures.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsEditorOpen(false)}
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b px-4 bg-muted/10 overflow-x-auto scrollbar-thin">
              <div className="flex items-center gap-2 py-2">
                {[
                  { id: "financial" as const, label: "Balance Sheet & P&L", icon: DollarSign },
                  { id: "ratios" as const, label: "Prudential Ratios", icon: Activity },
                  { id: "operations" as const, label: "Workforce & Operations", icon: Users },
                  { id: "economy" as const, label: "Macro Environment", icon: Globe },
                  { id: "identity" as const, label: "Bank Identity & Calendar", icon: Building2 },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveEditorTab(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        activeEditorTab === t.id
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="size-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              {/* 1. FINANCIAL & BALANCE SHEET */}
              {activeEditorTab === "financial" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
                    <div>
                      <span className="font-semibold text-foreground text-xs block">Balance Sheet Golden Rule</span>
                      <span className="text-[11px] text-muted-foreground">Assets = Liabilities + Shareholder Equity</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={autoBalanceAssets} className="h-7 text-xs text-blue-400 border-blue-500/30">
                      Auto-Balance Assets
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Total Assets ({currency})</label>
                      <input
                        type="number"
                        value={formFinancial.total_assets}
                        onChange={(e) => setFormFinancial({ ...formFinancial, total_assets: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Total Liabilities ({currency})</label>
                      <input
                        type="number"
                        value={formFinancial.total_liabilities}
                        onChange={(e) => setFormFinancial({ ...formFinancial, total_liabilities: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Core Equity Capital ({currency})</label>
                      <input
                        type="number"
                        value={formFinancial.total_equity}
                        onChange={(e) => setFormFinancial({ ...formFinancial, total_equity: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Customer Deposits ({currency})</label>
                      <input
                        type="number"
                        value={formFinancial.total_deposits}
                        onChange={(e) => setFormFinancial({ ...formFinancial, total_deposits: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Active Loan Book ({currency})</label>
                      <input
                        type="number"
                        value={formFinancial.total_loans_outstanding}
                        onChange={(e) => setFormFinancial({ ...formFinancial, total_loans_outstanding: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Cash Reserves ({currency})</label>
                      <input
                        type="number"
                        value={formFinancial.cash_reserves}
                        onChange={(e) => setFormFinancial({ ...formFinancial, cash_reserves: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Net Interest Income (NII)</label>
                      <input
                        type="number"
                        value={formFinancial.net_interest_income}
                        onChange={(e) => setFormFinancial({ ...formFinancial, net_interest_income: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Fee / Non-Interest Income</label>
                      <input
                        type="number"
                        value={formFinancial.non_interest_income}
                        onChange={(e) => setFormFinancial({ ...formFinancial, non_interest_income: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Operating Expenses (Opex)</label>
                      <input
                        type="number"
                        value={formFinancial.operating_expenses}
                        onChange={(e) => setFormFinancial({ ...formFinancial, operating_expenses: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2 md:col-span-3 pt-2 border-t">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-foreground">Net Quarterly Profit / Loss ({currency})</label>
                        <button
                          type="button"
                          onClick={autoCalculateNetProfit}
                          className="text-[11px] text-blue-400 hover:underline"
                        >
                          Auto Calculate (NII + Fees - Opex)
                        </button>
                      </div>
                      <input
                        type="number"
                        value={formFinancial.net_profit}
                        onChange={(e) => setFormFinancial({ ...formFinancial, net_profit: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs font-bold text-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. PRUDENTIAL RATIOS */}
              {activeEditorTab === "ratios" && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Regulator and Basel III prudential safety metrics for solvency and stability audits.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Capital Adequacy Ratio (CAR %)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formRatios.capital_adequacy_ratio}
                        onChange={(e) => setFormRatios({ ...formRatios, capital_adequacy_ratio: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                      <span className="text-[10px] text-muted-foreground">Standard benchmark: &gt; 10.5%</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Non-Performing Loans (NPL %)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formRatios.npl_ratio}
                        onChange={(e) => setFormRatios({ ...formRatios, npl_ratio: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                      <span className="text-[10px] text-muted-foreground">Standard benchmark: &lt; 4.0%</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Liquidity Ratio (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formRatios.liquidity_ratio}
                        onChange={(e) => setFormRatios({ ...formRatios, liquidity_ratio: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                      <span className="text-[10px] text-muted-foreground">Standard benchmark: &gt; 20%</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Return on Equity (ROE %)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formRatios.roe}
                        onChange={(e) => setFormRatios({ ...formRatios, roe: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Return on Assets (ROA %)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formRatios.roa}
                        onChange={(e) => setFormRatios({ ...formRatios, roe: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. WORKFORCE & OPERATIONS */}
              {activeEditorTab === "operations" && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Human staff vs Autonomous AI Agent counts directly power the teacher-grade Human vs AI Workforce Analysis in Annual Reports!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <Users className="size-3.5 text-blue-400" />
                        Total Human Employees (Officers)
                      </label>
                      <input
                        type="number"
                        value={formOps.total_employees}
                        onChange={(e) => setFormOps({ ...formOps, total_employees: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <Bot className="size-3.5 text-cyan-400" />
                        Active Autonomous AI Agents Fleet
                      </label>
                      <input
                        type="number"
                        value={formOps.total_ai_agents}
                        onChange={(e) => setFormOps({ ...formOps, total_ai_agents: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs text-cyan-400 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <UserCircle className="size-3.5 text-emerald-400" />
                        Customer Satisfaction Score (0 - 100%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formOps.customer_satisfaction}
                        onChange={(e) => setFormOps({ ...formOps, customer_satisfaction: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-rose-400" />
                        Fraud / Security Incidents Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formOps.fraud_incidents}
                        onChange={(e) => setFormOps({ ...formOps, fraud_incidents: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. MACRO ENVIRONMENT */}
              {activeEditorTab === "economy" && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Macroeconomic climate driving interest margins, customer credit scores, and deposit growth.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Economic Cycle Phase</label>
                      <select
                        value={formEconomy.phase}
                        onChange={(e) => setFormEconomy({ ...formEconomy, phase: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border bg-background text-xs"
                      >
                        <option value="Expansion">Expansion (High Growth)</option>
                        <option value="Peak">Peak (Maximum Output)</option>
                        <option value="Contraction">Contraction (Slowing Down)</option>
                        <option value="Trough">Trough (Recession Low)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Market Sentiment</label>
                      <select
                        value={formEconomy.market_sentiment}
                        onChange={(e) => setFormEconomy({ ...formEconomy, market_sentiment: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border bg-background text-xs"
                      >
                        <option value="Bullish">Bullish</option>
                        <option value="Stable">Stable</option>
                        <option value="Recession">Recession</option>
                        <option value="Volatile">Volatile</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Central Bank Rate (%)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={formEconomy.central_bank_rate}
                        onChange={(e) => setFormEconomy({ ...formEconomy, central_bank_rate: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">GDP Growth Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formEconomy.gdp_growth}
                        onChange={(e) => setFormEconomy({ ...formEconomy, gdp_growth: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Inflation Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formEconomy.inflation_rate}
                        onChange={(e) => setFormEconomy({ ...formEconomy, inflation_rate: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Unemployment Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formEconomy.unemployment_rate}
                        onChange={(e) => setFormEconomy({ ...formEconomy, unemployment_rate: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background font-mono-numbers text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 5. BANK IDENTITY & CALENDAR */}
              {activeEditorTab === "identity" && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Bank name, CEO signatory name, and simulation calendar coordinates.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Bank Institution Name</label>
                      <input
                        type="text"
                        value={formIdentity.name}
                        onChange={(e) => setFormIdentity({ ...formIdentity, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border bg-background text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">CEO / Signatory Name</label>
                      <input
                        type="text"
                        value={formIdentity.ceo_name}
                        onChange={(e) => setFormIdentity({ ...formIdentity, ceo_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border bg-background text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Operating Year (1 to 5)</label>
                      <select
                        value={formIdentity.current_year}
                        onChange={(e) => setFormIdentity({ ...formIdentity, current_year: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border bg-background text-xs"
                      >
                        {[1, 2, 3, 4, 5].map((y) => (
                          <option key={y} value={y}>Year {y}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Operating Quarter (1 to 4)</label>
                      <select
                        value={formIdentity.current_quarter}
                        onChange={(e) => setFormIdentity({ ...formIdentity, current_quarter: Number(e.target.value) as 1 | 2 | 3 | 4 })}
                        className="w-full px-3 py-2 rounded-lg border bg-background text-xs"
                      >
                        {[1, 2, 3, 4].map((q) => (
                          <option key={q} value={q}>Quarter {q} of 4</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t bg-muted/20 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditorOpen(false)}
                className="gap-1.5"
              >
                <X className="size-4" />
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  className="gap-1.5"
                  title="Reload currently saved values"
                >
                  <RotateCcw className="size-3.5" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveAllChanges}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm font-semibold"
                >
                  <Save className="size-4" />
                  Save & Apply Parameters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
