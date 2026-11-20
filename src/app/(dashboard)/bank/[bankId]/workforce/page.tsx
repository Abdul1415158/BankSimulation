"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import {
  Users,
  Bot,
  UserPlus,
  Sparkles,
  DollarSign,
  Heart,
  Briefcase,
  Trash2,
} from "lucide-react";
import { getBank, getEmployees, hireEmployee, terminateEmployee, Employee } from "@/lib/storage";
import type { Bank } from "@/types/bank";

export default function WorkforcePage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  function reload() {
    if (!bankId) return;
    setBank(getBank(bankId));
    setEmployees(getEmployees(bankId));
  }

  useEffect(() => {
    reload();
  }, [bankId]);

  if (!bank) return <div className="p-6">Loading workforce...</div>;

  const currency = bank.currency || "USD";
  const activeEmployees = employees.filter((e) => e.status === "Active");
  const totalSalaries = activeEmployees.reduce((sum, e) => sum + e.salary, 0);
  const avgMorale = activeEmployees.length > 0
    ? Math.round(activeEmployees.reduce((sum, e) => sum + e.morale, 0) / activeEmployees.length)
    : 0;

  function handleQuickHire() {
    const roles = [
      { name: "John Doe", role: "Junior Loan Officer", dept: "Loan and Credit Department", salary: 50000, skill: "Junior" as const },
      { name: "Jane Smith", role: "Support Specialist", dept: "Customer Service", salary: 45000, skill: "Junior" as const },
      { name: "Robert Taylor", role: "Risk Analyst", dept: "Risk Management", salary: 65000, skill: "Mid" as const },
    ];
    const pick = roles[Math.floor(Math.random() * roles.length)];
    hireEmployee(bankId, {
      name: `${pick.name} ${Math.floor(Math.random() * 100)}`,
      role: pick.role,
      department_id: "dept-1",
      department_name: pick.dept,
      salary: pick.salary,
      experience_years: 2,
      skill_level: pick.skill,
      productivity: 85,
      accuracy: 92,
      customer_rating: 4.5,
      morale: 90,
      status: "Active",
    });
    reload();
  }

  function handleTerminate(id: string) {
    terminateEmployee(bankId, id);
    reload();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Human Workforce</h1>
          <p className="text-sm text-muted-foreground">
            Manage human personnel, recruitment, morale, and performance across departments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/bank/${bankId}/workforce/ai-agents`} className="flex items-center gap-1.5">
              <Bot className="size-4 text-blue-500" />
              <span>AI Agents Hub</span>
            </Link>
          </Button>
          <Button size="sm" onClick={handleQuickHire} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
            <UserPlus className="size-4 mr-1.5" />
            Recruit Employee
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Human Staff</p>
              <p className="text-2xl font-bold font-mono-numbers">{activeEmployees.length}</p>
            </div>
            <Users className="size-5 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Annual Payroll</p>
              <p className="text-2xl font-bold font-mono-numbers">{formatCurrency(totalSalaries, currency, true)}</p>
            </div>
            <DollarSign className="size-5 text-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Average Morale</p>
              <p className="text-2xl font-bold font-mono-numbers">{avgMorale}%</p>
            </div>
            <Heart className="size-5 text-rose-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Workforce Strategy</p>
              <p className="text-sm font-semibold text-foreground">Hybrid Model</p>
            </div>
            <Sparkles className="size-5 text-amber-500" />
          </CardContent>
        </Card>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Employee Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-y border-border text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Role & Level</th>
                  <th className="px-4 py-3 text-right">Annual Salary</th>
                  <th className="px-4 py-3 text-center">Accuracy</th>
                  <th className="px-4 py-3 text-center">Morale</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{emp.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.department_name}</td>
                    <td className="px-4 py-3">
                      <span>{emp.role}</span>
                      <Badge variant="outline" className="ml-2 text-[10px]">{emp.skill_level}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono-numbers font-medium">
                      {formatCurrency(emp.salary, currency)}
                    </td>
                    <td className="px-4 py-3 text-center font-mono-numbers text-emerald-600 font-medium">
                      {emp.accuracy}%
                    </td>
                    <td className="px-4 py-3 text-center font-mono-numbers">
                      {emp.morale}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTerminate(emp.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                      >
                        <Trash2 className="size-3.5" />
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
