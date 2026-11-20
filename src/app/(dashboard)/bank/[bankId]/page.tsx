import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent, formatCompactNumber, getChangeColor } from "@/lib/formatters";
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
              <p className={`text-xs font-medium ${
                trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-muted-foreground"
              }`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="size-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Icon className="size-4 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function BankOverviewPage({
  params,
}: {
  params: Promise<{ bankId: string }>;
}) {
  const { bankId } = await params;
  const supabase = await createClient();

  const [{ data: bank }, { data: state }, { data: economy }] = await Promise.all([
    supabase.from("banks").select("*").eq("id", bankId).single(),
    supabase.from("simulation_states").select("*").eq("bank_id", bankId).single(),
    supabase.from("economic_conditions").select("*").eq("bank_id", bankId).order("year", { ascending: false }).order("quarter", { ascending: false }).limit(1).single(),
  ]);

  if (!bank || !state) notFound();

  const currency = bank.currency || "USD";

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          {bank.name} · Year {bank.current_year}, Quarter {bank.current_quarter}
        </p>
      </div>

      {/* Financial KPIs */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Financial Indicators</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Assets" value={formatCurrency(state.total_assets, currency, true)} icon={DollarSign} />
          <KPICard title="Total Liabilities" value={formatCurrency(state.total_liabilities, currency, true)} icon={TrendingDown} />
          <KPICard title="Total Equity" value={formatCurrency(state.total_equity, currency, true)} icon={TrendingUp} />
          <KPICard title="Net Profit" value={formatCurrency(state.net_profit, currency, true)} icon={BarChart3} trend={state.net_profit >= 0 ? "up" : "down"} />
          <KPICard title="Total Deposits" value={formatCurrency(state.total_deposits, currency, true)} icon={PiggyBank} />
          <KPICard title="Total Loans" value={formatCurrency(state.total_loans_outstanding, currency, true)} icon={CreditCard} />
          <KPICard title="Cash Reserves" value={formatCurrency(state.cash_reserves, currency, true)} icon={Landmark} />
          <KPICard title="Net Interest Income" value={formatCurrency(state.net_interest_income, currency, true)} icon={Activity} />
        </div>
      </div>

      {/* Ratios & Operational */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Key Ratios</h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              {[
                { label: "Liquidity Ratio", value: formatPercent(state.liquidity_ratio * 100), good: state.liquidity_ratio > 0.2 },
                { label: "Capital Adequacy", value: formatPercent(state.capital_adequacy_ratio * 100), good: state.capital_adequacy_ratio > 0.08 },
                { label: "NPL Ratio", value: formatPercent(state.npl_ratio * 100), good: state.npl_ratio < 0.05 },
                { label: "Net Interest Margin", value: formatPercent(state.net_interest_margin * 100), good: state.net_interest_margin > 0.02 },
                { label: "Return on Assets", value: formatPercent(state.return_on_assets * 100), good: state.return_on_assets > 0 },
                { label: "Return on Equity", value: formatPercent(state.return_on_equity * 100), good: state.return_on_equity > 0 },
                { label: "Cost to Income", value: formatPercent(state.cost_to_income_ratio * 100), good: state.cost_to_income_ratio < 0.6 },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className={`font-mono-numbers font-medium ${r.good ? "text-emerald-600" : "text-amber-600"}`}>{r.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Operational Indicators</h2>
          <div className="grid grid-cols-2 gap-4">
            <KPICard title="Employees" value={String(state.total_employees)} icon={Users} />
            <KPICard title="AI Agents" value={String(state.total_ai_agents)} icon={Bot} />
            <KPICard title="Customers" value={formatCompactNumber(state.total_customers)} icon={UserCircle} />
            <KPICard title="Satisfaction" value={formatPercent(state.customer_satisfaction, 0)} icon={ShieldCheck} trend={state.customer_satisfaction >= 50 ? "up" : "down"} />
          </div>

          {economy && (
            <div className="mt-4">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Economic Conditions</h2>
              <Card>
                <CardContent className="p-4 space-y-2">
                  {[
                    { label: "GDP Growth", value: formatPercent(economy.gdp_growth) },
                    { label: "Inflation", value: formatPercent(economy.inflation_rate) },
                    { label: "Central Bank Rate", value: formatPercent(economy.central_bank_rate) },
                    { label: "Unemployment", value: formatPercent(economy.unemployment_rate) },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="font-mono-numbers font-medium">{r.value}</span>
                    </div>
                  ))}
                  {economy.recession_flag && (
                    <Badge variant="destructive" className="mt-1">Recession Active</Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Bank score */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Overall Bank Performance Score</p>
            <p className="text-3xl font-bold font-mono-numbers">{state.overall_score}<span className="text-lg text-muted-foreground">/100</span></p>
          </div>
          <div className="size-16 rounded-full border-4 border-blue-500 flex items-center justify-center">
            <span className="text-lg font-bold text-blue-600">{state.overall_score >= 70 ? "A" : state.overall_score >= 50 ? "B" : state.overall_score >= 30 ? "C" : "D"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
