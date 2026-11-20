import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  Users,
  Bot,
  UserPlus,
  ArrowUpRight,
  GraduationCap,
  Sparkles,
  DollarSign,
  Heart,
  Briefcase,
} from "lucide-react";

export default async function WorkforcePage({
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

  const { data: employees } = await supabase
    .from("employees")
    .select("*, departments(name)")
    .eq("bank_id", bankId)
    .order("salary", { ascending: false });

  const activeEmployees = (employees ?? []).filter((e) => e.status === "active");
  const totalSalariesQuarter = activeEmployees.reduce((sum, e) => sum + Number(e.salary), 0);
  const avgMorale = activeEmployees.length > 0
    ? Math.round(activeEmployees.reduce((sum, e) => sum + Number(e.morale ?? 75), 0) / activeEmployees.length)
    : 0;
  const avgAccuracy = activeEmployees.length > 0
    ? (activeEmployees.reduce((sum, e) => sum + Number(e.accuracy ?? 0.95), 0) / activeEmployees.length)
    : 0.95;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workforce Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage human capital, training programs, employee morale, and hybrid AI collaboration.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/bank/${bankId}/workforce/ai-agents`}>
              <Bot className="size-4 mr-2 text-cyan-500" />
              Manage AI Agents
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active Human Employees</CardDescription>
            <CardTitle className="text-2xl font-bold">{activeEmployees.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="size-3.5 text-blue-500" /> Across 10 departments
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Quarterly Payroll</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {formatCurrency(totalSalariesQuarter, bank.currency)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <DollarSign className="size-3.5 text-emerald-500" /> Base compensation
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Average Employee Morale</CardDescription>
            <CardTitle className="text-2xl font-bold">{avgMorale}%</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <Heart className="size-3.5 text-rose-500" /> {avgMorale >= 70 ? "Healthy retention" : "Turnover risk"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Staff Processing Accuracy</CardDescription>
            <CardTitle className="text-2xl font-bold">{formatPercent(avgAccuracy)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <GraduationCap className="size-3.5 text-purple-500" /> Human judgment quality
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Employee Roster</CardTitle>
              <CardDescription className="text-xs">
                Detailed performance, compensation, and skill breakdown for active staff.
              </CardDescription>
            </div>
            <Badge variant="outline">{activeEmployees.length} Personnel</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-4 py-3">Employee Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Salary (Qtr)</th>
                  <th className="px-4 py-3">Morale</th>
                  <th className="px-4 py-3">Skill Level</th>
                  <th className="px-4 py-3">Accuracy</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                      <div className="size-7 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {emp.name.charAt(0)}
                      </div>
                      {emp.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {emp.departments?.name || "General"}
                    </td>
                    <td className="px-4 py-3 text-foreground font-medium">
                      {emp.role}
                    </td>
                    <td className="px-4 py-3 font-mono-numbers">
                      {formatCurrency(emp.salary, bank.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={emp.morale >= 70 ? "default" : "destructive"}>
                        {emp.morale ?? 75}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{emp.skill_level ?? 70}/100</span>
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${emp.skill_level ?? 70}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono-numbers">
                      {formatPercent(emp.accuracy ?? 0.95)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                        Active
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
