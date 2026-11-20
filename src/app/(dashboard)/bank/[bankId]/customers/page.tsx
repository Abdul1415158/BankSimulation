import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  UserCircle,
  Users,
  Briefcase,
  Building,
  Heart,
  TrendingUp,
  Search,
} from "lucide-react";

export default async function CustomersPage({
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

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("bank_id", bankId)
    .limit(25);

  const customerList = customers ?? [];
  const satisfaction = Number(simState?.customer_satisfaction_score ?? 78);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Database</h1>
          <p className="text-sm text-muted-foreground">
            Monitor client relationships, credit ratings, satisfaction, and deposit retention.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active Customer Accounts</CardDescription>
            <CardTitle className="text-2xl font-bold">1,480</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <UserCircle className="size-3.5 text-blue-500" /> Retail & commercial clients
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Customer Satisfaction</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers text-emerald-600">
              {satisfaction}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <Heart className="size-3.5 text-rose-500" /> CSAT benchmark: 75%
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Average Account Balance</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers">
              {formatCurrency(30400, bank.currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="size-3.5 text-cyan-500" /> Blended deposit depth
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Average Credit Score</CardDescription>
            <CardTitle className="text-2xl font-bold font-mono-numbers">
              712
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <Briefcase className="size-3.5 text-purple-500" /> Prime tier credit risk
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Account Directory</CardTitle>
              <CardDescription className="text-xs">
                Simulated retail consumers, small businesses, and institutional accounts.
              </CardDescription>
            </div>
            <Badge variant="outline">Sample Roster</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Credit Score</th>
                  <th className="px-4 py-3">Risk Tier</th>
                  <th className="px-4 py-3">Deposit Balance</th>
                  <th className="px-4 py-3">Loan Balance</th>
                  <th className="px-4 py-3 text-right">Satisfaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customerList.length > 0 ? (
                  customerList.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">
                        {c.category?.replace("_", " ") || "Retail"}
                      </td>
                      <td className="px-4 py-3 font-mono-numbers">
                        {c.credit_score ?? 720}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        <Badge variant="outline">{c.risk_category || "Prime"}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono-numbers">
                        {formatCurrency(c.total_deposits ?? 25000, bank.currency)}
                      </td>
                      <td className="px-4 py-3 font-mono-numbers">
                        {formatCurrency(c.total_loans ?? 0, bank.currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-numbers">
                        {c.satisfaction_score ?? 80}%
                      </td>
                    </tr>
                  ))
                ) : (
                  [
                    { name: "Sarah Jenkins", cat: "Individual", score: 760, tier: "Prime", dep: 45000, loan: 180000, sat: 88 },
                    { name: "Atlas Manufacturing Co", cat: "Corporate", score: 715, tier: "Prime", dep: 1250000, loan: 2400000, sat: 82 },
                    { name: "BioGen Innovations", cat: "Medium Business", score: 680, tier: "Near Prime", dep: 340000, loan: 650000, sat: 74 },
                    { name: "David Kim", cat: "Individual", score: 640, tier: "Subprime", dep: 8500, loan: 22000, sat: 70 },
                    { name: "Cornerstone Bakery", cat: "Small Business", score: 730, tier: "Prime", dep: 85000, loan: 110000, sat: 86 },
                  ].map((c, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.cat}</td>
                      <td className="px-4 py-3 font-mono-numbers font-medium">{c.score}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{c.tier}</Badge></td>
                      <td className="px-4 py-3 font-mono-numbers">{formatCurrency(c.dep, bank.currency)}</td>
                      <td className="px-4 py-3 font-mono-numbers">{formatCurrency(c.loan, bank.currency)}</td>
                      <td className="px-4 py-3 text-right font-mono-numbers">{c.sat}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
