import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  CreditCard,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCheck,
  Bot,
  UserCheck,
} from "lucide-react";

export default async function LoansPage({
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

  const totalLoans = Number(simState?.total_loans ?? 40000000);
  const nplRatio = Number(simState?.non_performing_loan_ratio ?? 0.024);
  const nplAmount = totalLoans * nplRatio;
  const avgYield = 0.076; // 7.6%
  const quarterlyInterest = (totalLoans * avgYield) / 4;

  // Sample pending applications for underwriting
  const sampleApplications = [
    {
      id: "app-101",
      borrower: "Apex Logistics LLC",
      type: "Commercial Term Loan",
      amount: 450000,
      creditScore: 742,
      collateral: 580000,
      aiRecommendation: "approve",
      aiConfidence: 0.94,
      riskTier: "Prime",
    },
    {
      id: "app-102",
      borrower: "Elena Rostova",
      type: "Residential Mortgage",
      amount: 320000,
      creditScore: 685,
      collateral: 390000,
      aiRecommendation: "review",
      aiConfidence: 0.72,
      riskTier: "Near Prime",
    },
    {
      id: "app-103",
      borrower: "Solaris Green Tech",
      type: "SME Working Capital",
      amount: 180000,
      creditScore: 610,
      collateral: 95000,
      aiRecommendation: "reject",
      aiConfidence: 0.89,
      riskTier: "High Risk",
    },
    {
      id: "app-104",
      borrower: "Marcus Vance",
      type: "Consumer Auto Loan",
      amount: 35000,
      creditScore: 780,
      collateral: 42000,
      aiRecommendation: "approve",
      aiConfidence: 0.98,
      riskTier: "Super Prime",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loan Portfolio & Underwriting</h1>
          <p className="text-sm text-muted-foreground">
            Manage credit exposures, monitor non-performing loans, and review AI underwriting decisions.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Gross Loan Portfolio</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers">
              {formatCurrency(totalLoans, bank.currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <CreditCard className="size-3.5 text-blue-500" /> Earning assets
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">NPL Ratio</CardDescription>
            <CardTitle className={`text-2xl font-bold font-mono-numbers ${nplRatio > 0.05 ? "text-destructive" : "text-emerald-600"}`}>
              {formatPercent(nplRatio)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="size-3.5 text-amber-500" /> Defaulted: {formatCurrency(nplAmount, bank.currency)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Average Portfolio Yield</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers">
              {formatPercent(avgYield)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="size-3.5 text-emerald-500" /> Blended lending margin
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Quarterly Interest Revenue</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers">
              {formatCurrency(quarterlyInterest, bank.currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-cyan-500" /> Cash loan inflows
          </CardContent>
        </Card>
      </div>

      {/* Loan Origination Pipeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Underwriting Decision Queue</CardTitle>
              <CardDescription className="text-xs">
                Pending applications evaluated by AI Credit Assessment agents with human review flags.
              </CardDescription>
            </div>
            <Badge variant="outline">4 Pending Applications</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-4 py-3">Borrower</th>
                  <th className="px-4 py-3">Loan Facility</th>
                  <th className="px-4 py-3">Requested</th>
                  <th className="px-4 py-3">Credit Score</th>
                  <th className="px-4 py-3">Collateral</th>
                  <th className="px-4 py-3">AI Recommendation</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sampleApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {app.borrower}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {app.type}
                    </td>
                    <td className="px-4 py-3 font-mono-numbers">
                      {formatCurrency(app.amount, bank.currency)}
                    </td>
                    <td className="px-4 py-3 font-mono-numbers">
                      <span className={app.creditScore >= 700 ? "text-emerald-600 font-semibold" : app.creditScore >= 650 ? "text-amber-600" : "text-destructive"}>
                        {app.creditScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono-numbers">
                      {formatCurrency(app.collateral, bank.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          app.aiRecommendation === "approve"
                            ? "default"
                            : app.aiRecommendation === "review"
                            ? "secondary"
                            : "destructive"
                        }
                        className="capitalize gap-1"
                      >
                        <Bot className="size-3" />
                        {app.aiRecommendation}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono-numbers text-xs">
                      {Math.round(app.aiConfidence * 100)}%
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button size="xs" variant="outline" className="h-6 px-2 text-xs">
                        Review
                      </Button>
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
