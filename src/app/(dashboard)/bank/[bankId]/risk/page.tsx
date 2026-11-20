"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Scale,
  Lock,
  Cpu,
  Eye,
  CheckCircle,
} from "lucide-react";
import {
  getBank,
  getSimulationState,
  getSecurityConfig,
  updateSecurityConfig,
  getEvents,
  SimulationState,
  BankSecurityConfig,
  CrisisEvent,
} from "@/lib/storage";
import type { Bank } from "@/types/bank";

export default function RiskManagementPage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [state, setState] = useState<SimulationState | null>(null);
  const [security, setSecurity] = useState<BankSecurityConfig | null>(null);
  const [incidents, setIncidents] = useState<CrisisEvent[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (!bankId) return;
    setBank(getBank(bankId));
    setState(getSimulationState(bankId));
    setSecurity(getSecurityConfig(bankId));
    const evs = getEvents(bankId);
    setIncidents(evs.filter((e) => e.category === "Cyber" || e.category === "Fraud"));
  }, [bankId]);

  if (!bank || !state || !security) return <div className="p-6">Loading risk management...</div>;

  const car = state.capital_adequacy_ratio;
  const nplRatio = state.npl_ratio;
  const isCarCompliant = car >= 10.5;

  function handleSaveSecurity(patch: Partial<BankSecurityConfig>) {
    if (!bankId) return;
    updateSecurityConfig(bankId, patch);
    setSecurity(getSecurityConfig(bankId));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security & Risk Management Desk</h1>
          <p className="text-sm text-muted-foreground">
            Configure institutional defenses, physical bank security, cybersecurity posture, and Basel III capital buffers.
          </p>
        </div>
        {savedNotice && (
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 gap-1.5 py-1 px-3">
            <CheckCircle className="size-3.5" /> Security Configuration Saved
          </Badge>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Capital Adequacy Ratio</p>
              <p className={`text-2xl font-bold font-mono-numbers ${isCarCompliant ? "text-emerald-500" : "text-rose-500"}`}>
                {car}%
              </p>
            </div>
            <ShieldCheck className="size-5 text-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Supervisory CAR Floor</p>
              <p className="text-2xl font-bold font-mono-numbers">12.0%</p>
            </div>
            <Scale className="size-5 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">NPL Default Rate</p>
              <p className="text-2xl font-bold font-mono-numbers text-amber-500">{nplRatio}%</p>
            </div>
            <AlertTriangle className="size-5 text-amber-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Audit Defense Score</p>
              <p className="text-2xl font-bold font-mono-numbers text-cyan-400">
                {security.last_audit_score}/100
              </p>
            </div>
            <ShieldAlert className="size-5 text-cyan-400" />
          </CardContent>
        </Card>
      </div>

      {/* ACTIVE SECURITY CONFIGURATION */}
      <Card className="border-blue-500/30">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="size-5 text-blue-500" /> Institutional Security Configuration
          </CardTitle>
          <CardDescription className="text-xs">
            Directly configure cybersecurity tiers, anti-fraud algorithms, and internal control protocols.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Cybersecurity */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Cpu className="size-4 text-blue-400" /> Cybersecurity Tier
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(["Basic", "Enhanced", "Military-Grade"] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => handleSaveSecurity({ cybersecurity_tier: tier })}
                    className={`p-3 rounded-lg border text-xs text-left transition-all ${
                      security.cybersecurity_tier === tier
                        ? "border-blue-500 bg-blue-500/10 font-bold text-foreground"
                        : "border-border hover:border-blue-400/40 text-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold">{tier}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {tier === "Basic" ? "Firewall only" : tier === "Enhanced" ? "24/7 SOC + WAF" : "Quantum-safe IDS"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Fraud Prevention */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye className="size-4 text-purple-400" /> Anti-Fraud Monitoring
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(["Manual", "Automated", "AI-Realtime"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleSaveSecurity({ fraud_monitoring: mode })}
                    className={`p-3 rounded-lg border text-xs text-left transition-all ${
                      security.fraud_monitoring === mode
                        ? "border-purple-500 bg-purple-500/10 font-bold text-foreground"
                        : "border-border hover:border-purple-400/40 text-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold">{mode}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {mode === "Manual" ? "Sampling" : mode === "Automated" ? "Rule Engine" : "ML Heuristics"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Physical Security */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Lock className="size-4 text-amber-400" /> Physical Branch & Vault Security
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(["Standard", "Armed Guards", "High-Sec Vault"] as const).map((phys) => (
                  <button
                    key={phys}
                    type="button"
                    onClick={() => handleSaveSecurity({ physical_security: phys })}
                    className={`p-3 rounded-lg border text-xs text-left transition-all ${
                      security.physical_security === phys
                        ? "border-amber-500 bg-amber-500/10 font-bold text-foreground"
                        : "border-border hover:border-amber-400/40 text-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold">{phys}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {phys === "Standard" ? "CCTV only" : phys === "Armed Guards" ? "Armed Escorts" : "Biometric Vault"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Internal Controls */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Scale className="size-4 text-emerald-400" /> Governance & Internal Controls
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(["Standard", "Dual Authorization", "Continuous Audit"] as const).map((ctrl) => (
                  <button
                    key={ctrl}
                    type="button"
                    onClick={() => handleSaveSecurity({ internal_controls: ctrl })}
                    className={`p-3 rounded-lg border text-xs text-left transition-all ${
                      security.internal_controls === ctrl
                        ? "border-emerald-500 bg-emerald-500/10 font-bold text-foreground"
                        : "border-border hover:border-emerald-400/40 text-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold">{ctrl}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {ctrl === "Standard" ? "Single officer" : ctrl === "Dual Authorization" ? "4-Eye Principle" : "Automated Audit"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quarterly Security Budget */}
          <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <Label className="text-sm font-semibold">Quarterly Security & Defense Budget</Label>
              <p className="text-xs text-muted-foreground">
                Dedicated allocation for cybersecurity patches, physical guard payroll, and anti-fraud licensing.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                step="5000"
                min="10000"
                max="250000"
                value={security.quarterly_security_budget}
                onChange={(e) => handleSaveSecurity({ quarterly_security_budget: parseFloat(e.target.value) || 0 })}
                className="w-40 font-mono-numbers"
              />
              <span className="text-xs text-muted-foreground">
                {formatCurrency(security.quarterly_security_budget, bank.currency || "USD")} / Qtr
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Incidents & Investigations */}
      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-bold">Security Incidents & Investigations Log</CardTitle>
          <CardDescription className="text-xs">Recorded cyber incursions, fraud probes, and regulatory inspection notices.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {incidents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-xs">
              <ShieldCheck className="size-8 text-emerald-500/50 mx-auto mb-2" />
              No active security incidents or breach events detected on bank systems.
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((inc) => (
                <div key={inc.id} className="p-3.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{inc.title}</span>
                      <Badge variant={inc.resolved ? "secondary" : "destructive"} className="text-[10px]">
                        {inc.resolved ? "RESOLVED" : "ACTIVE"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{inc.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono-numbers">
                    Year {inc.year} Q{inc.quarter}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stress Test Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Simulated Basel III Stress Testing</CardTitle>
          <CardDescription className="text-xs">Projected impact of severe economic shocks on capital reserves.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { scenario: "Severe Economic Recession (+4% Unemployment)", impact: "-2.4% Capital", carProjected: `${(car - 2.4).toFixed(1)}%`, pass: car - 2.4 >= 10.5 },
            { scenario: "Real Estate Market Shock (-20% Collateral Values)", impact: "-3.1% Capital", carProjected: `${(car - 3.1).toFixed(1)}%`, pass: car - 3.1 >= 10.5 },
            { scenario: "Cyberattack & Mass Deposit Outflow (15% Run)", impact: "-4.5% Capital", carProjected: `${(car - 4.5).toFixed(1)}%`, pass: car - 4.5 >= 10.5 },
          ].map((st) => (
            <div key={st.scenario} className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-muted/20">
              <div>
                <p className="font-semibold text-sm">{st.scenario}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Estimated Shock: {st.impact}</p>
              </div>
              <div className="text-right">
                <p className="font-mono-numbers font-bold text-sm">Post-Shock CAR: {st.carProjected}</p>
                <Badge variant={st.pass ? "secondary" : "destructive"} className="text-[10px] mt-1">
                  {st.pass ? "PASSED BUFFER" : "CAPITAL BREACH"}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
