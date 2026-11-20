"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/formatters";
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Scale,
} from "lucide-react";
import { getBank, getSimulationState, SimulationState } from "@/lib/storage";
import type { Bank } from "@/types/bank";

export default function RiskManagementPage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [state, setState] = useState<SimulationState | null>(null);

  useEffect(() => {
    if (!bankId) return;
    setBank(getBank(bankId));
    setState(getSimulationState(bankId));
  }, [bankId]);

  if (!bank || !state) return <div className="p-6">Loading risk management...</div>;

  const car = state.capital_adequacy_ratio;
  const nplRatio = state.npl_ratio;
  const isCarCompliant = car >= 10.5;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Risk Management & Basel III Compliance</h1>
        <p className="text-sm text-muted-foreground">
          Monitor Capital Adequacy Ratios (CAR), Non-Performing Loans (NPL), and credit stress indicators.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Capital Adequacy Ratio</p>
              <p className={`text-2xl font-bold font-mono-numbers ${isCarCompliant ? "text-emerald-600" : "text-red-500"}`}>
                {car}%
              </p>
            </div>
            <ShieldCheck className="size-5 text-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Regulatory CAR Threshold</p>
              <p className="text-2xl font-bold font-mono-numbers">10.5%</p>
            </div>
            <Scale className="size-5 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">NPL Default Rate</p>
              <p className="text-2xl font-bold font-mono-numbers text-amber-600">{nplRatio}%</p>
            </div>
            <AlertTriangle className="size-5 text-amber-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Value at Risk (99%)</p>
              <p className="text-2xl font-bold font-mono-numbers text-rose-600">1.8%</p>
            </div>
            <ShieldAlert className="size-5 text-rose-500" />
          </CardContent>
        </Card>
      </div>

      {/* Stress Test Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Simulated Stress Testing</CardTitle>
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
