"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import {
  CreditCard,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Bot,
} from "lucide-react";
import { getBank, getLoans, approveLoan, rejectLoan, getSimulationState, Loan, SimulationState } from "@/lib/storage";
import type { Bank } from "@/types/bank";

export default function LoansPage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [state, setState] = useState<SimulationState | null>(null);

  function reload() {
    if (!bankId) return;
    setBank(getBank(bankId));
    setLoans(getLoans(bankId));
    setState(getSimulationState(bankId));
  }

  useEffect(() => {
    reload();
  }, [bankId]);

  if (!bank || !state) return <div className="p-6">Loading loan portfolio...</div>;

  const currency = bank.currency || "USD";
  const totalLoans = state.total_loans_outstanding;
  const nplRatio = state.npl_ratio;

  function handleApprove(id: string) {
    approveLoan(bankId, id);
    reload();
  }

  function handleReject(id: string) {
    rejectLoan(bankId, id);
    reload();
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Credit Portfolio & Lending Operations</h1>
        <p className="text-sm text-muted-foreground">
          Underwrite commercial and retail loans, manage risk grades, interest yields, and non-performing loans (NPL).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Gross Loan Portfolio</p>
              <p className="text-2xl font-bold font-mono-numbers">{formatCurrency(totalLoans, currency, true)}</p>
            </div>
            <CreditCard className="size-5 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Non-Performing Ratio</p>
              <p className="text-2xl font-bold font-mono-numbers text-amber-600">{nplRatio}%</p>
            </div>
            <AlertTriangle className="size-5 text-amber-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Weighted Lending Yield</p>
              <p className="text-2xl font-bold font-mono-numbers text-emerald-600">7.8%</p>
            </div>
            <TrendingUp className="size-5 text-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Collateral Coverage</p>
              <p className="text-2xl font-bold font-mono-numbers text-cyan-600">132%</p>
            </div>
            <ShieldCheck className="size-5 text-cyan-500" />
          </CardContent>
        </Card>
      </div>

      {/* Active Loan Portfolio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Active Credit Facilities</CardTitle>
          <CardDescription className="text-xs">Underwritten commercial, corporate, mortgage, and retail facilities.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-y border-border text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Borrower</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Principal</th>
                  <th className="px-4 py-3 text-center">Interest Rate</th>
                  <th className="px-4 py-3 text-center">Risk Grade</th>
                  <th className="px-4 py-3 text-right">Collateral</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-semibold">{loan.borrower_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{loan.category}</td>
                    <td className="px-4 py-3 text-right font-mono-numbers font-medium">
                      {formatCurrency(loan.amount, currency)}
                    </td>
                    <td className="px-4 py-3 text-center font-mono-numbers text-emerald-600 font-semibold">
                      {loan.interest_rate}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className="text-xs font-mono">
                        {loan.risk_grade}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono-numbers text-muted-foreground">
                      {formatCurrency(loan.collateral_value, currency)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant="secondary"
                        className={
                          loan.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : loan.status === "Pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }
                      >
                        {loan.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApprove(loan.id)}
                          className="text-emerald-600 hover:bg-emerald-50 h-7 px-2"
                        >
                          <CheckCircle2 className="size-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(loan.id)}
                          className="text-red-500 hover:bg-red-50 h-7 px-2"
                        >
                          <XCircle className="size-3.5" />
                        </Button>
                      </div>
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
