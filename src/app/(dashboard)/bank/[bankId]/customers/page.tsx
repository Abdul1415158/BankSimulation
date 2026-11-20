"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/formatters";
import {
  UserCircle,
  Users,
  Search,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { getBank, getCustomers, Customer } from "@/lib/storage";
import type { Bank } from "@/types/bank";

export default function CustomersPage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!bankId) return;
    setBank(getBank(bankId));
    setCustomers(getCustomers(bankId));
  }, [bankId]);

  if (!bank) return <div className="p-6">Loading customer accounts...</div>;

  const currency = bank.currency || "USD";
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.account_type.toLowerCase().includes(search.toLowerCase())
  );

  const totalDeposits = customers.reduce((sum, c) => sum + c.deposit_balance, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Accounts & CRM</h1>
          <p className="text-sm text-muted-foreground">
            Monitor client accounts, credit risk profiles, deposit balances, and satisfaction metrics.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Accounts</p>
              <p className="text-2xl font-bold font-mono-numbers">{customers.length}</p>
            </div>
            <Users className="size-5 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Portfolio Deposits</p>
              <p className="text-2xl font-bold font-mono-numbers">{formatCurrency(totalDeposits, currency, true)}</p>
            </div>
            <UserCircle className="size-5 text-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Avg Credit Score</p>
              <p className="text-2xl font-bold font-mono-numbers text-cyan-600">748</p>
            </div>
            <ShieldCheck className="size-5 text-cyan-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Client Retention</p>
              <p className="text-2xl font-bold font-mono-numbers text-emerald-600">96.4%</p>
            </div>
            <ShieldCheck className="size-5 text-emerald-500" />
          </CardContent>
        </Card>
      </div>

      {/* Search & List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-bold">Client Registry</CardTitle>
          <div className="relative w-64">
            <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-y border-border text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Client Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Account Type</th>
                  <th className="px-4 py-3 text-right">Deposit Balance</th>
                  <th className="px-4 py-3 text-center">Credit Score</th>
                  <th className="px-4 py-3 text-center">Risk Tier</th>
                  <th className="px-4 py-3 text-center">Satisfaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-semibold text-foreground">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.category}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs font-normal">
                        {c.account_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono-numbers font-medium">
                      {formatCurrency(c.deposit_balance, currency)}
                    </td>
                    <td className="px-4 py-3 text-center font-mono-numbers font-medium text-blue-600">
                      {c.credit_score}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant="secondary"
                        className={
                          c.risk_category === "Low"
                            ? "bg-emerald-50 text-emerald-700"
                            : c.risk_category === "Medium"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }
                      >
                        {c.risk_category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center font-mono-numbers text-emerald-600">
                      {c.satisfaction}%
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
