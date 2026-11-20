"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBank, getBankSettings, updateBankSettings, BankSettings } from "@/lib/storage";
import type { Bank } from "@/types/bank";
import { Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [settings, setSettings] = useState<BankSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!bankId) return;
    setBank(getBank(bankId));
    setSettings(getBankSettings(bankId));
  }, [bankId]);

  if (!bank || !settings) return <div className="p-6">Loading settings...</div>;

  function handleSave() {
    if (!settings) return;
    updateBankSettings(bankId, settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Charter Settings & Governance</h1>
          <p className="text-sm text-muted-foreground">
            Configure interest rate spreads, underwriting parameters, and risk appetite.
          </p>
        </div>
        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 gap-1.5">
          {saved ? <CheckCircle2 className="size-4 text-emerald-300" /> : <Save className="size-4" />}
          <span>{saved ? "Settings Saved" : "Save Changes"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Charter Identification</CardTitle>
            <CardDescription className="text-xs">Bank registration and operating currency.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">Bank Legal Name</Label>
              <Input value={bank.name} disabled className="bg-muted/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Headquarters</Label>
                <Input value={`${bank.city}, ${bank.country}`} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Charter Currency</Label>
                <Input value={bank.currency} disabled className="bg-muted/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Charter Type</Label>
                <Input value={bank.bank_type.toUpperCase()} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Difficulty Tier</Label>
                <Input value={bank.difficulty.toUpperCase()} disabled className="bg-muted/50" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interest Rate & Lending Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Lending & Deposit Rate Policies</CardTitle>
            <CardDescription className="text-xs">Adjust your base pricing to compete with peer banks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Savings APY (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.savings_rate}
                  onChange={(e) => setSettings({ ...settings, savings_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">1-Year Term Deposit APY (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.fixed_deposit_rate_1yr}
                  onChange={(e) => setSettings({ ...settings, fixed_deposit_rate_1yr: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Personal Loan Spread (+%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.personal_loan_spread}
                  onChange={(e) => setSettings({ ...settings, personal_loan_spread: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Commercial Loan Spread (+%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.business_loan_spread}
                  onChange={(e) => setSettings({ ...settings, business_loan_spread: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Min Credit Score for Approval</Label>
                <Input
                  type="number"
                  value={settings.min_credit_score}
                  onChange={(e) => setSettings({ ...settings, min_credit_score: parseInt(e.target.value) || 600 })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max Loan-to-Value (LTV %)</Label>
                <Input
                  type="number"
                  value={settings.max_loan_to_value}
                  onChange={(e) => setSettings({ ...settings, max_loan_to_value: parseInt(e.target.value) || 80 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
