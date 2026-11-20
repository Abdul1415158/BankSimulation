"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  UserPlus,
  Landmark,
  CheckCircle2,
} from "lucide-react";
import { getBank, getCustomers, onboardCustomer, Customer } from "@/lib/storage";
import type { Bank } from "@/types/bank";

export default function CustomersPage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientCategory, setNewClientCategory] = useState<Customer["category"]>("Small Business");
  const [newClientDeposit, setNewClientDeposit] = useState(250000);

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

  function handleAcquireClient(e: React.FormEvent) {
    e.preventDefault();
    if (!newClientName.trim()) return;

    onboardCustomer(bankId, {
      name: newClientName.trim(),
      category: newClientCategory,
      account_type: newClientCategory === "Corporate" ? "Checking" : newClientCategory === "Individual" ? "Savings" : "Checking",
      deposit_balance: newClientDeposit,
      credit_score: 720 + Math.floor(Math.random() * 80),
      risk_category: "Low",
      satisfaction: 92,
      status: "Active",
    });

    setCustomers(getCustomers(bankId));
    setNewClientName("");
    setShowAddModal(false);
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Accounts & Deposits Desk</h1>
          <p className="text-sm text-muted-foreground">
            Monitor client deposit accounts, credit scores, risk profiles, and quarterly balance growth.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(!showAddModal)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <UserPlus className="size-4" />
          <span>Acquire New Client</span>
        </Button>
      </div>

      {/* Quick Add Client Modal / Bar */}
      {showAddModal && (
        <Card className="border-blue-500/40 bg-blue-500/5 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Proactive Client Acquisition</CardTitle>
            <CardDescription className="text-xs">
              Directly onboard a retail, commercial, or corporate customer with initial opening deposit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAcquireClient} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-xs font-semibold mb-1 block">Client / Company Name</label>
                <Input
                  placeholder="e.g. Sterling Trading Partners"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Account Category</label>
                <select
                  value={newClientCategory}
                  onChange={(e) => setNewClientCategory(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
                >
                  <option value="Individual">Individual (Retail)</option>
                  <option value="Small Business">Small Business</option>
                  <option value="Medium Business">Medium Business</option>
                  <option value="Corporate">Corporate Group</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Opening Deposit ({currency})</label>
                <Input
                  type="number"
                  step="10000"
                  min="5000"
                  value={newClientDeposit}
                  onChange={(e) => setNewClientDeposit(parseFloat(e.target.value) || 0)}
                  className="h-9 text-xs font-mono-numbers"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex-1 text-xs">
                  Confirm Account
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="h-9 text-xs">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
              <p className="text-xs text-muted-foreground">Total Customer Deposits</p>
              <p className="text-2xl font-bold font-mono-numbers text-cyan-400">{formatCurrency(totalDeposits, currency, true)}</p>
            </div>
            <Landmark className="size-5 text-cyan-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Avg Credit Score</p>
              <p className="text-2xl font-bold font-mono-numbers text-blue-400">
                {customers.length > 0 ? Math.round(customers.reduce((s, c) => s + c.credit_score, 0) / customers.length) : "750"}
              </p>
            </div>
            <ShieldCheck className="size-5 text-blue-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Avg Satisfaction</p>
              <p className="text-2xl font-bold font-mono-numbers text-emerald-500">
                {customers.length > 0 ? Math.round(customers.reduce((s, c) => s + c.satisfaction, 0) / customers.length) : 100}%
              </p>
            </div>
            <CheckCircle2 className="size-5 text-emerald-500" />
          </CardContent>
        </Card>
      </div>

      {/* Search & List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">Client Account Registry</CardTitle>
            <CardDescription className="text-xs">
              Every customer deposit directly contributes to bank liquidity and non-interest fee income.
            </CardDescription>
          </div>
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
          {customers.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <Users className="size-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-semibold text-sm">No Client Accounts Registered Yet</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Because your bank started from zero, customer accounts will organically open as you advance quarters, advertise, and offer attractive savings rates. You can also onboard clients directly using the "Acquire New Client" button above.
              </p>
            </div>
          ) : (
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
                      <td className="px-4 py-3 text-right font-mono-numbers font-medium text-cyan-400">
                        {formatCurrency(c.deposit_balance, currency)}
                      </td>
                      <td className="px-4 py-3 text-center font-mono-numbers font-medium text-blue-400">
                        {c.credit_score}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant="secondary"
                          className={
                            c.risk_category === "Low"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : c.risk_category === "Medium"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-rose-500/10 text-rose-400"
                          }
                        >
                          {c.risk_category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center font-mono-numbers text-emerald-400">
                        {c.satisfaction}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
